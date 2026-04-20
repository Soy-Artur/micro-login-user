-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: databaseruwark_dblogin:3306
-- Tiempo de generación: 12-02-2026 a las 14:06:41
-- Versión del servidor: 9.6.0
-- Versión de PHP: 8.2.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `dblogin`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `auth_provider` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'email_password',
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `provider_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombres` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `apellidos` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rol` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'cliente',
  `email_verificado` tinyint(1) DEFAULT '0',
  `verification_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verification_token_expira` timestamp NULL DEFAULT NULL,
  `reset_password_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reset_password_expira` timestamp NULL DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `intentos_fallidos` int DEFAULT '0',
  `bloqueado_hasta` timestamp NULL DEFAULT NULL,
  `ultimo_acceso` timestamp NULL DEFAULT NULL,
  `refresh_token` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `logo_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `clientes`
--

INSERT INTO `clientes` (`id`, `email`, `auth_provider`, `password_hash`, `provider_id`, `nombres`, `apellidos`, `telefono`, `avatar_url`, `rol`, `email_verificado`, `verification_token`, `verification_token_expira`, `reset_password_token`, `reset_password_expira`, `activo`, `intentos_fallidos`, `bloqueado_hasta`, `ultimo_acceso`, `refresh_token`, `logo_url`, `metadata`, `created_at`, `updated_at`) VALUES
('9b1ebf24-59b3-46a1-b77a-704f19eb8b26', 'cliente@ejemplo.com', 'email_password', '$2a$10$WyF0016blT6bl4.Q7v0jzeSff8n418BJz4oHQFqAT13H4Ra0cxU/6', NULL, 'Juan Carlos', 'Pérez González', '926405891', NULL, 'cliente', 1, 'ver_123abc', NULL, NULL, NULL, 1, 0, NULL, NULL, NULL, NULL, '{\"origen\": \"web\", \"preferencias\": {\"notificaciones\": true}}', '2026-02-12 14:00:19', '2026-02-12 14:00:19'),
('c3960892-dc3a-4d86-b241-cf40f0718bbd', 'cliente@google.com', 'google', NULL, '108847665432112345678', 'Arturo', 'Letona Porras', '926405891', 'https://lh3.googleusercontent.com/a/avatar123', 'cliente', 1, NULL, NULL, NULL, NULL, 1, 0, NULL, NULL, NULL, NULL, '{\"origen\": \"google\", \"oauth_info\": {\"google_verified\": true}}', '2026-02-12 14:00:19', '2026-02-12 14:00:19');

--
-- Disparadores `clientes`
--
DELIMITER $$
CREATE TRIGGER `set_cliente_defaults_before_insert` BEFORE INSERT ON `clientes` FOR EACH ROW BEGIN
  -- Establecer rol por defecto si está vacío
  IF NEW.rol IS NULL OR NEW.rol = '' THEN
    SET NEW.rol = 'cliente';
  END IF;
  
  -- Si es OAuth, el email ya está verificado
  IF NEW.auth_provider != 'email_password' AND NEW.email_verificado = 0 THEN
    SET NEW.email_verificado = 1;
  END IF;
  
  -- Para OAuth, no debe tener contraseña
  IF NEW.auth_provider != 'email_password' AND NEW.password_hash IS NOT NULL THEN
    SET NEW.password_hash = NULL;
  END IF;
  
  -- Para email_password, debe tener contraseña
  IF NEW.auth_provider = 'email_password' AND (NEW.password_hash IS NULL OR NEW.password_hash = '') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La contraseña es requerida para autenticación email_password';
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `permisos` json DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id`, `nombre`, `descripcion`, `permisos`, `activo`, `created_at`, `updated_at`) VALUES
('5aeaa5a5-1c83-47e1-b89f-4f968ebd6ced', 'cliente', 'Rol para clientes del sistema', NULL, 1, '2026-02-11 21:53:45', '2026-02-11 21:53:45'),
('ebb5666d-c3cc-11f0-979b-02420a0b0012', 'admin', 'Administrador del sistema', '[]', 1, '2025-11-17 15:48:54', '2025-11-17 15:48:54'),
('ebb5695b-c3cc-11f0-979b-02420a0b0012', 'ventas', 'Personal del área de ventas', '[]', 1, '2025-11-17 15:48:54', '2025-11-17 15:48:54'),
('ebb56a3f-c3cc-11f0-979b-02420a0b0012', 'marketing', 'Personal del área de marketing', '[]', 1, '2025-11-17 15:48:54', '2025-11-17 15:48:54'),
('ebb56aac-c3cc-11f0-979b-02420a0b0012', 'operaciones', 'Personal del área de operaciones', '[]', 1, '2025-11-17 15:48:54', '2025-11-17 15:48:54'),
('ebb56b12-c3cc-11f0-979b-02420a0b0012', 'administracion', 'Personal del área de administración', '[]', 1, '2025-11-17 15:48:54', '2025-11-17 15:48:54'),
('ebb56b79-c3cc-11f0-979b-02420a0b0012', 'contabilidad', 'Personal del área de contabilidad', '[]', 1, '2025-11-17 15:48:54', '2025-11-17 15:48:54'),
('ebb56bdc-c3cc-11f0-979b-02420a0b0012', 'desarrollo', 'Personal del área de desarrollo', '[]', 1, '2025-11-17 15:48:54', '2025-11-17 15:48:54'),
('ebb56c39-c3cc-11f0-979b-02420a0b0012', 'sistemas', 'Personal de sistemas e IT', '[]', 1, '2025-11-17 15:48:54', '2025-11-17 15:48:54');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sesiones`
--

