# LogiFlow - Guía de Dockerización y Despliegue en Kubernetes

## 📦 Estructura de Archivos Creados

```
Proyecto_P2/
├── docker-compose.yml          # Orquestación de todos los servicios
├── deploy-docker.ps1           # Script PowerShell para Docker
├── deploy-docker.bat           # Script Batch para Docker
├── deploy-k8s.ps1              # Script PowerShell para Kubernetes
├── k8s/                        # Manifiestos de Kubernetes
│   ├── namespace.yaml          # Namespace logiflow
│   ├── config.yaml             # ConfigMap y Secrets
│   ├── rabbitmq.yaml           # RabbitMQ + PVC
│   ├── backend-services.yaml   # Auth, Pedido, Fleet, Billing
│   ├── support-services.yaml   # Gateway, Notification, Tracking, GraphQL, WebSocket
│   ├── frontend.yaml           # Frontend React
│   └── ingress.yaml            # Ingress + NodePort
├── auth-service/Dockerfile
├── pedido-service/Dockerfile
├── fleet-service/Dockerfile
├── billing-service/Dockerfile
├── api-gateway/Dockerfile
├── notification-service/Dockerfile
├── tracking-service/Dockerfile
├── graphql-service/Dockerfile
├── websocket-service/Dockerfile
└── logiflow-frontend/
    ├── Dockerfile
    ├── nginx.conf
    └── .dockerignore
```

---

## 🐳 Despliegue con Docker Compose

### Opción 1: Script Interactivo
```powershell
.\deploy-docker.ps1
```

### Opción 2: Comando Directo
```powershell
# Construir y levantar todo
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

### Puertos Expuestos
| Servicio | Puerto |
|----------|--------|
| Frontend | 80 |
| Auth Service | 8081 |
| Pedido Service | 8082 |
| Fleet Service | 8083 |
| Billing Service | 8084 |
| API Gateway | 8085 |
| Notification Service | 8086 |
| Tracking Service | 8087 |
| GraphQL Service | 8088 |
| WebSocket Service | 8089 |
| RabbitMQ | 5672, 15672 |

---

## ☸️ Despliegue en Kubernetes

### Requisitos Previos
1. Cluster de Kubernetes (Minikube, Docker Desktop K8s, AKS, EKS, GKE)
2. `kubectl` configurado
3. NGINX Ingress Controller (opcional, para Ingress)

### Opción 1: Script Interactivo
```powershell
.\deploy-k8s.ps1
```

### Opción 2: Despliegue Manual Paso a Paso

```powershell
# 1. Crear namespace y configuración
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/config.yaml

# 2. Desplegar RabbitMQ
kubectl apply -f k8s/rabbitmq.yaml
kubectl wait --for=condition=ready pod -l app=rabbitmq -n logiflow --timeout=120s

# 3. Desplegar microservicios backend
kubectl apply -f k8s/backend-services.yaml
kubectl apply -f k8s/support-services.yaml

# 4. Desplegar frontend
kubectl apply -f k8s/frontend.yaml

# 5. Configurar Ingress (si tienes NGINX Ingress instalado)
kubectl apply -f k8s/ingress.yaml
```

### Verificar Estado
```powershell
# Ver pods
kubectl get pods -n logiflow

# Ver servicios
kubectl get svc -n logiflow

# Ver deployments
kubectl get deployments -n logiflow

# Ver logs de un servicio
kubectl logs -f deployment/auth-service -n logiflow
```

### Acceso Local (Port Forward)
```powershell
# Frontend en http://localhost:8080
kubectl port-forward svc/frontend 8080:80 -n logiflow

# Auth Service en http://localhost:8081
kubectl port-forward svc/auth-service 8081:8081 -n logiflow
```

### Acceso con Ingress
Añade al archivo hosts (C:\Windows\System32\drivers\etc\hosts):
```
127.0.0.1 logiflow.local
```
Luego accede a: http://logiflow.local

---

## 🔧 Construir Imágenes Manualmente

```powershell
# Backend services
docker build -t logiflow/auth-service:latest ./auth-service
docker build -t logiflow/pedido-service:latest ./pedido-service
docker build -t logiflow/fleet-service:latest ./fleet-service
docker build -t logiflow/billing-service:latest ./billing-service
docker build -t logiflow/api-gateway:latest ./api-gateway
docker build -t logiflow/notification-service:latest ./notification-service
docker build -t logiflow/tracking-service:latest ./tracking-service
docker build -t logiflow/graphql-service:latest ./graphql-service
docker build -t logiflow/websocket-service:latest ./websocket-service

# Frontend
docker build -t logiflow/frontend:latest ./logiflow-frontend
```

---

## 📊 Arquitectura de Microservicios

```
                    ┌─────────────────┐
                    │     Ingress     │
                    │  logiflow.local │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
    ┌──────────┐      ┌──────────┐      ┌──────────┐
    │ Frontend │      │  Gateway │      │ GraphQL  │
    │  :80     │      │  :8085   │      │  :8088   │
    └──────────┘      └────┬─────┘      └──────────┘
                           │
    ┌──────────────────────┼──────────────────────┐
    │           │          │          │           │
    ▼           ▼          ▼          ▼           ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│  Auth  │ │ Pedido │ │ Fleet  │ │Billing │ │Tracking│
│ :8081  │ │ :8082  │ │ :8083  │ │ :8084  │ │ :8087  │
└───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘
    │          │          │          │          │
    └──────────┴──────────┴──────────┴──────────┘
                          │
                    ┌─────┴─────┐
                    │ RabbitMQ  │
                    │  :5672    │
                    └───────────┘
```

---

## 🔄 Backup Creado

Se ha creado un backup en: `backup_20260211_XXXXXX/`
- App.tsx.backup
- docker-compose.yml.backup

Para restaurar:
```powershell
Copy-Item "backup_20260211_*/App.tsx.backup" "logiflow-frontend/src/App.tsx"
Copy-Item "backup_20260211_*/docker-compose.yml.backup" "docker-compose.yml"
```

---

## ⚠️ Notas Importantes

1. **Imágenes Docker**: Las imágenes deben construirse antes de desplegar en K8s
2. **Registry**: Para producción, sube las imágenes a un registry (Docker Hub, ACR, ECR, GCR)
3. **Secrets**: En producción, usa secrets de Kubernetes o un vault
4. **Persistencia**: RabbitMQ tiene un PVC para persistir datos
5. **Réplicas**: Los servicios críticos tienen 2 réplicas por defecto

---

## 🚀 Comandos Rápidos

```powershell
# Docker Compose - Todo en uno
docker-compose up -d --build

# Kubernetes - Todo en uno
kubectl apply -f k8s/

# Ver todo en K8s
kubectl get all -n logiflow

# Escalar un servicio
kubectl scale deployment/pedido-service --replicas=3 -n logiflow

# Reiniciar un servicio
kubectl rollout restart deployment/auth-service -n logiflow
```
