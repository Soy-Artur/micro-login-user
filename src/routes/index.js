const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const usuarioExternoRoutes = require('./usuario-externo.routes');
const roleRoutes = require('./role.routes');

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Microservicio de Login y Usuarios funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Registrar rutas
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/usuarios_externos', usuarioExternoRoutes);
router.use('/roles', roleRoutes);

module.exports = router;
