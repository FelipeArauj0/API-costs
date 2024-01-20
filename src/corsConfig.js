const corsOptions = {
    origin: 'http://localhost:3000/',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELEYE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'autorizathion'],
    optionsSuccessStatus: 204,
  };
  module.exports = corsOptions