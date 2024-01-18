const jwt = require('jsonwebtoken');
const knex = require('../conexaoDB');

require('dotenv').config()

const validarLogin = async (req,res, next)=>{

    const { authorization } = req.headers;
    
  
    if(!authorization){
      return res.status(400).json({mensagem:"Não autorizado"});
      
    }
    const token = authorization.split(' ')[1]; 
  
    if (!token) {
      return res.status(400).json({mensagem:"Não autorizado"});
    }

    try {
        const { id: id_token } = jwt.verify(token, process.env.SENHA_JWT);
        
        if(!id_token){
            return res.status(400).json({mensagem:"Não autorizado"});
          }
          const usuarioExiste = await knex('usuario').where({id: id_token}).first()
        
          if (!usuarioExiste) {
            return res.status(404).json({mensagem:"Usuario não encontrado"});
          }

        const { senha, ...usuario } = usuarioExiste;
        
        req.usuario = usuario
        next()
    
    } catch (error) {
        console.log(error)
        return res.status(500).json({menssagem: 'erro interno do servidor'})
    }
}

module.exports = validarLogin