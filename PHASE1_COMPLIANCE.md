# Sistema de Gestión de Pedidos - Cumplimiento Fase 1

## ✅ Implementaciones Completadas

### 1. Arquitectura de Microservicios
- **5 Microservicios independientes**:
  - `auth-service` (Puerto 8081): Autenticación y gestión de usuarios
  - `fleet-service` (Puerto 8082): Gestión de vehículos y repartidores
  - `pedido-service` (Puerto 8083): Gestión de pedidos
  - `billing-service` (Puerto 8084): Facturación
  - `api-gateway` (Puerto 8085): Gateway con filtro JWT

### 2. Validación de Esquemas
- **Bean Validation** implementada con anotaciones Jakarta:
  ```java
  @NotNull(message = "El ID del cliente es obligatorio")
  private Long clienteId;
  
  @NotBlank(message = "La dirección de entrega es obligatoria")
  @Size(min = 10, max = 200, message = "La dirección debe tener entre 10 y 200 caracteres")
  private String direccionEntrega;
  
  @NotNull(message = "La tarifa es obligatoria")
  @DecimalMin(value = "0.01", message = "La tarifa debe ser mayor que 0")
  private BigDecimal tarifa;
  ```
- **Validación automática** en controllers con `@Valid`
- **Mensajes de error personalizados** en español

### 3. Endpoints PATCH
#### Pedido Service:
```
PATCH /api/pedidos/{id}
Body: { "direccionEntrega": "nueva dirección", "estado": "EN_ENTREGA" }
```
- Permite actualizaciones parciales sin enviar todo el objeto
- Validación de campos antes de actualizar
- Prevención de actualización de pedidos cancelados

#### Fleet Service:
```
PATCH /api/fleet/vehiculos/{id}/estado
Body: { "estado": "EN_SERVICIO" }
```
- Actualización de estado de vehículos
- Validación de estados permitidos: `DISPONIBLE`, `EN_SERVICIO`, `MANTENIMIENTO`

### 4. Cancelación Lógica (Soft Delete)
- **Campo `cancelado`** agregado a entidades:
  ```java
  @Column(nullable = false)
  private Boolean cancelado = false;
  ```
- **Endpoint DELETE** implementa cancelación lógica:
  ```
  DELETE /api/pedidos/{id}
  ```
- **Validación**: Los pedidos cancelados no pueden ser modificados
- **Audit trail**: Se mantiene historial completo

### 5. Gestión de Errores
- **Excepciones personalizadas** con mensajes descriptivos
- **HTTP Status codes** apropiados:
  - 200 OK: Operación exitosa
  - 201 Created: Recurso creado
  - 400 Bad Request: Validación fallida
  - 401 Unauthorized: Token inválido/expirado
  - 404 Not Found: Recurso no encontrado
  - 500 Internal Server Error: Errores del servidor

### 6. Transacciones ACID
- **@Transactional** en operaciones críticas:
  ```java
  @Transactional(rollbackFor = Exception.class)
  public Pedido actualizarParcial(Long id, Map<String, Object> updates) {
      // Rollback automático en caso de error
  }
  ```
- **Rollback automático** en caso de excepciones
- **Aislamiento** y consistencia garantizados

### 7. Documentación OpenAPI/Swagger
- **Dependencia agregada** a todos los servicios:
  ```xml
  <dependency>
      <groupId>org.springdoc</groupId>
      <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
      <version>2.3.0</version>
  </dependency>
  ```
- **Configuración @OpenAPIDefinition** en cada servicio
- **Swagger UI disponible** en cada servicio:
  - http://localhost:8081/swagger-ui/index.html (Auth Service)
  - http://localhost:8082/swagger-ui/index.html (Fleet Service)
  - http://localhost:8083/swagger-ui/index.html (Pedido Service)
  - http://localhost:8084/swagger-ui/index.html (Billing Service)

### 8. Persistencia de Datos
- **Base de datos H2** con almacenamiento en archivo:
  ```yaml
  datasource:
    url: jdbc:h2:file:./data/pedidodb
  ```
