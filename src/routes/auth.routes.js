const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validateRegister, validateLogin } = require('../validators/auth.validator');
const authMiddleware = require('../middlewares/auth.middleware');
const { rateLimitMiddleware } = require('../middlewares/rate-limit.middleware');

// 🔐 Rutas públicas
router.post('/register', validateRegister, authController.register);
router.post('/login', rateLimitMiddleware, validateLogin, authController.login);
router.post('/refresh-token', authController.refreshToken);

// 🔒 Rutas protegidas
router.post('/logout', authMiddleware, authController.logout);
router.get('/verify', authMiddleware, authController.verifyToken);

// 📊 Estadísticas de rate limit (solo admin)
router.get('/rate-limit-stats', authMiddleware, authController.getRateLimitStats);

// 🔓 Resetear rate limit de una IP (solo admin)
router.post('/rate-limit-reset', authMiddleware, authController.resetRateLimit);

module.exports = router;
