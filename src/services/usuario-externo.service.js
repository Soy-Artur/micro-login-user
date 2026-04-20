const { query } = require('../config/database');
const bcrypt = require('bcryptjs');
const logger = require('../config/logger');
const { v4: uuidv4 } = require('uuid');

class ClienteService {
  // Buscar clientes por término (para autocompletado)
  async searchClientes(searchTerm, limit = 10) {
    try {
      logger.info(`=== BÚSQUEDA DE CLIENTES ===`);
      logger.info(`Término de búsqueda: "${searchTerm}"`);
      logger.info(`Límite: ${limit}`);
      
      // Asegurar que limit sea número entero
      const limitNum = parseInt(limit, 10) || 10;
      
      // LIMIT debe ser inyectado directamente (es un número, no hay riesgo de SQL injection)
      const sql = `
        SELECT id, email, nombres, apellidos, telefono, activo
        FROM usuarios_externos
        WHERE activo = 1
          AND (
            nombres LIKE ? 
            OR apellidos LIKE ? 
            OR email LIKE ? 
            OR CONCAT(IFNULL(nombres, ''), ' ', IFNULL(apellidos, '')) LIKE ?
          )
        ORDER BY nombres, apellidos
        LIMIT ${limitNum}
      `;
      
      const term = `%${searchTerm}%`;
      
      logger.info(`Término con wildcards: "${term}"`);
      logger.info(`Ejecutando query...`);
      
      const clientes = await query(sql, [term, term, term, term]);
      
      logger.info(`Resultados encontrados: ${clientes.length}`);
      if (clientes.length > 0) {
        logger.info(`Primer resultado: ${JSON.stringify(clientes[0])}`);
      }
      
      return clientes.map(cliente => ({
        id: cliente.id,
        email: cliente.email,
        nombres: cliente.nombres,
        apellidos: cliente.apellidos,
        telefono: cliente.telefono,
        nombre_completo: `${cliente.nombres || ''} ${cliente.apellidos || ''}`.trim() || cliente.email
      }));
    } catch (error) {
      logger.error('Error buscando clientes:', error);
      throw error;
    }
  }

  // Obtener clientes por múltiples IDs (para merge con suscripciones)
  async getClientesByIds(ids) {
    try {
      if (!ids || ids.length === 0) {
        return [];
      }
      
      // Crear placeholders para la query IN
      const placeholders = ids.map(() => '?').join(',');
      
      const sql = `
        SELECT id, email, nombres, apellidos, telefono, activo
        FROM usuarios_externos
        WHERE id IN (${placeholders})
      `;
      
      const clientes = await query(sql, ids);
      
      return clientes.map(cliente => ({
        id: cliente.id,
        email: cliente.email,
        nombres: cliente.nombres,
        apellidos: cliente.apellidos,
        telefono: cliente.telefono,
        nombre_completo: `${cliente.nombres || ''} ${cliente.apellidos || ''}`.trim() || cliente.email
      }));
    } catch (error) {
      logger.error('Error obteniendo clientes por IDs:', error);
      throw error;
    }
  }

  // Obtener todos los clientes
  async getAllClientes(filters = {}) {
    try {
      let sql = `
        SELECT c.*
        FROM usuarios_externos c
        WHERE 1=1
      `;
      
      const params = [];
      
      if (filters.activo !== undefined) {
        sql += ' AND c.activo = ?';
        params.push(filters.activo);
      }
      
      sql += ' ORDER BY c.created_at DESC';
      
      const clientes = await query(sql, params);
      
      // Remover password_hash de todos los clientes
      return clientes.map(cliente => {
        delete cliente.password_hash;
        delete cliente.refresh_token;
        return cliente;
      });
    } catch (error) {
      logger.error('Error obteniendo clientes:', error);
      throw error;
    }
  }
  
  // Obtener cliente por ID
  async getClienteById(id) {
    try {
      const clientes = await query(
        `SELECT c.*
         FROM usuarios_externos c
         WHERE c.id = ?`,
        [id]
      );
      
      if (clientes.length === 0) {
        throw new Error('Cliente no encontrado');
      }
      
      const cliente = clientes[0];
      
      // Remover información sensible
      delete cliente.password_hash;
      delete cliente.refresh_token;
      
      return cliente;
    } catch (error) {
      logger.error('Error obteniendo cliente:', error);
      throw error;
    }
  }
  
