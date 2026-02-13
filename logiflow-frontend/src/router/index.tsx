import { lazy, Suspense, ComponentType } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute, UnauthorizedPage } from '../components/ProtectedRoute';

// Lazy loading de páginas (para code splitting)
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const ClienteDashboard = lazy(() => import('../pages/ClienteDashboard'));
const RepartidorDashboard = lazy(() => import('../pages/RepartidorDashboard'));
const SupervisorDashboard = lazy(() => import('../pages/SupervisorDashboard'));
const GerenteDashboard = lazy(() => import('../pages/GerenteDashboard'));

// Loading fallback
const LoadingFallback = () => (
  <div style={{ 
    minHeight: '100vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    background: '#f3f4f6'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚚</div>
      <p style={{ color: '#6b7280' }}>Cargando...</p>
    </div>
  </div>
);

// Wraps component in Suspense
const withSuspense = (Component: React.LazyExoticComponent<ComponentType<unknown>>) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        {withSuspense(LoginPage)}
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        {withSuspense(RegisterPage)}
      </PublicRoute>
    ),
  },
  {
    path: '/cliente',
    element: (
      <ProtectedRoute allowedRoles={['CLIENTE']}>
        {withSuspense(ClienteDashboard)}
      </ProtectedRoute>
    ),
  },
  {
    path: '/repartidor',
    element: (
      <ProtectedRoute allowedRoles={['REPARTIDOR']}>
        {withSuspense(RepartidorDashboard)}
      </ProtectedRoute>
    ),
  },
  {
    path: '/supervisor',
    element: (
      <ProtectedRoute allowedRoles={['SUPERVISOR', 'GERENTE', 'ADMIN']}>
        {withSuspense(SupervisorDashboard)}
      </ProtectedRoute>
    ),
  },
  {
    path: '/gerente',
    element: (
      <ProtectedRoute allowedRoles={['GERENTE', 'ADMIN']}>
        {withSuspense(GerenteDashboard)}
      </ProtectedRoute>
    ),
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);

export default router;
