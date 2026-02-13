import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import 'leaflet/dist/leaflet.css';

const isDev = import.meta.env?.DEV ?? false;
const PEDIDO_API = isDev ? 'http://localhost:9082' : '';

// Fix for default marker icons
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

const styles = {
  card: { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', padding: '24px' },
  btn: { padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  btnSuccess: { backgroundColor: '#10b981', color: 'white' },
  btnSecondary: { backgroundColor: '#6b7280', color: 'white' },
  input: { width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' as const },
  badge: (color: string) => ({ 
    padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
    backgroundColor: color === 'green' ? '#d1fae5' : color === 'yellow' ? '#fef3c7' : color === 'blue' ? '#dbeafe' : '#fee2e2',
    color: color === 'green' ? '#065f46' : color === 'yellow' ? '#92400e' : color === 'blue' ? '#1e40af' : '#991b1b'
  })
};

export default function RepartidorDashboard() {
  const { user, token, logout } = useAuth();
  const [asignaciones, setAsignaciones] = useState<Pedido[]>([]);
  const [showEntrega, setShowEntrega] = useState<number | null>(null);
  const [fotoEntrega, setFotoEntrega] = useState('');
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);

  // Cargar pedidos desde la API
  const cargarPedidos = async () => {
    try {
      const res = await fetch(`${PEDIDO_API}/api/pedidos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Mostrar todos los pedidos (en una app real filtraríamos por repartidorId)
        setAsignaciones(data);
      }
    } catch (err) {
      console.error('Error cargando pedidos:', err);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  // WebSocket para recibir nuevas asignaciones
  const { connected, sendMessage } = useWebSocket({
    autoConnect: true,
    topics: ['/topic/pedidos'],
    onMessage: (msg) => {
      console.log('Nueva asignación:', msg);
      cargarPedidos(); // Recargar al recibir evento
    }
  });

  const confirmarEntrega = (pedidoId: number) => {
    setAsignaciones(asignaciones.map(p => 
      p.id === pedidoId ? { ...p, estado: 'ENTREGADO' as const } : p
    ));
    // Enviar confirmación por WebSocket
    sendMessage('/app/entrega/confirmar', { pedidoId, foto: fotoEntrega, timestamp: new Date().toISOString() });
    setShowEntrega(null);
    setFotoEntrega('');
  };

  const iniciarEntrega = (pedidoId: number) => {
    setAsignaciones(asignaciones.map(p => 
      p.id === pedidoId ? { ...p, estado: 'EN_CAMINO' as const } : p
    ));
    sendMessage('/app/entrega/iniciar', { pedidoId, timestamp: new Date().toISOString() });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      <Header user={user} onLogout={logout} connected={connected} />
      <main style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        <h2 style={{ margin: '0 0 24px 0', fontSize: '28px', color: '#1f2937' }}>🚴 Mis Asignaciones</h2>
        
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          <div style={{ ...styles.card, backgroundColor: '#dbeafe' }}>
            <h3 style={{ margin: '0 0 8px 0' }}>📋 Pendientes</h3>
            <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0, color: '#1e40af' }}>
              {asignaciones.filter(p => p.estado === 'ASIGNADO').length}
            </p>
          </div>
          <div style={{ ...styles.card, backgroundColor: '#fef3c7' }}>
            <h3 style={{ margin: '0 0 8px 0' }}>🚚 En Camino</h3>
            <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0, color: '#92400e' }}>
              {asignaciones.filter(p => p.estado === 'EN_CAMINO').length}
            </p>
          </div>
        </div>

        {/* Mapa de entregas */}
        {selectedPedido && (
          <div style={{ ...styles.card, marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>🗺️ Ruta de Entrega - Pedido #{selectedPedido.id}</h3>
              <button onClick={() => setSelectedPedido(null)} style={{ ...styles.btn, ...styles.btnSecondary, padding: '8px 16px' }}>✕ Cerrar</button>
            </div>
            <div style={{ marginTop: '16px', height: '350px', borderRadius: '8px', overflow: 'hidden' }}>
              <MapContainer center={[-0.2295, -78.5243]} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[-0.2295, -78.5243]}>
                  <Popup><strong>📍 Destino</strong><br/>{selectedPedido.direccionEntrega}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        )}

        {/* Confirmar entrega form */}
        {showEntrega !== null && (
          <div style={{ ...styles.card, marginBottom: '24px', border: '2px solid #10b981' }}>
            <h3 style={{ margin: '0 0 16px 0' }}>📸 Confirmar Entrega - Pedido #{showEntrega}</h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Foto de Entrega (URL)</label>
              <input
                type="text"
                value={fotoEntrega}
                onChange={(e) => setFotoEntrega(e.target.value)}
                style={styles.input}
                placeholder="URL de la foto o captura de la entrega"
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => confirmarEntrega(showEntrega)} style={{ ...styles.btn, ...styles.btnSuccess }}>
                ✅ Confirmar Entrega
              </button>
              <button onClick={() => setShowEntrega(null)} style={{ ...styles.btn, ...styles.btnSecondary }}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lista de asignaciones */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {asignaciones.map((pedido) => (
            <div key={pedido.id} style={{ ...styles.card, borderLeft: `4px solid ${pedido.estado === 'ASIGNADO' ? '#3b82f6' : '#f59e0b'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '20px' }}>Pedido #{pedido.id}</h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Cliente: {pedido.clienteId}</p>
                </div>
                <span style={styles.badge(pedido.estado === 'EN_CAMINO' ? 'yellow' : 'blue')}>{pedido.estado}</span>
              </div>
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                <p style={{ margin: '0 0 8px 0' }}><strong>📍</strong> {pedido.direccionEntrega}</p>
                <p style={{ margin: '0 0 8px 0' }}><strong>💰</strong> ${pedido.tarifa.toFixed(2)}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                {pedido.estado === 'ASIGNADO' && (
                  <button onClick={() => iniciarEntrega(pedido.id)} style={{ ...styles.btn, backgroundColor: '#f59e0b', color: 'white', flex: 1 }}>
                    🚀 Iniciar Entrega
                  </button>
                )}
                {pedido.estado === 'EN_CAMINO' && (
                  <button onClick={() => setShowEntrega(pedido.id)} style={{ ...styles.btn, ...styles.btnSuccess, flex: 1 }}>
                    ✅ Confirmar Entrega
                  </button>
                )}
                <button onClick={() => setSelectedPedido(pedido)} style={{ ...styles.btn, ...styles.btnSecondary, padding: '8px 16px' }}>
                  🗺️
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function Header({ user, onLogout, connected }: { user: { nombre: string } | null; onLogout: () => void; connected: boolean }) {
  return (
    <header style={{ backgroundColor: '#f59e0b', color: 'white', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontSize: '32px' }}>🚴</span>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px' }}>LogiFlow</h1>
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>Panel de Repartidor</p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ 
          width: '10px', height: '10px', borderRadius: '50%', 
          backgroundColor: connected ? '#10b981' : '#ef4444'
        }} title={connected ? 'Conectado' : 'Desconectado'} />
        <span>👤 Bienvenido, {user?.nombre || 'Repartidor'}</span>
        <button onClick={onLogout} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', backgroundColor: '#ef4444', color: 'white' }}>
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
}
