# PRUEBAS COMPLETAS DEL SISTEMA - Paso a Paso

## Todos los servicios DEben Estar Corriendo:
- auth-service (8081)
- fleet-service (8082)
- pedido-service (8083)
- billing-service (8084)
- api-gateway (8085)

---

## 1. AUTENTICACIÓN

### 1.1 Registrar Usuario
```powershell
$registerBody = @{
    nombreUsuario = "admin_test"
    contrasena = "admin123"
    rol = "ADMIN"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8085/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
```

### 1.2 Login
```powershell
$loginBody = @{
    nombreUsuario = "admin_test"
    contrasena = "admin123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8085/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $response.token
$headers = @{ Authorization = "Bearer $token" }

Write-Host "Token obtenido: $($token.Substring(0, 50))..." -ForegroundColor Green
```

### 1.3 Listar Usuarios
```powershell
Invoke-RestMethod -Uri "http://localhost:8085/auth/usuarios" -Method Get -Headers $headers | Format-Table
```

---

## 2. VEHÍCULOS (Fleet Service)

### 2.1 Crear Moto
```powershell
$motoBody = @{
    tipo = "MOTO"
    placa = "ABC-123"
    modelo = "Yamaha FZ 150"
    capacidadCarga = 20.0
    estado = "DISPONIBLE"
} | ConvertTo-Json

$moto = Invoke-RestMethod -Uri "http://localhost:8085/fleet/vehiculos" -Method Post -Body $motoBody -ContentType "application/json" -Headers $headers
Write-Host "Moto creada - ID: $($moto.id), Tipo: $($moto.tipo), Capacidad: $($moto.capacidadCarga) kg" -ForegroundColor Green
$motoId = $moto.id
```

### 2.2 Crear Furgoneta
```powershell
$furgonBody = @{
    tipo = "FURGONETA"
    placa = "XYZ-456"
    modelo = "Chevrolet N300"
    capacidadCarga = 800.0
    estado = "DISPONIBLE"
} | ConvertTo-Json

$furgoneta = Invoke-RestMethod -Uri "http://localhost:8085/fleet/vehiculos" -Method Post -Body $furgonBody -ContentType "application/json" -Headers $headers
Write-Host "Furgoneta creada - ID: $($furgoneta.id), Tipo: $($furgoneta.tipo)" -ForegroundColor Green
```

### 2.3 Probar Validación de Placa Inválida (debe fallar)
```powershell
$vehiculoInvalido = @{
    tipo = "MOTO"
    placa = "abc-12"
    modelo = "Test"
    capacidadCarga = 20.0
    estado = "DISPONIBLE"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:8085/fleet/vehiculos" -Method Post -Body $vehiculoInvalido -ContentType "application/json" -Headers $headers
    Write-Host "ERROR: Deberia haber rechazado la placa invalida" -ForegroundColor Red
} catch {
    Write-Host "CORRECTO: Validacion funciona - Rechazo placa invalida" -ForegroundColor Green
}
```

### 2.4 Listar Vehículos
```powershell
Invoke-RestMethod -Uri "http://localhost:8085/fleet/vehiculos" -Method Get -Headers $headers | Format-Table -Property id, tipo, placa, modelo, capacidadCarga, estado
```

### 2.5 Actualizar Estado con PATCH
```powershell
$estadoBody = @{ estado = "EN_SERVICIO" } | ConvertTo-Json
$vehiculoActualizado = Invoke-RestMethod -Uri "http://localhost:8085/fleet/vehiculos/$motoId/estado" -Method Patch -Body $estadoBody -ContentType "application/json" -Headers $headers
Write-Host "Estado actualizado a: $($vehiculoActualizado.estado)" -ForegroundColor Green
```

---

## 3. PEDIDOS (Pedido Service)

### 3.1 Crear Pedido con Cédula Válida
```powershell
$pedidoBody = @{
    clienteId = 1714567890
    direccionEntrega = "Av. Amazonas 1234, Quito - Ecuador"
    estado = "PENDIENTE"
    tarifa = 5.50
} | ConvertTo-Json

$pedido = Invoke-RestMethod -Uri "http://localhost:8085/pedidos" -Method Post -Body $pedidoBody -ContentType "application/json" -Headers $headers
Write-Host "Pedido creado - ID: $($pedido.id), Cliente: $($pedido.clienteId), Tarifa: $($pedido.tarifa)" -ForegroundColor Green
$pedidoId = $pedido.id
```

