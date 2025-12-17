# Sistema de Gestión de Pedidos - Microservicios

Sistema distribuido de gestión de pedidos y entregas implementado con arquitectura de microservicios, Spring Boot, y Spring Cloud Gateway.

## 🏗️ Arquitectura

El sistema está compuesto por 5 microservicios independientes:

- **api-gateway** (Puerto 8085) - Gateway con autenticación JWT
- **auth-service** (Puerto 8081) - Autenticación y gestión de usuarios
- **fleet-service** (Puerto 8082) - Gestión de vehículos y repartidores
- **pedido-service** (Puerto 8083) - Gestión de pedidos
- **billing-service** (Puerto 8084) - Facturación

## 🚀 Tecnologías

- **Java 21**
- **Spring Boot 3.2.1+**
- **Spring Cloud Gateway 2023.0.0**
- **Spring Security** con JWT
- **Spring Data JPA**
- **H2 Database** (persistencia en archivo)
- **OpenFeign** para comunicación entre microservicios
- **Bean Validation** (Jakarta Validation)
- **Lombok**
- **SpringDoc OpenAPI 2.3.0** (Swagger)

## ✨ Características Implementadas

### Fase 1 - Completada ✅

- ✅ Arquitectura de microservicios
- ✅ API Gateway con filtro JWT
- ✅ Autenticación y autorización con Spring Security
- ✅ Validación de esquemas (Bean Validation)
- ✅ Endpoints PATCH para actualizaciones parciales
- ✅ Cancelación lógica (soft delete)
- ✅ Gestión de errores con códigos HTTP apropiados
- ✅ Transacciones ACID con @Transactional
- ✅ Documentación OpenAPI/Swagger
- ✅ Persistencia en base de datos H2
- ✅ Comunicación entre microservicios con Feign
- ✅ Patrones de diseño (Factory, Strategy)
- ✅ CRUD completo en todos los servicios
- ✅ CORS configurado

### Validaciones Personalizadas

#### Vehículos (Fleet Service):
- **Placa única** por vehículo
- **Formato de placa**: `ABC-123` o `ABC-1234` (3 letras mayúsculas, guion, 3-4 números)

#### Pedidos (Pedido Service):
- **Cédula ecuatoriana válida** para clientes (validación con algoritmo módulo 10)
- **Dirección mínimo 10 caracteres**
- **Tarifa mayor a 0**

## 📋 Requisitos Previos

- Java 21 o superior
- Maven 3.6+
- Python 3.x (para servidor web de pruebas)

