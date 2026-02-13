import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import 'leaflet/dist/leaflet.css';

// Coordenadas base para Quito (simulación)
const DESTINO_BASE: [number, number] = [-0.2295, -78.5243];
const INICIO_REPARTIDOR: [number, number] = [-0.1950, -78.4900];

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const destinoIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const repartidorIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

interface Pedido {
  id: number;
  clienteId: number;
  repartidorId?: number;
  direccionEntrega: string;
  estado: 'PENDIENTE' | 'ASIGNADO' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO';
  tarifa: number;
}

const styles = {
  card: { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', padding: '24px' },
  btn: { padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  btnPrimary: { backgroundColor: '#2563eb', color: 'white' },
  btnSuccess: { backgroundColor: '#10b981', color: 'white' },
  btnSecondary: { backgroundColor: '#6b7280', color: 'white' },
  input: { width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' as const },
  badge: (color: string) => ({ 
    padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
    backgroundColor: color === 'green' ? '#d1fae5' : color === 'yellow' ? '#fef3c7' : color === 'blue' ? '#dbeafe' : '#fee2e2',
    color: color === 'green' ? '#065f46' : color === 'yellow' ? '#92400e' : color === 'blue' ? '#1e40af' : '#991b1b'
  })
};

const isDev = import.meta.env?.DEV ?? false;
const API_BASE = isDev ? 'http://localhost:9082' : '';

// Componente para actualizar la vista del mapa cuando cambia la posición
function MapUpdater({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.panTo(position, { animate: true, duration: 1 });
  }, [map, position]);
  return null;
}

export default function ClienteDashboard() {
  const { user, token, logout } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nuevoPedido, setNuevoPedido] = useState({ direccionEntrega: '', tarifa: 15 });
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  
  // Estado para seguimiento en tiempo real
  const [repartidorPos, setRepartidorPos] = useState<[number, number]>(INICIO_REPARTIDOR);
  const [rutaRecorrida, setRutaRecorrida] = useState<[number, number][]>([INICIO_REPARTIDOR]);
  const movementInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simular movimiento del repartidor cuando hay un pedido seleccionado EN_CAMINO
  useEffect(() => {
    if (selectedPedido && (selectedPedido.estado === 'EN_CAMINO' || selectedPedido.estado === 'ASIGNADO')) {
      // Reiniciar posición al seleccionar nuevo pedido
      setRepartidorPos(INICIO_REPARTIDOR);
      setRutaRecorrida([INICIO_REPARTIDOR]);
      
      movementInterval.current = setInterval(() => {
        setRepartidorPos(prev => {
          const destino = DESTINO_BASE;
          const dx = (destino[0] - prev[0]) * 0.08; // 8% hacia destino
          const dy = (destino[1] - prev[1]) * 0.08;
          
          // Si está muy cerca del destino, detener
          if (Math.abs(dx) < 0.0005 && Math.abs(dy) < 0.0005) {
            if (movementInterval.current) clearInterval(movementInterval.current);
            return destino;
          }
          
          const newPos: [number, number] = [prev[0] + dx, prev[1] + dy];
          setRutaRecorrida(r => [...r, newPos]);
          return newPos;
        });
      }, 2000); // Actualizar cada 2 segundos
    }
    
    return () => {
      if (movementInterval.current) clearInterval(movementInterval.current);
    };
  }, [selectedPedido]);

  // WebSocket para actualizaciones en tiempo real
  const { connected } = useWebSocket({
    autoConnect: true,
    topics: ['/topic/pedidos'],
    onMessage: (msg) => {
      console.log('WebSocket message:', msg);
      cargarPedidos(); // Recargar pedidos cuando llega una actualización
    }
  });

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      const url = isDev ? `${API_BASE}/api/pedidos` : '/api/pedidos';
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setPedidos(await res.json());
      } else {
        throw new Error('API error');
      }
    } catch {
      // Demo data
      setPedidos([
        { id: 1, clienteId: 1724562440, direccionEntrega: 'Av. Amazonas N36-152, Quito', estado: 'EN_CAMINO', tarifa: 15.50, repartidorId: 1 },
        { id: 2, clienteId: 1724562440, direccionEntrega: 'Calle García Moreno, Centro Histórico', estado: 'PENDIENTE', tarifa: 12.00 },
        { id: 3, clienteId: 1724562440, direccionEntrega: 'Mall El Jardín, Local 234', estado: 'ENTREGADO', tarifa: 8.50, repartidorId: 2 }
      ]);
    }
  };

  const crearPedido = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = isDev ? `${API_BASE}/api/pedidos` : '/api/pedidos';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          clienteId: parseInt(user?.cedula || '0'),
          direccionEntrega: nuevoPedido.direccionEntrega,
          tarifa: nuevoPedido.tarifa,
          estado: 'PENDIENTE'
        })
      });
      if (res.ok) {
        cargarPedidos();
      }
    } catch {
      // Demo: add locally
      setPedidos([...pedidos, {
        id: pedidos.length + 1,
        clienteId: parseInt(user?.cedula || '0'),
        direccionEntrega: nuevoPedido.direccionEntrega,
        estado: 'PENDIENTE',
        tarifa: nuevoPedido.tarifa
      }]);
    }
    setShowForm(false);
    setNuevoPedido({ direccionEntrega: '', tarifa: 15 });
    setLoading(false);
  };

  const getEstadoBadge = (estado: string) => {
    const colors: Record<string, string> = {
      PENDIENTE: 'blue', ASIGNADO: 'yellow', EN_CAMINO: 'yellow', ENTREGADO: 'green', CANCELADO: 'red'
    };
    return styles.badge(colors[estado] || 'blue');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      <Header user={user} onLogout={logout} connected={connected} />
      <main style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '28px', color: '#1f2937' }}>📦 Mis Pedidos</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setShowForm(!showForm)} style={{ ...styles.btn, ...styles.btnPrimary }}>
              {showForm ? '❌ Cancelar' : '➕ Nuevo Pedido'}
            </button>
            <button onClick={cargarPedidos} style={{ ...styles.btn, ...styles.btnSuccess }}>🔄 Actualizar</button>
          </div>
        </div>

        {showForm && (
          <div style={{ ...styles.card, marginBottom: '24px' }}>
            <h3 style={{ marginTop: 0 }}>📝 Crear Nuevo Pedido</h3>
            <form onSubmit={crearPedido}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Dirección de Entrega</label>
                  <input
                    type="text"
                    value={nuevoPedido.direccionEntrega}
                    onChange={(e) => setNuevoPedido({...nuevoPedido, direccionEntrega: e.target.value})}
                    style={styles.input}
                    placeholder="Ej: Av. Principal 123, Quito"
                    required
                    minLength={10}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Tarifa (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={nuevoPedido.tarifa}
                    onChange={(e) => setNuevoPedido({...nuevoPedido, tarifa: parseFloat(e.target.value)})}
                    style={styles.input}
                    required
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} style={{ ...styles.btn, ...styles.btnSuccess, marginTop: '16px' }}>
                {loading ? '⏳ Creando...' : '✅ Crear Pedido'}
              </button>
            </form>
          </div>
        )}

        {/* Mapa de seguimiento */}
        {selectedPedido && (
          <div style={{ ...styles.card, marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>📍 Seguimiento en Tiempo Real - Pedido #{selectedPedido.id}</h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#10b981' }}>🟢 Actualizando cada 2s</span>
                <button onClick={() => setSelectedPedido(null)} style={{ ...styles.btn, ...styles.btnSecondary, padding: '8px 16px' }}>✕ Cerrar</button>
              </div>
            </div>
            <div style={{ marginTop: '16px', height: '350px', borderRadius: '8px', overflow: 'hidden' }}>
              <MapContainer center={repartidorPos} zoom={14} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapUpdater position={repartidorPos} />
                <Marker position={DESTINO_BASE} icon={destinoIcon}>
                  <Popup><strong>📍 Destino</strong><br/>{selectedPedido.direccionEntrega}</Popup>
                </Marker>
                <Marker position={repartidorPos} icon={repartidorIcon}>
                  <Popup><strong>🚚 Repartidor</strong><br/>Pedido #{selectedPedido.id}<br/>Actualizado: {new Date().toLocaleTimeString()}</Popup>
                </Marker>
                {/* Ruta recorrida */}
                <Polyline positions={rutaRecorrida} color="#10b981" weight={3} opacity={0.7}/>
                {/* Ruta pendiente */}
                <Polyline positions={[repartidorPos, DESTINO_BASE]} color="#3b82f6" weight={3} dashArray="10, 10"/>
              </MapContainer>
            </div>
            <div style={{ marginTop: '12px', display: 'flex', gap: '24px', fontSize: '14px', color: '#6b7280' }}>
              <span>🟢 Repartidor: {repartidorPos[0].toFixed(4)}, {repartidorPos[1].toFixed(4)}</span>
              <span>🔴 Destino: {DESTINO_BASE[0].toFixed(4)}, {DESTINO_BASE[1].toFixed(4)}</span>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {pedidos.map((pedido) => (
            <div key={pedido.id} style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '20px' }}>Pedido #{pedido.id}</h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Cliente: {pedido.clienteId}</p>
                </div>
                <span style={getEstadoBadge(pedido.estado)}>{pedido.estado}</span>
              </div>
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                <p style={{ margin: '0 0 8px 0' }}><strong>📍</strong> {pedido.direccionEntrega}</p>
                <p style={{ margin: '0 0 8px 0' }}><strong>💰</strong> ${pedido.tarifa.toFixed(2)}</p>
                {pedido.repartidorId && <p style={{ margin: '0 0 8px 0' }}><strong>🚚</strong> Repartidor #{pedido.repartidorId}</p>}
              </div>
              {pedido.estado !== 'ENTREGADO' && pedido.estado !== 'CANCELADO' && (
                <button onClick={() => setSelectedPedido(pedido)} style={{ ...styles.btn, ...styles.btnPrimary, padding: '8px 16px', marginTop: '16px', width: '100%' }}>
                  🗺️ Seguimiento
                </button>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

// Header component
function Header({ user, onLogout, connected }: { user: { nombre: string; rol: string } | null; onLogout: () => void; connected: boolean }) {
  return (
    <header style={{ backgroundColor: '#1e40af', color: 'white', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontSize: '32px' }}>🚚</span>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px' }}>LogiFlow</h1>
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>Panel de Cliente</p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ 
          width: '10px', height: '10px', borderRadius: '50%', 
          backgroundColor: connected ? '#10b981' : '#ef4444',
          display: 'inline-block'
        }} title={connected ? 'Conectado' : 'Desconectado'} />
        <span>👤 Bienvenido, {user?.nombre || 'Cliente'}</span>
        <button onClick={onLogout} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', backgroundColor: '#ef4444', color: 'white' }}>
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
}
