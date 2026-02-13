# Script para levantar servicios de Fase 2
# Ejecutar desde la raíz del proyecto

Write-Host "🚀 Levantando servicios para pruebas de Fase 2..." -ForegroundColor Green
Write-Host ""

$rootPath = "c:\Users\cajh1\OneDrive\Documentos1\ESPE\OCT 25\DISTRIBUIDAS\Proyecto_P2"

# Verificar RabbitMQ
Write-Host "🐰 Verificando RabbitMQ..." -ForegroundColor Yellow
$rabbitMQ = docker ps --filter "name=rabbitmq" --format "{{.Status}}"
if ($rabbitMQ -match "Up") {
    Write-Host "✅ RabbitMQ está corriendo" -ForegroundColor Green
} else {
    Write-Host "❌ RabbitMQ NO está corriendo. Ejecuta: docker-compose up -d" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Función para iniciar servicio
function Start-Service {
    param(
        [string]$ServiceName,
        [int]$Port
    )
    
    Write-Host "🔵 Iniciando $ServiceName (Puerto:$Port)..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "cd '$rootPath\$ServiceName'; Write-Host '🚀 $ServiceName' -ForegroundColor Green; .\mvnw.cmd spring-boot:run"
    )
    Start-Sleep -Seconds 2
}

# Levantar servicios FASE 1 (necesarios)
Write-Host "📦 FASE 1 - Servicios Base" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta
Start-Service -ServiceName "auth-service" -Port 8081
Start-Service -ServiceName "pedido-service" -Port 8083

Write-Host ""
Write-Host "⏳ Esperando 30 segundos para que los servicios base inicien..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Levantar servicios FASE 2
Write-Host ""
Write-Host "📦 FASE 2 - Servicios Nuevos" -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta
Start-Service -ServiceName "tracking-service" -Port 8086
Start-Service -ServiceName "notification-service" -Port 8087
Start-Service -ServiceName "graphql-service" -Port 8088
Start-Service -ServiceName "websocket-service" -Port 8089

Write-Host ""
Write-Host "⏳ Esperando 30 segundos para que los servicios de Fase 2 inicien..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# API Gateway al final
Write-Host ""
Write-Host "🌐 Levantando API Gateway..." -ForegroundColor Magenta
Write-Host "============================================" -ForegroundColor Magenta
Start-Service -ServiceName "api-gateway" -Port 8085

Write-Host ""
Write-Host "✅ ¡Todos los servicios están levantándose!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 URLs de Verificación:" -ForegroundColor Cyan
Write-Host "   Auth Service:         http://localhost:8081/swagger-ui.html"
Write-Host "   Pedido Service:       http://localhost:8083/swagger-ui.html"
Write-Host "   Tracking Service:     http://localhost:8086/swagger-ui.html"
Write-Host "   Notification Service: http://localhost:8087/swagger-ui.html"
Write-Host "   GraphQL Service:      http://localhost:8088/graphiql"
Write-Host "   WebSocket Service:    http://localhost:8089/status"
Write-Host "   API Gateway:          http://localhost:8085/actuator/health"
Write-Host "   RabbitMQ Management:  http://localhost:15672 (admin/admin123)"
Write-Host ""
Write-Host "⏳ Espera 2-3 minutos para que todos los servicios terminen de iniciar" -ForegroundColor Yellow
Write-Host ""
Write-Host "Para probar, ejecuta: .\test-phase2.ps1" -ForegroundColor Green
