const logger = require('../config/logger');

/**
 * Almacenamiento en memoria de intentos fallidos por IP
 * Estructura: { ip: { count: número, lastAttempt: timestamp, resetTime: timestamp } }
 */
const rateLimitStore = new Map();

const MAX_ATTEMPTS = 15;
const RESET_TIME = 15 * 60 * 1000;

/**
 * Formatear tiempo restante en formato legible
 */
function formatTimeRemaining(seconds) {
  if (seconds <= 0) return 'ahora';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours} hora${hours > 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} minuto${minutes > 1 ? 's' : ''}`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs} segundo${secs !== 1 ? 's' : ''}`);

  return parts.join(', ');
}

/**
 * Limpiar entradas expiradas del store
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [ip, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(ip);
      logger.info(`🧹 Contador de intentos reseteado para IP: ${ip}`);
    }
  }
}

/**
 * Obtener información de rate limit para una IP
 */
function getRateLimitInfo(ip) {
  cleanupExpiredEntries();
  
  if (!rateLimitStore.has(ip)) {
    const now = Date.now();
    rateLimitStore.set(ip, {
      count: 0,
      lastAttempt: now,
      resetTime: now + RESET_TIME
    });
  }
  
  return rateLimitStore.get(ip);
}

/**
 * Incrementar contador de intentos fallidos
 */
function incrementFailedAttempt(ip) {
  const info = getRateLimitInfo(ip);
  info.count++;
  info.lastAttempt = Date.now();
  
  logger.warn(
    `⚠️ Intento fallido de login desde IP ${ip}. Contador: ${info.count}/${MAX_ATTEMPTS}`
  );
  
  return info;
}

/**
 * Resetear contador de intentos para una IP (tras login exitoso)
 */
function resetFailedAttempts(ip) {
  const info = getRateLimitInfo(ip);
  logger.info(`✅ Contador de intentos reseteado para IP: ${ip}`);
  info.count = 0;
  info.resetTime = Date.now() + RESET_TIME;
  return info;
}

/**
 * Middleware para verificar rate limit
 * Debe usarse ANTES de las rutas de login
 */
const rateLimitMiddleware = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
  
  const info = getRateLimitInfo(ip);
  const now = Date.now();
  const timeUntilReset = info.resetTime - now;
  const secondsUntilReset = Math.ceil(timeUntilReset / 1000);
  const formattedTime = formatTimeRemaining(secondsUntilReset);
  
  if (info.count >= MAX_ATTEMPTS) {
    logger.warn(
      `🚫 IP ${ip} ha excedido el límite de intentos. ` +
      `Intenta de nuevo en ${secondsUntilReset}s`
    );
    
    return res.status(429).json({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      blocked: true,
      attemptsLeft: 0,
      retryAfter: secondsUntilReset,
      retryAfterFormatted: formattedTime,
      resetAt: new Date(info.resetTime).toISOString()
    });
  }
  
  req.rateLimitInfo = {
    ip,
    count: info.count,
    attemptsLeft: MAX_ATTEMPTS - info.count,
    timeUntilReset: secondsUntilReset,
    timeUntilResetFormatted: formattedTime,
    incrementFailedAttempt: () => {
      const updated = incrementFailedAttempt(ip);
      const newTimeUntilReset = Math.ceil((updated.resetTime - Date.now()) / 1000);
      return {
        attemptsLeft: MAX_ATTEMPTS - updated.count,
        timeUntilReset: newTimeUntilReset,
        timeUntilResetFormatted: formatTimeRemaining(newTimeUntilReset),
        blocked: updated.count >= MAX_ATTEMPTS
      };
    },
    resetFailedAttempts: () => resetFailedAttempts(ip),
    getTimeUntilReset: () => secondsUntilReset
  };
  
  next();
};

module.exports = {
  rateLimitMiddleware,
  incrementFailedAttempt,
  resetFailedAttempts,
  getRateLimitInfo,
  formatTimeRemaining,
  getRateLimitStats: () => {
    cleanupExpiredEntries();
    const stats = {};
    for (const [ip, data] of rateLimitStore.entries()) {
      const now = Date.now();
      const timeUntilReset = Math.ceil((data.resetTime - now) / 1000);
      stats[ip] = {
        count: data.count,
        attemptsLeft: MAX_ATTEMPTS - data.count,
        blocked: data.count >= MAX_ATTEMPTS,
        timeUntilReset: timeUntilReset > 0 ? timeUntilReset : 0,
        timeUntilResetFormatted: formatTimeRemaining(timeUntilReset),
        resetTime: new Date(data.resetTime).toISOString()
      };
    }
    return stats;
  }
};
