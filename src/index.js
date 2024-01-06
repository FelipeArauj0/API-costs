const express = require('express')
const app = express()

app.use(express.json());

app.get('/', (req,res)=>{
    return res.json('API ok')
})

app.listen(8080, ()=>{
    console.log('API rodando na porta 8080');
})