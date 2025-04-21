const corsOptions = {
  origin: 'https://costs-eta.vercel.app', 
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'authorization'],
  optionsSuccessStatus: 204,
};

module.exports = corsOptions;