import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const isDev = import.meta.env?.DEV ?? false;
const AUTH_API = isDev ? 'http://localhost:8081' : '';

const styles = {
  container: { minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' },
  loginBg: { background: 'linear-gradient(135deg, #1e40af 0%, #7c3aed 100%)' },
  card: { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', padding: '24px' },
  btn: { padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  btnPrimary: { backgroundColor: '#10b981', color: 'white' },
  btnSecondary: { backgroundColor: '#6b7280', color: 'white' },
  input: { width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' as const },
  select: { width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '16px', backgroundColor: 'white' },
};

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    cedula: '',
    nombre: '',
    password: '',
    confirmPassword: '',
    rol: 'CLIENTE'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateCedula = (cedula: string): boolean => {
    if (cedula.length !== 10) return false;
    const digits = cedula.split('').map(Number);
    const province = parseInt(cedula.substring(0, 2));
    if (province < 1 || province > 24) return false;
    
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      let digit = digits[i];
      if (i % 2 === 0) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }
    const verifier = (10 - (sum % 10)) % 10;
    return verifier === digits[9];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validaciones
    if (!validateCedula(formData.cedula)) {
      setError('La cédula ingresada no es válida');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (formData.nombre.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${AUTH_API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cedula: formData.cedula,
          nombre: formData.nombre.trim(),
          password: formData.password,
          rol: formData.rol
        })
      });

      if (response.ok) {
        setSuccess('✅ ¡Registro exitoso! Redirigiendo al login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        const data = await response.json().catch(() => ({}));
        setError(data.message || 'Error al registrar. La cédula podría ya estar registrada.');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ ...styles.container, ...styles.loginBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ ...styles.card, width: '450px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '56px', marginBottom: '8px' }}>📝</div>
          <h1 style={{ fontSize: '28px', color: '#1e40af', margin: '0 0 8px 0' }}>Registro</h1>
          <p style={{ color: '#6b7280', margin: 0 }}>Crea tu cuenta en LogiFlow</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>
              Cédula de Identidad
            </label>
            <input
              type="text"
              name="cedula"
              value={formData.cedula}
              onChange={handleChange}
              style={styles.input}
              placeholder="Ej: 1710034065"
              maxLength={10}
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>
              Nombre Completo
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              style={styles.input}
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>
              Confirmar Contraseña
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={styles.input}
              placeholder="Repite tu contraseña"
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>
              Tipo de Cuenta
            </label>
            <select 
              name="rol" 
              value={formData.rol} 
              onChange={handleChange}
              style={styles.select}
            >
              <option value="CLIENTE">👤 Cliente - Realizar pedidos</option>
              <option value="REPARTIDOR">🚴 Repartidor - Entregar pedidos</option>
            </select>
          </div>

          {error && (
            <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
              ❌ {error}
            </div>
          )}

          {success && (
            <div style={{ padding: '12px', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
              {success}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            style={{ ...styles.btn, ...styles.btnPrimary, width: '100%', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? '⏳ Registrando...' : '✅ Crear Cuenta'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
          <span style={{ color: '#6b7280' }}>¿Ya tienes cuenta? </span>
          <Link to="/login" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
