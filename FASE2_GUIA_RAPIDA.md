# 🚀 GUÍA RÁPIDA - FASE 2: GraphQL, RabbitMQ y WebSocket

## 📋 Prerequisitos

- Java 21
- Maven 3.6+
- Docker Desktop (para RabbitMQ)

---

## ⚡ INICIO RÁPIDO

### 1️⃣ Iniciar RabbitMQ (Docker)

```powershell
# En la raíz del proyecto
docker-compose up -d
```

**Verificar:** http://localhost:15672 (Usuario: `admin`, Password: `admin123`)

---

### 2️⃣ Levantar Servicios (EN ESTE ORDEN)

Abre **8 terminales PowerShell** y ejecuta:

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

**Terminal 5 - Tracking Service (NUEVO - FASE 2):**
```powershell
cd tracking-service
.\mvnw.cmd spring-boot:run
```

**Terminal 6 - Notification Service (NUEVO - FASE 2):**
```powershell
cd notification-service
.\mvnw.cmd spring-boot:run
```

**Terminal 7 - GraphQL Service (NUEVO - FASE 2):**
```powershell
cd graphql-service
.\mvnw.cmd spring-boot:run
```

**Terminal 8 - WebSocket Service (NUEVO - FASE 2):**
```powershell
cd websocket-service
.\mvnw.cmd spring-boot:run
```

**Terminal 9 - API Gateway (ÚLTIMO):**
```powershell
cd api-gateway
.\mvnw.cmd spring-boot:run
```

**⏱️ Espera 2-3 minutos** hasta que todos los servicios estén levantados.

---

## ✅ VERIFICACIÓN RÁPIDA

### Servicios Activos

| Servicio | Puerto | URL Verif icación |
|----------|--------|-------------------|
| Auth | 8081 | http://localhost:8081/swagger-ui.html |
| Fleet | 8082 | http://localhost:8082/swagger-ui.html |
| Pedido | 8083 | http://localhost:8083/swagger-ui.html |
| Billing | 8084 | http://localhost:8084/swagger-ui.html |
| Tracking | 8086 | http://localhost:8086/swagger-ui.html |
| Notification | 8087 | http://localhost:8087/swagger-ui.html |
| **GraphQL** | 8088 | http://localhost:8088/graphiql |
| **WebSocket** | 8089 | http://localhost:8089/status |
| API Gateway | 8085 | http://localhost:8085/actuator/health |
| RabbitMQ | 15672 | http://localhost:15672 |

---

## 🧪 PRUEBAS FASE 2

### 🔐 Paso 1: Obtener Token JWT

```powershell
# Login
$response = Invoke-RestMethod -Uri "http://localhost:8085/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"username":"admin","password":"admin123"}'

$token = $response.token
Write-Host "✅ Token obtenido: $token"

# Headers para peticiones autenticadas
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
```

---

### 📊 Paso 2: Probar GraphQL

**Opción A: Interfaz GraphiQL (RECOMENDADO)**

1. Abrir: http://localhost:8088/graphiql
2. Agregar header de autenticación:
   ```json
   {
     "Authorization": "Bearer TU_TOKEN_AQUI"
   }
   ```
3. Ejecutar consulta:

```graphql
query {
  pedidos {
    id
    clienteId
    estado
    tarifa
    direccionEntrega
  }
  
  flotaActiva {
    total
    disponibles
    enRuta
    mantenimiento
  }
  
  kpiDiario {
    totalPedidos
    pedidosEntregados
    tarifaPromedio
    vehiculosActivos
  }
}
```

**Opción B: PowerShell**

```powershell
# Consulta GraphQL de KPIs
$graphqlQuery = @"
{
  "query": "{ kpiDiario { fecha totalPedidos pedidosEntregados tarifaPromedio vehiculosActivos } }"
}
"@

$kpis = Invoke-RestMethod -Uri "http://localhost:8088/graphql" `
  -Method POST `
  -Headers $headers `
  -Body $graphqlQuery