- **JPA/Hibernate** para ORM
- **Datos persistentes** entre reinicios
- **Consola H2** disponible: http://localhost:808X/h2-console

### 9. Seguridad JWT
- **Autenticación basada en tokens** JWT
- **Expiración**: 30 minutos
- **Cifrado BCrypt** para contraseñas
- **Validación en Gateway** para todas las rutas protegidas
- **Endpoints públicos**: /auth/register, /auth/login

### 10. Comunicación entre Microservicios
- **OpenFeign** para llamadas HTTP síncronas
- **REST APIs** bien definidas
- **DTOs** para transferencia de datos
- **Gestión de errores** en comunicación

### 11. Patrones de Diseño
#### Factory Pattern:
```java
public class VehiculoFactory {
    public Vehiculo crearVehiculo(String tipo) {
        return switch (tipo) {
            case "MOTO" -> new Motorizado();
            case "FURGONETA" -> new Furgoneta();
            default -> throw new IllegalArgumentException("Tipo no válido");
        };
    }
}
```

#### Strategy Pattern:
```java
public abstract class Vehiculo {
    public abstract Double calcularCapacidadCarga();
}
```

### 12. Operaciones CRUD Completas
#### Pedidos:
- ✅ POST /api/pedidos - Crear pedido
- ✅ GET /api/pedidos - Listar todos
- ✅ GET /api/pedidos/{id} - Obtener por ID
- ✅ PATCH /api/pedidos/{id} - Actualización parcial
- ✅ DELETE /api/pedidos/{id} - Cancelación lógica

#### Vehículos:
- ✅ POST /api/fleet/vehiculos - Crear vehículo
- ✅ GET /api/fleet/vehiculos - Listar todos
- ✅ GET /api/fleet/vehiculos/{id} - Obtener por ID
- ✅ PATCH /api/fleet/vehiculos/{id}/estado - Actualizar estado
- ✅ DELETE /api/fleet/vehiculos/{id} - Eliminar

#### Repartidores:
- ✅ POST /api/fleet/repartidores - Crear
- ✅ GET /api/fleet/repartidores - Listar todos
- ✅ GET /api/fleet/repartidores/{id} - Obtener por ID
- ✅ GET /api/fleet/repartidores/disponibles - Listar disponibles

#### Facturas:
- ✅ POST /api/billing/facturas - Crear factura
- ✅ GET /api/billing/facturas - Listar todas
- ✅ GET /api/billing/facturas/{id} - Obtener por ID

## 🚀 Comandos para Pruebas PowerShell

### 1. Autenticación
```powershell
# Registrar usuario
$registerBody = @{
    nombreUsuario = "admin"
    contrasena = "admin123"
    rol = "ADMIN"
} | ConvertTo-Json

$registerResponse = Invoke-RestMethod -Uri "http://localhost:8085/auth/register" -Method Post -Body $registerBody -ContentType "application/json"

# Login
$loginBody = @{
    nombreUsuario = "admin"
    contrasena = "admin123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:8085/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token
$headers = @{ Authorization = "Bearer $token" }
```

### 2. Crear y Gestionar Pedidos
```powershell
# Crear pedido (con validación)
$pedidoBody = @{
    clienteId = 1
    direccionEntrega = "Av. Amazonas 1234, Quito"
    estado = "PENDIENTE"
    repartidorId = 1
    tarifa = 5.50
} | ConvertTo-Json

$pedido = Invoke-RestMethod -Uri "http://localhost:8085/pedidos" -Method Post -Body $pedidoBody -ContentType "application/json" -Headers $headers

# Actualización parcial (PATCH)
$updateBody = @{
    estado = "EN_ENTREGA"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8085/pedidos/$($pedido.id)" -Method Patch -Body $updateBody -ContentType "application/json" -Headers $headers

# Cancelar pedido (soft delete)
Invoke-RestMethod -Uri "http://localhost:8085/pedidos/$($pedido.id)" -Method Delete -Headers $headers
```

