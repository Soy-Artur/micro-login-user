# 🚀 Instalación y Configuración - Microservicio Login MySQL

## 📋 Requisitos previos

- Node.js >= 16.x
- MySQL >= 8.0
- npm o yarn

## 🔧 Pasos de instalación

### 1. Instalar dependencias

```bash
cd micro-login-users
npm install
```

### 2. Configurar MySQL

#### Opción A: Usar XAMPP/WAMP (Windows)
1. Inicia XAMPP o WAMP
2. Asegúrate de que MySQL esté corriendo
3. Abre phpMyAdmin (http://localhost/phpmyadmin)
4. Crea una nueva base de datos llamada `dblogin`
5. Importa el archivo de migración:
   - Ve a la pestaña "SQL"
   - Copia y pega el contenido de `migrations/000_complete_migration_mysql.sql`
   - Haz clic en "Continuar"

#### Opción B: Línea de comandos MySQL
```bash
# Crear la base de datos
mysql -u root -p -e "CREATE DATABASE dblogin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Importar la migración
mysql -u root -p dblogin < migrations/000_complete_migration_mysql.sql
```

### 3. Configurar variables de entorno

```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita el archivo .env con tus credenciales
```

Ejemplo de configuración `.env`:

```env
# Servidor
NODE_ENV=development
PORT=3002
SERVICE_NAME=micro-login-users

# Base de datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password_aqui
DB_NAME=dblogin
DB_CONNECTION_LIMIT=10

# JWT
JWT_SECRET=ruwark-secret-key-2024
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Servicios
SERVICE_TOKEN=your-service-token-for-gateway
API_GATEWAY_URL=http://localhost:3000

# Logs
LOG_LEVEL=info

# CORS
CORS_ORIGIN=*
```

### 4. Iniciar el microservicio

#### Modo desarrollo (con auto-reload)
```bash
npm run dev
```

#### Modo producción
```bash
npm start
```

## ✅ Verificar instalación

1. El servidor debe mostrar:
```
✅ Conexión exitosa a MySQL
📊 Base de datos: dblogin
🌐 Host: localhost:3306
🚀 Microservicio micro-login-users iniciado
📡 Puerto: 3002
🔗 URL: http://localhost:3002
```

2. Prueba el endpoint de health:
```bash
curl http://localhost:3002/api/health
```

3. Prueba hacer login con un usuario de ejemplo:
```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ruwark.com",
    "password": "password123"
  }'
```

## 👥 Usuarios de prueba

Después de ejecutar la migración, tendrás estos usuarios:

| Email | Password | Rol |
|-------|----------|-----|
| admin@ruwark.com | password123 | admin |
| ventas@ruwark.com | password123 | ventas |
| marketing@ruwark.com | password123 | marketing |
| operaciones@ruwark.com | password123 | operaciones |
| administracion@ruwark.com | password123 | administracion |
| contabilidad@ruwark.com | password123 | contabilidad |
| desarrollo@ruwark.com | password123 | desarrollo |
| sistemas@ruwark.com | password123 | sistemas |
| cliente@ruwark.com | password123 | cliente |

## 🐛 Solución de problemas

### Error: "Cannot connect to MySQL"
- Verifica que MySQL esté corriendo
- Verifica las credenciales en el archivo `.env`
- Verifica que la base de datos `dblogin` exista

### Error: "Table doesn't exist"
- Ejecuta la migración SQL en phpMyAdmin o línea de comandos
- Verifica que el nombre de la base de datos sea correcto

### Error: "Port 3002 already in use"
- Cambia el puerto en el archivo `.env`
- O mata el proceso que está usando el puerto 3002

### Error: "JWT_SECRET is not defined"
- Asegúrate de tener el archivo `.env` configurado
- Verifica que la variable `JWT_SECRET` esté definida

## 📚 Estructura del proyecto

```
micro-login-users/
├── src/
│   ├── config/
│   │   ├── database.js      # ✨ Nueva configuración MySQL
│   │   ├── index.js          # Variables de entorno
│   │   └── logger.js         # Sistema de logs
│   ├── controllers/          # Controladores de rutas
│   ├── middlewares/          # Middlewares personalizados
│   ├── routes/              # Definición de rutas
│   ├── services/            # Lógica de negocio
│   ├── validators/          # Validadores de datos
│   └── server.js            # Servidor principal
├── migrations/
│   └── 000_complete_migration_mysql.sql  # ✨ Migración unificada
├── .env                     # Variables de entorno (no subir)
├── .env.example            # ✨ Plantilla de variables
├── package.json
└── README.md

✨ = Archivos nuevos o modificados para MySQL
```

## 🔄 Cambios principales de Supabase a MySQL

1. ✅ Reemplazado `@supabase/supabase-js` por `mysql2`
2. ✅ Creado archivo `src/config/database.js` con pool de conexiones
3. ✅ Actualizado `src/config/index.js` con configuración de MySQL
4. ✅ Modificado `src/server.js` para verificar conexión al iniciar
5. ✅ Creada migración SQL unificada para MySQL
6. ✅ Actualizado `.env` con variables de MySQL
7. ✅ Agregado soporte para transacciones y queries preparados

## 📞 Soporte

Si tienes problemas, revisa:
1. Que MySQL esté corriendo
2. Que las credenciales sean correctas
3. Que la base de datos exista
4. Los logs del servidor en consola
