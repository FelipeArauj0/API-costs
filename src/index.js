const express = require('express');
const rotas = require('./rotas');
const app = express()
const cors = require('cors');
const corsOptions = require('./corsConfig');

app.use(cors(corsOptions));
app.use(express.json())
app.use(rotas)




if (process.env.NODE_ENV !== 'production') {
    app.listen(3000, () => {
      console.log('Servidor rodando localmente');
    });
  }

  module.exports = app