### 3. Gestionar Vehículos
```powershell
# Crear vehículo
$vehiculoBody = @{
    tipo = "MOTO"
    placa = "ABC-123"
    modelo = "Yamaha FZ"
    capacidadCarga = 20.0
    estado = "DISPONIBLE"
} | ConvertTo-Json

$vehiculo = Invoke-RestMethod -Uri "http://localhost:8085/fleet/vehiculos" -Method Post -Body $vehiculoBody -ContentType "application/json" -Headers $headers

# Actualizar estado del vehículo (PATCH)
$estadoBody = @{
    estado = "EN_SERVICIO"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8085/fleet/vehiculos/$($vehiculo.id)/estado" -Method Patch -Body $estadoBody -ContentType "application/json" -Headers $headers
```

### 4. Validación de Errores
```powershell
# Intentar crear pedido sin campos obligatorios (debe fallar con 400)
$pedidoInvalido = @{
    clienteId = $null  # Violación de @NotNull
    direccionEntrega = "Corta"  # Violación de @Size(min=10)
    tarifa = 0  # Violación de @DecimalMin
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:8085/pedidos" -Method Post -Body $pedidoInvalido -ContentType "application/json" -Headers $headers
} catch {
    Write-Host "Error esperado: $($_.Exception.Message)"
}
```

## 📊 Verificación de Swagger UI

Una vez iniciados los servicios, acceder a:

1. **Auth Service**: http://localhost:8081/swagger-ui/index.html
2. **Fleet Service**: http://localhost:8082/swagger-ui/index.html
3. **Pedido Service**: http://localhost:8083/swagger-ui/index.html
4. **Billing Service**: http://localhost:8084/swagger-ui/index.html

Cada interfaz muestra:
- Todos los endpoints disponibles
- Esquemas de request/response
- Posibilidad de probar endpoints directamente
- Documentación completa de la API

## 🔧 Iniciar Todos los Servicios

```powershell
# Terminal 1 - Auth Service
cd "c:\Users\cajh1\OneDrive\Documentos1\ESPE\OCT 25\DISTRIBUIDAS\Proyecto_P2\auth-service"
.\mvnw.cmd spring-boot:run

# Terminal 2 - Fleet Service
cd "c:\Users\cajh1\OneDrive\Documentos1\ESPE\OCT 25\DISTRIBUIDAS\Proyecto_P2\fleet-service"
.\mvnw.cmd spring-boot:run

# Terminal 3 - Pedido Service
cd "c:\Users\cajh1\OneDrive\Documentos1\ESPE\OCT 25\DISTRIBUIDAS\Proyecto_P2\pedido-service"
.\mvnw.cmd spring-boot:run

# Terminal 4 - Billing Service
cd "c:\Users\cajh1\OneDrive\Documentos1\ESPE\OCT 25\DISTRIBUIDAS\Proyecto_P2\billing-service"
.\mvnw.cmd spring-boot:run

# Terminal 5 - API Gateway
cd "c:\Users\cajh1\OneDrive\Documentos1\ESPE\OCT 25\DISTRIBUIDAS\Proyecto_P2\api-gateway"
.\mvnw.cmd spring-boot:run
```

## ✅ Checklist de Cumplimiento Fase 1

- [x] Arquitectura de microservicios (5 servicios)
- [x] API Gateway con autenticación JWT
- [x] Validación de esquemas con Bean Validation
- [x] Endpoints PATCH para actualizaciones parciales
- [x] Cancelación lógica (soft delete)
- [x] Gestión de errores con códigos HTTP apropiados
- [x] Transacciones ACID con @Transactional
- [x] Documentación OpenAPI/Swagger
- [x] Persistencia con H2 en archivo
- [x] Comunicación entre microservicios con Feign
- [x] Patrones de diseño (Factory, Strategy)
- [x] Operaciones CRUD completas
- [x] Seguridad con Spring Security y JWT
- [x] CORS configurado correctamente

## 🎯 Estado Final

**FASE 1: 100% COMPLETADA** ✅

Todos los requisitos de la Fase 1 han sido implementados exitosamente y probados. El sistema está listo para avanzar a la Fase 2.
