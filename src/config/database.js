const mysql = require('mysql2/promise');
const config = require('./index');
const logger = require('./logger');

// Crear pool de conexiones
const pool = mysql.createPool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  connectionLimit: config.database.connectionLimit,
  waitForConnections: config.database.waitForConnections,
  queueLimit: config.database.queueLimit,
  enableKeepAlive: config.database.enableKeepAlive,
  keepAliveInitialDelay: config.database.keepAliveInitialDelay,
  charset: 'utf8mb4'
});

// Verificar conexión inicial
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    logger.info('✅ Conexión exitosa a MySQL');
    logger.info(`📊 Base de datos: ${config.database.database}`);
    logger.info(`🌐 Host: ${config.database.host}:${config.database.port}`);
    connection.release();
    return true;
  } catch (error) {
    logger.error('❌ Error al conectar con MySQL:', error.message);
    logger.error('Detalles de configuración:');
    logger.error(`  - Host: ${config.database.host}`);
    logger.error(`  - Puerto: ${config.database.port}`);
    logger.error(`  - Usuario: ${config.database.user}`);
    logger.error(`  - Base de datos: ${config.database.database}`);
    throw error;
  }
};

// Manejar errores del pool
pool.on('error', (err) => {
  logger.error('Error inesperado en el pool de MySQL:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    logger.error('Conexión a la base de datos perdida');
  }
});

// Helper para ejecutar queries con manejo de errores
const query = async (sql, params) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    logger.error('Error ejecutando query:', error.message);
    logger.error('SQL:', sql);
    throw error;
  }
};

// Helper para transacciones
const transaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    logger.error('Error en transacción, rollback realizado:', error.message);
    throw error;
  } finally {
    connection.release();
  }
};

// Cerrar pool de conexiones (para shutdown graceful)
const closePool = async () => {
  try {
    await pool.end();
    logger.info('Pool de conexiones MySQL cerrado correctamente');
  } catch (error) {
    logger.error('Error al cerrar pool de MySQL:', error.message);
    throw error;
  }
};

module.exports = {
  pool,
  query,
  transaction,
  testConnection,
  closePool
};
