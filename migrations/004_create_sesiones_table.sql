-- Migración 004: Crear tabla de sesiones
-- Descripción: Registro de sesiones activas y tokens de usuarios

CREATE TABLE IF NOT EXISTS sesiones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL UNIQUE,
  refresh_token VARCHAR(500),
  ip_address VARCHAR(45),
  dispositivo VARCHAR(255),
  ubicacion VARCHAR(255),
  activo BOOLEAN DEFAULT true,
  expira_en TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_sesiones_usuario_id ON sesiones(usuario_id);
CREATE INDEX idx_sesiones_token ON sesiones(token);
CREATE INDEX idx_sesiones_activo ON sesiones(activo);
CREATE INDEX idx_sesiones_expira_en ON sesiones(expira_en);

-- Trigger para updated_at
CREATE TRIGGER update_sesiones_updated_at
  BEFORE UPDATE ON sesiones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE sesiones IS 'Registro de sesiones y tokens activos de usuarios';
