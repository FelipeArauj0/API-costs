const knex = require("../conexaoDB")

const categorias = async (req,res)=>{
    const categorias = await knex('categories')
    return res.json(categorias)
}

module.exports = categorias