-- ============================================
-- MIGRACIÓN 008: Agregar campos de localización a usuarios_externos
-- ============================================
-- Base de datos: dblogin
-- Descripción: Agrega columnas direccion y ciudad a la tabla usuarios_externos
--              para almacenar datos de ubicación de los clientes externos.

ALTER TABLE usuarios_externos
    ADD COLUMN IF NOT EXISTS direccion TEXT NULL COMMENT 'Dirección del cliente' AFTER logo_url,
    ADD COLUMN IF NOT EXISTS ciudad VARCHAR(100) NULL COMMENT 'Ciudad del cliente' AFTER direccion;

-- Índice opcional para búsquedas por ciudad
CREATE INDEX IF NOT EXISTS idx_usuarios_externos_ciudad ON usuarios_externos(ciudad);
