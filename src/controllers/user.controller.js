const userService = require('../services/user.service');
const logger = require('../config/logger');

class UserController {
  // GET /api/users
  async getAllUsers(req, res) {
    try {
      const filters = {
        cliente_id: req.query.cliente_id,
        rol_id: req.query.rol_id,
        activo: req.query.activo,
        departamento: req.query.departamento
      };
      
      const usuarios = await userService.getAllUsers(filters);
      
      res.json({
        success: true,
        data: usuarios
      });
    } catch (error) {
      logger.error('Error obteniendo usuarios:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // GET /api/users/:id
  async getUserById(req, res) {
    try {
      const usuario = await userService.getUserById(req.params.id);
      
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      
      res.json({
        success: true,
        data: usuario
      });
    } catch (error) {
      logger.error('Error obteniendo usuario:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // PUT /api/users/:id
  async updateUser(req, res) {
    try {
      const usuario = await userService.updateUser(req.params.id, req.body);
      
      res.json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: usuario
      });
    } catch (error) {
      logger.error('Error actualizando usuario:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // DELETE /api/users/:id
  async deleteUser(req, res) {
    try {
      await userService.deleteUser(req.params.id);
      
      res.json({
        success: true,
        message: 'Usuario eliminado exitosamente'
      });
    } catch (error) {
      logger.error('Error eliminando usuario:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // POST /api/users/:id/change-password
  async changePassword(req, res) {
    try {
      const { oldPassword, newPassword } = req.body;
      
      await userService.changePassword(req.params.id, oldPassword, newPassword);
      
      res.json({
        success: true,
        message: 'Password cambiado exitosamente'
      });
    } catch (error) {
      logger.error('Error cambiando password:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // GET /api/users/:id/team
  async getUserTeam(req, res) {
    try {
      const equipo = await userService.getUserTeam(req.params.id);
      
      res.json({
        success: true,
        data: equipo
      });
    } catch (error) {
      logger.error('Error obteniendo equipo:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // GET /api/users/me
  async getCurrentUser(req, res) {
    try {
      const usuario = await userService.getUserById(req.user.id);
      
      res.json({
        success: true,
        data: usuario
      });
    } catch (error) {
      logger.error('Error obteniendo usuario actual:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/users/by-role/:rolId - Obtener usuarios por rol (datos mínimos)
  async getUsuariosByRol(req, res) {
    try {
      const { rolId } = req.params;

      if (!rolId) {
        return res.status(400).json({
          success: false,
          message: 'rol_id es requerido'
        });
      }

      const usuarios = await userService.getUsuariosByRolId(rolId);

      res.json({
        success: true,
        total: usuarios.length,
        data: usuarios
      });
    } catch (error) {
      logger.error('Error obteniendo usuarios por rol:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new UserController();
