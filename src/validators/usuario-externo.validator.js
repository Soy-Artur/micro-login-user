const { body, validationResult } = require('express-validator');

// Middleware para convertir strings vacíos a null en campos opcionales
const sanitizeOptionalFields = (req, res, next) => {
  const fieldsToSanitize = ['nombres', 'apellidos', 'telefono', 'avatar_url', 'logo_url'];
  
  fieldsToSanitize.forEach(field => {
    if (req.body[field] === '' || req.body[field] === undefined) {
      req.body[field] = null;
    }
  });
  
  console.log('Body después de sanitización:', req.body);
  next();
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('=== ERRORES DE VALIDACIÓN ===');
    console.log('Body recibido:', req.body);
    console.log('Errores encontrados:', errors.array());
    
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array()
    });
  }
  console.log('✅ Validación pasada correctamente para:', req.method, req.path);
  next();
};

// Validación para crear usuario externo 
const validateUsuarioExterno = [
  sanitizeOptionalFields,
  body('email')
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('nombres')
    .optional({ nullable: true })
    .custom((value) => {
      if (!value || value === null || value === '') return true; // Permite null o vacío
      if (value.length < 2) throw new Error('Los nombres deben tener al menos 2 caracteres');
      return true;
    }),
  body('apellidos')
    .optional({ nullable: true })
    .custom((value) => {
      if (!value || value === null || value === '') return true; // Permite null o vacío
      if (value.length < 2) throw new Error('Los apellidos deben tener al menos 2 caracteres');
      return true;
    }),
  body('telefono')
    .optional({ nullable: true })
    .custom((value) => {
      if (!value || value === null || value === '') return true; // Permite null o vacío
      if (!/^[\+]?[1-9][\d\s\-\(\)\.]{7,20}$/.test(value)) {
        throw new Error('Formato de teléfono inválido');
      }
      return true;
    }),
  body('auth_provider')
    .optional()
    .isIn(['email_password', 'google', 'facebook', 'local'])
    .withMessage('Proveedor de autenticación inválido'),
  body('avatar_url')
    .optional({ nullable: true })
    .custom((value) => {
      if (!value || value === null || value === '') return true; // Permite null o vacío
      if (!/^https?:\/\/.+/.test(value)) {
        throw new Error('URL del avatar inválida');
      }
      return true;
    }),
  body('logo_url')
    .optional({ nullable: true })
    .custom((value) => {
      if (!value || value === null || value === '') return true; // Permite null o vacío
      if (!/^https?:\/\/.+/.test(value)) {
        throw new Error('URL del logo inválida');
      }
      return true;
    }),
  validate
];

// Validación para actualizar usuario externo (todos opcionales)
const validateUpdateUsuarioExterno = [
  sanitizeOptionalFields,
  body('nombres')
    .optional({ nullable: true })
    .custom((value) => {
      if (!value || value === null || value === '') return true; // Permite null o vacío
      if (value.length < 2) throw new Error('Los nombres deben tener al menos 2 caracteres');
      return true;
    }),
  body('apellidos')
    .optional({ nullable: true })
    .custom((value) => {
      if (!value || value === null || value === '') return true; // Permite null o vacío
      if (value.length < 2) throw new Error('Los apellidos deben tener al menos 2 caracteres');
      return true;
    }),
  body('telefono')
    .optional({ nullable: true })
    .custom((value) => {
      if (!value || value === null || value === '') return true; // Permite null o vacío
      if (!/^[\+]?[1-9][\d\s\-\(\)\.]{7,20}$/.test(value)) {
        throw new Error('Formato de teléfono inválido - acepta: +51926405891, 926405891, etc');
      }
      return true;
    }),
  body('avatar_url')
    .optional({ nullable: true })
    .custom((value) => {
      if (!value || value === null || value === '') return true; // Permite null o vacío
      if (!/^https?:\/\/.+/.test(value)) {
        throw new Error('URL del avatar inválida (debe comenzar con http:// o https://)');
      }
      return true;
    }),
  body('logo_url')
    .optional({ nullable: true })
    .custom((value) => {
      if (!value || value === null || value === '') return true; // Permite null o vacío
      if (!/^https?:\/\/.+/.test(value)) {
        throw new Error('URL del logo inválida (debe comenzar con http:// o https://)');
      }
      return true;
    }),
  body('activo')
    .optional()
    .isBoolean()
    .withMessage('El campo activo debe ser true o false'),
  validate
];

// Validación para cambiar contraseña de usuario externo
const validateChangePasswordUsuarioExterno = [
  body('oldPassword')
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[0-9]).*$/)
    .withMessage('La contraseña debe contener al menos una letra minúscula y un número'),
  validate
];

module.exports = {
  validateUsuarioExterno,
  validateUpdateUsuarioExterno,
  validateChangePasswordUsuarioExterno
};
