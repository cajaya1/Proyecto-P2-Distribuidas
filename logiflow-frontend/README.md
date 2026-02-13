# LogiFlow Frontend - Panel de Control

Frontend de la aplicación LogiFlow construido con React + TypeScript + Vite para gestión de entregas en tiempo real.

## 🛠️ Stack Tecnológico

- **React 18.2** - Biblioteca UI
- **TypeScript 5.2** - Tipado estático
- **Vite 5.0** - Build tool y dev server
- **Tailwind CSS 3.4** - Framework CSS utility-first
- **React Router DOM 6.21** - Enrutamiento
- **Apollo Client 3.8** - Cliente GraphQL
- **Axios 1.6** - Cliente REST
- **STOMP WebSocket 7.0** - Comunicación en tiempo real
- **Chart.js 4.4** - Visualización de datos
- **Leaflet 1.9** - Mapas interactivos
- **React Hook Form 7.49** - Gestión de formularios
- **Zod 3.22** - Validación de esquemas

## 📋 Prerrequisitos

- Node.js >= 18.x
- npm >= 9.x
- Backend services corriendo (ver README principal del proyecto)

## 🚀 Instalación

```bash
# Navegar al directorio del frontend
cd logiflow-frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en: `http://localhost:3000`

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Layout.tsx      # Shell principal de la app
│   ├── LoadingSpinner.tsx
│   └── ProtectedRoute.tsx
├── config/             # Configuración
│   └── constants.ts    # URLs, enums, constantes
├── context/            # Context API
│   └── AuthContext.tsx # Estado global de autenticación
├── graphql/            # Definiciones GraphQL
│   └── queries.ts      # Queries de Apollo
├── pages/              # Páginas de la aplicación
│   ├── Login.tsx       # Página de login
│   ├── Dashboard.tsx   # Router de dashboards
│   └── dashboards/     # Dashboards por rol
│       ├── ClienteDashboard.tsx
│       ├── RepartidorDashboard.tsx
│       ├── SupervisorDashboard.tsx
│       └── GerenteDashboard.tsx
├── services/           # Servicios
│   ├── api.ts          # Cliente Axios (REST)
│   ├── apolloClient.ts # Cliente Apollo (GraphQL)
│   ├── auth.ts         # Servicio de autenticación
│   └── websocket.ts    # Servicio WebSocket STOMP
├── types/              # Tipos TypeScript
│   └── index.ts        # Interfaces y tipos
├── App.tsx             # Componente raíz
├── main.tsx            # Entry point
└── index.css           # Estilos globales
```

## 🔐 Sistema de Autenticación

El sistema utiliza JWT (JSON Web Tokens) almacenados en localStorage:

1. Usuario ingresa cédula y contraseña
2. Backend valida y retorna JWT + datos de usuario
3. Frontend almacena token y establece conexión WebSocket
4. Token se inyecta automáticamente en todas las peticiones HTTP y GraphQL
5. En caso de 401/403, se hace logout automático

### Usuarios de Prueba

```
Cédula: 1724562440
Contraseña: password123
Rol: CLIENTE
```

## 📊 Dashboards por Rol

### 1. Cliente Dashboard
- **Ruta:** `/dashboard/cliente`
- **Características:**
  - Lista de pedidos personales
  - Estadísticas (Total, En Camino, Entregados, Cancelados)
  - Detalle de pedido en modal
  - Actualización en tiempo real vía WebSocket
  - Filtrado automático por ID de cliente

### 2. Repartidor Dashboard
- **Ruta:** `/dashboard/repartidor`
- **Características:**
  - Lista de asignaciones activas
  - Confirmación de entrega
  - Estadísticas de entregas completadas
  - Actualización automática al confirmar entrega

### 3. Supervisor Dashboard
- **Ruta:** `/dashboard/supervisor`
- **Características:**
  - Mapa de flota en tiempo real (placeholder)
  - Estadísticas de flota (disponibles, en ruta, en mantenimiento)
  - Lista de pedidos en su zona
  - Actualización en tiempo real de posiciones

### 4. Gerente Dashboard
- **Ruta:** `/dashboard/gerente`
- **Características:**
  - KPIs principales (entregas, ingresos, tiempo promedio)
  - Gráficos de tendencias (Chart.js)
  - Gráfico de barras por estados
  - Gráfico de pastel de distribución
  - Exportación de reportes a CSV
  - Filtros por rango de fechas

## 🌐 Integración con Backend

### REST API (Puerto 8085)
- **Base URL:** `http://localhost:8085/api`
- **Endpoints:**
  - `POST /auth/login` - Autenticación
  - `POST /auth/register` - Registro
  - `GET /pedidos` - Lista de pedidos
  - `PATCH /pedidos/:id` - Actualizar estado

