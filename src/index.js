const express = require('express');
const rotas = require('./rotas');
const app = express()

app.use(express.json());
app.use(rotas)


app.listen(8080, ()=>{
    console.log('API rodando na porta 8080');
})