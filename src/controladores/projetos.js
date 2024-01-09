const knex = require("../conexaoDB")

const projetos = async (req,res)=>{
    /*
        select p.id, p.name, p.budget, c.costs, cat.id, cat.name 
        from projetos p join costs c on costs_id = c.id 
        join categories cat on categories_id = cat.id;
    */
    try {
        const projetos = await knex('projetos')
            .join('costs', 'costs_id', '=', 'costs.id')
            .join('categories', 'categories_id', '=', 'categories.id')
            // .join('servicos', function(){
            //     this
            //     .on('projetos_id', '=','projetos.id')
            // })
            .select('projetos.id', 'projetos.name', 'projetos.budget', 
                'costs.costs', 'categories.id as categoria_id', 'categories.name',/*'servicos.name as nome_servico'*/)
            .debug()

        
        const resultado = projetos.map((element)=>{
            return {
                id: element.id,
                budget: element.budget,
                categories: {
                    id: element.categoria_id,
                    name: element.name
                },
                costs: element.costs,
                servicos: !element.servicos ? [] : element.servicos,
            }
        })

        if(projetos.length === 0){
            return res.status(404).json({mensagem: 'Não há projetos cadastrados.'})
        }
        return res.json(resultado)
        
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
        const costs_id = await knex('costs').insert({costs: 0}).returning('id')
        const projeto = await knex('projetos').insert({
            name, 
            budget, 
            costs_id: costs_id[0].id, 
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
    const cost= Number(req.body.cost)
    const {id} = req.params
    try {
        if(isNaN(id)){
            return res.status(400).json({menssagem: 'id inválido'})
        }

        const existeProjeto = await knex('projetos').where({id}).first()
        
        if(!existeProjeto){
            return res.status(400).json({menssagem: 'projeto não encontrado'})
        }

        const {budget, costs_id} = await knex('projetos')
            .where({id})
            .select('budget', 'costs_id')
            .first()

        const {costs: costAtual} = await knex('costs').where({id: costs_id}).first()
        
        if(cost > budget){
            return res.status(400).json({menssagem: 'Orçamento inválido, verifique o valor do serviço'})
        }
        
        if((costAtual + cost) > budget){
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
            .update({budget: budget - cost })
            .where({id})

        await knex('costs')
            .update({costs: costAtual + cost })
            .where({id: costs_id})

        return res.json({menssagem: 'Serviço adicionado com sucesso'})
    } catch (error) {
        console.log(error)
        return res.status(500).json({menssagem: 'Erro interno do servidor'})
    }
}

const editarServico = async (req,res)=>{
    const id = Number(req.params.id)
    const dados = req.body
    try {
        return res.status(200).json({
            id,
            dados
        })
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
    editarServico
}