### GraphQL (Puerto 8088)
- **URL:** `http://localhost:8088/graphql`
- **Queries:**
  - `pedidos(filtro: PedidoFiltro)` - Consulta con filtros
  - `pedido(id: ID!)` - Pedido por ID
  - `vehiculos` - Lista de vehículos
  - `kpiDiario(fecha: String)` - Métricas del día
  - `flotaActiva` - Estado de la flota

### WebSocket (Puerto 8089)
- **URL:** `ws://localhost:8089/ws`
- **Protocolo:** STOMP over SockJS
- **Topics:**
  - `/topic/cliente/{userId}` - Actualizaciones de pedidos del cliente
  - `/topic/repartidor/{userId}` - Asignaciones del repartidor
  - `/topic/supervisor/updates` - Actualizaciones de flota
  - `/topic/zona/{zonaId}` - Eventos por zona

## 🔄 Características en Tiempo Real

1. **Reconexión Automática:**
   - Máximo 5 intentos
   - Backoff exponencial (delay × intentos)
   - Heartbeat cada 4 segundos

2. **Suscripciones por Rol:**
   - Cliente: recibe updates de sus pedidos
   - Repartidor: notificaciones de nuevas asignaciones
   - Supervisor: cambios en la flota de su zona

3. **Polling como Fallback:**
   - GraphQL queries con `pollInterval`
   - ClienteDashboard: 30s
   - SupervisorDashboard: 15-20s
   - GerenteDashboard: 60s

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia dev server en http://localhost:3000

# Producción
npm run build        # Compila para producción en /dist
npm run preview      # Preview del build de producción

# Calidad de Código
npm run lint         # Ejecuta ESLint
```

## 🎨 Personalización de Estilos

Tailwind CSS está configurado con un tema personalizado en `tailwind.config.js`:

```js
colors: {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    // ... hasta 900
  }
}
```

Clases personalizadas en `src/index.css`:
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`
- `.input` - Inputs de formulario
- `.card` - Contenedores con sombra
- `.badge` - Etiquetas de estado
- `.spinner` - Animación de carga

## 🚧 Desarrollo Futuro

### Pendientes de Implementación
- [ ] Integración completa de Leaflet Maps en SupervisorDashboard
- [ ] Captura de foto/QR en confirmación de entrega
- [ ] Exportación a PDF (además de CSV)
- [ ] Reportes de incidencias con geolocalización
- [ ] Notificaciones push del navegador
- [ ] Modo offline con Service Workers
- [ ] Optimización de bundle size (code splitting)
- [ ] Tests unitarios (React Testing Library)
- [ ] Tests E2E (Playwright/Cypress)

## ⚠️ Notas Importantes

1. **Token Expiration:**
   - Los JWT expiran después de cierto tiempo
   - No hay refresh token implementado aún
   - Usuario debe volver a hacer login

2. **CORS:**
   - Vite proxy maneja CORS en desarrollo
   - En producción, backend debe configurar CORS headers

3. **WebSocket Connection:**
   - Se conecta automáticamente después del login
   - Se desconecta en logout
   - Reconexión automática en caso de pérdida de conexión

4. **npm Vulnerabilities:**
   - 2 vulnerabilidades moderadas detectadas en npm audit
   - No son críticas para desarrollo
   - Ejecutar `npm audit fix` para intentar resolverlas

## 📱 Responsive Design

La aplicación es responsive y funciona en:
- Desktop (>1024px)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

Breakpoints de Tailwind:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## ♿ Accesibilidad

- Cumplimiento WCAG 2.1 AA (objetivo)
- Focus visible para navegación por teclado
- Soporte para modo de alto contraste
- Labels en todos los inputs
- Roles ARIA cuando es necesario

## 🐛 Troubleshooting

### El dev server no inicia
```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error de conexión con backend
- Verificar que todos los servicios backend estén corriendo
- Revisar URLs en `src/config/constants.ts`
- Verificar proxy en `vite.config.ts`

### WebSocket no conecta
- Verificar que websocket-service esté corriendo en puerto 8089
- Revisar console del navegador para errores
- Verificar que el token JWT sea válido

## 📄 Licencia

Este proyecto es parte del curso de Sistemas Distribuidos - ESPE 2025

## 👥 Equipo

Proyecto P2 - Fase 3: Frontend
