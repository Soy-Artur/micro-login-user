-- Migración 007: Insertar datos de ejemplo
-- Descripción: Usuarios de ejemplo (uno por cada rol) y un cliente
-- Password para todos los usuarios: "password123"
-- Password hash generado con bcrypt (10 rounds): $2a$10$X5lLLp/UT5OQhxe8WW0JJuVZ5.nPJOTJ/BLaZ7UVZT.YQ.8RgZCJW

-- ============================================
-- INSERTAR CLIENTES
-- ============================================

INSERT INTO clientes (
  email,
  password_hash,
  username,
  telefono,
  rol_id,
  activo,
  email_verificado,
  metadata
) VALUES (
  'cliente@ruwark.com',
  '$2a$10$X5lLLp/UT5OQhxe8WW0JJuVZ5.nPJOTJ/BLaZ7UVZT.YQ.8RgZCJW', -- password123
  'cliente_ruwark',
  '987654321',
  (SELECT id FROM roles WHERE nombre = 'cliente'),
  true,
  true,
  '{"empresa": "Empresa Demo SAC", "ruc": "20123456789", "industria": "Tecnología"}'
);

-- ============================================
-- INSERTAR USUARIOS (uno por cada rol)
-- ============================================

-- 1. Usuario Admin
INSERT INTO usuarios (
  email,
  password_hash,
  username,
  dni,
  nombre,
  apellido_paterno,
  apellido_materno,
  fecha_nacimiento,
  telefono_movil,
  rol_id,
  puesto,
  fecha_ingreso,
  salario,
  direccion,
  distrito,
  ciudad,
  pais,
  activo,
  email_verificado,
  metadata
) VALUES (
  'admin@ruwark.com',
  '$2a$10$X5lLLp/UT5OQhxe8WW0JJuVZ5.nPJOTJ/BLaZ7UVZT.YQ.8RgZCJW', -- password123
  'admin_ruwark',
  '12345678',
  'Carlos',
  'Administrador',
  'Sistemas',
  '1985-01-15',
  '999888777',
  (SELECT id FROM roles WHERE nombre = 'admin'),
  'Administrador del Sistema',
  '2020-01-01',
  8000.00,
  'Av. Principal 123',
  'San Isidro',
  'Lima',
  'Perú',
  true,
  true,
  '{"departamento": "TI", "nivel": "senior"}'
);

-- 2. Usuario Ventas
INSERT INTO usuarios (
  email,
  password_hash,
  username,
  dni,
  nombre,
  apellido_paterno,
  apellido_materno,
  fecha_nacimiento,
  telefono_movil,
  rol_id,
  puesto,
  fecha_ingreso,
  salario,
  direccion,
  distrito,
  ciudad,
  pais,
  activo,
  email_verificado,
  metadata
) VALUES (
  'ventas@ruwark.com',
  '$2a$10$X5lLLp/UT5OQhxe8WW0JJuVZ5.nPJOTJ/BLaZ7UVZT.YQ.8RgZCJW', -- password123
  'vendedor_juan',
  '23456789',
  'Juan',
  'Pérez',
  'García',
  '1990-03-20',
  '998877666',
  (SELECT id FROM roles WHERE nombre = 'ventas'),
  'Ejecutivo de Ventas',
  '2021-06-15',
  3500.00,
  'Calle Los Robles 456',
  'Miraflores',
  'Lima',
  'Perú',
  true,
  true,
  '{"departamento": "Ventas", "meta_mensual": 50000, "comision": 5}'
);

-- 3. Usuario Marketing
INSERT INTO usuarios (
  email,
  password_hash,
  username,
  dni,
  nombre,
  apellido_paterno,
  apellido_materno,
  fecha_nacimiento,
  telefono_movil,
  rol_id,
  puesto,
  fecha_ingreso,
  salario,
  direccion,
  distrito,
  ciudad,
  pais,
  activo,
  email_verificado,
  metadata
) VALUES (
  'marketing@ruwark.com',
  '$2a$10$X5lLLp/UT5OQhxe8WW0JJuVZ5.nPJOTJ/BLaZ7UVZT.YQ.8RgZCJW', -- password123
  'marketing_maria',
  '34567890',
  'María',
  'López',
  'Torres',
  '1992-07-12',
  '997766555',
  (SELECT id FROM roles WHERE nombre = 'marketing'),
  'Especialista en Marketing Digital',
  '2021-09-01',
  4000.00,
  'Jr. Las Flores 789',
  'San Borja',
  'Lima',
  'Perú',
  true,
  true,
  '{"departamento": "Marketing", "especializacion": "Digital", "certificaciones": ["Google Ads", "Meta Blueprint"]}'
);