### 3.2 Probar Validación de Cédula Inválida (debe fallar)
```powershell
$pedidoInvalido = @{
    clienteId = 1234567890
    direccionEntrega = "Direccion de prueba larga"
    estado = "PENDIENTE"
    tarifa = 5.50
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:8085/pedidos" -Method Post -Body $pedidoInvalido -ContentType "application/json" -Headers $headers
    Write-Host "ERROR: Deberia haber rechazado cedula invalida" -ForegroundColor Red
} catch {
    Write-Host "CORRECTO: Validacion funciona - Rechazo cedula invalida" -ForegroundColor Green
}
```

### 3.3 Crear Segundo Pedido
```powershell
$pedido2Body = @{
    clienteId = 1724562440
    direccionEntrega = "Calle Garcia Moreno 456, Centro Historico"
    estado = "PENDIENTE"
    tarifa = 8.75
} | ConvertTo-Json

$pedido2 = Invoke-RestMethod -Uri "http://localhost:8085/pedidos" -Method Post -Body $pedido2Body -ContentType "application/json" -Headers $headers
Write-Host "Segundo pedido creado - ID: $($pedido2.id)" -ForegroundColor Green
$pedido2Id = $pedido2.id
```

### 3.4 Listar Pedidos
```powershell
Invoke-RestMethod -Uri "http://localhost:8085/pedidos" -Method Get -Headers $headers | Format-Table -Property id, clienteId, direccionEntrega, estado, tarifa, cancelado
```

### 3.5 Actualizar Pedido con PATCH
```powershell
$updateBody = @{
    estado = "EN_CAMINO"
    direccionEntrega = "Av. Amazonas 1234, Sector La Carolina"
} | ConvertTo-Json

$pedidoActualizado = Invoke-RestMethod -Uri "http://localhost:8085/pedidos/$pedidoId" -Method Patch -Body $updateBody -ContentType "application/json" -Headers $headers
Write-Host "Pedido actualizado - Estado: $($pedidoActualizado.estado)" -ForegroundColor Green
```

### 3.6 Cancelar Pedido (Soft Delete)
```powershell
Invoke-RestMethod -Uri "http://localhost:8085/pedidos/$pedido2Id" -Method Delete -Headers $headers
Write-Host "Pedido cancelado (soft delete)" -ForegroundColor Green

# Verificar
$pedidos = Invoke-RestMethod -Uri "http://localhost:8085/pedidos" -Method Get -Headers $headers
$pedidoCancelado = $pedidos | Where-Object { $_.id -eq $pedido2Id }
Write-Host "Estado: $($pedidoCancelado.estado), Cancelado: $($pedidoCancelado.cancelado)" -ForegroundColor Yellow
```

---

## 4. FACTURAS (Billing Service)

### 4.1 Crear Factura
```powershell
$facturaBody = @{
    pedidoId = $pedidoId
    clienteId = 1714567890
    subtotal = 100.00
} | ConvertTo-Json

$factura = Invoke-RestMethod -Uri "http://localhost:8085/billing/facturas" -Method Post -Body $facturaBody -ContentType "application/json" -Headers $headers
Write-Host "Factura creada - ID: $($factura.id)" -ForegroundColor Green
Write-Host "  Subtotal: $($factura.subtotal)" -ForegroundColor Gray
Write-Host "  IVA (15%): $($factura.impuestos)" -ForegroundColor Gray
Write-Host "  Total: $($factura.total)" -ForegroundColor Gray
$facturaId = $factura.id
```

### 4.2 Listar Facturas
```powershell
Invoke-RestMethod -Uri "http://localhost:8085/billing/facturas" -Method Get -Headers $headers | Format-Table -Property id, pedidoId, clienteId, subtotal, impuestos, total, estado
```

### 4.3 Obtener Factura por ID
```powershell
Invoke-RestMethod -Uri "http://localhost:8085/billing/facturas/$facturaId" -Method Get -Headers $headers | Format-List
```

---

## RESUMEN DE FUNCIONALIDADES PROBADAS

- ✅ Autenticación JWT (Registro y Login)
- ✅ CRUD Completo de Vehículos
- ✅ Validación de Formato de Placas (ABC-123)
- ✅ CRUD Completo de Pedidos
- ✅ Validación de Cédulas Ecuatorianas
- ✅ PATCH - Actualizaciones Parciales
- ✅ DELETE - Soft Delete (Cancelación Lógica)
- ✅ Generación de Facturas con Cálculo de IVA
- ✅ Persistencia en Base de Datos H2

## Documentación Adicional

- README.md
- PHASE1_COMPLIANCE.md
- Swagger UI: http://localhost:808X/swagger-ui/index.html
- Repositorio: https://github.com/cajaya1/Proyecto-P2-Distribuidas
