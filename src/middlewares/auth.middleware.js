const authService = require('../services/auth.service');
const logger = require('../config/logger');

const authMiddleware = async (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }
    
    const token = authHeader.substring(7);
    
    // Verificar token
    const decoded = authService.verifyToken(token);
    
    // Agregar usuario al request
    req.user = decoded;
    req.token = token;
    
    next();
  } catch (error) {
    logger.error('Error en autenticación:', error);
    res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }
};

module.exports = authMiddleware;
