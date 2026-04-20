const authService = require('../services/auth.service');
const logger = require('../config/logger');
const eventBusService = require('../services/eventBus.service');

class AuthController {
  // POST /api/auth/register
  async register(req, res) {
    try {
      console.log('🎯 [REGISTER] Iniciando registro de usuario');
      console.log('📥 [REGISTER] Body recibido:', req.body);
      
      const usuario = await authService.register(req.body);
      
      // Publicar evento de usuario registrado (opcional)
      try {
        await eventBusService.publishUserRegistered(usuario);
      } catch (eventError) {
        logger.warn('❌ Error publicando evento user.registered:', eventError.message);
      }
      
      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: usuario
      });
    } catch (error) {
      console.log('🚨 [REGISTER] Error en servicio de registro:', error.message);
      console.log('🔍 [REGISTER] Stack trace:', error.stack);
      logger.error('Error en registro:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // POST /api/auth/login
  async login(req, res) {

    console.log('🎯 [LOGIN] Iniciando proceso de login', req);
    try {
      const { email, password, rememberMe = false } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('user-agent');
      
      // Validar que email y password existan
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos',
          error: 'INVALID_INPUT',
          attemptsLeft: req.rateLimitInfo?.attemptsLeft
        });
      }
      
      const result = await authService.login(email, password, ipAddress, userAgent, rememberMe);
      
      // ✅ Resetear contador de intentos fallidos tras login exitoso
      if (req.rateLimitInfo) {
        req.rateLimitInfo.resetFailedAttempts();
      }
      
      // Publicar evento de login (opcional)
      try {
        await eventBusService.publishUserLoggedIn(
          result.usuario,
          {
            sessionId: result.refreshToken,
            ipAddress,
            userAgent,
            rememberMe 
          }
        );
      } catch (eventError) {
        logger.warn('❌ Error publicando evento user.logged_in:', eventError.message);
      }
      
      res.json({
        success: true,
        message: 'Login exitoso',
        data: result
      });
    } catch (error) {
      const errorResponse = {
        success: false,
        message: '',
        error: 'LOGIN_FAILED'
      };

      if (req.rateLimitInfo) {
        const rateLimitUpdate = req.rateLimitInfo.incrementFailedAttempt();

        errorResponse.attemptsLeft = rateLimitUpdate.attemptsLeft;
        errorResponse.timeUntilResetSeconds = rateLimitUpdate.timeUntilReset;
        errorResponse.timeUntilResetFormatted = rateLimitUpdate.timeUntilResetFormatted;

        if (rateLimitUpdate.blocked) {
          errorResponse.blocked = true;
          errorResponse.error = 'RATE_LIMIT_EXCEEDED';
          // errorResponse.message = `Ha excedido el límite de intentos. Intente de nuevo en ${rateLimitUpdate.timeUntilResetFormatted}`;
          errorResponse.retryAfter = rateLimitUpdate.timeUntilReset;
          errorResponse.retryAfterFormatted = rateLimitUpdate.timeUntilResetFormatted;

          logger.error(
            `🚫 IP ${req.rateLimitInfo.ip} bloqueada tras alcanzar 15 intentos`
          );

          return res.status(429).json(errorResponse);
        }
      }

      logger.error('Error en login:', error);
      return res.status(401).json(errorResponse);
    }
  }
  
  // POST /api/auth/refresh-token
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      
      const tokens = await authService.refreshToken(refreshToken);
      
      res.json({
        success: true,
        data: tokens
      });
    } catch (error) {
      logger.error('Error en refresh token:', error);
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // POST /api/auth/logout
  async logout(req, res) {
    try {
      const userId = req.user.id;
      const token = req.token;
      
      await authService.logout(userId, token);
      
      // Publicar evento de logout (opcional)
      try {
        await eventBusService.publishUserLoggedOut(userId, token);
      } catch (eventError) {
        logger.warn('❌ Error publicando evento user.logged_out:', eventError.message);
      }
      
      res.json({
        success: true,
        message: 'Logout exitoso'
      });
    } catch (error) {
      logger.error('Error en logout:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // GET /api/auth/verify
  async verifyToken(req, res) {
    try {
      res.json({
        success: true,
        data: {
          valid: true,
          user: req.user
        }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
  }

  // 🧹 POST /api/auth/cleanup-sessions - Limpieza manual de sesiones
  async cleanupSessions(req, res) {
    try {
      // Verificar que el usuario tenga permisos de administrador
      if (!req.user || req.user.rol?.nombre !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Solo los administradores pueden ejecutar limpieza de sesiones'
        });
      }

      logger.info(`🧹 Iniciando limpieza manual de sesiones solicitada por: ${req.user.email}`);
      
      const resultado = await authService.forceCleanupAllSessions();
      
      res.json({
        success: true,
        message: 'Limpieza de sesiones completada exitosamente',
        data: {
          sesiones_antes: resultado.before,
          sesiones_despues: resultado.after,
          sesiones_eliminadas: resultado.cleaned,
          ejecutado_por: req.user.email,
          fecha_limpieza: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('❌ Error en limpieza manual de sesiones:', error);
      res.status(500).json({
        success: false,
        message: 'Error ejecutando limpieza de sesiones',
        error: error.message
      });
    }
  }

  // 📊 GET /api/auth/rate-limit-stats - Estadísticas de rate limiting (solo admin)
  async getRateLimitStats(req, res) {
    try {
      // Verificar que el usuario tenga permisos de administrador
      if (!req.user || req.user.rol?.nombre !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Solo los administradores pueden ver las estadísticas de rate limit'
        });
      }

      const { getRateLimitStats } = require('../middlewares/rate-limit.middleware');
      const stats = getRateLimitStats();
      
      logger.info('📊 Estadísticas de rate limiting solicitadas');
      
      res.json({
        success: true,
        data: {
          stats,
          config: {
            maxAttempts: 15,
            resetTime: '15 minutos',
            totalEnMonitoreo: Object.keys(stats).length
          }
        }
      });
    } catch (error) {
      logger.error('Error obteniendo estadísticas de rate limit:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas',
        error: 'STATS_ERROR'
      });
    }
  }

  // 🔓 POST /api/auth/rate-limit-reset - Resetear rate limit de una IP (solo admin)
  async resetRateLimit(req, res) {
    try {
      // Verificar que el usuario tenga permisos de administrador
      if (!req.user || req.user.rol?.nombre !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Solo los administradores pueden resetear el rate limit'
        });
      }

      const { ip } = req.body;

      if (!ip) {
        return res.status(400).json({
          success: false,
          message: 'IP es requerida',
          error: 'INVALID_INPUT'
        });
      }

      const { resetFailedAttempts } = require('../middlewares/rate-limit.middleware');
      resetFailedAttempts(ip);
      
      logger.info(`🔓 Rate limit reseteado para IP ${ip} por admin ${req.user.email}`);
      
      res.json({
        success: true,
        message: `Contador de rate limit reseteado para IP: ${ip}`,
        data: {
          ip,
          attemptsAvailable: 15,
          message: 'El usuario puede intentar login nuevamente',
          resetBy: req.user.email,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Error reseteando rate limit:', error);
      res.status(500).json({
        success: false,
        message: 'Error reseteando rate limit',
        error: 'RESET_ERROR'
      });
    }
  }
}

module.exports = new AuthController();
