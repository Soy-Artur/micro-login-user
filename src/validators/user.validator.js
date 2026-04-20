const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array()
    });
  }
  next();
};

// Validación para actualizar usuario
const validateUpdateUser = [
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('El nombre debe tener al menos 2 caracteres'),
  body('telefono')
    .optional()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Teléfono inválido'),
  body('rol_id')
    .optional()
    .isUUID()
    .withMessage('rol_id debe ser un UUID válido'),
  validate
];

// Validación para cambiar password
const validateChangePassword = [
  body('oldPassword')
    .notEmpty()
    .withMessage('El password actual es requerido'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('El nuevo password debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('El password debe contener mayúsculas, minúsculas y números'),
  validate
];

module.exports = {
  validateUpdateUser,
  validateChangePassword
};
