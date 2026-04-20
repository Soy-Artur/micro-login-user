const { query } = require('../config/database');
const logger = require('../config/logger');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class UserService {
  // Obtener todos los usuarios
  async getAllUsers(filters = {}) {
    try {
      let sql = `
        SELECT u.*, 
               r.id as rol_id,
               r.nombre as rol_nombre, 
               r.descripcion as rol_descripcion,
               r.permisos as rol_permisos
        FROM usuarios u
        LEFT JOIN roles r ON u.rol_id = r.id
        WHERE 1=1
      `;
      
      const params = [];
      
      if (filters.rol_id) {
        sql += ' AND u.rol_id = ?';
        params.push(filters.rol_id);
      }
      
      if (filters.activo !== undefined) {
        sql += ' AND u.activo = ?';
        params.push(filters.activo);
      }
      
      if (filters.puesto) {
        sql += ' AND u.puesto = ?';
        params.push(filters.puesto);
      }
      
      sql += ' ORDER BY u.created_at DESC';
      
      const users = await query(sql, params);
      
      // Remover password_hash y formatear cada usuario
      return users.map(user => {
        delete user.password_hash;
        delete user.refresh_token;
        // ✅ Formatear cada usuario con rol anidado
        return this.formatUserResponse(user);
      });
    } catch (error) {
      logger.error('Error obteniendo usuarios:', error);
      throw error;
    }
  }
  
  // Formatear respuesta de usuario con rol anidado
  formatUserResponse(user) {
    if (!user) return null;
    
    // Crear copia del usuario
    const formattedUser = { ...user };
    
    // Si tiene datos de rol, formatearlos como objeto anidado
    if (user.rol_nombre || user.rol_id) {
      let permisos = [];
      if (user.rol_permisos) {
        // Si ya es un objeto/array, usarlo directamente
        if (typeof user.rol_permisos === 'object') {
          permisos = Array.isArray(user.rol_permisos) ? user.rol_permisos : [];
        } 
        // Si es string, parsearlo
        else if (typeof user.rol_permisos === 'string' && user.rol_permisos.trim() !== '') {
          try {
            permisos = JSON.parse(user.rol_permisos);
          } catch (err) {
            console.error('Error parsing rol_permisos:', err);
            permisos = [];
          }
        }
      }
      
      formattedUser.rol = {
        id: user.rol_id,
        nombre: user.rol_nombre,
        descripcion: user.rol_descripcion,
        permisos
      };
      
      // Remover campos planos del rol
      delete formattedUser.rol_id;
      delete formattedUser.rol_nombre;
      delete formattedUser.rol_descripcion;
      delete formattedUser.rol_permisos;
    }
    
    // Si tiene datos de cliente, formatearlos (si existen en el futuro)
    // ... código similar para cliente
    
    return formattedUser;
  }
  
  // Obtener usuario por ID
  async getUserById(id) {
    try {
      const users = await query(
        `SELECT u.*, 
                r.id as rol_id,
                r.nombre as rol_nombre, 
                r.descripcion as rol_descripcion,
                r.permisos as rol_permisos
         FROM usuarios u
         LEFT JOIN roles r ON u.rol_id = r.id
         WHERE u.id = ?`,
        [id]
      );
      
      if (users.length === 0) {
        throw new Error('Usuario no encontrado');
      }
      
      const user = users[0];
      
      // Remover información sensible
      delete user.password_hash;
      delete user.refresh_token;
      
      // ✅ Formatear respuesta con rol anidado
      return this.formatUserResponse(user);
    } catch (error) {
      logger.error('Error obteniendo usuario:', error);
      throw error;
    }
  }
  
  // Obtener usuario por email
  async getUserByEmail(email) {
    try {
      const users = await query(
        `SELECT u.*, 
                r.id as rol_id,
                r.nombre as rol_nombre,
                r.descripcion as rol_descripcion,
                r.permisos as rol_permisos
         FROM usuarios u
         LEFT JOIN roles r ON u.rol_id = r.id
         WHERE u.email = ?`,
        [email]
      );
      
      if (users.length === 0) {
        return null;
      }
      
      const user = users[0];
      delete user.password_hash;
      delete user.refresh_token;
      
      // ✅ Formatear respuesta con rol anidado
      return this.formatUserResponse(user);
    } catch (error) {
      logger.error('Error obteniendo usuario por email:', error);
      throw error;
    }
  }
  
  // Actualizar usuario
  async updateUser(id, updateData) {
    try {
      // Remover campos que no se deben actualizar directamente
      delete updateData.id;
      delete updateData.password_hash;
      delete updateData.refresh_token;
      delete updateData.created_at;
      
      // 🔐 Si se está cambiando la contraseña, hashearla
      if (updateData.password) {
        updateData.password_hash = await bcrypt.hash(updateData.password, 10);
        delete updateData.password; // Remover password plano
        logger.info(`🔑 Password actualizado para usuario: ${id}`);
      }
      
      // Construir query dinámicamente
      const fields = Object.keys(updateData);
      const values = Object.values(updateData);
      
      if (fields.length === 0) {
        throw new Error('No hay datos para actualizar');
      }
      
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      values.push(id);
      
      await query(
        `UPDATE usuarios SET ${setClause}, updated_at = NOW() WHERE id = ?`,
        values
      );
      
      logger.info(`Usuario actualizado: ${id}`);
      
      // Retornar usuario actualizado
      return await this.getUserById(id);
    } catch (error) {
      logger.error('Error actualizando usuario:', error);
      throw error;
    }
  }
  
  // Cambiar contraseña
  async changePassword(id, oldPassword, newPassword) {
    try {
      // Obtener usuario con password_hash
      const users = await query(
        'SELECT password_hash FROM usuarios WHERE id = ?',
        [id]
      );
      
      if (users.length === 0) {
        throw new Error('Usuario no encontrado');
      }
      
      const user = users[0];
      
      // Verificar contraseña anterior
      const isValid = await bcrypt.compare(oldPassword, user.password_hash);
      
      if (!isValid) {
        throw new Error('Contraseña actual incorrecta');
      }
      
      // Hashear nueva contraseña
      const newPasswordHash = await bcrypt.hash(newPassword, 10);
      
      // Actualizar contraseña
      await query(
        'UPDATE usuarios SET password_hash = ?, updated_at = NOW() WHERE id = ?',
        [newPasswordHash, id]
      );
      
      logger.info(`Contraseña cambiada para usuario: ${id}`);
      
      return { message: 'Contraseña actualizada exitosamente' };
    } catch (error) {
      logger.error('Error cambiando contraseña:', error);
      throw error;
    }
  }
  
  // Eliminar usuario REALMENTE de la base de datos
  async deleteUser(id) {
    try {
      // 🗑️ ELIMINACIÓN REAL - DELETE from database
      const result = await query('DELETE FROM usuarios WHERE id = ?', [id]);
      
      if (result.affectedRows === 0) {
        throw new Error('Usuario no encontrado');
      }
      
      logger.info(`Usuario eliminado completamente: ${id}`);
      
      return { message: 'Usuario eliminado exitosamente de la base de datos' };
    } catch (error) {
      logger.error('Error eliminando usuario:', error);
      throw error;
    }
  }
  
  // Activar usuario
  async activateUser(id) {
    try {
      await query(
        'UPDATE usuarios SET activo = TRUE, updated_at = NOW() WHERE id = ?',
        [id]
      );
      
      logger.info(`Usuario activado: ${id}`);
      
      return { message: 'Usuario activado exitosamente' };
    } catch (error) {
      logger.error('Error activando usuario:', error);
      throw error;
    }
  }
  
  // Obtener usuarios por rol
  async getUsersByRole(roleName) {
    try {
      const users = await query(
        `SELECT u.*, 
                r.id as rol_id,
                r.nombre as rol_nombre,
                r.descripcion as rol_descripcion,
                r.permisos as rol_permisos
         FROM usuarios u
         INNER JOIN roles r ON u.rol_id = r.id
         WHERE r.nombre = ? AND u.activo = TRUE`,
        [roleName]
      );
      
      return users.map(user => {
        delete user.password_hash;
        delete user.refresh_token;
        // ✅ Formatear cada usuario con rol anidado
        return this.formatUserResponse(user);
      });
    } catch (error) {
      logger.error('Error obteniendo usuarios por rol:', error);
      throw error;
    }
  }
  
  // Obtener usuarios por rol_id (solo datos mínimos: id y nombre completo)
  async getUsuariosByRolId(rolId) {
    try {
      const users = await query(
        `SELECT u.id, CONCAT(u.nombre, ' ', u.apellido_paterno, IFNULL(CONCAT(' ', u.apellido_materno), '')) AS nombre_completo
         FROM usuarios u
         WHERE u.rol_id = ? AND u.activo = 1
         ORDER BY u.nombre ASC`,
        [rolId]
      );
      return users;
    } catch (error) {
      logger.error('Error obteniendo usuarios por rol_id:', error);
      throw error;
    }
  }

  // Resetear intentos fallidos
  async resetLoginAttempts(id) {
    try {
      await query(
        `UPDATE usuarios 
         SET intentos_fallidos = 0, 
             bloqueado_hasta = NULL, 
             updated_at = NOW() 
         WHERE id = ?`,
        [id]
      );
      
      logger.info(`Intentos de login reseteados para usuario: ${id}`);
      
      return { message: 'Intentos reseteados exitosamente' };
    } catch (error) {
      logger.error('Error reseteando intentos:', error);
      throw error;
    }
  }
}

module.exports = new UserService();
