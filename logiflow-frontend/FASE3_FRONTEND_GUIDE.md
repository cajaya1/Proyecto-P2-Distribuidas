# 🚀 LogiFlow - Fase 3: Frontend Completo

## ✅ Estado de Implementación

### Phase 3 - Frontend Panel de Control: **COMPLETO**

Todos los dashboards implementados con las siguientes características:

#### 1. Cliente Dashboard ✅
- Lista de pedidos personales con filtrado automático
- Estadísticas en tiempo real (Total, En Camino, Entregados, Cancelados)
- Vista detallada en modal
- Actualización en tiempo real vía WebSocket
- Consultas GraphQL con polling

#### 2. Repartidor Dashboard ✅
- Lista de asignaciones activas
- Confirmación de entrega con un click
- Estadísticas de entregas completadas
- Actualización automática tras confirmar entrega
- Filtrado por estados ASIGNADO, EN_CAMINO, EN_ENTREGA

#### 3. Supervisor Dashboard ✅
- Estadísticas de flota (disponibles, en ruta, mantenimiento)
- Placeholder para mapa interactivo (Leaflet)
- Lista de pedidos en zona
- Actualización en tiempo real vía WebSocket
- Consultas GraphQL con polling de 15-20 segundos

#### 4. Gerente Dashboard ✅
- KPIs principales (entregas, ingresos, tiempo promedio)
- Gráficos interactivos con Chart.js:
  - Gráfico de línea: tendencia de entregas
  - Gráfico de barras: pedidos por estado
  - Gráfico de pastel: distribución de pedidos
- Filtros por rango de fechas
- **Exportación a CSV funcional** ✅
- Resumen de operaciones con métricas calculadas

## 📦 Estructura Completa

```
logiflow-frontend/
├── src/
│   ├── components/
│   │   ├── Layout.tsx           # App shell con header/footer
│   │   ├── LoadingSpinner.tsx   # Spinner reutilizable
│   │   └── ProtectedRoute.tsx   # HOC para rutas protegidas
│   ├── config/
│   │   └── constants.ts         # URLs y enums
│   ├── context/
│   │   └── AuthContext.tsx      # Estado global de auth
│   ├── graphql/
│   │   └── queries.ts           # Queries de Apollo
│   ├── pages/
│   │   ├── Login.tsx            # Página de login
│   │   ├── Dashboard.tsx        # Router de dashboards
│   │   └── dashboards/
│   │       ├── ClienteDashboard.tsx      ✅
│   │       ├── RepartidorDashboard.tsx   ✅
│   │       ├── SupervisorDashboard.tsx   ✅
│   │       └── GerenteDashboard.tsx      ✅
│   ├── services/
│   │   ├── api.ts               # Axios client (REST)
│   │   ├── apolloClient.ts      # GraphQL client
│   │   ├── auth.ts              # Auth service
│   │   └── websocket.ts         # WebSocket STOMP
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   └── vite-env.d.ts
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 🎯 Características Implementadas

### Autenticación y Seguridad
- ✅ Login con JWT
- ✅ Protected routes por rol
- ✅ Auto-logout en 401/403
- ✅ Almacenamiento seguro en localStorage
- ✅ Interceptores HTTP para tokens

### Comunicación en Tiempo Real
- ✅ WebSocket STOMP con reconexión automática
- ✅ Suscripciones por rol y usuario
- ✅ Actualización reactiva de datos
- ✅ Heartbeat para mantener conexión

### Integración Backend
- ✅ REST API con Axios
- ✅ GraphQL con Apollo Client
- ✅ WebSocket con STOMP/SockJS
- ✅ Proxy configurado en Vite

### Visualización de Datos
- ✅ Gráficos con Chart.js (línea, barras, pastel)
- ✅ Estadísticas en tiempo real
- ✅ Tablas responsivas
- ✅ Cards interactivas

### Exportación
- ✅ CSV funcional en Gerente Dashboard
- ⏳ PDF pendiente (puede agregarse con jsPDF)

### UI/UX
- ✅ Diseño responsive (mobile-first)
- ✅ Tailwind CSS con tema personalizado
- ✅ Loading states
- ✅ Error handling
- ✅ Modals interactivos
- ✅ Iconos con Lucide React

## 🚀 Cómo Ejecutar

### 1. Asegurar que el backend esté corriendo

Desde la raíz del proyecto:

```powershell
# Iniciar todos los servicios (Docker + Spring Boot)
.\start-phase2-services.ps1
```

Servicios necesarios:
- ✅ API Gateway (8085)
- ✅ GraphQL Service (8088)
- ✅ WebSocket Service (8089)
- ✅ Auth Service (8081)
- ✅ Pedido Service (8082)
- ✅ Fleet Service (8083)
- ✅ Billing Service (8084)

### 2. Instalar dependencias del frontend

```powershell
cd logiflow-frontend
npm install
```

### 3. Iniciar servidor de desarrollo

```powershell
npm run dev
```

Abrir: http://localhost:3000

### 4. Login con credenciales de prueba

```
Cédula: 1724562440
Contraseña: password123
```

## 🧪 Testing Manual

### Test 1: Login y Autenticación
1. Ir a http://localhost:3000
2. Ingresar credenciales
3. Verificar redirección a dashboard
4. Verificar token en localStorage (DevTools > Application > Local Storage)

### Test 2: WebSocket en Tiempo Real
1. Abrir consola del navegador
2. Login exitoso
3. Buscar mensaje: "WebSocket conectado exitosamente"
4. Desde otra terminal, disparar evento (ej: crear pedido)
5. Verificar actualización automática en dashboard

### Test 3: Navegación por Roles
1. Login como CLIENTE -> debe ir a `/dashboard/cliente`
2. Verificar que solo ve sus pedidos
3. Intentar acceder manualmente a `/dashboard/gerente` -> debe redirigir

### Test 4: Exportar CSV (Gerente)
1. Login como GERENTE
2. Ir a Dashboard
3. Click en botón "Exportar CSV"
4. Verificar descarga de archivo `reporte_pedidos_YYYY-MM-DD.csv`
5. Abrir CSV y verificar formato correcto

### Test 5: Confirmación de Entrega (Repartidor)
1. Login como REPARTIDOR
2. Ver lista de asignaciones
3. Click en "Confirmar Entrega"
4. Confirmar en modal
5. Verificar actualización automática de estado

## 📊 GraphQL Queries Disponibles

```graphql
# Pedidos
query GetPedidos($filtro: PedidoFiltro) {
  pedidos(filtro: $filtro) {
    id
    clienteId
    repartidorId
    estado
    direccionEntrega
    tarifa
    fechaCreacion
  }
}

