const { query } = require('../config/database');
const logger = require('../config/logger');
const { v4: uuidv4 } = require('uuid');

class RoleService {
  // Obtener todos los roles
  async getAllRoles() {
    try {
      const roles = await query(
        'SELECT * FROM roles ORDER BY nombre ASC'
      );
      
      return roles;
    } catch (error) {
      logger.error('Error obteniendo roles:', error);
      throw error;
    }
  }
  
  // Obtener roles activos
  async getActiveRoles() {
    try {
      const roles = await query(
        'SELECT * FROM roles WHERE activo = TRUE ORDER BY nombre ASC'
      );
      
      return roles;
    } catch (error) {
      logger.error('Error obteniendo roles activos:', error);
      throw error;
    }
  }
  
  // Obtener rol por ID
  async getRoleById(id) {
    try {
      const roles = await query(
        'SELECT * FROM roles WHERE id = ?',
        [id]
      );
      
      if (roles.length === 0) {
        throw new Error('Rol no encontrado');
      }
      
      return roles[0];
    } catch (error) {
      logger.error('Error obteniendo rol:', error);
      throw error;
    }
  }
  
  // Obtener rol por nombre
  async getRoleByName(nombre) {
    try {
      const roles = await query(
        'SELECT * FROM roles WHERE nombre = ?',
        [nombre]
      );
      
      if (roles.length === 0) {
        return null;
      }
      
      return roles[0];
    } catch (error) {
      logger.error('Error obteniendo rol por nombre:', error);
      throw error;
    }
  }
  
  // Crear rol
  async createRole(roleData) {
    try {
      const { nombre, descripcion, permisos } = roleData;
      
      // Verificar si el rol ya existe
      const existingRole = await this.getRoleByName(nombre);
      
      if (existingRole) {
        throw new Error('Ya existe un rol con ese nombre');
      }
      
      const roleId = uuidv4();
      
      await query(
        `INSERT INTO roles (id, nombre, descripcion, permisos, activo)
         VALUES (?, ?, ?, ?, TRUE)`,
        [
          roleId,
          nombre,
          descripcion || null,
          JSON.stringify(permisos || [])
        ]
      );
      
      logger.info(`Rol creado: ${nombre}`);
      
      return await this.getRoleById(roleId);
    } catch (error) {
      logger.error('Error creando rol:', error);
      throw error;
    }
  }
  
  // Actualizar rol
  async updateRole(id, updateData) {
    try {
      const { nombre, descripcion, permisos, activo } = updateData;
      
      const fields = [];
      const values = [];
      
      if (nombre !== undefined) {
        fields.push('nombre = ?');
        values.push(nombre);
      }
      
      if (descripcion !== undefined) {
        fields.push('descripcion = ?');
        values.push(descripcion);
      }
      
      if (permisos !== undefined) {
        fields.push('permisos = ?');
        values.push(JSON.stringify(permisos));
      }
      
      if (activo !== undefined) {
        fields.push('activo = ?');
        values.push(activo);
      }
      
      if (fields.length === 0) {
        throw new Error('No hay datos para actualizar');
      }
      
      fields.push('updated_at = NOW()');
      values.push(id);
      
      await query(
        `UPDATE roles SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      
      logger.info(`Rol actualizado: ${id}`);
      
      return await this.getRoleById(id);
    } catch (error) {
      logger.error('Error actualizando rol:', error);
      throw error;
    }
  }
  
  // Desactivar rol
  async deactivateRole(id) {
    try {
      await query(
        'UPDATE roles SET activo = FALSE, updated_at = NOW() WHERE id = ?',
        [id]
      );
      
      logger.info(`Rol desactivado: ${id}`);
      
      return { message: 'Rol desactivado exitosamente' };
    } catch (error) {
      logger.error('Error desactivando rol:', error);
      throw error;
    }
  }
  
  // Activar rol
  async activateRole(id) {
    try {
      await query(
        'UPDATE roles SET activo = TRUE, updated_at = NOW() WHERE id = ?',
        [id]
      );
      
      logger.info(`Rol activado: ${id}`);
      
      return { message: 'Rol activado exitosamente' };
    } catch (error) {
      logger.error('Error activando rol:', error);
      throw error;
    }
  }
  
  // Obtener usuarios de un rol
  async getUsersByRole(roleId) {
    try {
      const users = await query(
        `SELECT u.id, u.email, u.nombre, u.apellido_paterno, u.apellido_materno,
                u.puesto, u.activo
         FROM usuarios u
         WHERE u.rol_id = ?
         ORDER BY u.nombre ASC`,
        [roleId]
      );
      
      return users;
    } catch (error) {
      logger.error('Error obteniendo usuarios del rol:', error);
      throw error;
    }
  }
}

module.exports = new RoleService();
