const usuarioExternoService = require('../services/usuario-externo.service');
const logger = require('../config/logger');

class UsuarioExternoController {
  // GET /api/usuarios_externos/search?q=termino
  async searchClientes(req, res) {
    try {
      logger.info('=== CONTROLLER SEARCH CLIENTES ===');
      logger.info('Query params:', req.query);
      
      const { q, limit } = req.query;
      
      if (!q || q.length < 2) {
        logger.info('Término muy corto, devolviendo array vacío');
        return res.json({
          success: true,
          data: []
        });
      }
      
      logger.info(`Buscando clientes con término: "${q}"`);
      const clientes = await usuarioExternoService.searchClientes(q, parseInt(limit) || 10);
      
      logger.info(`Clientes encontrados: ${clientes.length}`);
      
      res.json({
        success: true,
        data: clientes
      });
    } catch (error) {
      logger.error('Error buscando clientes:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/clientes
  async getAllClientes(req, res) {
    try {
      const filters = {
        activo: req.query.activo
      };
      
      const clientes = await usuarioExternoService.getAllClientes(filters);
      
      res.json({
        success: true,
        data: clientes
      });
    } catch (error) {
      logger.error('Error obteniendo usuarios externos:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/usuarios_externos/by-ids
  // Obtiene clientes por múltiples IDs (para merge con suscripciones de otro servicio)
  async getClientesByIds(req, res) {
    try {
      const { ids } = req.body;
      
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.json({
          success: true,
          data: []
        });
      }
      
      const clientes = await usuarioExternoService.getClientesByIds(ids);
      
      res.json({
        success: true,
        data: clientes
      });
    } catch (error) {
      logger.error('Error obteniendo clientes por IDs:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // GET /api/clientes/:id
  async getClienteById(req, res) {
    try {
      const cliente = await usuarioExternoService.getClienteById(req.params.id);
      
      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente no encontrado'
        });
      }
      
      res.json({
        success: true,
        data: cliente
      });
    } catch (error) {
      logger.error('Error obteniendo cliente:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // POST /api/clientes
  async createCliente(req, res) {
    try {
      logger.info('=== CREAR CLIENTE - INICIO ===');
      logger.info('Body recibido:', JSON.stringify(req.body, null, 2));
      
      const cliente = await usuarioExternoService.createCliente(req.body);
      
      logger.info('Cliente creado exitosamente:', cliente.id);
      
      res.status(201).json({
        success: true,
        message: 'Cliente creado exitosamente',
        data: cliente
      });
    } catch (error) {
      logger.error('=== ERROR AL CREAR CLIENTE ===');
      logger.error('Error completo:', error);
      logger.error('Mensaje:', error.message);
      logger.error('Stack:', error.stack);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Error al crear cliente'
      });
    }
  }
  
  // PUT /api/clientes/:id
  async updateCliente(req, res) {
    try {
      logger.info('=== ACTUALIZAR CLIENTE ===');
      logger.info('ID:', req.params.id);
      logger.info('Body recibido:', req.body);
      
      const cliente = await usuarioExternoService.updateCliente(req.params.id, req.body);
      
      logger.info('Cliente actualizado exitosamente:', cliente.id);
      
      res.json({
        success: true,
        message: 'Cliente actualizado exitosamente',
        data: cliente
      });
    } catch (error) {
      logger.error('=== ERROR AL ACTUALIZAR CLIENTE ===');
      logger.error('Error completo:', error);
      logger.error('Mensaje:', error.message);
      logger.error('Stack:', error.stack);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Error al actualizar cliente'
      });
    }
  }
  
  // DELETE /api/clientes/:id
  async deleteCliente(req, res) {
    try {
      await usuarioExternoService.deleteCliente(req.params.id);
      
      res.json({
        success: true,
        message: 'Cliente eliminado exitosamente'
      });
    } catch (error) {
      logger.error('Error eliminando cliente:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/clientes/:id/change-password
  async changePassword(req, res) {
    try {
      const { oldPassword, newPassword } = req.body;
      await usuarioExternoService.changePassword(req.params.id, oldPassword, newPassword);
      
      res.json({
        success: true,
        message: 'Contraseña cambiada exitosamente'
      });
    } catch (error) {
      logger.error('Error cambiando contraseña:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/clientes/:id/admin-change-password
  async adminChangePassword(req, res) {
    try {
      const { newPassword } = req.body;
      
      if (!newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Nueva contraseña es requerida'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'La nueva contraseña debe tener al menos 6 caracteres'
        });
      }

      const result = await usuarioExternoService.adminChangePassword(req.params.id, newPassword);
      
      res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente por administrador',
        data: result
      });
    } catch (error) {
      logger.error('Error en cambio administrativo de contraseña:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // GET /api/clientes/:id/stats
  async getClienteStats(req, res) {
    try {
      const stats = await usuarioExternoService.getClienteStats(req.params.id);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new UsuarioExternoController();
