const { body, validationResult } = require('express-validator');

// Middleware para validar resultados
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('🚨 [VALIDATION] Errores de validación detectados:');
    console.log('📝 [VALIDATION] Body recibido:', req.body);
    console.log('❌ [VALIDATION] Errores:', errors.array());
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array()
    });
  }
  next();
};

// Validación para registro
const validateRegister = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('El password debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*\d)/)
    .withMessage('El password debe contener al menos una letra minúscula y un número'),
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 2 })
    .withMessage('El nombre debe tener al menos 2 caracteres'),
  body('username')
    .trim()
    .notEmpty()
    .withMessage('El nombre de usuario es requerido'),
  body('rol_id')
    .notEmpty()
    .withMessage('El rol es requerido')
    .isUUID()
    .withMessage('rol_id debe ser un UUID válido'),
  validate
];

// Validación para login
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('El password es requerido'),
  validate
];

module.exports = {
  validateRegister,
  validateLogin
};