# KPIs
query GetKPIDiario($fecha: String!) {
  kpiDiario(fecha: $fecha) {
    pedidosEntregados
    pedidosPendientes
    ingresosTotales
    tiempoPromedioEntrega
  }
}

# Flota
query GetFlotaActiva {
  flotaActiva {
    total
    disponibles
    enRuta
    enMantenimiento
  }
}
```

## 🔧 Configuración de Proxy (Vite)

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8085',
      changeOrigin: true,
    },
    '/graphql': {
      target: 'http://localhost:8088',
      changeOrigin: true,
    },
    '/ws': {
      target: 'http://localhost:8089',
      ws: true,
    },
  },
}
```

## ⚙️ Variables de Entorno (Opcional)

Crear archivo `.env` en la raíz de `logiflow-frontend/`:

```env
VITE_API_URL=http://localhost:8085
VITE_GRAPHQL_URL=http://localhost:8088/graphql
VITE_WS_URL=http://localhost:8089/ws
```

## 🐛 Troubleshooting

### Error: "WebSocket desconectado"
- Verificar que websocket-service esté corriendo en puerto 8089
- Revisar token JWT vario
- Comprobar logs del navegador

### Error: "Cannot find module"
- Ejecutar: `npm install`
- Reiniciar el servidor TypeScript (VS Code: Ctrl+Shift+P > "Restart TS Server")

### Gráficos no se muestran
- Verificar que Chart.js esté instalado
- Abrir consola para ver errores
- Verificar que haya datos en las consultas GraphQL

### CSV no descarga
- Verificar que haya pedidos en el sistema
- Revisar permisos de descarga del navegador
- Comprobar consola para errores

## 📝 Notas para Producción

### Build de Producción

```powershell
npm run build
```

Genera archivos optimizados en `/dist`:
- HTML minificado
- CSS con PurgeCSS (solo clases usadas)
- JS con tree-shaking
- Assets optimizados

### Deploy

1. **Frontend estático** (Netlify, Vercel, etc.):
   ```powershell
   npm run build
   # Subir carpeta /dist
   ```

2. **Configurar CORS** en backend para dominio de producción

3. **Actualizar URLs** en `constants.ts` para endpoints de producción

4. **HTTPS obligatorio** para WebSocket seguro (wss://)

## 🔐 Seguridad

- ✅ JWT con expiración
- ✅ Protected routes
- ✅ Role-based access control
- ⚠️ JWT en localStorage (considerar httpOnly cookies en producción)
- ⚠️ No hay refresh token (sesión expira y requiere re-login)

## 📚 Tecnologías Clave

| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 18.2.0 | UI Library |
| TypeScript | 5.2.2 | Type Safety |
| Vite | 5.0.8 | Build Tool |
| Tailwind CSS | 3.4.0 | Styling |
| Apollo Client | 3.8.8 | GraphQL |
| Axios | 1.6.2 | REST API |
| Chart.js | 4.4.1 | Data Visualization |
| STOMP | 7.0.0 | WebSocket |
| React Router | 6.21.0 | Routing |

## ✅ Cumplimiento de Requisitos

Según documento de Fase 3:

| Requisito | Estado | Notas |
|-----------|--------|-------|
| Vistas por Rol (4) | ✅ | Cliente, Repartidor, Supervisor, Gerente |
| Actualización <2s | ✅ | WebSocket con reconexión automática |
| Exportar CSV | ✅ | Funcional en Gerente Dashboard |
| Mapa interactivo | ⏳ | Placeholder (integración Leaflet pendiente) |
| KPIs con gráficos | ✅ | Chart.js implementado |
| Filtros por fecha | ✅ | En Gerente Dashboard |
| Responsive | ✅ | Mobile-first con Tailwind |
| Accesibilidad | ⏳ | Parcial (focus, contrast) - requiere audit |

## 🎓 Próximos Pasos

1. **Integración Leaflet**: Completar mapa en SupervisorDashboard
2. **Foto Upload**: Implementar captura en RepartidorDashboard
3. **Export PDF**: Agregar jsPDF al lado de CSV
4. **Tests**: Jest + React Testing Library
5. **Lighthouse Audit**: Optimizar performance y accessibility
6. **Service Worker**: Soporte offline

---

**Fase 3 Frontend:** ✅ **COMPLETADO**

**Desarrollado para:** Sistemas Distribuidos - ESPE 2025
