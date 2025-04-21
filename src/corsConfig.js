const corsOptions = {
    origin: 'https://api-costs.vercel.app/',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELEYE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'autorizathion'],
    optionsSuccessStatus: 204,
  };
  module.exports = corsOptions