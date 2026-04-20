const express = require('express');
const router = express.Router();
const usuarioExternoController = require('../controllers/usuario-externo.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { validateUsuarioExterno, validateUpdateUsuarioExterno, validateChangePasswordUsuarioExterno } = require('../validators/usuario-externo.validator');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Búsqueda de clientes (debe ir antes de /:id)
router.get('/search', usuarioExternoController.searchClientes);

// Obtener clientes por múltiples IDs (para merge con otros servicios)
router.post('/by-ids', usuarioExternoController.getClientesByIds);

// CRUD de usuarios externos
router.get('/', usuarioExternoController.getAllClientes);
router.get('/:id', usuarioExternoController.getClienteById);
router.post('/', validateUsuarioExterno, usuarioExternoController.createCliente);
router.put('/:id', validateUpdateUsuarioExterno, usuarioExternoController.updateCliente);
router.delete('/:id', usuarioExternoController.deleteCliente);

// Operaciones especiales
router.post('/:id/change-password', validateChangePasswordUsuarioExterno, usuarioExternoController.changePassword);
router.post('/:id/admin-change-password', usuarioExternoController.adminChangePassword);

// Estadísticas
router.get('/:id/stats', usuarioExternoController.getClienteStats);

module.exports = router;
