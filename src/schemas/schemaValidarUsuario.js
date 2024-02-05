const joi = require('joi')

const schemaUsuario = joi.object({
    email: joi.string().email().required().messages({
        'any.required':'O campo email é obrigatório .',
        'string.email':'O campo email precisa ter um formato válido',
        'string.empty':"O campo email é obrigatório",
    }),
    senha: joi.string().required().messages({
        'any.required':'O campo senha é obrigatório .',
        'string.base':'O campo senha precisa ser uma string',
        'string.empty':"O campo senha é obrigatório"
    })
});

module.exports = schemaUsuario