CREATE TABLE `sesiones` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuario_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `refresh_token` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dispositivo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ubicacion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `expira_en` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `sesiones`
--

INSERT INTO `sesiones` (`id`, `usuario_id`, `token`, `refresh_token`, `ip_address`, `dispositivo`, `ubicacion`, `activo`, `expira_en`, `created_at`, `updated_at`) VALUES
('45bb49cd-6819-4030-8dcd-357c2c4abe63', 'ebc30cb3-c3cc-11f0-979b-02420a0b0012', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImViYzMwY2IzLWMzY2MtMTFmMC05NzliLTAyNDIwYTBiMDAxMiIsInVzdWFyaW9faWQiOiJlYmMzMGNiMy1jM2NjLTExZjAtOTc5Yi0wMjQyMGEwYjAwMTIiLCJlbWFpbCI6InZlbnRhc0BydXdhcmsuY29tIiwicm9sX2lkIjoiZWJiNTY5NWItYzNjYy0xMWYwLTk3OWItMDI0MjBhMGIwMDEyIiwicm9sIjoidmVudGFzIiwidGlwb19lbnRpZGFkIjoidXN1YXJpbyIsImlhdCI6MTc3MDgxODQ1OCwiZXhwIjoxNzcwOTA0ODU4fQ.r-jfZtvDwV4RuVSRPJEEZRSKyZnVx2ac02hAcvnNy1g', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImViYzMwY2IzLWMzY2MtMTFmMC05NzliLTAyNDIwYTBiMDAxMiIsInVzdWFyaW9faWQiOiJlYmMzMGNiMy1jM2NjLTExZjAtOTc5Yi0wMjQyMGEwYjAwMTIiLCJpYXQiOjE3NzA4MTg0NTgsImV4cCI6MTc3MTQyMzI1OH0.IKGVrqQKD0Sg8PLS-joatK7TtJr07Hd7hzJGB3y_-sQ', '::ffff:10.11.0.21', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '{\"tipo_entidad\":\"usuario\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0\",\"ip_address\":\"::ffff:10.11.0.21\"}', 1, '2026-02-12 14:00:59', '2026-02-11 14:00:58', '2026-02-11 14:00:58'),
('e492f2ad-42dd-4899-9eda-f0d5228f5acb', 'ebc4b903-c3cc-11f0-979b-02420a0b0012', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImViYzRiOTAzLWMzY2MtMTFmMC05NzliLTAyNDIwYTBiMDAxMiIsInVzdWFyaW9faWQiOiJlYmM0YjkwMy1jM2NjLTExZjAtOTc5Yi0wMjQyMGEwYjAwMTIiLCJlbWFpbCI6Im9wZXJhY2lvbmVzQHJ1d2Fyay5jb20iLCJyb2xfaWQiOiJlYmI1NmFhYy1jM2NjLTExZjAtOTc5Yi0wMjQyMGEwYjAwMTIiLCJyb2wiOiJvcGVyYWNpb25lcyIsInRpcG9fZW50aWRhZCI6InVzdWFyaW8iLCJpYXQiOjE3NzA4MzA5NDAsImV4cCI6MTc3MDkxNzM0MH0.DIdRJuNSQ4VdDcOek14ijmJUVJs79w9FCuMq2r9DdGM', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImViYzRiOTAzLWMzY2MtMTFmMC05NzliLTAyNDIwYTBiMDAxMiIsInVzdWFyaW9faWQiOiJlYmM0YjkwMy1jM2NjLTExZjAtOTc5Yi0wMjQyMGEwYjAwMTIiLCJpYXQiOjE3NzA4MzA5NDAsImV4cCI6MTc3MTQzNTc0MH0.WuAZMx7DIxsrW2EIBk0M4B4ezIjhZRu3fQg2NVUHu40', '::ffff:10.11.0.21', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '{\"tipo_entidad\":\"usuario\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\",\"ip_address\":\"::ffff:10.11.0.21\"}', 1, '2026-02-12 17:29:01', '2026-02-11 17:29:00', '2026-02-11 17:29:00'),
('e4a2b115-bcde-472b-b29b-017b4de554bc', 'ebc2313a-c3cc-11f0-979b-02420a0b0012', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImViYzIzMTNhLWMzY2MtMTFmMC05NzliLTAyNDIwYTBiMDAxMiIsInVzdWFyaW9faWQiOiJlYmMyMzEzYS1jM2NjLTExZjAtOTc5Yi0wMjQyMGEwYjAwMTIiLCJlbWFpbCI6ImFkbWluQHJ1d2Fyay5jb20iLCJyb2xfaWQiOiJlYmI1NjY2ZC1jM2NjLTExZjAtOTc5Yi0wMjQyMGEwYjAwMTIiLCJyb2wiOiJhZG1pbiIsInRpcG9fZW50aWRhZCI6InVzdWFyaW8iLCJpYXQiOjE3NzA4NDYyMjYsImV4cCI6MTc3MDkzMjYyNn0.JGC2QqkdaAeyz5m3ydpsAt7pZQl4M41E_FsWm_dzSGc', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImViYzIzMTNhLWMzY2MtMTFmMC05NzliLTAyNDIwYTBiMDAxMiIsInVzdWFyaW9faWQiOiJlYmMyMzEzYS1jM2NjLTExZjAtOTc5Yi0wMjQyMGEwYjAwMTIiLCJpYXQiOjE3NzA4NDYyMjYsImV4cCI6MTc3MTQ1MTAyNn0.W_gx1ME9EHX_LuYTxjNgbr6IaXiG2rKlEt4s_8HkQjI', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '{\"tipo_entidad\":\"usuario\",\"user_agent\":\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36\",\"ip_address\":\"::1\"}', 1, '2026-02-12 16:43:47', '2026-02-11 21:43:47', '2026-02-11 21:43:47');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dni` varchar(8) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido_paterno` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellido_materno` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `sexo` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono_movil` varchar(9) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `foto_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rol_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `puesto` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_ingreso` date DEFAULT NULL,
  `salario` decimal(10,2) DEFAULT NULL,
  `direccion` text COLLATE utf8mb4_unicode_ci,
  `distrito` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ciudad` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pais` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Perú',
  `activo` tinyint(1) DEFAULT '1',
  `email_verificado` tinyint(1) DEFAULT '0',
  `ultimo_acceso` timestamp NULL DEFAULT NULL,
  `intentos_fallidos` int DEFAULT '0',
  `bloqueado_hasta` timestamp NULL DEFAULT NULL,
  `refresh_token` text COLLATE utf8mb4_unicode_ci,
  `reset_password_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reset_password_expira` timestamp NULL DEFAULT NULL,
  `verification_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `permisos_especiales` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `email`, `password_hash`, `username`, `dni`, `nombre`, `apellido_paterno`, `apellido_materno`, `fecha_nacimiento`, `sexo`, `telefono_movil`, `foto_url`, `rol_id`, `puesto`, `fecha_ingreso`, `salario`, `direccion`, `distrito`, `ciudad`, `pais`, `activo`, `email_verificado`, `ultimo_acceso`, `intentos_fallidos`, `bloqueado_hasta`, `refresh_token`, `reset_password_token`, `reset_password_expira`, `verification_token`, `metadata`, `permisos_especiales`, `created_at`, `updated_at`) VALUES
('02991428-50a9-4636-8f26-9bd93f21b0f7', 'ejemplo@gmail.com', '$2a$10$sHVifSfO5GmYZvRZKyUmR.3r2BbCimyvjEgFmV6XHDVIZG0wUDd3e', 'yoyo', '76167350', 'yoyo', 'yoyo', 'Luna', '2026-02-01', 'masculino', '926405891', NULL, 'ebb56aac-c3cc-11f0-979b-02420a0b0012', 'desarrollo', '2026-02-11', 4000.00, 'Garsilazo de la vega', 'cusco', 'TAMBURCO', 'Perú', 1, 0, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-11 19:57:57', '2026-02-11 20:30:21'),
('ebc2313a-c3cc-11f0-979b-02420a0b0012', 'admin@ruwark.com', '$2a$10$7p8zf87YVNrMZvdAl0eJM.4bk7y5yTX1RjwH3grHM5zYBYj8GJVe6', 'admin_ruwark', NULL, 'Carlos', 'Administrador', 'Sistemas', '1985-01-15', NULL, '999888777', NULL, 'ebb5666d-c3cc-11f0-979b-02420a0b0012', 'Administrador del Sistema', '2020-01-01', 8000.00, 'Av. Principal 123', 'San Isidro', 'Lima', 'Perú', 1, 1, '2026-02-11 21:43:45', 0, NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImViYzIzMTNhLWMzY2MtMTFmMC05NzliLTAyNDIwYTBiMDAxMiIsInVzdWFyaW9faWQiOiJlYmMyMzEzYS1jM2NjLTExZjAtOTc5Yi0wMjQyMGEwYjAwMTIiLCJpYXQiOjE3NzA5MDMxOTQsImV4cCI6MTc3MTUwNzk5NH0.Zhur8uCvtLWE6LRHWk_GfiiqrDbRzLzrwXnemNH_opw', NULL, NULL, NULL, '{\"nivel\": \"senior\", \"departamento\": \"TI\"}', NULL, '2025-11-17 15:48:54', '2026-02-12 13:33:13'),
('ebc30cb3-c3cc-11f0-979b-02420a0b0012', 'ventas@ruwark.com', '$2a$10$7p8zf87YVNrMZvdAl0eJM.4bk7y5yTX1RjwH3grHM5zYBYj8GJVe6', 'vendedor_juan', NULL, 'Juan', 'Pérez', 'García', '1990-03-20', NULL, '998877666', NULL, 'ebb5695b-c3cc-11f0-979b-02420a0b0012', 'Ejecutivo de Ventas', '2021-06-15', 3500.00, 'Calle Los Robles 456', 'Miraflores', 'Lima', 'Perú', 1, 1, '2026-02-11 14:00:58', 0, NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImViYzMwY2IzLWMzY2MtMTFmMC05NzliLTAyNDIwYTBiMDAxMiIsInVzdWFyaW9faWQiOiJlYmMzMGNiMy1jM2NjLTExZjAtOTc5Yi0wMjQyMGEwYjAwMTIiLCJpYXQiOjE3NzA5MDM5NjcsImV4cCI6MTc3MTUwODc2N30.c4aK7XRhObIPY58XehcSW4FiuCyICGWUn1xDHexyhMs', NULL, NULL, NULL, '{\"comision\": 5, \"departamento\": \"Ventas\", \"meta_mensual\": 50000}', NULL, '2025-11-17 15:48:54', '2026-02-12 13:46:07'),
('ebc3e533-c3cc-11f0-979b-02420a0b0012', 'marketing@ruwark.com', '$2a$10$7p8zf87YVNrMZvdAl0eJM.4bk7y5yTX1RjwH3grHM5zYBYj8GJVe6', 'marketing_maria', NULL, 'María', 'López', 'Torres', '1992-07-12', NULL, '997766555', NULL, 'ebb56a3f-c3cc-11f0-979b-02420a0b0012', 'Especialista en Marketing Digital', '2021-09-01', 4000.00, 'Jr. Las Flores 789', 'San Borja', 'Lima', 'Perú', 1, 1, '2026-01-07 20:39:35', 0, NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImViYzNlNTMzLWMzY2MtMTFmMC05NzliLTAyNDIwYTBiMDAxMiIsInVzdWFyaW9faWQiOiJlYmMzZTUzMy1jM2NjLTExZjAtOTc5Yi0wMjQyMGEwYjAwMTIiLCJpYXQiOjE3Njc4MTgzNzUsImV4cCI6MTc2ODQyMzE3NX0.kKSV-_e6mrQyf0kzvv915oehuc2DtgpMLFcah7MagL8', NULL, NULL, NULL, '{\"departamento\": \"Marketing\", \"certificaciones\": [\"Google Ads\", \"Meta Blueprint\"], \"especializacion\": \"Digital\"}', NULL, '2025-11-17 15:48:54', '2026-02-11 19:57:21'),
('ebc4b903-c3cc-11f0-979b-02420a0b0012', 'operaciones@ruwark.com', '$2a$10$7p8zf87YVNrMZvdAl0eJM.4bk7y5yTX1RjwH3grHM5zYBYj8GJVe6', 'ops_pedro', NULL, 'Pedro', 'Ramírez', 'Silva', '1988-11-25', NULL, '996655444', NULL, 'ebb56aac-c3cc-11f0-979b-02420a0b0012', 'Jefe de Operaciones', '2020-03-10', 5500.00, 'Av. Arequipa 1234', 'Lince', 'Lima', 'Perú', 1, 1, '2026-02-11 17:29:00', 0, NULL, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImViYzRiOTAzLWMzY2MtMTFmMC05NzliLTAyNDIwYTBiMDAxMiIsInVzdWFyaW9faWQiOiJlYmM0YjkwMy1jM2NjLTExZjAtOTc5Yi0wMjQyMGEwYjAwMTIiLCJpYXQiOjE3NzA4MzA5NDAsImV4cCI6MTc3MTQzNTc0MH0.WuAZMx7DIxsrW2EIBk0M4B4ezIjhZRu3fQg2NVUHu40', NULL, NULL, NULL, '{\"turno\": \"Diurno\", \"departamento\": \"Operaciones\", \"equipo_a_cargo\": 8}', NULL, '2025-11-17 15:48:54', '2026-02-11 19:57:21'),
('ebc5939b-c3cc-11f0-979b-02420a0b0012', 'administracion@ruwark.com', '$2a$10$7p8zf87YVNrMZvdAl0eJM.4bk7y5yTX1RjwH3grHM5zYBYj8GJVe6', 'admin_ana', NULL, 'Ana', 'Martínez', 'Rojas', '1987-05-08', NULL, '995544333', NULL, 'ebb56b12-c3cc-11f0-979b-02420a0b0012', 'Asistente Administrativa', '2020-08-20', 3000.00, 'Calle San Martín 567', 'Jesús María', 'Lima', 'Perú', 1, 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, '{\"area\": \"RRHH\", \"departamento\": \"Administración\"}', NULL, '2025-11-17 15:48:54', '2026-02-11 19:57:21'),
('ebc67dcb-c3cc-11f0-979b-02420a0b0012', 'contabilidad@ruwark.com', '$2a$10$7p8zf87YVNrMZvdAl0eJM.4bk7y5yTX1RjwH3grHM5zYBYj8GJVe6', 'contador_luis', NULL, 'Luis', 'Hernández', 'Castro', '1983-09-30', NULL, '994433222', NULL, 'ebb56b79-c3cc-11f0-979b-02420a0b0012', 'Contador General', '2019-11-05', 6000.00, 'Jr. Comercio 890', 'Cercado de Lima', 'Lima', 'Perú', 1, 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, '{\"colegiatura\": \"CPC12345\", \"departamento\": \"Contabilidad\", \"especializacion\": \"Tributaria\"}', NULL, '2025-11-17 15:48:54', '2026-02-11 19:57:21'),
('ebc754b7-c3cc-11f0-979b-02420a0b0012', 'desarrollo@ruwark.com', '$2a$10$7p8zf87YVNrMZvdAl0eJM.4bk7y5yTX1RjwH3grHM5zYBYj8GJVe6', 'dev_sofia', NULL, 'Sofía', 'Vargas', 'Mendoza', '1995-02-18', NULL, '993322111', NULL, 'ebb56bdc-c3cc-11f0-979b-02420a0b0012', 'Desarrolladora Full Stack', '2022-01-10', 7000.00, 'Av. Universitaria 234', 'San Miguel', 'Lima', 'Perú', 1, 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, '{\"nivel\": \"senior\", \"stack\": [\"React\", \"Node.js\", \"PostgreSQL\"], \"departamento\": \"Desarrollo\"}', NULL, '2025-11-17 15:48:54', '2026-02-11 19:57:21'),
('ebc82ec9-c3cc-11f0-979b-02420a0b0012', 'sistemas@ruwark.com', '$2a$10$7p8zf87YVNrMZvdAl0eJM.4bk7y5yTX1RjwH3grHM5zYBYj8GJVe6', 'sistemas_diego', NULL, 'Diego', 'Flores', 'Gutiérrez', '1991-12-05', NULL, '992211000', NULL, 'ebb56c39-c3cc-11f0-979b-02420a0b0012', 'Ingeniero de Sistemas', '2021-03-15', 6500.00, 'Calle Túpac Amaru 345', 'Pueblo Libre', 'Lima', 'Perú', 1, 1, NULL, 0, NULL, NULL, NULL, NULL, NULL, '{\"departamento\": \"Sistemas\", \"certificaciones\": [\"AWS\", \"Docker\"], \"especializacion\": \"DevOps\"}', NULL, '2025-11-17 15:48:54', '2026-02-11 19:57:21');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `unique_provider_account` (`auth_provider`,`provider_id`),
  ADD KEY `idx_clientes_email` (`email`),
  ADD KEY `idx_clientes_activo` (`activo`),
  ADD KEY `idx_clientes_rol` (`rol`),
  ADD KEY `idx_clientes_auth_provider` (`auth_provider`),
  ADD KEY `idx_clientes_provider_id` (`provider_id`),
  ADD KEY `idx_clientes_email_verificado` (`email_verificado`),
  ADD KEY `idx_clientes_ultimo_acceso` (`ultimo_acceso`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`),
  ADD KEY `idx_roles_nombre` (`nombre`),
  ADD KEY `idx_roles_activo` (`activo`);

--
-- Indices de la tabla `sesiones`
--
ALTER TABLE `sesiones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `idx_sesiones_usuario_id` (`usuario_id`),
  ADD KEY `idx_sesiones_token` (`token`),
  ADD KEY `idx_sesiones_activo` (`activo`),
  ADD KEY `idx_sesiones_expira_en` (`expira_en`),
  ADD KEY `idx_sesiones_usuario_activo` (`usuario_id`,`activo`),
  ADD KEY `idx_sesiones_expiracion` (`expira_en`,`activo`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `idx_usuarios_email` (`email`),
  ADD KEY `idx_usuarios_username` (`username`),
  ADD KEY `idx_usuarios_rol_id` (`rol_id`),
  ADD KEY `idx_usuarios_activo` (`activo`),
  ADD KEY `idx_usuarios_telefono_movil` (`telefono_movil`),
  ADD KEY `idx_usuarios_ultimo_acceso` (`ultimo_acceso`);

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `sesiones`
--
ALTER TABLE `sesiones`
  ADD CONSTRAINT `sesiones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
