require('dotenv').config()
const knex = require('knex')({
    client: 'pg',
    connection: {
      host : process.env.DB_HOST,
      port : 5432,
      user : process.env.DB_USER,
      password : process.env.DB_PASS,
      database : process.env.DB_NAME
    }
  });

  module.exports = knex