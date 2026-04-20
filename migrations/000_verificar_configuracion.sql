-- Script de verificación: Comprobar estado de la base de datos
-- Ejecuta este script en Supabase SQL Editor para verificar tu configuración

-- ============================================
-- 1. VERIFICAR QUE LAS TABLAS EXISTAN
-- ============================================

SELECT 
  'roles' as tabla,
  COUNT(*) as total_registros
FROM roles
UNION ALL
SELECT 
  'clientes' as tabla,
  COUNT(*) as total_registros
FROM clientes
UNION ALL
SELECT 
  'usuarios' as tabla,
  COUNT(*) as total_registros
FROM usuarios
UNION ALL
SELECT 
  'sesiones' as tabla,
  COUNT(*) as total_registros
FROM sesiones
ORDER BY tabla;

-- ============================================
-- 2. VERIFICAR ROLES
-- ============================================

SELECT 
  'ROLES' as categoria,
  id,
  nombre,
  activo
FROM roles
ORDER BY nombre;

-- ============================================
-- 3. VERIFICAR USUARIOS
-- ============================================

SELECT 
  'USUARIOS' as categoria,
  u.email,
  u.nombre,
  u.apellido_paterno,
  r.nombre as rol,
  u.activo,
  u.email_verificado,
  CASE 
    WHEN u.password_hash IS NULL THEN '❌ NO TIENE PASSWORD'
    WHEN u.password_hash = '' THEN '❌ PASSWORD VACÍO'
    ELSE '✅ Password configurado'
  END as estado_password,
  LENGTH(u.password_hash) as longitud_hash
FROM usuarios u
LEFT JOIN roles r ON u.rol_id = r.id
ORDER BY u.email;

-- ============================================
-- 4. VERIFICAR CLIENTES
-- ============================================

SELECT 
  'CLIENTES' as categoria,
  c.email,
  c.username,
  r.nombre as rol,
  c.activo,
  c.email_verificado,
  CASE 
    WHEN c.password_hash IS NULL THEN '❌ NO TIENE PASSWORD'
    WHEN c.password_hash = '' THEN '❌ PASSWORD VACÍO'
    ELSE '✅ Password configurado'
  END as estado_password
FROM clientes c
LEFT JOIN roles r ON c.rol_id = r.id
ORDER BY c.email;

-- ============================================
-- 5. VERIFICAR ESTRUCTURA DE TABLA USUARIOS
-- ============================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'usuarios'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================
-- 6. PROBAR LOGIN MANUALMENTE
-- ============================================
-- Este query simula lo que hace el microservicio

SELECT 
  u.id,
  u.email,
  u.nombre,
  u.apellido_paterno,
  u.password_hash,
  u.activo,
  u.email_verificado,
  u.intentos_fallidos,
  u.bloqueado_hasta,
  r.nombre as rol_nombre,
  r.permisos as rol_permisos
FROM usuarios u
LEFT JOIN roles r ON u.rol_id = r.id
WHERE u.email = 'admin@ruwark.com';  -- Cambia esto por el email que estás probando

-- ============================================
-- 7. RESUMEN FINAL
-- ============================================

SELECT 
  'Total de roles' as metrica,
  COUNT(*)::text as valor
FROM roles
WHERE activo = true
UNION ALL
SELECT 
  'Total de usuarios' as metrica,
  COUNT(*)::text as valor
FROM usuarios
WHERE activo = true
UNION ALL
SELECT 
  'Total de clientes' as metrica,
  COUNT(*)::text as valor
FROM clientes
WHERE activo = true
UNION ALL
SELECT 
  'Usuarios sin password' as metrica,
  COUNT(*)::text as valor
FROM usuarios
WHERE password_hash IS NULL OR password_hash = ''
UNION ALL
SELECT 
  'Usuarios bloqueados' as metrica,
  COUNT(*)::text as valor
FROM usuarios
WHERE bloqueado_hasta > NOW();

-- ============================================
-- INSTRUCCIONES
-- ============================================

-- Si ves "relation does not exist":
--   → Las tablas no existen. Ejecuta las migraciones 001-006 primero.
--
-- Si ves "Total de usuarios: 0":
--   → No hay usuarios. Ejecuta la migración 007_insert_sample_data.sql
--
-- Si ves "❌ NO TIENE PASSWORD" o "❌ PASSWORD VACÍO":
--   → El usuario no tiene password_hash. Ejecuta de nuevo el script 007.
--
-- Si ves "❌ Password configurado" pero no puedes hacer login:
--   → Verifica que el password_hash sea correcto:
--     $2a$10$X5lLLp/UT5OQhxe8WW0JJuVZ5.nPJOTJ/BLaZ7UVZT.YQ.8RgZCJW
--   → Este hash corresponde a: "password123"
--
-- CREDENCIALES DE PRUEBA:
--   Email: admin@ruwark.com
--   Password: password123