  // Obtener cliente por email
  async getClienteByEmail(email) {
    try {
      const clientes = await query(
        `SELECT c.*
         FROM usuarios_externos c
         WHERE c.email = ?`,
        [email]
      );
      
      if (clientes.length === 0) {
        return null;
      }
      
      const cliente = clientes[0];
      delete cliente.password_hash;
      delete cliente.refresh_token;
      
      return cliente;
    } catch (error) {
      logger.error('Error obteniendo cliente por email:', error);
      throw error;
    }
  }
  
  // Crear cliente
  async createCliente(clienteData) {
    try {
      logger.info('=== SERVICIO CREAR CLIENTE - INICIO ===');
      logger.info('Datos recibidos:', JSON.stringify(clienteData, null, 2));
      
      const { email, password, nombres, apellidos, telefono } = clienteData;
      
      logger.info('Campos extraídos:', {
        email,
        password: password ? '***PRESENTE***' : 'FALTANTE',
        nombres,
        apellidos,
        telefono
      });
      
      // Verificar si el email ya existe
      logger.info('Verificando si existe email:', email);
      const existingCliente = await this.getClienteByEmail(email);
      
      if (existingCliente) {
        throw new Error('Ya existe un cliente con ese email');
      }
      
      logger.info('Email disponible. Generando hash de contraseña...');
      // Hash del password
      const password_hash = await bcrypt.hash(password, 10);
      logger.info('Hash generado correctamente');
      
      // Asignar rol de cliente (ahora es simplemente texto)
      logger.info('Asignando rol de cliente como texto...');
      const rol = 'cliente';
      
      const clienteId = uuidv4();
      logger.info('ID generado para cliente:', clienteId);
      
      const insertData = [
        clienteId,
        email,
        password_hash,
        nombres || null, // Permitir NULL en lugar de cadena vacía
        apellidos || null,
        telefono || null,
        rol,
        JSON.stringify(clienteData.metadata || {}),
        'email_password' // auth_provider por defecto según tabla
      ];
      
      logger.info('Datos para insertar (sin password_hash):', {
        id: clienteId,
        email,
        nombres: nombres || null,
        apellidos: apellidos || null,
        telefono: telefono || null,
        rol: rol,
        metadata: JSON.stringify(clienteData.metadata || {}),
        auth_provider: 'email_password'
      });
      
      logger.info('Ejecutando INSERT en base de datos...');
      await query(
        `INSERT INTO usuarios_externos (
          id, email, password_hash, nombres, apellidos, telefono, rol, 
          activo, email_verificado, metadata, auth_provider
        ) VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, FALSE, ?, ?)`,
        insertData
      );
      
      logger.info(`Cliente creado exitosamente: ${email}`);
      
      return await this.getClienteById(clienteId);
    } catch (error) {
      logger.error('=== ERROR EN SERVICIO CREAR CLIENTE ===');
      logger.error('Error message:', error.message);
      logger.error('Error code:', error.code);
      logger.error('Error stack:', error.stack);
      throw error;
    }
  }
  
