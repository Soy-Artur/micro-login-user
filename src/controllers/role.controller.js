const roleService = require('../services/role.service');
const logger = require('../config/logger');

class RoleController {
  // GET /api/roles
  async getAllRoles(req, res) {
    try {
      const roles = await roleService.getAllRoles();
      
      res.json({
        success: true,
        data: roles
      });
    } catch (error) {
      logger.error('Error obteniendo roles:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // GET /api/roles/:id
  async getRoleById(req, res) {
    try {
      const role = await roleService.getRoleById(req.params.id);
      
      if (!role) {
        return res.status(404).json({
          success: false,
          message: 'Rol no encontrado'
        });
      }
      
      res.json({
        success: true,
        data: role
      });
    } catch (error) {
      logger.error('Error obteniendo rol:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // POST /api/roles
  async createRole(req, res) {
    try {
      const role = await roleService.createRole(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Rol creado exitosamente',
        data: role
      });
    } catch (error) {
      logger.error('Error creando rol:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // PUT /api/roles/:id
  async updateRole(req, res) {
    try {
      const role = await roleService.updateRole(req.params.id, req.body);
      
      res.json({
        success: true,
        message: 'Rol actualizado exitosamente',
        data: role
      });
    } catch (error) {
      logger.error('Error actualizando rol:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // DELETE /api/roles/:id
  async deleteRole(req, res) {
    try {
      await roleService.deleteRole(req.params.id);
      
      res.json({
        success: true,
        message: 'Rol eliminado exitosamente'
      });
    } catch (error) {
      logger.error('Error eliminando rol:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // PUT /api/roles/:id/permissions
  async assignPermissions(req, res) {
    try {
      const { permisos } = req.body;
      
      const role = await roleService.assignPermissions(req.params.id, permisos);
      
      res.json({
        success: true,
        message: 'Permisos asignados exitosamente',
        data: role
      });
    } catch (error) {
      logger.error('Error asignando permisos:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new RoleController();
