require('dotenv').config();

module.exports = {
  server: {
    port: process.env.PORT || 3002,
    env: process.env.NODE_ENV || 'development',
    serviceName: process.env.SERVICE_NAME || 'micro-login-users'
  },
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dblogin',
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
    waitForConnections: true,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  },
  
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  
  services: {
    apiGateway: process.env.API_GATEWAY_URL || 'http://localhost:3000',
    eventBus: process.env.EVENT_BUS_URL || 'http://localhost:3010',
    serviceToken: process.env.SERVICE_TOKEN
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  }
};
