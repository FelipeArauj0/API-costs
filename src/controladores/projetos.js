const { json } = require("express")
const knex = require("../conexaoDB")

const projetos = async (req,res)=>{
    
    try {
        
        const projetos = await knex('projetos')
            .leftJoin('servicos', 'projetos_id', '=', 'projetos.id')
            .leftJoin('categories', 'categories.id', '=', 'projetos.categories_id') // Corrigindo a junção com a tabela de categorias
            .select(
                'projetos.id as id',
                'projetos.*',
                'servicos.id as servicos_id',
                'servicos.name as servicos_name',
                'servicos.description as description_servico',
                'servicos.cost as cost_servico',
                'categories.id as categoria_id',
                'categories.name as categoria_name',
            )
            .orderBy('projetos.id')
            .groupBy('projetos.id', 'servicos.id', 'categoria_id', 'categoria_name');
        
        if(projetos.length === 0){
            return res.status(400).json({menssagem: 'Nenhum projeto cadastrado'})
        }
        
        // Agrupar os resultados pelo ID do projeto
        const projetosAgrupados = projetos.reduce((acc, projeto) => {
            const projetoExistente = acc.find((p) => p.id === projeto.id);

            if (projetoExistente) {
                // Adicionar serviço ao projeto existente
                projetoExistente.servicos.push({
                    id: projeto.servicos_id,
                    name: projeto.servicos_name,
                    cost: projeto.cost_servico,
                    description: projeto.description_servico
                });
            } else {
                // Criar novo projeto com um array de serviços
                acc.push({
                    id: projeto.id,
                    name: projeto.name,
                    budget: projeto.budget,
                    categories: {
                        id: projeto.categoria_id,
                        name: projeto.categoria_name
                    },
                    costs: projeto.cost,
                    servicos: projeto.cost === 0 ? [] : [{
                        id: projeto.servicos_id,
                        name: projeto.servicos_name,
                        cost: projeto.cost_servico,
                        description: projeto.description_servico
                    }],
                });
            }

            return acc;
        }, []);

        return res.json(projetosAgrupados);



    } catch (error) {
        console.log(error)
        return res.status(500).json({menssagem: 'Erro interno do servidor'})
    }
}

const novoProjeto = async (req,res)=>{
    const {name, id_categoria} = req.body
    const budget = Number(req.body.budget)
    
    try {
        if(!name || !budget || !id_categoria){
            return res.status(400).json({mensagem: 'Preencha todos os dados corretamente.'})
        }

        if(isNaN(budget)){
            return res.status(400).json({mensagem: 'O orçamento precisa ser um valor válido!'})

        }

        if(isNaN(id_categoria)){
            return res.status(400).json({mensagem: 'Categoria inválida'})

        }

        const categoria = await knex('categories').select('name').where({id:id_categoria}).first()
        
        
        if(!categoria){
            return res.status(400).json({mensagem: 'Categoria não encontrada'})
        }


        //inserir no bd
        
        const projeto = await knex('projetos').insert({
            name, 
            budget, 
            categories_id: id_categoria
        })

        return res.status(201).json({menssagem: 'Projeto criado com sucesso'})
    } catch (error) {
        console.log(error)
        return res.status(500).json({menssagem: 'Erro interno do servidor'})
    }
}

const removerProjeto = async (req,res)=>{
    const {id} = req.params
    try {

        if(isNaN(id)){
            return res.status(400).json({menssagem: 'id inválido'})
        }

        const existeProjeto = await knex('projetos').where({id}).first()
        
        if(!existeProjeto){
            return res.status(400).json({menssagem: 'projeto não encontrado'})
        }

        const existeServico = await knex('servicos').where({projetos_id: id})
        
        if(existeServico.length === 0){
            //deletar projeto
            await knex('projetos')
                .where({id})
                .delete()
    
            return res.status(200).json({menssagem: 'Projeto removido com sucesso'})
        }
        
        const projeto = await knex('projetos')
            .where({id: id})
            .first()
        
        
        
        // deletar servico
        await knex('servicos')
            .where({projetos_id: id})
            .delete()
            .returning('*')
        
        //deletar projeto
        await knex('projetos')
            .where({id})
            .delete()

        return res.status(200).json({menssagem: 'Projeto removido com sucesso'})
    } catch (error) {
        console.log(error)
        return res.status(500).json({menssagem: 'Erro interno do servidor'})
    }
}

