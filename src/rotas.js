const express = require('express')
const { projetos, novoProjeto, removerProjeto, adicionarServico, removerServico, editarServico, editarProjeto, projeto, servico } = require('./controladores/projetos')
const categorias = require('./controladores/categorias')
const { cadastrar, login } = require('./controladores/usuario')
const validarLogin = require('./intermediarios/validarLogin')
const validarBody = require('./validacoes/validarBody')
const schemaUsuario = require('./schemas/schemaValidarUsuario')
const rotas = express()


rotas.get('/categorias', categorias)

rotas.post('/login', login)
rotas.post('/cadastrar', validarBody(schemaUsuario),cadastrar)

rotas.use(validarLogin)

rotas.get('/projetos', projetos)
rotas.get('/projeto/:id', projeto)
rotas.post('/projetos', novoProjeto)
rotas.patch('/projetos/:id', editarProjeto)
rotas.delete('/projetos/:id', removerProjeto)

rotas.get('/servicos/:id', servico)
rotas.post('/servicos/:id', adicionarServico)
rotas.patch('/servicos/:id', editarServico)
rotas.delete('/servicos/:id', removerServico)

module.exports = rotas