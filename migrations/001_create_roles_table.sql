-- Migración 001: Crear tabla de roles
-- Descripción: Define los roles de la organización (ventas, marketing, operaciones, etc.)

CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion TEXT,
  permisos JSONB DEFAULT '[]',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar roles predefinidos
INSERT INTO roles (nombre, descripcion) VALUES
  ('admin', 'admin'),
  ('ventas', 'Personal del área de ventas'),
  ('marketing', 'Personal del área de marketing'),
  ('operaciones', 'Personal del área de operaciones'),
  ('administracion', 'Personal del área de administración'),
  ('contabilidad', 'Personal del área de contabilidad'),
  ('desarrollo', 'Personal del área de desarrollo'),
  ('sistemas', 'Personal de sistemas e IT'),
  ('cliente', 'Clientes de la empresa');

-- Índices
CREATE INDEX idx_roles_nombre ON roles(nombre);
CREATE INDEX idx_roles_activo ON roles(activo);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentarios
COMMENT ON TABLE roles IS 'Tabla de roles de usuario del sistema';
COMMENT ON COLUMN roles.permisos IS 'Array JSON de permisos específicos del rol';
