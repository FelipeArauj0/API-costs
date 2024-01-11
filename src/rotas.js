const express = require('express')
const { projetos, novoProjeto, removerProjeto, adicionarServico, removerServico, editarServico, editarProjeto } = require('./controladores/projetos')
const categorias = require('./controladores/categorias')

const rotas = express()

rotas.get('/projetos', projetos)
rotas.get('/categorias', categorias)

rotas.post('/projetos', novoProjeto)
rotas.patch('/projetos/:id', editarProjeto)
rotas.delete('/projetos/:id', removerProjeto)

rotas.post('/servicos/:id', adicionarServico)
rotas.patch('/servicos/:id', editarServico)
rotas.delete('/servicos/:id', removerServico)

module.exports = rotas