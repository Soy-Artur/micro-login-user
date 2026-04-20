-- ============================================
-- MIGRACIÓN COMPLETA UNIFICADA PARA MYSQL
-- Sistema Ruwark - Base de datos de usuarios y autenticación
-- ============================================
-- Descripción: Script unificado que crea todas las tablas necesarias
--              e inserta datos de ejemplo para el sistema
-- Base de datos: MySQL 8.0+
-- Fecha: Noviembre 2025
-- ============================================

-- Configuración inicial
SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS;
SET UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE;
SET SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- Eliminar tablas si existen (orden inverso por dependencias)
DROP TABLE IF EXISTS sesiones;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS roles;

-- ============================================
-- TABLA: roles
-- ============================================
-- Descripción: Define los roles de la organización
CREATE TABLE roles (
  id CHAR(36) PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion TEXT,
  permisos JSON DEFAULT NULL,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_roles_nombre (nombre),
  INDEX idx_roles_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar roles predefinidos
INSERT INTO roles (id, nombre, descripcion, permisos, activo) VALUES
  (UUID(), 'admin', 'Administrador del sistema', '[]', TRUE),
  (UUID(), 'ventas', 'Personal del área de ventas', '[]', TRUE),
  (UUID(), 'marketing', 'Personal del área de marketing', '[]', TRUE),
  (UUID(), 'operaciones', 'Personal del área de operaciones', '[]', TRUE),
  (UUID(), 'administracion', 'Personal del área de administración', '[]', TRUE),
  (UUID(), 'contabilidad', 'Personal del área de contabilidad', '[]', TRUE),
  (UUID(), 'desarrollo', 'Personal del área de desarrollo', '[]', TRUE),
  (UUID(), 'sistemas', 'Personal de sistemas e IT', '[]', TRUE),
  (UUID(), 'cliente', 'Clientes de la empresa', '[]', TRUE);

-- ============================================
-- TABLA: clientes
-- ============================================
-- Descripción: Clientes/empresas que utilizan el sistema
CREATE TABLE clientes (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE,
  telefono VARCHAR(20),
  rol_id CHAR(36),
  logo_url VARCHAR(500),
  metadata JSON DEFAULT NULL,
  
  -- Estado y control
  activo BOOLEAN DEFAULT TRUE,
  email_verificado BOOLEAN DEFAULT FALSE,
  ultimo_acceso TIMESTAMP NULL,
  intentos_fallidos INT DEFAULT 0,
  
  -- Tokens
  refresh_token TEXT,
  reset_password_token VARCHAR(255),
  reset_password_expira TIMESTAMP NULL,
  verification_token VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE SET NULL,
  INDEX idx_clientes_email (email),
  INDEX idx_clientes_activo (activo),
  INDEX idx_clientes_rol_id (rol_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trigger para asignar rol 'cliente' por defecto
DELIMITER //
CREATE TRIGGER set_cliente_role_before_insert
BEFORE INSERT ON clientes
FOR EACH ROW
BEGIN
  IF NEW.rol_id IS NULL THEN
    SET NEW.rol_id = (SELECT id FROM roles WHERE nombre = 'cliente' LIMIT 1);
  END IF;
END//
DELIMITER ;

-- ============================================
-- TABLA: usuarios
-- ============================================
-- Descripción: Usuarios del sistema con información de empleado/empresa
CREATE TABLE usuarios (
  id CHAR(36) PRIMARY KEY,
  
  -- Información de autenticación
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE,
  
  -- Información personal
  dni VARCHAR(8) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido_paterno VARCHAR(100) NOT NULL,
  apellido_materno VARCHAR(100),
  fecha_nacimiento DATE,
  sexo VARCHAR(10),
  telefono_movil VARCHAR(9),
  foto_url VARCHAR(500),
  
  -- Información de la empresa/empleado
  rol_id CHAR(36),
  puesto VARCHAR(100),
  fecha_ingreso DATE,
  salario DECIMAL(10,2),
  
  -- Dirección
  direccion TEXT,
  distrito VARCHAR(100),
  ciudad VARCHAR(100),
  pais VARCHAR(100) DEFAULT 'Perú',
  
  -- Estado y control
  activo BOOLEAN DEFAULT TRUE,
  email_verificado BOOLEAN DEFAULT FALSE,
  ultimo_acceso TIMESTAMP NULL,
  intentos_fallidos INT DEFAULT 0,
  bloqueado_hasta TIMESTAMP NULL,
  
  -- Tokens
  refresh_token TEXT,
  reset_password_token VARCHAR(255),
  reset_password_expira TIMESTAMP NULL,
  verification_token VARCHAR(255),
  
  -- Metadata
  metadata JSON DEFAULT NULL,
  permisos_especiales JSON DEFAULT NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE SET NULL,
  INDEX idx_usuarios_email (email),
  INDEX idx_usuarios_username (username),
  INDEX idx_usuarios_rol_id (rol_id),
  INDEX idx_usuarios_activo (activo),
  INDEX idx_usuarios_telefono_movil (telefono_movil),
  INDEX idx_usuarios_ultimo_acceso (ultimo_acceso)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: sesiones
-- ============================================
-- Descripción: Registro de sesiones activas y tokens de usuarios
CREATE TABLE sesiones (
  id CHAR(36) PRIMARY KEY,
  usuario_id CHAR(36) NOT NULL,
  token VARCHAR(500) NOT NULL UNIQUE,
  refresh_token VARCHAR(500),
  ip_address VARCHAR(45),
  dispositivo VARCHAR(255),
  ubicacion VARCHAR(255),
  activo BOOLEAN DEFAULT TRUE,
  expira_en TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_sesiones_usuario_id (usuario_id),
  INDEX idx_sesiones_token (token),
  INDEX idx_sesiones_activo (activo),
  INDEX idx_sesiones_expira_en (expira_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- DATOS DE EJEMPLO
-- ============================================
-- Password para todos los usuarios: "password123"
-- Hash bcrypt (10 rounds): $2a$10$X5lLLp/UT5OQhxe8WW0JJuVZ5.nPJOTJ/BLaZ7UVZT.YQ.8RgZCJW

-- ============================================
-- INSERTAR CLIENTES
-- ============================================
INSERT INTO clientes (
  id,
  email,
  password_hash,
  username,
  telefono,
  rol_id,
  activo,
  email_verificado,
  metadata
) VALUES (
  UUID(),
  'cliente@ruwark.com',
  '$2a$10$X5lLLp/UT5OQhxe8WW0JJuVZ5.nPJOTJ/BLaZ7UVZT.YQ.8RgZCJW',
  'cliente_ruwark',
  '987654321',
  (SELECT id FROM roles WHERE nombre = 'cliente' LIMIT 1),
  TRUE,
  TRUE,
  '{"empresa": "Empresa Demo SAC", "ruc": "20123456789", "industria": "Tecnología"}'
);

-- ============================================
-- INSERTAR USUARIOS (uno por cada rol)
-- ============================================

-- 1. Usuario Admin
INSERT INTO usuarios (
  id, email, password_hash, username, dni, nombre, apellido_paterno, apellido_materno,
  fecha_nacimiento, telefono_movil, rol_id, puesto, fecha_ingreso, salario,
  direccion, distrito, ciudad, pais, activo, email_verificado, metadata
) VALUES (
  UUID(),
  'admin@ruwark.com',
  '$2a$10$X5lLLp/UT5OQhxe8WW0JJuVZ5.nPJOTJ/BLaZ7UVZT.YQ.8RgZCJW',
  'admin_ruwark',
  '12345678',
  'Carlos',
  'Administrador',
  'Sistemas',
  '1985-01-15',
  '999888777',
  (SELECT id FROM roles WHERE nombre = 'admin' LIMIT 1),
  'Administrador del Sistema',
  '2020-01-01',
  8000.00,
  'Av. Principal 123',
  'San Isidro',
  'Lima',
  'Perú',
  TRUE,
  TRUE,
  '{"departamento": "TI", "nivel": "senior"}'
);

-- 2. Usuario Ventas
INSERT INTO usuarios (
  id, email, password_hash, username, dni, nombre, apellido_paterno, apellido_materno,
  fecha_nacimiento, telefono_movil, rol_id, puesto, fecha_ingreso, salario,
  direccion, distrito, ciudad, pais, activo, email_verificado, metadata
) VALUES (
  UUID(),
  'ventas@ruwark.com',
  '$2a$10$X5lLLp/UT5OQhxe8WW0JJuVZ5.nPJOTJ/BLaZ7UVZT.YQ.8RgZCJW',
  'vendedor_juan',
  '23456789',
  'Juan',
  'Pérez',
  'García',
  '1990-03-20',
  '998877666',
  (SELECT id FROM roles WHERE nombre = 'ventas' LIMIT 1),
  'Ejecutivo de Ventas',
  '2021-06-15',
  3500.00,
  'Calle Los Robles 456',
  'Miraflores',
  'Lima',
  'Perú',
  TRUE,
  TRUE,
  '{"departamento": "Ventas", "meta_mensual": 50000, "comision": 5}'
);

-- 3. Usuario Marketing
INSERT INTO usuarios (
  id, email, password_hash, username, dni, nombre, apellido_paterno, apellido_materno,
  fecha_nacimiento, telefono_movil, rol_id, puesto, fecha_ingreso, salario,
  direccion, distrito, ciudad, pais, activo, email_verificado, metadata
) VALUES (
  UUID(),
  'marketing@ruwark.com',
  '$2a$10$X5lLLp/UT5OQhxe8WW0JJuVZ5.nPJOTJ/BLaZ7UVZT.YQ.8RgZCJW',
  'marketing_maria',
  '34567890',
  'María',
  'López',
  'Torres',
  '1992-07-12',
  '997766555',
  (SELECT id FROM roles WHERE nombre = 'marketing' LIMIT 1),
  'Especialista en Marketing Digital',
  '2021-09-01',
  4000.00,
  'Jr. Las Flores 789',
  'San Borja',
  'Lima',
  'Perú',
  TRUE,
  TRUE,
  '{"departamento": "Marketing", "especializacion": "Digital", "certificaciones": ["Google Ads", "Meta Blueprint"]}'
);

-- 4. Usuario Operaciones
INSERT INTO usuarios (
  id, email, password_hash, username, dni, nombre, apellido_paterno, apellido_materno,
  fecha_nacimiento, telefono_movil, rol_id, puesto, fecha_ingreso, salario,
  direccion, distrito, ciudad, pais, activo, email_verificado, metadata
) VALUES (
  UUID(),
  'operaciones@ruwark.com',
  '$2a$10$X5lLLp/UT5OQhxe8WW0JJuVZ5.nPJOTJ/BLaZ7UVZT.YQ.8RgZCJW',
  'ops_pedro',
  '45678901',
  'Pedro',
  'Ramírez',
  'Silva',
  '1988-11-25',
  '996655444',
  (SELECT id FROM roles WHERE nombre = 'operaciones' LIMIT 1),
  'Jefe de Operaciones',
  '2020-03-10',
  5500.00,
  'Av. Arequipa 1234',
  'Lince',
  'Lima',
  'Perú',
  TRUE,
  TRUE,
  '{"departamento": "Operaciones", "turno": "Diurno", "equipo_a_cargo": 8}'
);

-- 5. Usuario Administración
INSERT INTO usuarios (
  id, email, password_hash, username, dni, nombre, apellido_paterno, apellido_materno,
  fecha_nacimiento, telefono_movil, rol_id, puesto, fecha_ingreso, salario,
  direccion, distrito, ciudad, pais, activo, email_verificado, metadata
) VALUES (
  UUID(),
  'administracion@ruwark.com',
  '$2a$10$X5lLLp/UT5OQhxe8WW0JJuVZ5.nPJOTJ/BLaZ7UVZT.YQ.8RgZCJW',
  'admin_ana',
  '56789012',
  'Ana',
  'Martínez',
  'Rojas',
  '1987-05-08',
  '995544333',
  (SELECT id FROM roles WHERE nombre = 'administracion' LIMIT 1),
  'Asistente Administrativa',
  '2020-08-20',
  3000.00,
  'Calle San Martín 567',
  'Jesús María',
  'Lima',
  'Perú',
  TRUE,
  TRUE,
  '{"departamento": "Administración", "area": "RRHH"}'
);

-- 6. Usuario Contabilidad
INSERT INTO usuarios (
  id, email, password_hash, username, dni, nombre, apellido_paterno, apellido_materno,
  fecha_nacimiento, telefono_movil, rol_id, puesto, fecha_ingreso, salario,
  direccion, distrito, ciudad, pais, activo, email_verificado, metadata
) VALUES (
  UUID(),
  'contabilidad@ruwark.com',
  '$2a$10$X5lLLp/UT5OQhxe8WW0JJuVZ5.nPJOTJ/BLaZ7UVZT.YQ.8RgZCJW',
  'contador_luis',
  '67890123',
  'Luis',
  'Hernández',
  'Castro',
  '1983-09-30',
  '994433222',
  (SELECT id FROM roles WHERE nombre = 'contabilidad' LIMIT 1),
  'Contador General',
  '2019-11-05',
  6000.00,
  'Jr. Comercio 890',
  'Cercado de Lima',
  'Lima',
  'Perú',
  TRUE,
  TRUE,
  '{"departamento": "Contabilidad", "colegiatura": "CPC12345", "especializacion": "Tributaria"}'
);

-- 7. Usuario Desarrollo
INSERT INTO usuarios (
  id, email, password_hash, username, dni, nombre, apellido_paterno, apellido_materno,
  fecha_nacimiento, telefono_movil, rol_id, puesto, fecha_ingreso, salario,
  direccion, distrito, ciudad, pais, activo, email_verificado, metadata
) VALUES (
  UUID(),
  'desarrollo@ruwark.com',
  '$2a$10$X5lLLp/UT5OQhxe8WW0JJuVZ5.nPJOTJ/BLaZ7UVZT.YQ.8RgZCJW',
  'dev_sofia',
  '78901234',
  'Sofía',
  'Vargas',
  'Mendoza',
  '1995-02-18',
  '993322111',
  (SELECT id FROM roles WHERE nombre = 'desarrollo' LIMIT 1),
  'Desarrolladora Full Stack',
  '2022-01-10',
  7000.00,
  'Av. Universitaria 234',
  'San Miguel',
  'Lima',
  'Perú',
  TRUE,
  TRUE,
  '{"departamento": "Desarrollo", "stack": ["React", "Node.js", "PostgreSQL"], "nivel": "senior"}'
);

-- 8. Usuario Sistemas
INSERT INTO usuarios (
  id, email, password_hash, username, dni, nombre, apellido_paterno, apellido_materno,
  fecha_nacimiento, telefono_movil, rol_id, puesto, fecha_ingreso, salario,
  direccion, distrito, ciudad, pais, activo, email_verificado, metadata
) VALUES (
  UUID(),
  'sistemas@ruwark.com',
  '$2a$10$X5lLLp/UT5OQhxe8WW0JJuVZ5.nPJOTJ/BLaZ7UVZT.YQ.8RgZCJW',
  'sistemas_diego',
  '89012345',
  'Diego',
  'Flores',
  'Gutiérrez',
  '1991-12-05',
  '992211000',
  (SELECT id FROM roles WHERE nombre = 'sistemas' LIMIT 1),
  'Ingeniero de Sistemas',
  '2021-03-15',
  6500.00,
  'Calle Túpac Amaru 345',
  'Pueblo Libre',
  'Lima',
  'Perú',
  TRUE,
  TRUE,
  '{"departamento": "Sistemas", "especializacion": "DevOps", "certificaciones": ["AWS", "Docker"]}'
);

-- ============================================
-- VERIFICACIÓN DE DATOS
-- ============================================

-- Mostrar resumen de roles
SELECT '=== ROLES ===' as '';
SELECT 
  r.nombre as rol,
  r.descripcion,
  COUNT(u.id) as total_usuarios,
  r.activo
FROM roles r
LEFT JOIN usuarios u ON u.rol_id = r.id
GROUP BY r.id, r.nombre, r.descripcion, r.activo
ORDER BY r.nombre;

-- Mostrar todos los usuarios
SELECT '=== USUARIOS ===' as '';
SELECT 
  u.email,
  u.nombre,
  u.apellido_paterno,
  r.nombre as rol,
  u.puesto,
  u.activo,
  u.email_verificado
FROM usuarios u
LEFT JOIN roles r ON u.rol_id = r.id
ORDER BY r.nombre, u.nombre;

-- Mostrar clientes
SELECT '=== CLIENTES ===' as '';
SELECT 
  c.email,
  c.username,
  r.nombre as rol,
  c.activo,
  c.email_verificado
FROM clientes c
LEFT JOIN roles r ON c.rol_id = r.id;

-- Estadísticas generales
SELECT '=== ESTADÍSTICAS ===' as '';
SELECT 
  'Total Roles' as concepto,
  COUNT(*) as cantidad
FROM roles
UNION ALL
SELECT 
  'Total Usuarios',
  COUNT(*)
FROM usuarios
UNION ALL
SELECT 
  'Total Clientes',
  COUNT(*)
FROM clientes
UNION ALL
SELECT 
  'Usuarios Activos',
  COUNT(*)
FROM usuarios
WHERE activo = TRUE;

-- Restaurar configuración
SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 
-- CREDENCIALES DE ACCESO:
-- Todos los usuarios tienen la contraseña: "password123"
-- 
-- USUARIOS DISPONIBLES:
-- 1. admin@ruwark.com         - Rol: admin           - Usuario: admin_ruwark
-- 2. ventas@ruwark.com        - Rol: ventas          - Usuario: vendedor_juan
-- 3. marketing@ruwark.com     - Rol: marketing       - Usuario: marketing_maria
-- 4. operaciones@ruwark.com   - Rol: operaciones     - Usuario: ops_pedro
-- 5. administracion@ruwark.com- Rol: administracion  - Usuario: admin_ana
-- 6. contabilidad@ruwark.com  - Rol: contabilidad    - Usuario: contador_luis
-- 7. desarrollo@ruwark.com    - Rol: desarrollo      - Usuario: dev_sofia
-- 8. sistemas@ruwark.com      - Rol: sistemas        - Usuario: sistemas_diego
-- 
-- CLIENTE:
-- 1. cliente@ruwark.com       - Rol: cliente         - Usuario: cliente_ruwark
-- 
-- ADAPTACIONES DE POSTGRESQL A MYSQL:
-- • UUID → CHAR(36) con UUID()
-- • gen_random_uuid() → UUID()
-- • JSONB → JSON
-- • TIMESTAMP WITH TIME ZONE → TIMESTAMP
-- • NOW() → CURRENT_TIMESTAMP
-- • Triggers adaptados a sintaxis MySQL
-- • ON UPDATE CURRENT_TIMESTAMP agregado automáticamente
-- 
-- EJECUCIÓN:
-- mysql -u usuario -p nombre_base_datos < 000_complete_migration_mysql.sql
-- 
-- O desde MySQL client:
-- source /ruta/a/000_complete_migration_mysql.sql;
-- 
-- ============================================