-- 4. Usuario Operaciones
INSERT INTO usuarios (
  email,
  password_hash,
  username,
  dni,
  nombre,
  apellido_paterno,
  apellido_materno,
  fecha_nacimiento,
  telefono_movil,
  rol_id,
  puesto,
  fecha_ingreso,
  salario,
  direccion,
  distrito,
  ciudad,
  pais,
  activo,
  email_verificado,
  metadata
) VALUES (
  'operaciones@ruwark.com',
  '$2a$10$X5lLLp/UT5OQhxe8WW0JJuVZ5.nPJOTJ/BLaZ7UVZT.YQ.8RgZCJW', -- password123
  'ops_pedro',
  '45678901',
  'Pedro',
  'Ramírez',
  'Silva',
  '1988-11-25',
  '996655444',
  (SELECT id FROM roles WHERE nombre = 'operaciones'),
  'Jefe de Operaciones',
  '2020-03-10',
  5500.00,
  'Av. Arequipa 1234',
  'Lince',
  'Lima',
  'Perú',
  true,
  true,
  '{"departamento": "Operaciones", "turno": "Diurno", "equipo_a_cargo": 8}'
);

-- 5. Usuario Administración
INSERT INTO usuarios (
  email,
  password_hash,
  username,
  dni,
  nombre,
  apellido_paterno,
  apellido_materno,
  fecha_nacimiento,
  telefono_movil,
  rol_id,
  puesto,
  fecha_ingreso,
  salario,
  direccion,
  distrito,
  ciudad,
  pais,
  activo,
  email_verificado,
  metadata
) VALUES (
  'administracion@ruwark.com',
  '$2a$10$X5lLLp/UT5OQhxe8WW0JJuVZ5.nPJOTJ/BLaZ7UVZT.YQ.8RgZCJW', -- password123
  'admin_ana',
  '56789012',
  'Ana',
  'Martínez',
  'Rojas',
  '1987-05-08',
  '995544333',
  (SELECT id FROM roles WHERE nombre = 'administracion'),
  'Asistente Administrativa',
  '2020-08-20',
  3000.00,
  'Calle San Martín 567',
  'Jesús María',
  'Lima',
  'Perú',
  true,
  true,
  '{"departamento": "Administración", "area": "RRHH"}'
);

-- 6. Usuario Contabilidad
INSERT INTO usuarios (
  email,
  password_hash,
  username,
  dni,
  nombre,
  apellido_paterno,
  apellido_materno,
  fecha_nacimiento,
  telefono_movil,
  rol_id,
  puesto,
  fecha_ingreso,
  salario,
  direccion,
  distrito,
  ciudad,
  pais,
  activo,
  email_verificado,
  metadata
) VALUES (
  'contabilidad@ruwark.com',
  '$2a$10$X5lLLp/UT5OQhxe8WW0JJuVZ5.nPJOTJ/BLaZ7UVZT.YQ.8RgZCJW', -- password123
  'contador_luis',
  '67890123',
  'Luis',
  'Hernández',
  'Castro',
  '1983-09-30',
  '994433222',
  (SELECT id FROM roles WHERE nombre = 'contabilidad'),
  'Contador General',
  '2019-11-05',
  6000.00,
  'Jr. Comercio 890',
  'Cercado de Lima',
  'Lima',
  'Perú',
  true,
  true,
  '{"departamento": "Contabilidad", "colegiatura": "CPC12345", "especializacion": "Tributaria"}'
);

-- 7. Usuario Desarrollo
INSERT INTO usuarios (
  email,
  password_hash,
  username,
  dni,
  nombre,
  apellido_paterno,
  apellido_materno,
  fecha_nacimiento,
  telefono_movil,
  rol_id,
  puesto,
  fecha_ingreso,
  salario,
  direccion,
  distrito,
  ciudad,
  pais,
  activo,
  email_verificado,
  metadata
) VALUES (
  'desarrollo@ruwark.com',
  '$2a$10$X5lLLp/UT5OQhxe8WW0JJuVZ5.nPJOTJ/BLaZ7UVZT.YQ.8RgZCJW', -- password123
  'dev_sofia',
  '78901234',
  'Sofía',
  'Vargas',
  'Mendoza',
  '1995-02-18',
  '993322111',
  (SELECT id FROM roles WHERE nombre = 'desarrollo'),
  'Desarrolladora Full Stack',
  '2022-01-10',
  7000.00,
  'Av. Universitaria 234',
  'San Miguel',
  'Lima',
  'Perú',
  true,
  true,
  '{"departamento": "Desarrollo", "stack": ["React", "Node.js", "PostgreSQL"], "nivel": "senior"}'
);