$kpis.data.kpiDiario | Format-List
```

---

### 📡 Paso 3: Probar RabbitMQ + Notificaciones

**Crear un pedido (genera evento):**

```powershell
$nuevoPedido = @{
    clienteId = 1234567890
    direccionEntrega = "Av. Amazonas 123, Quito"
    peso = 5.5
    tarifa = 15.50
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8085/api/pedidos" `
  -Method POST `
  -Headers $headers `
  -Body $nuevoPedido
```

**Verificar evento en RabbitMQ:**
1. Abrir: http://localhost:15672
2. Login: `admin` / `admin123`
3. Ir a **Queues** → Ver `pedido.creado` → Should have 1 message

**Ver notificación generada:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8085/api/notifications/estado/ENVIADO" `
  -Headers $headers
```

---

### 📍 Paso 4: Probar Tracking GPS

**Registrar ubicación GPS:**

```powershell
$ubicacion = @{
    repartidorId = 1
    latitud = -0.1807
    longitud = -78.4678
    estado = "EN_RUTA"
    velocidad = 35.5
    pedidoId = 1
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8085/api/tracking" `
  -Method POST `
  -Headers $headers `
  -Body $ubicacion
```

**Obtener última ubicación:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8085/api/tracking/repartidor/1/ultima" `
  -Headers $headers
```

**Ver repartidores activos:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8085/api/tracking/activos" `
  -Headers $headers
```

---

### 🌐 Paso 5: Probar WebSocket (Tiempo Real)

**Opción A: Cliente HTML de Prueba**

Crear archivo `prueba-websocket.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Test WebSocket</title>
    <script src="https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/stompjs@2.3.3/lib/stomp.min.js"></script>
</head>
<body>
    <h1>WebSocket Test - LogiFlow</h1>
    <div id="messages"></div>
    
    <script>
        const socket = new SockJS('http://localhost:8089/ws');
        const stompClient = Stomp.over(socket);
        
        stompClient.connect({}, function(frame) {
            console.log('Conectado:', frame);
            document.getElementById('messages').innerHTML += '<p>✅ Conectado a WebSocket</p>';
            
            // Suscribirse a eventos de pedidos
            stompClient.subscribe('/topic/pedidos', function(message) {
                const event = JSON.parse(message.body);
                document.getElementById('messages').innerHTML += 
                    `<p>📦 Nuevo pedido: ${event.pedidoId} - Estado: ${event.estado}</p>`;
            });
            
            // Suscribirse a ubicaciones
            stompClient.subscribe('/topic/ubicaciones', function(message) {
                const event = JSON.parse(message.body);
                document.getElementById('messages').innerHTML += 
                    `<p>📍 Repartidor ${event.repartidorId}: Lat ${event.latitud}, Lng ${event.longitud}</p>`;
            });
        });
    </script>
</body>
</html>
```

**Uso:**
1. Abrir `prueba-websocket.html` en navegador
2. En otra terminal, crear pedidos o ubicaciones
3. Ver actualizaciones en tiempo real

---

## 🔄 FLUJO COMPLETO DE PRUEBA

```powershell
# 1. Login y obtener token
$response = Invoke-RestMethod -Uri "http://localhost:8085/auth/login" `
  -Method POST -ContentType "application/json" `
  -Body '{"username":"admin","password":"admin123"}'
$token = $response.token
$headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }

# 2. Crear vehículo
$vehiculo = @{
    placa = "ABC-456"
    modelo = "Honda CRV"
    tipo = "FURGONETA"
    capacidad = 800.0
    pesoMaximo = 500.0
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8085/api/fleet/vehiculos" `
  -Method POST -Headers $headers -Body $vehiculo

# 3. Crear pedido (genera evento → RabbitMQ → Notification)
$pedido = @{
    clienteId = 1234567890
    direccionEntrega = "Calle Falsa 123"
    peso = 10.5
    tarifa = 25.00
    repartidorId = 1
} | ConvertTo-Json

$pedidoCreado = Invoke-RestMethod -Uri "http://localhost:8085/api/pedidos" `
  -Method POST -Headers $headers -Body $pedido

$pedidoId = $pedidoCreado.id
Write-Host "✅ Pedido creado: $pedidoId"

# 4. Registrar ubicación GPS (genera evento → WebSocket)
$ubicacion = @{
    repartidorId = 1
    latitud = -0.1807
    longitud = -78.4678
    estado = "EN_RUTA"
    pedidoId = $pedidoId
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8085/api/tracking" `
  -Method POST -Headers $headers -Body $ubicacion

# 5. Actualizar estado del pedido (genera evento)
Invoke-RestMethod -Uri "http://localhost:8085/api/pedidos/$pedidoId" `
  -Method PATCH -Headers $headers `
  -Body '{"estado":"EN_CAMINO"}'

# 6. Consultar con GraphQL
$graphqlQuery = '{"query":"{ pedido(id:\"' + $pedidoId + '\") { id estado clienteId tarifa } }"}'
Invoke-RestMethod -Uri "http://localhost:8088/graphql" `
  -Method POST -Headers $headers -Body $graphqlQuery

# 7. Ver notificaciones generadas
Invoke-RestMethod -Uri "http://localhost:8085/api/notifications/estado/ENVIADO" `
  -Headers $headers

Write-Host "`n✅ FLUJO COMPLETO EJECUTADO"
Write-Host "📊 Revisa RabbitMQ Management: http://localhost:15672"
Write-Host "🔍 Revisa GraphiQL: http://localhost:8088/graphiql"
```

---

## 📈 PUNTOS CLAVE PARA LA PRESENTACIÓN

### ✅ Fase 2 Implementada:

1. **GraphQL Service (Puerto 8088)**
   - Consultas complejas con un solo request
   - GraphiQL UI para testing interactivo
   - Queries: pedidos, vehiculos, KPIs, flotaActiva

2. **RabbitMQ (Puerto 5672/15672)**
   - Mensajería asíncrona producer/consumer
   - Eventos: pedido.creado, pedido.estado.actualizado, ubicacion.actualizada
   - Idempotencia con eventId

3. **Tracking Service (Puerto 8086)**
   - Registro de ubicaciones GPS
   - Publica eventos en RabbitMQ
   - Histórico y consultas por rango

4. **Notification Service (Puerto 8087)**
   - Consumer de eventos RabbitMQ
   - Simula envío EMAIL/SMS/PUSH
   - Log visible en consola

5. **WebSocket Service (Puerto 8089)**
   - Tiempo real basado en STOMP
   - Consume eventos de RabbitMQ → broadcast a clientes
   - Topics: /topic/pedidos, /topic/ubicaciones, /topic/pedido/{id}

---

## 🎯 DEMOSTRACIONES RECOMENDADAS

1. **GraphQL:** Mostrar GraphiQL ejecutando query de KPIs
2. **RabbitMQ:** Crear pedido → ver queue en RabbitMQ UI → ver notificación
3. **WebSocket:** Cliente HTML conectado → crear pedido → ver actualización en tiempo real
4. **Tracking:** Registrar ubicación → ver evento en logs del WebSocket Service

---

## 🚨 Troubleshooting

**Puerto ocupado:**
```powershell
# Ver qué usa el puerto  8089
netstat -ano | findstr :8089
# Matar proceso
taskkill /PID <PID> /F
```

**RabbitMQ no inicia:**
```powershell
docker-compose down
docker-compose up -d
```

**Servicio no levanta:**
- Verificar logs en la terminal
- Revisar que ports no estén en uso
- Verificar Java 21 instalado: `java -version`

---

## 📝 Checklist para Presentación

- [ ] RabbitMQ corriendo (verificar UI)
- [ ] 9 servicios levantados (verificar Swagger de cada uno)
- [ ] Crear 1-2 pedidos de prueba
- [ ] Registrar ubicaciones GPS
- [ ] Abrir GraphiQL con query preparado
- [ ] Tener archivo HTML de WebSocket listo
- [ ] Terminal con script de prueba completo

**¡LISTO PARA PRESENTAR!** 🎉
