import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const styles = {
  container: { minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' },
  loginBg: { background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)' },
  card: { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', padding: '24px' },
  btn: { padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  btnPrimary: { backgroundColor: '#2563eb', color: 'white' },
  input: { width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' as const },
};

export default function LoginPage() {
  const [cedula, setCedula] = useState('1709473852');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = (role: string): string => {
    const paths: Record<string, string> = {
      CLIENTE: '/cliente',
      REPARTIDOR: '/repartidor',
      SUPERVISOR: '/supervisor',
      GERENTE: '/gerente',
      ADMIN: '/gerente', // Admin va al dashboard de gerente
    };
    return paths[role] || '/cliente';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(cedula, password);
      navigate(getDashboardPath(user.rol));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ ...styles.container, ...styles.loginBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ ...styles.card, width: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '64px', marginBottom: '8px' }}>🚚</div>
          <h1 style={{ fontSize: '32px', color: '#1e40af', margin: '0 0 8px 0' }}>LogiFlow</h1>
          <p style={{ color: '#6b7280', margin: 0 }}>Sistema de Gestión de Entregas</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Cédula</label>
            <input
              type="text"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          {error && (
            <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{ ...styles.btn, ...styles.btnPrimary, width: '100%' }}>
            {loading ? '⏳ Iniciando sesión...' : '🔐 Iniciar Sesión'}
          </button>
        </form>

        <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '8px', fontSize: '13px' }}>
          <strong>💡 Credenciales de prueba:</strong><br />
          <div style={{ marginTop: '8px', fontSize: '12px' }}>
            <div>👤 Cliente: <code>1709473852</code></div>
            <div>🚴 Repartidor: <code>1709473853</code></div>
            <div>👨‍💼 Supervisor: <code>1709473854</code></div>
            <div>📊 Gerente: <code>1709473855</code></div>
            <div style={{ marginTop: '4px', color: '#6b7280' }}>Contraseña: <code>password123</code></div>
          </div>
        </div>

        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <span style={{ color: '#6b7280' }}>¿No tienes cuenta? </span>
          <Link to="/register" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