const adicionarServico = async (req,res)=>{
    const {name, description}= req.body
    let cost = req.body.cost
    const {id} = req.params
    try {
        if(isNaN(id)){
            return res.status(400).json({menssagem: 'id inválido'})
        }

        if(cost){
            if(isNaN(cost)){
            return res.status(400).json({menssagem: 'Custo inválido, tente novamente'})
            }
        }
        
        cost = Number(cost)
        const existeProjeto = await knex('projetos').where({id}).first()
        
        if(!existeProjeto){
            return res.status(400).json({menssagem: 'projeto não encontrado'})
        }

        const {budget: budgetAtual, cost: costAtual} = await knex('projetos')
            .where({id})
            .select('budget', 'cost')
            .first()
 
        if(cost > budgetAtual){
            return res.status(400).json({menssagem: 'Orçamento inválido, verifique o valor do serviço'})
        }
        
        if((costAtual + cost) > budgetAtual){
            return res.status(400).json({menssagem: 'Verifique o orçamento do projeto, custo ultrapassa o orçamento!'})

        }
        const addServico = await knex('servicos')  
            .insert({
                name, 
                cost, 
                description,
                projetos_id: id
            })
            

        await knex('projetos')
            .update({cost: costAtual + cost })
            .where({id})
            

        return res.json({menssagem: 'Serviço adicionado'})
    } catch (error) {
        console.log(error)
        return res.status(500).json({menssagem: 'Erro interno do servidor'})
    }
}

const editarProjeto = async (req,res)=>{
    const id = Number(req.params.id)
    const { name: novoName, categories_id: novaCategoria} = req.body
    let novoBudget = req.body.budget
    try {
        if(isNaN(id)){
            return res.status(400).json({menssagem: 'id inválido'})
        }
        if(novoBudget){
            if(isNaN(novoBudget)){
                return res.status(400).json({menssagem: 'Orçamento inválido'})
            }
        }

        novoBudget = Number(novoBudget)
        const existeProjeto = await knex('projetos').where({id}).first()
        
        if(!existeProjeto){
            return res.status(400).json({menssagem: 'Projeto não encontrado'})
        }
        const {
            id_projeto ,name, budget, cost, categoria_id
            
        } = await knex('projetos')
            .join('categories', 'categories_id', '=', 'categories.id')
            .select('projetos.id as id_projeto', 'projetos.name', 'projetos.budget', 'projetos.cost', 
                'categories.id as categoria_id', 'categories.name as categoria_name')
            .where('projetos.id', '=', id)
            .first()
            
            if(novoBudget < cost){
                return res.status(400).json({menssagem: 'O orçamento não pode ser menor que o custo do projeto!'})
            }

            const servicos = await knex('servicos')
                .where({projetos_id: id_projeto})
            
            if(servicos.length >= 1){
                let somaCostServicos = 0
                
                for (let i = 0; i < servicos.length; i++) {
                    somaCostServicos = somaCostServicos + servicos[i].cost
                }

                await knex('projetos')
                    .where({id})
                    .update({
                        name: novoName ? novoName: name,
                        budget: novoBudget ? novoBudget : budget,
                        categories_id: novaCategoria ? novaCategoria : categoria_id

                    })
                return res.status(200).json({menssagem: 'Projeto Atualizado'})
            }

            const projetoAtualizado = await knex('projetos')
                .where({id})
                .update({
                    name: novoName ? novoName: name,
                    budget: novoBudget ? novoBudget : budget,
                    categories_id: novaCategoria ? novaCategoria : categoria_id

                })
        return res.status(200).json({menssagem: 'Projeto Atualizado'})
    } catch (error) {
        console.log(error)
        return res.status(500).json({menssagem: 'Erro interno do servidor'})
    }
}

