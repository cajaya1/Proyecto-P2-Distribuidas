# LogiFlow - Script de construcción y despliegue con Docker
# Ejecutar desde el directorio raíz del proyecto

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   LogiFlow - Docker Build & Deploy" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Docker
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Docker no está instalado o no está en el PATH" -ForegroundColor Red
    exit 1
}

# Verificar Docker Compose
if (!(Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    # Intentar con docker compose (v2)
    $dockerComposeCmd = "docker compose"
} else {
    $dockerComposeCmd = "docker-compose"
}

$registry = "logiflow"

# Función para construir una imagen
function Build-Service {
    param($serviceName, $context)
    Write-Host "📦 Construyendo $serviceName..." -ForegroundColor Yellow
    docker build -t "${registry}/${serviceName}:latest" -f "$context/Dockerfile" $context
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error construyendo $serviceName" -ForegroundColor Red
        return $false
    }
    Write-Host "✅ $serviceName construido exitosamente" -ForegroundColor Green
    return $true
}

# Menú de opciones
Write-Host "Seleccione una opción:" -ForegroundColor White
Write-Host "1. Construir todas las imágenes"
Write-Host "2. Construir solo backend"
Write-Host "3. Construir solo frontend"
Write-Host "4. Levantar todos los servicios (docker-compose up)"
Write-Host "5. Detener todos los servicios (docker-compose down)"
Write-Host "6. Ver logs de los servicios"
Write-Host "7. Construir y levantar todo"
Write-Host ""
$option = Read-Host "Opción"

switch ($option) {
    "1" {
        Write-Host "`n🔨 Construyendo todas las imágenes..." -ForegroundColor Cyan
        Build-Service "auth-service" "./auth-service"
        Build-Service "pedido-service" "./pedido-service"
        Build-Service "fleet-service" "./fleet-service"
        Build-Service "billing-service" "./billing-service"
        Build-Service "api-gateway" "./api-gateway"
        Build-Service "notification-service" "./notification-service"
        Build-Service "tracking-service" "./tracking-service"
        Build-Service "graphql-service" "./graphql-service"
        Build-Service "websocket-service" "./websocket-service"
        Build-Service "frontend" "./logiflow-frontend"
        Write-Host "`n✅ Todas las imágenes construidas" -ForegroundColor Green
    }
    "2" {
        Write-Host "`n🔨 Construyendo imágenes del backend..." -ForegroundColor Cyan
        Build-Service "auth-service" "./auth-service"
        Build-Service "pedido-service" "./pedido-service"
        Build-Service "fleet-service" "./fleet-service"
        Build-Service "billing-service" "./billing-service"
        Build-Service "api-gateway" "./api-gateway"
        Build-Service "notification-service" "./notification-service"
        Build-Service "tracking-service" "./tracking-service"
        Build-Service "graphql-service" "./graphql-service"
        Build-Service "websocket-service" "./websocket-service"
    }
    "3" {
        Write-Host "`n🔨 Construyendo imagen del frontend..." -ForegroundColor Cyan
        Build-Service "frontend" "./logiflow-frontend"
    }
    "4" {
        Write-Host "`n🚀 Levantando servicios con Docker Compose..." -ForegroundColor Cyan
        Invoke-Expression "$dockerComposeCmd up -d"
        Write-Host "`n✅ Servicios levantados" -ForegroundColor Green
        Write-Host "Frontend: http://localhost:80" -ForegroundColor Yellow
        Write-Host "RabbitMQ: http://localhost:15672 (admin/admin123)" -ForegroundColor Yellow
    }
    "5" {
        Write-Host "`n🛑 Deteniendo servicios..." -ForegroundColor Cyan
        Invoke-Expression "$dockerComposeCmd down"
        Write-Host "✅ Servicios detenidos" -ForegroundColor Green
    }
    "6" {
        Write-Host "`n📋 Mostrando logs..." -ForegroundColor Cyan
        Invoke-Expression "$dockerComposeCmd logs -f"
    }
    "7" {
        Write-Host "`n🔨 Construyendo y levantando todo..." -ForegroundColor Cyan
        Invoke-Expression "$dockerComposeCmd up -d --build"
        Write-Host "`n✅ Sistema completo desplegado" -ForegroundColor Green
        Write-Host ""
        Write-Host "============================================" -ForegroundColor Cyan
        Write-Host "   Accesos:" -ForegroundColor White
        Write-Host "   Frontend:    http://localhost:80" -ForegroundColor Yellow
        Write-Host "   Auth API:    http://localhost:8081" -ForegroundColor Yellow
        Write-Host "   Pedidos API: http://localhost:8082" -ForegroundColor Yellow
        Write-Host "   Fleet API:   http://localhost:8083" -ForegroundColor Yellow
        Write-Host "   Billing API: http://localhost:8084" -ForegroundColor Yellow
        Write-Host "   Gateway:     http://localhost:8085" -ForegroundColor Yellow
        Write-Host "   GraphQL:     http://localhost:8088/graphql" -ForegroundColor Yellow
        Write-Host "   WebSocket:   http://localhost:8089" -ForegroundColor Yellow
        Write-Host "   RabbitMQ:    http://localhost:15672" -ForegroundColor Yellow
        Write-Host "============================================" -ForegroundColor Cyan
    }
    default {
        Write-Host "Opción no válida" -ForegroundColor Red
    }
}
