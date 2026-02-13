import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import 'leaflet/dist/leaflet.css';

const isDev = import.meta.env?.DEV ?? false;
const PEDIDO_API = isDev ? 'http://localhost:9082' : '';

// Fix icons
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Pedido {
  id: number;
  clienteId: number;
  repartidorId?: number;
  direccionEntrega: string;
  estado: 'RECIBIDO' | 'PENDIENTE' | 'ASIGNADO' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO';
  tarifa: number;
  cancelado?: boolean;
}

interface Repartidor {
  id: number;
  nombre: string;
  estado: 'DISPONIBLE' | 'EN_RUTA' | 'NO_DISPONIBLE';
  vehiculoTipo: string;
  ubicacion?: { lat: number; lng: number };
}

const styles = {
  card: { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', padding: '24px' },
  badge: (color: string) => ({ 
    padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
    backgroundColor: color === 'green' ? '#d1fae5' : color === 'yellow' ? '#fef3c7' : color === 'blue' ? '#dbeafe' : '#fee2e2',
    color: color === 'green' ? '#065f46' : color === 'yellow' ? '#92400e' : color === 'blue' ? '#1e40af' : '#991b1b'
  })
};

export default function SupervisorDashboard() {
  const { user, token, logout } = useAuth();
  const [filtroEstado, setFiltroEstado] = useState('');
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  const [repartidores, setRepartidores] = useState<Repartidor[]>([]);

  // Cargar repartidores desde auth-service
  const cargarRepartidores = async () => {
    try {
      const authApi = isDev ? 'http://localhost:8081' : '';
      const res = await fetch(`${authApi}/auth/usuarios`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const usuarios = await res.json();
        // Filtrar solo repartidores y mapear al formato esperado
        const reps = usuarios
          .filter((u: { rol: string }) => u.rol === 'REPARTIDOR')
          .map((u: { id: number; nombre: string; cedula: string }, idx: number) => ({
            id: u.id || parseInt(u.cedula),
            nombre: u.nombre,
            estado: idx % 3 === 0 ? 'DISPONIBLE' : idx % 3 === 1 ? 'EN_RUTA' : 'DISPONIBLE',
            vehiculoTipo: idx % 2 === 0 ? 'MOTORIZADO' : 'AUTO',
            ubicacion: { lat: -0.2150 + (Math.random() * 0.05), lng: -78.5100 + (Math.random() * 0.05) }
          }));
        setRepartidores(reps.length > 0 ? reps : [
          { id: 1, nombre: 'Sin repartidores', estado: 'NO_DISPONIBLE', vehiculoTipo: 'N/A' }
        ]);
      }
    } catch (err) {
      console.error('Error cargando repartidores:', err);
    }
  };

  // Cargar pedidos desde la API
  const cargarPedidos = async () => {
    try {
      const res = await fetch(`${PEDIDO_API}/api/pedidos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPedidos(data);
      }
    } catch (err) {
      console.error('Error cargando pedidos:', err);
    }
  };

  useEffect(() => {
    cargarPedidos();
    cargarRepartidores();
  }, []);

  // WebSocket para actualizaciones en tiempo real
  const { connected } = useWebSocket({
    autoConnect: true,
    topics: ['/topic/pedidos'],
    onMessage: (msg) => {
      console.log('WebSocket Update:', msg);
      cargarPedidos(); // Recargar al recibir evento
    }
  });

  const reasignarPedido = (pedidoId: number, repartidorId: number) => {
    setPedidos(pedidos.map(p => 
      p.id === pedidoId ? { ...p, repartidorId, estado: 'ASIGNADO' as const } : p
    ));
  };

  const pedidosFiltrados = filtroEstado 
    ? pedidos.filter(p => p.estado === filtroEstado)
    : pedidos;

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      <Header user={user} onLogout={logout} connected={connected} />
      <main style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        <h2 style={{ margin: '0 0 24px 0', fontSize: '28px', color: '#1f2937' }}>👨‍💼 Supervisión de Operaciones</h2>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ ...styles.card, textAlign: 'center' }}>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Total Pedidos</p>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0 0 0', color: '#1e40af' }}>{pedidos.length}</p>
          </div>
          <div style={{ ...styles.card, textAlign: 'center', backgroundColor: '#dbeafe' }}>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Nuevos/Pendientes</p>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0 0 0', color: '#1e40af' }}>{pedidos.filter(p => p.estado === 'RECIBIDO' || p.estado === 'PENDIENTE').length}</p>
          </div>
          <div style={{ ...styles.card, textAlign: 'center', backgroundColor: '#fef3c7' }}>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>En Camino</p>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0 0 0', color: '#92400e' }}>{pedidos.filter(p => p.estado === 'EN_CAMINO').length}</p>
          </div>
          <div style={{ ...styles.card, textAlign: 'center', backgroundColor: '#d1fae5' }}>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Entregados</p>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0 0 0', color: '#065f46' }}>{pedidos.filter(p => p.estado === 'ENTREGADO').length}</p>
          </div>
        </div>

        {/* Mapa de repartidores */}
        <div style={{ ...styles.card, marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0' }}>🗺️ Ubicación de Repartidores</h3>
          <div style={{ height: '350px', borderRadius: '8px', overflow: 'hidden' }}>
            <MapContainer center={[-0.2295, -78.5243]} zoom={12} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {repartidores.filter(r => r.ubicacion).map(rep => (
                <Marker key={rep.id} position={[rep.ubicacion!.lat, rep.ubicacion!.lng]}>
                  <Popup>
                    <strong>{rep.nombre}</strong><br/>
                    Estado: {rep.estado}<br/>
                    Vehículo: {rep.vehiculoTipo}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Repartidores */}
        <div style={{ ...styles.card, marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 16px 0' }}>🚴 Estado de Repartidores</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {repartidores.map(rep => (
              <div key={rep.id} style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', borderLeft: `4px solid ${
                rep.estado === 'DISPONIBLE' ? '#10b981' : rep.estado === 'EN_RUTA' ? '#f59e0b' : '#ef4444'
              }` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>{rep.nombre}</strong>
                  <span style={styles.badge(rep.estado === 'DISPONIBLE' ? 'green' : rep.estado === 'EN_RUTA' ? 'yellow' : 'red')}>
                    {rep.estado}
                  </span>
                </div>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#6b7280' }}>{rep.vehiculoTipo}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pedidos */}
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>📋 Gestión de Pedidos</h3>
            <select 
              value={filtroEstado} 
              onChange={(e) => setFiltroEstado(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #d1d5db' }}
            >
              <option value="">Todos los estados</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="ASIGNADO">Asignados</option>
              <option value="EN_CAMINO">En Camino</option>
              <option value="ENTREGADO">Entregados</option>
            </select>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>ID</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Dirección</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>Estado</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e5e7eb' }}>Tarifa</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>Repartidor</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map((pedido) => (
                <tr key={pedido.id}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>#{pedido.id}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{pedido.direccionEntrega}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
                    <span style={styles.badge(
                      pedido.estado === 'ENTREGADO' ? 'green' : 
                      pedido.estado === 'EN_CAMINO' ? 'yellow' : 
                      pedido.estado === 'PENDIENTE' ? 'blue' : 'yellow'
                    )}>{pedido.estado}</span>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>${pedido.tarifa.toFixed(2)}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
                    {pedido.estado !== 'ENTREGADO' ? (
                      <select
                        value={pedido.repartidorId || ''}
                        onChange={(e) => reasignarPedido(pedido.id, parseInt(e.target.value))}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db' }}
                      >
                        <option value="">Sin asignar</option>
                        {repartidores.filter(r => r.estado !== 'NO_DISPONIBLE').map(rep => (
                          <option key={rep.id} value={rep.id}>{rep.nombre}</option>
                        ))}
                      </select>
                    ) : (
                      <span style={{ color: '#6b7280' }}>-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

function Header({ user, onLogout, connected }: { user: { nombre: string } | null; onLogout: () => void; connected: boolean }) {
  return (
    <header style={{ backgroundColor: '#7c3aed', color: 'white', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontSize: '32px' }}>👨‍💼</span>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px' }}>LogiFlow</h1>
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>Panel de Supervisor</p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: connected ? '#10b981' : '#ef4444' }} />
        <span>👤 Bienvenido, {user?.nombre || 'Supervisor'}</span>
        <button onClick={onLogout} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', backgroundColor: '#ef4444', color: 'white' }}>
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
}
