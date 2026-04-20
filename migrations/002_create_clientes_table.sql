-- Migración 002: Crear tabla de clientes
-- Descripción: Define los clientes/empresas que utilizan el sistema

CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE,
  telefono VARCHAR(20),
  rol_id UUID REFERENCES roles(id) ON DELETE SET NULL,
  logo_url VARCHAR(500),
  metadata JSONB DEFAULT '{}',
    -- Estado y control
  activo BOOLEAN DEFAULT true,
  email_verificado BOOLEAN DEFAULT false,
  ultimo_acceso TIMESTAMP WITH TIME ZONE,
  intentos_fallidos INTEGER DEFAULT 0,
  
  -- Tokens
  refresh_token TEXT,
  reset_password_token VARCHAR(255),
  reset_password_expira TIMESTAMP WITH TIME ZONE,
  verification_token VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_clientes_email ON clientes(email);
CREATE INDEX idx_clientes_activo ON clientes(activo);

-- Trigger para updated_at
CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON clientes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para asignar rol 'cliente' por defecto
CREATE OR REPLACE FUNCTION set_default_cliente_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.rol_id IS NULL THEN
    NEW.rol_id := (SELECT id FROM roles WHERE nombre = 'cliente' LIMIT 1);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_cliente_role_before_insert
  BEFORE INSERT ON clientes
  FOR EACH ROW
  EXECUTE FUNCTION set_default_cliente_role();

-- Comentarios
COMMENT ON TABLE clientes IS 'Tabla de clientes/empresas del sistema';
COMMENT ON COLUMN clientes.metadata IS 'Información adicional del cliente en formato JSON';