const editarServico = async (req,res)=>{
    const id = Number(req.params.id)
    const {name:novoName, description: novaDescricao} = req.body
    const novoCost = Number(req.body.cost)
    try {
        console.log('novoCost: ',novoCost)
        if(isNaN(id)){
            return res.status(400).json({menssagem: 'id inválido'})
        }
        const existeServico = await knex('servicos').where({id}).first()
        const projeto = await knex('projetos')
        .where({id: existeServico.projetos_id})
        .first()
        
        const servicoAtualizado = await knex.transaction(async (trx) => {
            // Obter informações do serviço existente
            const servico = await trx('servicos').where({ id }).first()
            

        
            if (!servico) {
                // Lidar com o caso em que o serviço não existe
                return res.status(400).json({menssagem: 'Servico não encontrado'})
            }
        
            // Calcular a diferença no custo
            const diferencaCusto = novoCost < servico.cost ? servico.cost - novoCost : novoCost;
            
           

        
            // Obter todos os serviços vinculados ao projeto
            const servicosDiferentes = await trx('servicos')
                .where('id', '!=', id)
                .andWhere({ projetos_id: servico.projetos_id })
            let soma = 0
            for (const servico of servicosDiferentes) {
                soma = soma + servico.cost
            }
            // Calcular o novo custo total do projeto
            const novoCustoProjeto = soma + novoCost ;
        
            // Verificar se o novo custo total do projeto está dentro do orçamento
            if (novoCustoProjeto <= projeto.budget) {
                // Atualizar o custo do serviço
                await trx('servicos').where({ id }).update({
                    name: novoName ? novoName : servico.name,
                    cost: novoCost ? novoCost : servico.cost,
                    description: novaDescricao ? novaDescricao : servico.description
                });
        
                // Atualizar o custo total do projeto
                await trx('projetos')
                    .where({ id: servico.projetos_id })
                    .update({ cost: novoCustoProjeto });
                
                //atualizar o orçamento total
                // await trx('projetos')
                //     .where({ id: servico.projetos_id })
                //     .update({budget: projeto.budget - diferencaCusto})
                // Commit da transação
                await trx.commit();
                
                // Retornar o serviço atualizado
                return {
                    // ...servico,
                    name: novoName ? novoName : servico.name,
                    cost: novoCost ? novoCost : servico.cost,
                    description: novaDescricao ? novaDescricao : servico.description
                };
            } else {
                // Rollback da transação se o novo custo excede o orçamento
                await trx.rollback();
        
                // Lidar com o caso em que o novo custo excede o orçamento
                return res.status(400).json(`O valor do custo não pode ser maior que orçamento`)

            }
        });
        
        

        // RESOLVER ERRO servicoAtualizado

        return res.status(200).json({menssagem: 'Serviço editado'})
    } catch (error) {
        console.log(error)
        return res.status(500).json({menssagem: 'Erro interno do servidor'})
    }
}
const removerServico = async (req,res)=>{
    const id = Number(req.params.id)
    try {
        if(isNaN(id)){
            return res.status(400).json({menssagem: 'id inválido'})
        }
        const existeServico = await knex('servicos').where({id}).first()
        
        if(!existeServico){
            return res.status(400).json({menssagem: 'serviço não encontrado'})
        }
        const { budget: valorAtual,costs_id,...projeto} = await knex('projetos').where({id: existeServico.projetos_id}).first()
        const {costs: custoTotalProjeto} = await knex('costs').where({id: costs_id}).first()
        
        const servico = await knex('servicos')
            .where({id})
            .delete()
            .returning('*')

        //atualizar projeto
        await knex('projetos')
            .update({budget: valorAtual + servico[0].cost})
            .where({id: existeServico.projetos_id})
        
        //atualizar costs
        await knex('costs')
            .update({costs: custoTotalProjeto - servico[0].cost})
            .where({id: costs_id})  
        
        return res.status(200).json({menssagem: 'Serviço removido com sucesso.'})
    } catch (error) {
        console.log(error)
        return res.status(500).json({menssagem: 'Erro interno do servidor'})
    }
}
module.exports = {
    projetos,
    novoProjeto,
    removerProjeto,
    adicionarServico,
    removerServico,
    editarProjeto,
    editarServico
}