## 🔧 Instalación y Ejecución

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd Proyecto_P2
```

### 2. Iniciar los microservicios

Abre **5 terminales** y ejecuta cada servicio:

**Terminal 1 - Auth Service:**
```powershell
cd auth-service
.\mvnw.cmd spring-boot:run
```

**Terminal 2 - Fleet Service:**
```powershell
cd fleet-service
.\mvnw.cmd spring-boot:run
```

**Terminal 3 - Pedido Service:**
```powershell
cd pedido-service
.\mvnw.cmd spring-boot:run
```

**Terminal 4 - Billing Service:**
```powershell
cd billing-service
.\mvnw.cmd spring-boot:run
```

**Terminal 5 - API Gateway:**
```powershell
cd api-gateway
.\mvnw.cmd spring-boot:run
```

### 3. Iniciar interfaz web de pruebas

```powershell
python -m http.server 8000
```

Accede a: **http://localhost:8000/test-app.html**

## 📚 Documentación API (Swagger)

Una vez iniciados los servicios, accede a la documentación interactiva:

- Auth Service: http://localhost:8081/swagger-ui/index.html
- Fleet Service: http://localhost:8082/swagger-ui/index.html
- Pedido Service: http://localhost:8083/swagger-ui/index.html
- Billing Service: http://localhost:8084/swagger-ui/index.html

## 🧪 Pruebas con PowerShell

### Autenticación

```powershell
# Registrar usuario
$registerBody = @{
    nombreUsuario = "admin"
    contrasena = "admin123"
    rol = "ADMIN"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8085/auth/register" -Method Post -Body $registerBody -ContentType "application/json"

# Login
$loginBody = @{
    nombreUsuario = "admin"
    contrasena = "admin123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8085/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $response.token
$headers = @{ Authorization = "Bearer $token" }
```

### Crear Vehículo

```powershell
$vehiculoBody = @{
    tipo = "MOTO"
    placa = "ABC-123"
    modelo = "Yamaha FZ"
    capacidadCarga = 20.0
    estado = "DISPONIBLE"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8085/fleet/vehiculos" -Method Post -Body $vehiculoBody -ContentType "application/json" -Headers $headers
```

### Crear Pedido (con cédula válida)

```powershell
$pedidoBody = @{
    clienteId = 1714567890  # Cédula ecuatoriana válida
    direccionEntrega = "Av. Amazonas 1234, Quito"
    estado = "PENDIENTE"
    tarifa = 5.50
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8085/pedidos" -Method Post -Body $pedidoBody -ContentType "application/json" -Headers $headers
```

### Actualizar Estado (PATCH)

```powershell
# Actualizar estado de vehículo
$estadoBody = @{ estado = "EN_SERVICIO" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8085/fleet/vehiculos/1/estado" -Method Patch -Body $estadoBody -ContentType "application/json" -Headers $headers

# Actualizar pedido
$updateBody = @{ estado = "EN_ENTREGA" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8085/pedidos/1" -Method Patch -Body $updateBody -ContentType "application/json" -Headers $headers
```

### Cancelar Pedido (Soft Delete)

```powershell
Invoke-RestMethod -Uri "http://localhost:8085/pedidos/1" -Method Delete -Headers $headers
```

## 🗄️ Base de Datos

Cada microservicio utiliza H2 con persistencia en archivo:

- `auth-service/data/authdb`
- `fleet-service/data/fleetdb`
- `pedido-service/data/pedidodb`
- `billing-service/data/billingdb`

Accede a la consola H2: `http://localhost:808X/h2-console`

**Configuración de conexión:**
- JDBC URL: `jdbc:h2:file:./data/[nombredb]`
- Usuario: `sa`
- Password: `password`

## 📁 Estructura del Proyecto

```
Proyecto_P2/
├── api-gateway/          # Gateway con JWT filter
├── auth-service/         # Autenticación y usuarios
├── fleet-service/        # Vehículos y repartidores
├── pedido-service/       # Gestión de pedidos
├── billing-service/      # Facturación
├── test-app.html         # Interfaz web de pruebas
├── PHASE1_COMPLIANCE.md  # Documentación de cumplimiento
└── .gitignore
```

## 🎯 Endpoints Principales

### Auth Service
- `POST /auth/register` - Registrar usuario
- `POST /auth/login` - Login (devuelve JWT)
- `GET /auth/usuarios` - Listar usuarios

### Fleet Service
- `POST /api/fleet/vehiculos` - Crear vehículo
- `GET /api/fleet/vehiculos` - Listar vehículos
- `PATCH /api/fleet/vehiculos/{id}/estado` - Actualizar estado
- `DELETE /api/fleet/vehiculos/{id}` - Eliminar vehículo

### Pedido Service
- `POST /api/pedidos` - Crear pedido
- `GET /api/pedidos` - Listar pedidos
- `PATCH /api/pedidos/{id}` - Actualizar parcialmente
- `DELETE /api/pedidos/{id}` - Cancelar (soft delete)

### Billing Service
- `POST /api/billing/facturas` - Crear factura
- `GET /api/billing/facturas` - Listar facturas
- `GET /api/billing/facturas/{id}` - Obtener por ID

## 🔐 Seguridad

- **JWT** con expiración de 30 minutos
- **BCrypt** para cifrado de contraseñas
- **Gateway filter** valida tokens en todas las rutas protegidas
- Rutas públicas: `/auth/register`, `/auth/login`

## 👥 Autores

Proyecto desarrollado para el curso de Aplicaciones Distribuidas - ESPE

## 📄 Licencia

Este proyecto es parte de un trabajo académico.
