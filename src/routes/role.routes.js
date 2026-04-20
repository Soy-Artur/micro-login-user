const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { validateRole } = require('../validators/role.validator');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// CRUD de roles
router.get('/', roleController.getAllRoles);
router.get('/:id', roleController.getRoleById);
router.post('/', validateRole, roleController.createRole);
router.put('/:id', validateRole, roleController.updateRole);
router.delete('/:id', roleController.deleteRole);

// Permisos
router.put('/:id/permissions', roleController.assignPermissions);

module.exports = router;
