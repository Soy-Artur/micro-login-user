const amqp = require('amqplib');
const logger = require('./logger');

class RabbitMQConnection {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 5000; // 5 segundos
  }

  /**
   * Conectar a RabbitMQ
   */
  async connect() {
    try {
      const rabbitConfig = {
        protocol: 'amqp',
        hostname: process.env.RABBITMQ_HOST || 'appsruwark-rabbitmqbus.v3z7ma.easypanel.host',
        port: parseInt(process.env.RABBITMQ_PORT) || 5672,
        username: process.env.RABBITMQ_USER || 'guest',
        password: process.env.RABBITMQ_PASS || 'guest',
        vhost: process.env.RABBITMQ_VHOST || '/',
        heartbeat: 30,
        connectionTimeout: 60000,
        // Configuraciones adicionales para conexiones en producción
        frameMax: 0,
        channelMax: 0,
        locale: 'en_US'
      };

      logger.info('🐰 Conectando a RabbitMQ...', {
        host: rabbitConfig.hostname,
        port: rabbitConfig.port,
        vhost: rabbitConfig.vhost
      });

      this.connection = await amqp.connect(rabbitConfig);
      this.channel = await this.connection.createChannel();
      
      // Configurar prefetch para no sobrecargar el consumidor
      await this.channel.prefetch(10);

      this.isConnected = true;
      this.reconnectAttempts = 0;

      logger.info('✅ Conectado a RabbitMQ exitosamente');

      // Manejar eventos de conexión
      this.connection.on('error', (err) => {
        logger.error('❌ Error en conexión de RabbitMQ:', err);
        this.isConnected = false;
      });

      this.connection.on('close', () => {
        logger.warn('⚠️ Conexión a RabbitMQ cerrada');
        this.isConnected = false;
        this.handleReconnect();
      });

      this.connection.on('blocked', (reason) => {
        logger.warn('⚠️ Conexión a RabbitMQ bloqueada:', reason);
      });

      this.connection.on('unblocked', () => {
        logger.info('✅ Conexión a RabbitMQ desbloqueada');
      });

      // Crear exchange principal
      await this.setupExchanges();

      return this.channel;
    } catch (error) {
      logger.error('❌ Error conectando a RabbitMQ:', error);
      this.isConnected = false;
      this.handleReconnect();
      throw error;
    }
  }

  /**
   * Configurar exchanges y queues
   */
  async setupExchanges() {
    try {
      // Exchange principal para todos los eventos (tipo topic)
      await this.channel.assertExchange('ruwark.events', 'topic', {
        durable: true,
        autoDelete: false
      });

      // Exchange para dead letter queue
      await this.channel.assertExchange('ruwark.dlx', 'topic', {
        durable: true,
        autoDelete: false
      });

      logger.info('✅ Exchanges configurados correctamente');
    } catch (error) {
      logger.error('❌ Error configurando exchanges:', error);
      throw error;
    }
  }

  /**
   * Intentar reconexión
   */
  async handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error(`❌ Máximo de intentos de reconexión alcanzado (${this.maxReconnectAttempts})`);
      return;
    }

    this.reconnectAttempts++;
    logger.info(`🔄 Intentando reconectar a RabbitMQ (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        logger.error('❌ Error en reconexión:', error);
      }
    }, this.reconnectDelay);
  }

  /**
   * Obtener canal
   */
  async getChannel() {
    if (!this.isConnected || !this.channel) {
      try {
        logger.info('🔄 Reintentando conexión a RabbitMQ...');
        await this.connect();
        return this.channel;
      } catch (error) {
        logger.warn('⚠️ RabbitMQ no disponible, continuando sin eventos:', error.message);
        throw new Error('RabbitMQ no está conectado');
      }
    }
    return this.channel;
  }

  /**
   * Cerrar conexión
   */
  async close() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.isConnected = false;
      logger.info('🔌 Conexión a RabbitMQ cerrada correctamente');
    } catch (error) {
      logger.error('❌ Error cerrando conexión de RabbitMQ:', error);
    }
  }
}

// Singleton instance
const rabbitmqConnection = new RabbitMQConnection();

module.exports = rabbitmqConnection;