-- 8. Usuario Sistemas
INSERT INTO usuarios (
  email,
  password_hash,
  username,
  dni,
  nombre,
  apellido_paterno,
  apellido_materno,
  fecha_nacimiento,
  telefono_movil,
  rol_id,
  puesto,
  fecha_ingreso,
  salario,
  direccion,
  distrito,
  ciudad,
  pais,
  activo,
  email_verificado,
  metadata
) VALUES (
  'sistemas@ruwark.com',
  '$2a$10$X5lLLp/UT5OQhxe8WW0JJuVZ5.nPJOTJ/BLaZ7UVZT.YQ.8RgZCJW', -- password123
  'sistemas_diego',
  '89012345',
  'Diego',
  'Flores',
  'Gutiérrez',
  '1991-12-05',
  '992211000',
  (SELECT id FROM roles WHERE nombre = 'sistemas'),
  'Ingeniero de Sistemas',
  '2021-03-15',
  6500.00,
  'Calle Túpac Amaru 345',
  'Pueblo Libre',
  'Lima',
  'Perú',
  true,
  true,
  '{"departamento": "Sistemas", "especializacion": "DevOps", "certificaciones": ["AWS", "Docker"]}'
);

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Contar usuarios por rol
SELECT 
  r.nombre as rol,
  COUNT(u.id) as total_usuarios
FROM roles r
LEFT JOIN usuarios u ON u.rol_id = r.id
GROUP BY r.nombre
ORDER BY r.nombre;

-- Contar clientes
SELECT COUNT(*) as total_clientes FROM clientes;

-- Mostrar todos los usuarios creados
SELECT 
  u.email,
  u.nombre,
  u.apellido_paterno,
  r.nombre as rol,
  u.puesto,
  u.activo
FROM usuarios u
LEFT JOIN roles r ON u.rol_id = r.id
ORDER BY r.nombre, u.nombre;

-- Mostrar todos los clientes creados
SELECT 
  c.email,
  c.username,
  r.nombre as rol,
  c.activo
FROM clientes c
LEFT JOIN roles r ON c.rol_id = r.id;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================

-- CREDENCIALES DE ACCESO:
-- Todos los usuarios tienen la misma contraseña: "password123"
--
-- USUARIOS:
-- 1. admin@ruwark.com         - Rol: admin           - Usuario: admin_ruwark
-- 2. ventas@ruwark.com        - Rol: ventas          - Usuario: vendedor_juan
-- 3. marketing@ruwark.com     - Rol: marketing       - Usuario: marketing_maria
-- 4. operaciones@ruwark.com   - Rol: operaciones     - Usuario: ops_pedro
-- 5. administracion@ruwark.com- Rol: administracion  - Usuario: admin_ana
-- 6. contabilidad@ruwark.com  - Rol: contabilidad    - Usuario: contador_luis
-- 7. desarrollo@ruwark.com    - Rol: desarrollo      - Usuario: dev_sofia
-- 8. sistemas@ruwark.com      - Rol: sistemas        - Usuario: sistemas_diego
--
-- ============================================
-- CREDENCIALES ACTUALIZADAS
-- ============================================

-- TODOS LOS USUARIOS Y EL CLIENTE AHORA TIENEN:
-- Password: password123
--
-- USUARIOS:
-- • admin@ruwark.com         - password123
-- • ventas@ruwark.com        - password123
-- • marketing@ruwark.com     - password123
-- • operaciones@ruwark.com   - password123
-- • administracion@ruwark.com- password123
-- • contabilidad@ruwark.com  - password123
-- • desarrollo@ruwark.com    - password123
-- • sistemas@ruwark.com      - password123
-- CLIENTE:
-- 1. cliente@ruwark.com       - Rol: cliente         - Usuario: cliente_ruwark
--
-- Para cambiar la contraseña de cualquier usuario, usa bcrypt para generar un nuevo hash:
-- Ejemplo en Node.js:
-- const bcrypt = require('bcryptjs');
-- const hash = bcrypt.hashSync('nueva_password', 10);
--
-- Luego actualiza en la base de datos:
-- UPDATE usuarios SET password_hash = 'nuevo_hash' WHERE email = 'usuario@ejemplo.com';
