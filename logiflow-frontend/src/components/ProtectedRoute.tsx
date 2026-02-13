import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const location = useLocation();

  // Show loading while checking auth
  if (isLoading) {
    return (
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
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization
  if (allowedRoles && !hasRole(allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

// Public route - redirects to dashboard if already logged in
interface PublicRouteProps {
  children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚚</div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  // If authenticated, redirect to appropriate dashboard
  if (isAuthenticated && user) {
    const from = location.state?.from?.pathname || getDashboardPath(user.rol);
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}

// Helper to get dashboard path by role
function getDashboardPath(rol: string): string {
  const paths: Record<string, string> = {
    CLIENTE: '/cliente',
    REPARTIDOR: '/repartidor',
    SUPERVISOR: '/supervisor',
    GERENTE: '/gerente',
  };
  return paths[rol] || '/';
}

// Unauthorized page component
export function UnauthorizedPage() {
  const { user, logout } = useAuth();

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#f3f4f6'
    }}>
      <div style={{ 
        background: 'white', 
        padding: '48px', 
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🚫</div>
        <h1 style={{ color: '#ef4444', marginBottom: '8px' }}>Acceso Denegado</h1>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
          No tienes permisos para acceder a esta página.
          {user && ` Tu rol actual es: ${user.rol}`}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button 
            onClick={() => window.history.back()}
            style={{ 
              padding: '12px 24px', 
              borderRadius: '8px', 
              border: 'none',
              backgroundColor: '#6b7280',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Volver
          </button>
          <button 
            onClick={logout}
            style={{ 
              padding: '12px 24px', 
              borderRadius: '8px', 
              border: 'none',
              backgroundColor: '#ef4444',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProtectedRoute;
