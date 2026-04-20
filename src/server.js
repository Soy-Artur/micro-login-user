const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const logger = require('./config/logger');
const database = require('./config/database');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');
const rabbitmqConnection = require('./config/rabbitmq');
const SessionCleanupService = require('./services/sessionCleanup.service');

const app = express();

// Middlewares de seguridad
app.use(helmet());
app.use(cors(config.cors));

// Middlewares de parseo
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger de requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Rutas principales
app.use('/api', routes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    service: config.server.serviceName,
    version: '1.0.0',
    status: 'running',
    database: 'MySQL',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      clientes: '/api/clientes',
      roles: '/api/roles'
    }
  });
});

// Manejadores de errores
app.use(notFoundHandler);
app.use(errorHandler);

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Verificar conexión a la base de datos
    await database.testConnection();
    
    // Conectar a RabbitMQ
    try {
      await rabbitmqConnection.connect();
      logger.info('✅ RabbitMQ inicializado correctamente');
    } catch (error) {
      logger.warn('⚠️ No se pudo conectar a RabbitMQ al iniciar:', error.message);
      logger.warn('⚠️ Los eventos no se publicarán hasta que se establezca la conexión');
    }
    
    // Iniciar servidor
    const PORT = config.server.port;
    
    app.listen(PORT, () => {
      logger.info(`🚀 Microservicio ${config.server.serviceName} iniciado`);
      logger.info(`📡 Puerto: ${PORT}`);
      logger.info(`🌍 Entorno: ${config.server.env}`);
      logger.info(`🔗 URL: http://localhost:${PORT}`);
      logger.info(`💾 Base de datos: MySQL (${config.database.database})`);
      
      // 🧹 INICIALIZAR LIMPIEZA AUTOMÁTICA DE SESIONES
      try {
        SessionCleanupService.scheduleAutomaticCleanup();
        logger.info('🧹 ✅ Sistema de limpieza automática de sesiones inicializado');
      } catch (error) {
        logger.warn('🧹 ⚠️ No se pudo inicializar la limpieza automática de sesiones:', error.message);
      }
    });
  } catch (error) {
    logger.error('❌ Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
};

// Iniciar servidor
startServer();

// Manejo de shutdown graceful
const gracefulShutdown = async () => {
  logger.info('Cerrando servidor...');
  try {
    await database.closePool();
    await rabbitmqConnection.close();
    logger.info('Servidor cerrado correctamente');
    process.exit(0);
  } catch (error) {
    logger.error('Error al cerrar servidor:', error.message);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

module.exports = app;
