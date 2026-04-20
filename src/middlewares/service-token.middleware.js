const config = require('../config');
const logger = require('../config/logger');

// Middleware para validar el token de servicio (inter-service communication)
const serviceTokenMiddleware = (req, res, next) => {
  try {
    const serviceToken = req.headers['x-service-token'];
    
    console.log('🔐 Service Token Middleware - Token recibido:', serviceToken);
    console.log('🔐 Service Token Middleware - Token esperado:', config.services.serviceToken);
    
    if (!serviceToken) {
      console.log('❌ Service token no proporcionado');
      return res.status(401).json({
        success: false,
        message: 'Service token no proporcionado'
      });
    }
    
    if (serviceToken !== config.services.serviceToken) {
      console.log('❌ Service token inválido');
      return res.status(403).json({
        success: false,
        message: 'Service token inválido'
      });
    }
    
    console.log('✅ Service token válido');
    req.isServiceRequest = true;
    next();
  } catch (error) {
    logger.error('Error validando service token:', error);
    res.status(403).json({
      success: false,
      message: 'Error de autenticación de servicio'
    });
  }
};

module.exports = serviceTokenMiddleware;
