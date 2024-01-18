require('dotenv').config()
const knex = require("../conexaoDB")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const cadastrar = async (req,res)=>{
    const {email, senha} = req.body
    
    try {
        
        if(!email || !senha){
            return res.status(400).json({menssagem: 'Preencha todos os campos corretamente'})
        }
        
        const emailExistente = await knex('usuario').where({email}).first()
        
        if(emailExistente){
            return res.status(400).json({menssagem: 'já existe usuario para esse email'})
        }
        
        var senhaCriptografada = bcrypt.hashSync(senha, 10);
        
        const cadastrarUsuario = await knex('usuario')
            .insert({email, senha: senhaCriptografada})
            .returning(['email', 'senha'])
        
            return res.status(201).json(cadastrarUsuario[0])
    } catch (error) {
        console.log(error)
        return res.status(500).json({menssagem: 'Erro interno do servidor'})
    }
}

const login = async (req,res)=>{
    const { email, senha} = req.body
    
    try {

        if(!email || !senha){
            return res.status(400).json({menssagem: 'Preencha todos os campos corretamente'})
        }

        const Usuario = await knex('usuario').where({email}).first()
        
        if(!Usuario){
            return res.status(400).json({menssagem: 'email ou senha incorrretos'})
        }

        const senhaCorreta = await bcrypt.compare(senha, Usuario.senha);

        if (!senhaCorreta) {
            return res.status(400).json({mensagem: "Email ou senha incorretos"});
        }

        const token = jwt.sign({ id: Usuario.id }, process.env.SENHA_JWT, {
            expiresIn: "8h",
        })
        
        const { senha: _, ...dadosUsuario } = Usuario;
  
        return res.status(200).json({
            usuario: dadosUsuario,
            token,
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({menssagem: 'Erro interno do servidor'})
   }
}

module.exports = {
    cadastrar,
    login
}