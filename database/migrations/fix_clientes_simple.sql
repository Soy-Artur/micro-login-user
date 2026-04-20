-- Migración SIMPLE para phpMyAdmin - arreglar estructura tabla clientes
-- Ejecutar paso a paso en phpMyAdmin o MySQL

-- PASO 1: Cambiar el campo nombres para que permita NULL
ALTER TABLE `clientes` MODIFY `nombres` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL;

-- PASO 2: Cambiar rol_id a rol (esto automáticamente eliminará foreign key si existe)
ALTER TABLE `clientes` CHANGE `rol_id` `rol` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'cliente';

-- PASO 3: Actualizar registros existentes que tengan rol con UUID a 'cliente'
UPDATE `clientes` SET `rol` = 'cliente' WHERE `rol` IS NOT NULL AND `rol` != 'cliente';

-- PASO 4: Eliminar trigger existente (si existe)
DROP TRIGGER IF EXISTS `set_cliente_role_before_insert`;

-- PASO 5: Crear nuevo trigger para rol
DELIMITER $$
CREATE TRIGGER `set_cliente_role_before_insert` BEFORE INSERT ON `clientes` FOR EACH ROW 
BEGIN
  IF NEW.rol IS NULL OR NEW.rol = '' THEN
    SET NEW.rol = 'cliente';
  END IF;
END$$
DELIMITER ;

-- PASO 6: Verificar estructura final
DESCRIBE `clientes`;