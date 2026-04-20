const { query, transaction } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../config/logger');
const { v4: uuidv4 } = require('uuid');

class AuthService {
  // Registro de usuario
  async register(userData) {
    try {
      const { email, password, nombre, username, rol_id, apellido_paterno } = userData;
      
      // Verificar si el email ya existe
      const existingUser = await query(
        'SELECT id FROM usuarios WHERE email = ?',
        [email]
      );
      
      if (existingUser.length > 0) {
        throw new Error('El email ya está registrado');
      }
      
      // Hash del password
      const password_hash = await bcrypt.hash(password, 10);
      
      // Generar UUID para el nuevo usuario
      const userId = uuidv4();
      
      // Crear usuario con campos mínimos
      await query(
        `INSERT INTO usuarios (
          id, email, password_hash, username, dni, nombre, apellido_paterno, 
          apellido_materno, telefono_movil, rol_id, puesto, fecha_ingreso, 
          salario, direccion, distrito, ciudad, pais, activo, email_verificado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          email,
          password_hash,
          username || email.split('@')[0],
          null, // DNI será null por defecto
          nombre,
          apellido_paterno || null, // Usar el apellido enviado o null
          null, // apellido_materno
          null, // telefono_movil
          rol_id,
          null, // puesto
          new Date().toISOString().split('T')[0], // fecha_ingreso
          null, // salario
          userData.direccion || null,
          userData.distrito || null,
          userData.ciudad || null,
          userData.pais || 'Perú',
          true,
          false
        ]
      );
      
      // Obtener el usuario creado
      const [newUser] = await query(
        `SELECT u.*, r.nombre as rol_nombre 
         FROM usuarios u 
         LEFT JOIN roles r ON u.rol_id = r.id 
         WHERE u.id = ?`,
        [userId]
      );
      
      logger.info(`Usuario registrado: ${email}`);
      
      // Remover password_hash de la respuesta
      delete newUser.password_hash;
      
      return newUser;
    } catch (error) {
      logger.error('Error en registro:', error);
      throw error;
    }
  }
  
  // Login
  async login(email, password, ipAddress, userAgent) {
    try {
      // 🔍 BUSCAR USUARIO
      logger.info(`Buscando usuario con email: ${email}`);
      
      let usuario = null;
      let tipoEntidad = null;
      
      // Buscar como usuario primero
      const usuarios = await query(
        `SELECT u.*, r.id as rol_id, r.nombre as rol_nombre, r.permisos as rol_permisos
         FROM usuarios u
         LEFT JOIN roles r ON u.rol_id = r.id
         WHERE u.email = ?`,
        [email]
      );
      
      if (usuarios.length > 0) {
        usuario = usuarios[0];
        tipoEntidad = 'usuario';
        logger.info(`✅ Usuario encontrado: ${email}`);
      } else {
        // Buscar en usuarios externos
        logger.info(`🔍 Usuario no encontrado, buscando en usuarios externos...`);
        const clientes = await query(
          `SELECT c.*, r.id as rol_id, r.nombre as rol_nombre, r.permisos as rol_permisos
           FROM usuarios_externos c
           LEFT JOIN roles r ON c.rol_id = r.id
           WHERE c.email = ?`,
          [email]
        );
        
        if (clientes.length > 0) {
          usuario = clientes[0];
          tipoEntidad = 'cliente';
          logger.info(`✅ Usuario externo encontrado: ${email}`);
        }
      }
      
      if (!usuario) {
        logger.warn(`❌ Usuario no encontrado: ${email}`);
        throw new Error('Credenciales inválidas');
      }
      
      // Verificar si está activo
      if (!usuario.activo) {
        throw new Error(`${tipoEntidad === 'usuario' ? 'Usuario' : 'Cliente'} inactivo`);
      }
      
      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, usuario.password_hash);
      
      if (!isValidPassword) {
        logger.warn(`⚠️ Contraseña incorrecta para ${email}`);
        throw new Error('Credenciales inválidas');
      }
      
      // ✅ Contraseña correcta - Generar tokens
      usuario.rol = {
        id: usuario.rol_id,
        nombre: usuario.rol_nombre,
        permisos: usuario.rol_permisos
      };
      usuario.tipoEntidad = tipoEntidad;
      
      const accessToken = this.generateAccessToken(usuario);
      const refreshToken = this.generateRefreshToken(usuario);
      
      // 💾 GUARDAR REFRESH TOKEN
      if (tipoEntidad === 'usuario') {
        await query(
          'UPDATE usuarios SET refresh_token = ? WHERE id = ?',
          [refreshToken, usuario.id]
        );
      } else {
        await query(
          'UPDATE usuarios_externos SET refresh_token = ? WHERE id = ?',
          [refreshToken, usuario.id]
        );
      }
      
      // 🧹 LIMPIAR SESIONES Y CREAR NUEVA
      await this.cleanupUserSessions(usuario.id, tipoEntidad);
      
      const sessionMetadata = {
        tipo_entidad: tipoEntidad,
        user_agent: userAgent,
        ip_address: ipAddress
      };
      
      await query(
        `INSERT INTO sesiones (id, usuario_id, token, refresh_token, ip_address, dispositivo, ubicacion, expira_en)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          usuario.id,
          accessToken,
          refreshToken,
          ipAddress || null,
          userAgent || null,
          JSON.stringify(sessionMetadata),
          new Date(Date.now() + 24 * 60 * 60 * 1000)
        ]
      );
      
      // Remover información sensible
      delete usuario.password_hash;
      delete usuario.refresh_token;
      delete usuario.rol_permisos;
      delete usuario.tipoEntidad;
      
      logger.info(`✅ Login exitoso para ${tipoEntidad}: ${email}`);
      
      return {
        usuario,
        accessToken,
        refreshToken
      };
    } catch (error) {
      logger.error('❌ Error en login:', error);
      throw error;
    }
  }
  
  // Generar Access Token
  generateAccessToken(usuario) {
    return jwt.sign(
      {
        id: usuario.id,
        usuario_id: usuario.id, // ✅ Agregar usuario_id para compatibilidad con micro-operaciones
        email: usuario.email,
        rol_id: usuario.rol_id,
        rol: usuario.rol?.nombre || 'Usuario', // ✅ Agregar nombre del rol
        cliente_id: usuario.cliente_id,
        tipo_entidad: usuario.tipoEntidad || 'usuario' // 🔄 Identificar si es usuario o cliente
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }
  
  // Generar Refresh Token
  generateRefreshToken(usuario) {
    return jwt.sign(
      { 
        id: usuario.id,
        usuario_id: usuario.id // ✅ Agregar usuario_id para compatibilidad
      },
      config.jwt.secret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );
  }
  
  // Refresh Token
  async refreshToken(refreshToken) {
    try {
      // Verificar token
      const decoded = jwt.verify(refreshToken, config.jwt.secret);
      
      // Buscar usuario
      const usuarios = await query(
        `SELECT u.*, r.id as rol_id, r.nombre as rol_nombre, r.permisos as rol_permisos
         FROM usuarios u
         LEFT JOIN roles r ON u.rol_id = r.id
         WHERE u.id = ? AND u.refresh_token = ?`,
        [decoded.id, refreshToken]
      );
      
      if (usuarios.length === 0) {
        logger.error('Usuario no encontrado para refresh token');
        throw new Error('Token inválido');
      }
      
      const usuario = usuarios[0];
      
      if (!usuario.activo) {
        throw new Error('Usuario inactivo');
      }
      
      // Formatear objeto rol
      usuario.rol = {
        id: usuario.rol_id,
        nombre: usuario.rol_nombre,
        permisos: usuario.rol_permisos
      };
      
      // Generar nuevos tokens
      const newAccessToken = this.generateAccessToken(usuario);
      const newRefreshToken = this.generateRefreshToken(usuario);
      
      // Actualizar refresh token
      await query(
        'UPDATE usuarios SET refresh_token = ? WHERE id = ?',
        [newRefreshToken, usuario.id]
      );
      
      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      logger.error('Error en refresh token:', error);
      throw error;
    }
  }
  
  // Logout
  async logout(userId, token) {
    try {
      // Invalidar sesión
      await query(
        'UPDATE sesiones SET activo = FALSE WHERE usuario_id = ? AND token = ?',
        [userId, token]
      );
      
      logger.info(`Logout usuario: ${userId}`);
    } catch (error) {
      logger.error('Error en logout:', error);
      throw error;
    }
  }
  
  // Verificar token
  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      throw new Error('Token inválido o expirado');
    }
  }

  // 🧹 LIMPIAR SESIONES DE UN USUARIO ESPECÍFICO
  async cleanupUserSessions(userId, tipoEntidad = 'usuario') {
    try {
      logger.info(`🧹 Limpiando sesiones del ${tipoEntidad}: ${userId}`);
      
      // 1. Eliminar todas las sesiones anteriores de este usuario/cliente
      // Como usamos usuario_id para ambos, filtramos por ID directo
      const deletedUserSessions = await query(
        'DELETE FROM sesiones WHERE usuario_id = ?',
        [userId]
      );
      
      if (deletedUserSessions.affectedRows > 0) {
        logger.info(`✅ Eliminadas ${deletedUserSessions.affectedRows} sesiones anteriores del ${tipoEntidad} ${userId}`);
      }
      
      // 2. Aprovechar para limpiar sesiones expiradas de todos los usuarios
      await this.cleanupExpiredSessions();
      
    } catch (error) {
      logger.error('❌ Error limpiando sesiones del usuario:', error);
      // No lanzamos el error para no interrumpir el login
    }
  }

  // 🧹 LIMPIAR SESIONES EXPIRADAS DE TODOS LOS USUARIOS
  async cleanupExpiredSessions() {
    try {
      // Eliminar sesiones que han expirado
      const deletedExpired = await query(
        'DELETE FROM sesiones WHERE expira_en < NOW()'
      );
      
      if (deletedExpired.affectedRows > 0) {
        logger.info(`🗑️ Eliminadas ${deletedExpired.affectedRows} sesiones expiradas automáticamente`);
      }
      
      // Eliminar sesiones muy antiguas (más de 30 días) aunque no hayan expirado
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const deletedOld = await query(
        'DELETE FROM sesiones WHERE created_at < ?',
        [thirtyDaysAgo]
      );
      
      if (deletedOld.affectedRows > 0) {
        logger.info(`🗑️ Eliminadas ${deletedOld.affectedRows} sesiones muy antiguas (>30 días)`);
      }
      
    } catch (error) {
      logger.error('❌ Error limpiando sesiones expiradas:', error);
    }
  }

  // 🧹 MÉTODO PÚBLICO PARA LIMPIEZA MANUAL (opcional)
  async forceCleanupAllSessions() {
    try {
      logger.info('🧹 Iniciando limpieza completa de sesiones...');
      
      // Contar sesiones antes de la limpieza
      const sessionsBefore = await query('SELECT COUNT(*) as total FROM sesiones');
      const totalBefore = sessionsBefore[0].total;
      
      await this.cleanupExpiredSessions();
      
      // Contar sesiones después de la limpieza
      const sessionsAfter = await query('SELECT COUNT(*) as total FROM sesiones');
      const totalAfter = sessionsAfter[0].total;
      
      logger.info(`✅ Limpieza completa finalizada. Sesiones antes: ${totalBefore}, después: ${totalAfter}, eliminadas: ${totalBefore - totalAfter}`);
      
      return {
        before: totalBefore,
        after: totalAfter,
        cleaned: totalBefore - totalAfter
      };
      
    } catch (error) {
      logger.error('❌ Error en limpieza completa de sesiones:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();
