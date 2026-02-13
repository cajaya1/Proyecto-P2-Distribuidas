# LogiFlow - Script de despliegue en Kubernetes
# Ejecutar desde el directorio raíz del proyecto

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   LogiFlow - Kubernetes Deployment" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar kubectl
if (!(Get-Command kubectl -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: kubectl no está instalado o no está en el PATH" -ForegroundColor Red
    exit 1
}

# Verificar conexión al cluster
Write-Host "🔍 Verificando conexión al cluster..." -ForegroundColor Yellow
$context = kubectl config current-context 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: No hay conexión a ningún cluster de Kubernetes" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Conectado al cluster: $context" -ForegroundColor Green

$registry = "logiflow"

# Función para construir y subir imagen
function Build-And-Push {
    param($serviceName, $context)
    Write-Host "📦 Construyendo $serviceName..." -ForegroundColor Yellow
    docker build -t "${registry}/${serviceName}:latest" -f "$context/Dockerfile" $context
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error construyendo $serviceName" -ForegroundColor Red
        return $false
    }
    # Si usas un registry remoto, descomenta:
    # docker push "${registry}/${serviceName}:latest"
    Write-Host "✅ $serviceName listo" -ForegroundColor Green
    return $true
}

# Menú de opciones
Write-Host ""
Write-Host "Seleccione una opción:" -ForegroundColor White
Write-Host "1. Desplegar todo (namespace, config, servicios)"
Write-Host "2. Solo crear namespace y configuración"
Write-Host "3. Solo desplegar RabbitMQ"
Write-Host "4. Solo desplegar microservicios backend"
Write-Host "5. Solo desplegar frontend"
Write-Host "6. Construir imágenes Docker"
Write-Host "7. Ver estado del despliegue"
Write-Host "8. Eliminar todo el despliegue"
Write-Host "9. Port-forward para desarrollo local"
Write-Host ""
$option = Read-Host "Opción"

switch ($option) {
    "1" {
        Write-Host "`n🚀 Desplegando LogiFlow completo en Kubernetes..." -ForegroundColor Cyan
        
        # Namespace y configuración
        kubectl apply -f k8s/namespace.yaml
        kubectl apply -f k8s/config.yaml
        
        # RabbitMQ
        kubectl apply -f k8s/rabbitmq.yaml
        Write-Host "⏳ Esperando a que RabbitMQ esté listo..." -ForegroundColor Yellow
        kubectl wait --for=condition=ready pod -l app=rabbitmq -n logiflow --timeout=120s
        
        # Backend services
        kubectl apply -f k8s/backend-services.yaml
        kubectl apply -f k8s/support-services.yaml
        
        # Frontend
        kubectl apply -f k8s/frontend.yaml
        
        # Ingress
        kubectl apply -f k8s/ingress.yaml
        
        Write-Host "`n✅ Despliegue completo!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Para acceder localmente, ejecute:" -ForegroundColor Yellow
        Write-Host "  kubectl port-forward svc/frontend 8080:80 -n logiflow" -ForegroundColor White
        Write-Host ""
        Write-Host "O añada a /etc/hosts: 127.0.0.1 logiflow.local" -ForegroundColor Yellow
    }
    "2" {
        Write-Host "`n📋 Creando namespace y configuración..." -ForegroundColor Cyan
        kubectl apply -f k8s/namespace.yaml
        kubectl apply -f k8s/config.yaml
        Write-Host "✅ Namespace y configuración creados" -ForegroundColor Green
    }
    "3" {
        Write-Host "`n🐰 Desplegando RabbitMQ..." -ForegroundColor Cyan
        kubectl apply -f k8s/rabbitmq.yaml
        Write-Host "✅ RabbitMQ desplegado" -ForegroundColor Green
    }
    "4" {
        Write-Host "`n🔧 Desplegando microservicios backend..." -ForegroundColor Cyan
        kubectl apply -f k8s/backend-services.yaml
        kubectl apply -f k8s/support-services.yaml
        Write-Host "✅ Microservicios desplegados" -ForegroundColor Green
    }
    "5" {
        Write-Host "`n🖥️ Desplegando frontend..." -ForegroundColor Cyan
        kubectl apply -f k8s/frontend.yaml
        kubectl apply -f k8s/ingress.yaml
        Write-Host "✅ Frontend desplegado" -ForegroundColor Green
    }
    "6" {
        Write-Host "`n🔨 Construyendo imágenes Docker..." -ForegroundColor Cyan
        Build-And-Push "auth-service" "./auth-service"
        Build-And-Push "pedido-service" "./pedido-service"
        Build-And-Push "fleet-service" "./fleet-service"
        Build-And-Push "billing-service" "./billing-service"
        Build-And-Push "api-gateway" "./api-gateway"
        Build-And-Push "notification-service" "./notification-service"
        Build-And-Push "tracking-service" "./tracking-service"
        Build-And-Push "graphql-service" "./graphql-service"
        Build-And-Push "websocket-service" "./websocket-service"
        Build-And-Push "frontend" "./logiflow-frontend"
        Write-Host "`n✅ Todas las imágenes construidas" -ForegroundColor Green
    }
    "7" {
        Write-Host "`n📊 Estado del despliegue:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "=== Pods ===" -ForegroundColor Yellow
        kubectl get pods -n logiflow -o wide
        Write-Host ""
        Write-Host "=== Services ===" -ForegroundColor Yellow
        kubectl get svc -n logiflow
        Write-Host ""
        Write-Host "=== Deployments ===" -ForegroundColor Yellow
        kubectl get deployments -n logiflow
        Write-Host ""
        Write-Host "=== Ingress ===" -ForegroundColor Yellow
        kubectl get ingress -n logiflow
    }
    "8" {
        Write-Host "`n⚠️ ¿Está seguro de eliminar todo el despliegue? (s/n)" -ForegroundColor Red
        $confirm = Read-Host
        if ($confirm -eq "s") {
            Write-Host "🗑️ Eliminando namespace logiflow..." -ForegroundColor Yellow
            kubectl delete namespace logiflow
            Write-Host "✅ Despliegue eliminado" -ForegroundColor Green
        } else {
            Write-Host "Operación cancelada" -ForegroundColor Yellow
        }
    }
    "9" {
        Write-Host "`n🔌 Iniciando port-forward para desarrollo local..." -ForegroundColor Cyan
        Write-Host "Frontend estará disponible en: http://localhost:8080" -ForegroundColor Yellow
        Write-Host "Presione Ctrl+C para detener" -ForegroundColor Yellow
        kubectl port-forward svc/frontend 8080:80 -n logiflow
    }
    default {
        Write-Host "Opción no válida" -ForegroundColor Red
    }
}
