-- Migración 003: Crear tabla de usuarios
-- Descripción: Define los usuarios del sistema con información de empleado/empresa

CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
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
  telefono_movil VARCHAR(9),
  foto_url VARCHAR(500),
  
  -- Información de la empresa/empleado
  rol_id UUID REFERENCES roles(id) ON DELETE SET NULL,
  puesto VARCHAR(100),
  fecha_ingreso DATE,
  salario DECIMAL(10,2),
  
  -- Dirección
  direccion TEXT,
  distrito VARCHAR(100),
  ciudad VARCHAR(100),
  pais VARCHAR(100) DEFAULT 'Perú',
  
  -- Estado y control
  activo BOOLEAN DEFAULT true,
  email_verificado BOOLEAN DEFAULT false,
  ultimo_acceso TIMESTAMP WITH TIME ZONE,
  intentos_fallidos INTEGER DEFAULT 0,
  bloqueado_hasta TIMESTAMP WITH TIME ZONE,
  
  -- Tokens
  refresh_token TEXT,
  reset_password_token VARCHAR(255),
  reset_password_expira TIMESTAMP WITH TIME ZONE,
  verification_token VARCHAR(255),
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  permisos_especiales JSONB DEFAULT '[]',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_username ON usuarios(username);
CREATE INDEX idx_usuarios_rol_id ON usuarios(rol_id);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);
CREATE INDEX idx_usuarios_telefono_movil ON usuarios(telefono_movil);
CREATE INDEX idx_usuarios_ultimo_acceso ON usuarios(ultimo_acceso);

-- Trigger para updated_at
CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentarios
COMMENT ON TABLE usuarios IS 'Tabla principal de usuarios del sistema con información de empleado';
COMMENT ON COLUMN usuarios.telefono_movil IS 'Número de empleado dentro de la empresa/cliente';
COMMENT ON COLUMN usuarios.permisos_especiales IS 'Permisos adicionales específicos del usuario';
COMMENT ON COLUMN usuarios.metadata IS 'Información adicional del usuario en formato JSON';
