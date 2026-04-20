# API Documentation - Micro Login Users

## Documentación completa de la API del microservicio de usuarios

### Base URL
```
Development: http://localhost:3001/api
Production: https://api.ruwark.com/users
```

---

## Autenticación

### 1. Registro de Usuario

**Endpoint:** `POST /auth/register`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "juan.perez@empresa.com",
  "password": "Password123!",
  "nombre": "Juan",
  "apellido_paterno": "Pérez",
  "apellido_materno": "García",
  "username": "jperez",
  "telefono": "5551234567",
  "telefono_movil": "5559876543",
  "cliente_id": "uuid-del-cliente",
  "rol_id": "uuid-del-rol",
  "numero_empleado": "EMP001",
  "departamento": "Desarrollo",
  "puesto": "Desarrollador Senior",
  "fecha_ingreso": "2024-01-15"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "id": "uuid",
    "email": "juan.perez@empresa.com",
    "nombre": "Juan",
    "apellido_paterno": "Pérez",
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

### 2. Login

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "juan.perez@empresa.com",
  "password": "Password123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "usuario": {
      "id": "uuid",
      "email": "juan.perez@empresa.com",
      "nombre": "Juan",
      "apellido_paterno": "Pérez",
      "rol": {
        "id": "uuid",
        "nombre": "desarrollo",
        "permisos": ["leer", "escribir"]
      },
      "cliente": {
        "id": "uuid",
        "razon_social": "Empresa SA de CV"
      }
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 3. Refresh Token

**Endpoint:** `POST /auth/refresh-token`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 4. Logout

**Endpoint:** `POST /auth/logout`

**Headers:**
```
Authorization: Bearer {accessToken}
```

### 5. Verificar Token

**Endpoint:** `GET /auth/verify`

**Headers:**
```
Authorization: Bearer {accessToken}
```

---

## Usuarios

### 1. Obtener Usuario Actual

**Endpoint:** `GET /users/me`

**Headers:**
```
Authorization: Bearer {accessToken}
```

### 2. Listar Usuarios

**Endpoint:** `GET /users`

**Query Parameters:**
- `cliente_id` (opcional): UUID del cliente
- `rol_id` (opcional): UUID del rol
- `activo` (opcional): true/false
- `departamento` (opcional): Nombre del departamento

**Ejemplo:**
```
GET /users?cliente_id=uuid&activo=true&departamento=Desarrollo
```

### 3. Obtener Usuario por ID

**Endpoint:** `GET /users/:id`

### 4. Actualizar Usuario

**Endpoint:** `PUT /users/:id`

**Request Body:**
```json
{
  "nombre": "Juan Carlos",
  "telefono": "5551234567",
  "puesto": "Desarrollador Lead",
  "departamento": "Desarrollo",
  "activo": true
}
```

### 5. Eliminar Usuario

**Endpoint:** `DELETE /users/:id`

Nota: Soft delete - solo desactiva el usuario

### 6. Cambiar Contraseña

**Endpoint:** `POST /users/:id/change-password`

**Request Body:**
```json
{
  "oldPassword": "Password123!",
  "newPassword": "NewPassword456!"
}
```

### 7. Obtener Equipo del Usuario

**Endpoint:** `GET /users/:id/team`

Retorna la jerarquía de subordinados del usuario.

---

## Clientes

### 1. Listar Clientes

**Endpoint:** `GET /clientes`

**Query Parameters:**
- `activo` (opcional): true/false

### 2. Obtener Cliente por ID

**Endpoint:** `GET /clientes/:id`

### 3. Crear Cliente

**Endpoint:** `POST /clientes`

**Request Body:**
```json
{
  "razon_social": "Empresa SA de CV",
  "nombre_comercial": "Empresa",
  "rfc": "EMP123456ABC",
  "email": "contacto@empresa.com",
  "telefono": "5551234567",
  "direccion": "Av. Principal 123",
  "ciudad": "Ciudad de México",
  "estado": "CDMX",
  "codigo_postal": "01000",
  "pais": "México",
  "sitio_web": "https://empresa.com",
  "plan": "premium"
}
```

### 4. Actualizar Cliente

**Endpoint:** `PUT /clientes/:id`

### 5. Eliminar Cliente

**Endpoint:** `DELETE /clientes/:id`

### 6. Estadísticas del Cliente

**Endpoint:** `GET /clientes/:id/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "cliente_id": "uuid",
    "razon_social": "Empresa SA de CV",
    "total_usuarios": 50,
    "usuarios_activos": 45,
    "usuarios_inactivos": 5
  }
}
```

---

## Roles

### 1. Listar Roles

**Endpoint:** `GET /roles`

### 2. Obtener Rol por ID

**Endpoint:** `GET /roles/:id`

### 3. Crear Rol

**Endpoint:** `POST /roles`

**Request Body:**
```json
{
  "nombre": "ventas_senior",
  "descripcion": "Vendedor senior con permisos avanzados",
  "permisos": ["ver_clientes", "crear_cotizaciones", "aprobar_ventas"]
}
```

### 4. Actualizar Rol

**Endpoint:** `PUT /roles/:id`

### 5. Eliminar Rol

**Endpoint:** `DELETE /roles/:id`

### 6. Asignar Permisos

**Endpoint:** `PUT /roles/:id/permissions`

**Request Body:**
```json
{
  "permisos": [
    "crear_proyectos",
    "editar_proyectos",
    "eliminar_proyectos",
    "ver_reportes"
  ]
}
```

---

## Códigos de Estado HTTP

- `200 OK`: Solicitud exitosa
- `201 Created`: Recurso creado exitosamente
- `400 Bad Request`: Datos inválidos
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: Sin permisos
- `404 Not Found`: Recurso no encontrado
- `500 Internal Server Error`: Error del servidor

---

## Formato de Respuesta

### Éxito
```json
{
  "success": true,
  "message": "Mensaje opcional",
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "message": "Descripción del error",
  "errors": [ ... ] // Opcional: detalles de validación
}
```

---

## Seguridad

### Headers Requeridos

Para rutas protegidas:
```
Authorization: Bearer {accessToken}
```

Para comunicación entre servicios:
```
x-service-token: {serviceToken}
```

### Validación de Passwords

- Mínimo 8 caracteres
- Al menos una mayúscula
- Al menos una minúscula
- Al menos un número
- Se recomienda caracteres especiales

---

## Rate Limiting

- Máximo 5 intentos de login fallidos
- Bloqueo temporal de 15 minutos tras 5 intentos
- Contador se resetea tras login exitoso