  // Actualizar cliente
  async updateCliente(id, updateData) {
    try {
      logger.info(`=== ACTUALIZAR CLIENTE ${id} ===`);
      logger.info('Datos recibidos:', updateData);
      
      // Limpiar campos que no se deben actualizar en edición
      delete updateData.id;
      delete updateData.email;  
      delete updateData.password;
      delete updateData.password_hash;
      delete updateData.auth_provider;
      delete updateData.provider_id;
      delete updateData.rol;
      delete updateData.email_verificado;
      delete updateData.verification_token;
      delete updateData.refresh_token;
      delete updateData.created_at;
      
      // Si hay metadata, convertirla a JSON
      if (updateData.metadata && typeof updateData.metadata === 'object') {
        updateData.metadata = JSON.stringify(updateData.metadata);
      }
      
      // Filtrar solo campos válidos para edición
      const allowedFields = ['nombres', 'apellidos', 'telefono', 'avatar_url', 'logo_url', 'metadata', 'activo'];
      const filteredData = {};
      
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          // Convertir strings vacíos a null para URLs
          if ((field === 'avatar_url' || field === 'logo_url') && updateData[field] === '') {
            filteredData[field] = null;
          } else {
            filteredData[field] = updateData[field];
          }
        }
      });
      
      logger.info('Datos filtrados para actualizar:', filteredData);
      
      // Construir query dinámicamente
      const fields = Object.keys(filteredData);
      const values = Object.values(filteredData);
      
      if (fields.length === 0) {
        throw new Error('No hay datos válidos para actualizar');
      }
      
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      values.push(id);
      
      await query(
        `UPDATE usuarios_externos SET ${setClause}, updated_at = NOW() WHERE id = ?`,
        values
      );
      
      logger.info(`Cliente actualizado: ${id}`);
      
      // Retornar cliente actualizado
      return await this.getClienteById(id);
    } catch (error) {
      logger.error('Error actualizando cliente:', error);
      throw error;
    }
  }
  
  // Cambiar contraseña del cliente
  async changePassword(id, oldPassword, newPassword) {
    try {
      // Obtener cliente con password_hash
      const clientes = await query(
        'SELECT password_hash FROM usuarios_externos WHERE id = ?',
        [id]
      );
      
      if (clientes.length === 0) {
        throw new Error('Cliente no encontrado');
      }

      // Verificar contraseña anterior
      const validPassword = await bcrypt.compare(oldPassword, clientes[0].password_hash);
      
      if (!validPassword) {
        throw new Error('Contraseña actual incorrecta');
      }

      // Hash de nueva contraseña
      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      // Actualizar contraseña
      await query(
        'UPDATE usuarios_externos SET password_hash = ?, updated_at = NOW() WHERE id = ?',
        [newPasswordHash, id]
      );

      logger.info(`Contraseña de cliente cambiada: ${id}`);
      
      return { success: true };
    } catch (error) {
      logger.error('Error cambiando contraseña de cliente:', error);
      throw error;
    }
  }

  // Cambio administrativo de contraseña (sin requerir contraseña actual)
  async adminChangePassword(id, newPassword) {
    try {
      // Verificar que el cliente existe
      const clientes = await query(
        'SELECT id FROM usuarios_externos WHERE id = ?',
        [id]
      );
      
      if (clientes.length === 0) {
        throw new Error('Cliente no encontrado');
      }

      // Hash de nueva contraseña
      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      // Actualizar contraseña directamente
      await query(
        'UPDATE usuarios_externos SET password_hash = ?, updated_at = NOW() WHERE id = ?',
        [newPasswordHash, id]
      );

      logger.info(`Contraseña de cliente cambiada por administrador: ${id}`);
      
      return { success: true, message: 'Contraseña actualizada exitosamente' };
    } catch (error) {
      logger.error('Error en cambio administrativo de contraseña:', error);
      throw error;
    }
  }

  // Activar cliente
  async activateCliente(id) {
    try {
      await query(
        'UPDATE usuarios_externos SET activo = TRUE, updated_at = NOW() WHERE id = ?',
        [id]
      );
      
      logger.info(`Cliente activado: ${id}`);
      return await this.getClienteById(id);
    } catch (error) {
      logger.error('Error activando cliente:', error);
      throw error;
    }
  }

  // Desactivar cliente
  async deactivateCliente(id) {
    try {
      await query(
        'UPDATE usuarios_externos SET activo = FALSE, updated_at = NOW() WHERE id = ?',
        [id]
      );
      
      logger.info(`Cliente desactivado: ${id}`);
      return await this.getClienteById(id);
    } catch (error) {
      logger.error('Error desactivando cliente:', error);
      throw error;
    }
  }

  // Eliminar cliente
  async deleteCliente(id) {
    try {
      const result = await query(
        'DELETE FROM usuarios_externos WHERE id = ?',
        [id]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Cliente no encontrado');
      }
      
      logger.info(`Cliente eliminado: ${id}`);
      return { message: 'Cliente eliminado exitosamente' };
    } catch (error) {
      logger.error('Error eliminando cliente:', error);
      throw error;
    }
  }
}

module.exports = new ClienteService();
