const express = require('express');
const rotas = require('./rotas');
const app = express()
const cors = require('cors');
const corsOptions = require('./corsConfig');

app.use(express.json())
app.use(cors)
app.options('*')
app.use(rotas)




app.listen(process.env.PORT || 3000, ()=>{
    console.log('API rodando na porta 8080');
})