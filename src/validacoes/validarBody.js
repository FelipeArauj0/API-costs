const joi = require('joi')

const validarBody = schema => async (req,res,next)=>{
    try {
        await schema.validateAsync(req.body)
    } catch (error) {
        return res.status(400).json({menssagem: error.message})
    }
}

module.exports = validarBody
