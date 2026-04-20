const rabbitmqConnection = require('../config/rabbitmq');
const logger = require('../config/logger');

class EventBusService {
  constructor() {
    this.serviceName = 'micro-login-users';
  }

  /**
   * Publicar evento en RabbitMQ
   * @param {string} eventType - Tipo de evento (ej: 'user.registered', 'user.logged_in')
   * @param {object} data - Datos del evento
   * @param {object} metadata - Metadatos adicionales
   */
  async publish(eventType, data, metadata = {}) {
    try {
      const channel = await rabbitmqConnection.getChannel();

      const event = {
        eventType,
        service: this.serviceName,
        timestamp: new Date().toISOString(),
        data,
        metadata: {
          ...metadata,
          eventId: this.generateEventId()
        }
      };

      const routingKey = eventType; // ej: 'user.registered', 'user.updated'
      
      const published = channel.publish(
        'ruwark.events',
        routingKey,
        Buffer.from(JSON.stringify(event)),
        {
          persistent: true,
          contentType: 'application/json',
          timestamp: Date.now(),
          appId: this.serviceName
        }
      );

      if (published) {
        logger.info(`📤 Evento publicado: ${eventType}`, {
          eventId: event.metadata.eventId,
          routingKey
        });
      } else {
        logger.warn(`⚠️ No se pudo publicar evento: ${eventType}`);
      }

      return published;
    } catch (error) {
      logger.error(`❌ Error publicando evento ${eventType}:`, error);
      // No lanzar error para no interrumpir el flujo principal
      return false;
    }
  }

  /**
   * Suscribirse a eventos
   * @param {string} queueName - Nombre de la cola
   * @param {string[]} routingKeys - Patrones de routing keys (ej: ['user.*', 'client.created'])
   * @param {function} handler - Función manejadora del evento
   */
  async subscribe(queueName, routingKeys, handler) {
    try {
      const channel = await rabbitmqConnection.getChannel();

      // Crear cola con dead letter exchange
      const queue = await channel.assertQueue(queueName, {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': 'ruwark.dlx',
          'x-dead-letter-routing-key': `dlx.${queueName}`,
          'x-message-ttl': 86400000 // 24 horas
        }
      });

      // Bindear cola con routing keys
      for (const routingKey of routingKeys) {
        await channel.bindQueue(queue.queue, 'ruwark.events', routingKey);
        logger.info(`🔗 Queue '${queueName}' vinculada con routing key '${routingKey}'`);
      }

      // Consumir mensajes
      await channel.consume(queue.queue, async (msg) => {
        if (msg !== null) {
          try {
            const event = JSON.parse(msg.content.toString());
            
            logger.info(`📥 Evento recibido: ${event.eventType}`, {
              eventId: event.metadata?.eventId,
              service: event.service
            });

            // Ejecutar handler
            await handler(event);

            // Confirmar mensaje
            channel.ack(msg);
          } catch (error) {
            logger.error('❌ Error procesando evento:', error);
            
            // Rechazar mensaje y enviarlo a DLX
            channel.nack(msg, false, false);
          }
        }
      }, {
        noAck: false
      });

      logger.info(`✅ Suscrito a eventos en queue '${queueName}'`);
    } catch (error) {
      logger.error(`❌ Error suscribiendo a eventos en queue '${queueName}':`, error);
      throw error;
    }
  }

  /**
   * Generar ID único para evento
   */
  generateEventId() {
    return `${this.serviceName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ==================== MÉTODOS DE PUBLICACIÓN ESPECÍFICOS ====================

  /**
   * Usuario registrado
   */
  async publishUserRegistered(userData) {
    return this.publish('user.registered', {
      userId: userData.id,
      email: userData.email,
      nombre: userData.nombre,
      apellido_paterno: userData.apellido_paterno,
      clienteId: userData.cliente_id,
      rolId: userData.rol_id
    });
  }

  /**
   * Usuario inició sesión
   */
  async publishUserLoggedIn(userData, sessionInfo) {
    return this.publish('user.logged_in', {
      userId: userData.id,
      email: userData.email,
      nombre: `${userData.nombre} ${userData.apellido_paterno}`,
      sessionId: sessionInfo.sessionId,
      ipAddress: sessionInfo.ipAddress,
      userAgent: sessionInfo.userAgent
    });
  }

  /**
   * Usuario cerró sesión
   */
  async publishUserLoggedOut(userId, sessionId) {
    return this.publish('user.logged_out', {
      userId,
      sessionId
    });
  }

  /**
   * Usuario actualizado
   */
  async publishUserUpdated(userId, updatedFields) {
    return this.publish('user.updated', {
      userId,
      updatedFields
    });
  }

  /**
   * Usuario eliminado
   */
  async publishUserDeleted(userId) {
    return this.publish('user.deleted', {
      userId
    });
  }

  /**
   * Cliente creado
   */
  async publishClientCreated(clientData) {
    return this.publish('client.created', {
      clientId: clientData.id,
      razonSocial: clientData.razon_social,
      nombreComercial: clientData.nombre_comercial,
      email: clientData.email,
      plan: clientData.plan
    });
  }

  /**
   * Cliente actualizado
   */
  async publishClientUpdated(clientId, updatedFields) {
    return this.publish('client.updated', {
      clientId,
      updatedFields
    });
  }

  /**
   * Rol actualizado
   */
  async publishRoleUpdated(roleId, roleName, permissions) {
    return this.publish('role.updated', {
      roleId,
      roleName,
      permissions
    });
  }

  /**
   * Cambio de contraseña
   */
  async publishPasswordChanged(userId, email) {
    return this.publish('user.password_changed', {
      userId,
      email
    });
  }
}

module.exports = new EventBusService();
