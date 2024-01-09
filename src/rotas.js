const express = require('express')
const { projetos, novoProjeto, removerProjeto, adicionarServico, removerServico, editarServico } = require('./controladores/projetos')
const categorias = require('./controladores/categorias')

const rotas = express()

rotas.get('/projetos', projetos)
rotas.get('/categorias', categorias)
rotas.post('/projetos', novoProjeto)
rotas.post('/projetos/:id', adicionarServico)
rotas.patch('/servicos/:id', editarServico)
rotas.delete('/projetos/:id', removerProjeto)
rotas.delete('/servicos/:id', removerServico)

module.exports = rotas