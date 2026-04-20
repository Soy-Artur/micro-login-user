const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const serviceTokenMiddleware = require('../middlewares/service-token.middleware');
const { validateUpdateUser, validateChangePassword } = require('../validators/user.validator');

// Rutas especiales para comunicación entre servicios (solo con service token)
router.get('/internal/:id', serviceTokenMiddleware, userController.getUserById);
router.get('/internal/by-role/:rolId', serviceTokenMiddleware, userController.getUsuariosByRol);

// Todas las demás rutas requieren autenticación de usuario
router.use(authMiddleware);

// Obtener usuario actual
router.get('/me', userController.getCurrentUser);

// Obtener usuarios por rol (protegido con JWT - usado desde gateway/frontend)
router.get('/by-role/:rolId', userController.getUsuariosByRol);

// CRUD de usuarios
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', validateUpdateUser, userController.updateUser);
router.delete('/:id', userController.deleteUser);

// Operaciones especiales
router.post('/:id/change-password', validateChangePassword, userController.changePassword);
router.get('/:id/team', userController.getUserTeam);

module.exports = router;
