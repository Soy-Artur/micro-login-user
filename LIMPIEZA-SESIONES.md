# 🧹 Sistema de Limpieza de Sesiones - Solución Anti-Basura

## 📋 Problema Solucionado

**ANTES:** Las sesiones se acumulaban infinitamente en la base de datos cada vez que un usuario o cliente iniciaba sesión, generando "basura" de datos.

**AHORA:** Sistema inteligente que:
- ✅ **Limpia automáticamente** sesiones anteriores cuando un usuario inicia sesión
- ✅ **Elimina sesiones expiradas** periódicamente 
- ✅ **Mantiene solo 1 sesión activa** por usuario/cliente
- ✅ **Ejecuta limpieza programada** cada 6 horas
- ✅ **Soporte para usuarios Y clientes** en el mismo sistema

## 🔧 ¿Qué se Implementó?

### 1. **Limpieza Automática en Login**
- Cada vez que alguien inicia sesión, se eliminan sus sesiones anteriores
- Maneja tanto usuarios internos como clientes externos
- No interrumpe el proceso de login si hay errores

### 2. **Limpieza Programada Automática**
- Se ejecuta cada 6 horas automáticamente
- Elimina sesiones expiradas, inactivas y muy antiguas
- Mantiene solo la sesión más reciente por usuario

### 3. **Endpoint de Limpieza Manual**
- Los administradores pueden ejecutar limpieza manual
- Útil para resolver acumulación existente

### 4. **Soporte Dual Usuario/Cliente**
- El sistema de login ahora maneja tanto usuarios como clientes
- Ambos comparten la misma tabla de sesiones de forma inteligente

## 🚀 Cómo Usar

### **Limpieza Manual Inmediata** 

Para limpiar las sesiones ya acumuladas, ejecuta:

```bash
# Método 1: Usando curl (reemplaza TOKEN por el token de admin)
curl -X POST http://localhost:3002/api/auth/cleanup-sessions \
  -H "Authorization: Bearer TU_TOKEN_DE_ADMIN" \
  -H "Content-Type: application/json"

# Método 2: Desde Postman
POST http://localhost:3002/api/auth/cleanup-sessions
Headers:
- Authorization: Bearer TU_TOKEN_DE_ADMIN
- Content-Type: application/json
```

**Requisitos:** Solo usuarios con rol `admin` pueden ejecutar esto.

### **Ver el Estado Actual**

Para verificar cuántas sesiones existen actualmente:

```sql
-- Contar sesiones totales
SELECT COUNT(*) as total_sesiones FROM sesiones;

-- Ver sesiones por usuario
SELECT usuario_id, COUNT(*) as sesiones_count 
FROM sesiones 
GROUP BY usuario_id 
ORDER BY sesiones_count DESC;

-- Ver sesiones expiradas
SELECT COUNT(*) as sesiones_expiradas 
FROM sesiones 
WHERE expira_en < NOW();
```

## 📊 Monitoreo

### **Logs del Sistema**

El sistema registra todas las actividades de limpieza:

```bash
# Ver logs de limpieza en el microservicio
tail -f micro-login-users/logs/app.log | grep "🧹"
```

Busca mensajes como:
- `🧹 Limpiando sesiones del usuario: [ID]`
- `✅ Eliminadas X sesiones anteriores del usuario`
- `🗑️ Eliminadas X sesiones expiradas automáticamente`
- `⏰ Limpieza automática de sesiones programada cada 6 horas`

### **Estadísticas en Respuesta**

La limpieza manual devuelve estadísticas:

```json
{
  "success": true,
  "message": "Limpieza de sesiones completada exitosamente",
  "data": {
    "sesiones_antes": 1247,
    "sesiones_despues": 8,
    "sesiones_eliminadas": 1239,
    "ejecutado_por": "admin@ruwark.com",
    "fecha_limpieza": "2026-02-10T15:30:00.000Z"
  }
}
```

## 🔧 Configuración

### **Configurar Frecuencia de Limpieza**

Para cambiar la frecuencia (por defecto 6 horas):

```javascript
// En: src/services/sessionCleanup.service.js
// Cambiar esta línea:
const SIX_HOURS = 6 * 60 * 60 * 1000;

// Por ejemplo, para 2 horas:
const TWO_HOURS = 2 * 60 * 60 * 1000;
```

### **Configurar Días de Retención**

Para cambiar cuánto tiempo mantener sesiones antiguas:

```javascript
// En: src/services/sessionCleanup.service.js
// Cambiar esta línea:
const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

// Por ejemplo, para 3 días:
const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
```

## 🆘 Comandos de Emergencia

### **Limpieza de Emergencia Total**

Si necesitas eliminar TODAS las sesiones (desconectará a todos):

```javascript
// En Node.js REPL o script:
const SessionCleanupService = require('./src/services/sessionCleanup.service');
SessionCleanupService.emergencyCleanup();
```

### **Deshabilitar Limpieza Automática**

Para deshabilitar temporalmente la limpieza automática:

```javascript
// En: src/server.js
// Comentar estas líneas:
/*
try {
  SessionCleanupService.scheduleAutomaticCleanup();
  logger.info('🧹 ✅ Sistema de limpieza automática de sesiones inicializado');
} catch (error) {
  logger.warn('🧹 ⚠️ No se pudo inicializar la limpieza automática de sesiones:', error.message);
}
*/
```

## 📈 Beneficios Obtenidos

### **Antes de la Implementación:**
- ❌ Tabla `sesiones` crecía infinitamente
- ❌ Base de datos se llenaba de registros basura
- ❌ Rendimiento degradado por exceso de datos
- ❌ Dificultat para encontrar sesiones activas reales

### **Después de la Implementación:**
- ✅ Solo sesiones necesarias en base de datos
- ✅ Máximo 1 sesión activa por usuario
- ✅ Limpieza automática sin intervención manual
- ✅ Mejor rendimiento del sistema
- ✅ Logs claros de toda la actividad

## 🔄 Reiniciar el Microservicio

Para aplicar todos los cambios, reinicia el microservicio:

```bash
cd micro-login-users
npm restart

# O si usas PM2:
pm2 restart micro-login-users
```

¡El sistema ahora mantendrá automáticamente la tabla de sesiones limpia y sin basura! 🎉