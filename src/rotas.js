const express = require('express')
const { projetos, novoProjeto, removerProjeto, adicionarServico, removerServico, editarServico, editarProjeto, projeto } = require('./controladores/projetos')
const categorias = require('./controladores/categorias')
const { cadastrar, login } = require('./controladores/usuario')
const validarLogin = require('./intermediarios/validarLogin')
const rotas = express()


rotas.get('/categorias', categorias)

rotas.post('/login', login)
rotas.post('/cadastrar', cadastrar)

rotas.use(validarLogin)

rotas.get('/projetos', projetos)
rotas.get('/projeto/:id', projeto)
rotas.post('/projetos', novoProjeto)
rotas.patch('/projetos/:id', editarProjeto)
rotas.delete('/projetos/:id', removerProjeto)

rotas.post('/servicos/:id', adicionarServico)
rotas.patch('/servicos/:id', editarServico)
rotas.delete('/servicos/:id', removerServico)

module.exports = rotas