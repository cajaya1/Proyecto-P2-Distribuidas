import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@apollo/client';
import { GET_PEDIDOS } from '../graphql/queries';
import { 
  DeliveryTrendChart, 
  StatusDistributionChart, 
  ZoneComparisonChart, 
  RevenueChart 
} from '../components/Charts';

const isDev = import.meta.env?.DEV ?? false;
const PEDIDO_API = isDev ? 'http://localhost:9082' : '';

interface Pedido {
  id: number;
  clienteId: number;
  repartidorId?: number;
  direccionEntrega: string;
  estado: string;
  tarifa: number;
  cancelado?: boolean;
}

interface KPI {
  totalPedidos: number;
  entregados: number;
  enCamino: number;
  pendientes: number;
  recibidos: number;
  tasaEntrega: number;
  ingresoTotal: number;
}

const styles = {
  card: { backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', padding: '24px' },
  btn: { padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  btnSuccess: { backgroundColor: '#10b981', color: 'white' },
  input: { padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '16px' },
  badge: (color: string) => ({ 
    padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
    backgroundColor: color === 'green' ? '#d1fae5' : color === 'yellow' ? '#fef3c7' : '#dbeafe',
    color: color === 'green' ? '#065f46' : color === 'yellow' ? '#92400e' : '#1e40af'
  })
};

export default function GerenteDashboard() {
  const { user, token, logout } = useAuth();
  const [fechaInicio, setFechaInicio] = useState('2026-02-01');
  const [fechaFin, setFechaFin] = useState('2026-02-12');
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  // GraphQL Query for pedidos (usado como fallback)
  useQuery(GET_PEDIDOS, {
    variables: { filtro: null },
    fetchPolicy: 'cache-first',
    errorPolicy: 'ignore'
  });

  // Cargar pedidos desde la API REST
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
  }, []);

  // Calcular KPIs basados en datos reales
  const kpis: KPI = useMemo(() => {
    const total = pedidos.length;
    const entregados = pedidos.filter(p => p.estado === 'ENTREGADO').length;
    const enCamino = pedidos.filter(p => p.estado === 'EN_CAMINO').length;
    const pendientes = pedidos.filter(p => p.estado === 'PENDIENTE' || p.estado === 'ASIGNADO').length;
    const recibidos = pedidos.filter(p => p.estado === 'RECIBIDO').length;
    const ingresoTotal = pedidos.reduce((sum, p) => sum + (p.tarifa || 0), 0);
    const tasaEntrega = total > 0 ? (entregados / total) * 100 : 0;
    
    return { totalPedidos: total, entregados, enCamino, pendientes, recibidos, tasaEntrega, ingresoTotal };
  }, [pedidos]);

  // Agrupar por zona (basado en dirección)
  const kpisPorZona = useMemo(() => {
    const zonas: Record<string, { pedidos: number; entregados: number; ingresos: number }> = {};
    
    pedidos.forEach(p => {
      // Detectar zona por palabras clave en dirección
      let zona = 'Otras Zonas';
      const dir = p.direccionEntrega.toLowerCase();
      if (dir.includes('norte') || dir.includes('amazonas')) zona = 'Quito Norte';
      else if (dir.includes('sur') || dir.includes('villaflora')) zona = 'Quito Sur';
      else if (dir.includes('chillos') || dir.includes('sangolquí') || dir.includes('enriquez')) zona = 'Valle de los Chillos';
      else if (dir.includes('cumbayá') || dir.includes('tumbaco')) zona = 'Cumbayá/Tumbaco';
      else if (dir.includes('centro') || dir.includes('histórico')) zona = 'Centro Histórico';
      
      if (!zonas[zona]) zonas[zona] = { pedidos: 0, entregados: 0, ingresos: 0 };
      zonas[zona].pedidos++;
      if (p.estado === 'ENTREGADO') zonas[zona].entregados++;
      zonas[zona].ingresos += p.tarifa || 0;
    });
    
    return Object.entries(zonas).map(([zona, data]) => ({ zona, ...data }));
  }, [pedidos]);

  // Data for charts (basado en datos reales)
  const deliveryTrendData = [kpis.recibidos, kpis.pendientes, kpis.enCamino, kpis.entregados, 0, 0, 0];
  const deliveryLabels = ['Recibidos', 'Pendientes', 'En Camino', 'Entregados', '-', '-', '-'];
  
  const revenueData = kpisPorZona.map(z => z.ingresos);
  const revenueLabels = kpisPorZona.map(z => z.zona.split(' ')[0]);

  const exportarReporte = () => {
    const headers = ['Zona', 'Total Pedidos', 'Entregados', 'Tasa (%)', 'Ingresos ($)'];
    const rows = kpisPorZona.map(k => [
      k.zona, 
      k.pedidos, 
      k.entregados, 
      ((k.entregados / k.pedidos) * 100).toFixed(1),
      k.ingresos.toFixed(2)
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_kpis_${fechaInicio}_${fechaFin}.csv`;
    link.click();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      <Header user={user} onLogout={logout} />
      <main style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '28px', color: '#1f2937' }}>📊 Dashboard de KPIs</h2>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} style={{ ...styles.input, width: 'auto' }} />
            <span>-</span>
            <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} style={{ ...styles.input, width: 'auto' }} />
            <button onClick={exportarReporte} style={{ ...styles.btn, ...styles.btnSuccess }}>📥 Exportar CSV</button>
          </div>
        </div>

        {/* KPIs Principales */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ ...styles.card, textAlign: 'center' }}>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Total Pedidos</p>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0 0 0', color: '#1e40af' }}>{kpis.totalPedidos}</p>
          </div>
          <div style={{ ...styles.card, textAlign: 'center', backgroundColor: '#d1fae5' }}>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Entregados</p>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0 0 0', color: '#065f46' }}>{kpis.entregados}</p>
          </div>
          <div style={{ ...styles.card, textAlign: 'center', backgroundColor: '#fef3c7' }}>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>En Camino</p>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0 0 0', color: '#92400e' }}>{kpis.enCamino}</p>
          </div>
          <div style={{ ...styles.card, textAlign: 'center', backgroundColor: '#dbeafe' }}>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Pendientes</p>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0 0 0', color: '#1e40af' }}>{kpis.pendientes}</p>
          </div>
          <div style={{ ...styles.card, textAlign: 'center', backgroundColor: '#ede9fe' }}>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Tasa Entrega</p>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0 0 0', color: '#7c3aed' }}>{kpis.tasaEntrega}%</p>
          </div>
          <div style={{ ...styles.card, textAlign: 'center', backgroundColor: '#fce7f3' }}>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Ingresos</p>
            <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0 0 0', color: '#db2777' }}>${kpis.ingresoTotal.toFixed(2)}</p>
          </div>
        </div>

        {/* Gráficos con Chart.js */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          <div style={styles.card}>
            <h3 style={{ margin: '0 0 16px 0' }}>📈 Tendencia de Entregas (Últimos 7 días)</h3>
            <DeliveryTrendChart data={deliveryTrendData} labels={deliveryLabels} />
          </div>
          
          <div style={styles.card}>
            <h3 style={{ margin: '0 0 16px 0' }}>🥧 Distribución por Estado</h3>
            <StatusDistributionChart 
              entregados={kpis.entregados} 
              enCamino={kpis.enCamino} 
              pendientes={kpis.pendientes} 
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          <div style={styles.card}>
            <h3 style={{ margin: '0 0 16px 0' }}>📊 Comparativa por Zona</h3>
            <ZoneComparisonChart 
              zonas={kpisPorZona.map(z => z.zona)}
              pedidos={kpisPorZona.map(z => z.pedidos)}
              entregados={kpisPorZona.map(z => z.entregados)}
            />
          </div>
          
          <div style={styles.card}>
            <h3 style={{ margin: '0 0 16px 0' }}>💰 Ingresos Diarios</h3>
            <RevenueChart data={revenueData} labels={revenueLabels} />
          </div>
        </div>

        {/* Tabla por Zona */}
        <div style={styles.card}>
          <h3 style={{ margin: '0 0 16px 0' }}>🌍 KPIs por Zona</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Zona</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>Total Pedidos</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>Entregados</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>Tasa</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e5e7eb' }}>Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {kpisPorZona.map((zona) => (
                <tr key={zona.zona}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold' }}>{zona.zona}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>{zona.pedidos}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>{zona.entregados}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>
                    <span style={styles.badge((zona.entregados / zona.pedidos) > 0.9 ? 'green' : 'yellow')}>
                      {((zona.entregados / zona.pedidos) * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', textAlign: 'right', color: '#10b981', fontWeight: 'bold' }}>
                    ${zona.ingresos.toFixed(2)}
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

function Header({ user, onLogout }: { user: { nombre: string } | null; onLogout: () => void }) {
  return (
    <header style={{ backgroundColor: '#1e40af', color: 'white', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontSize: '32px' }}>📊</span>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px' }}>LogiFlow</h1>
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>Panel de Gerencia</p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span>👤 Bienvenido, {user?.nombre || 'Gerente'}</span>
        <button onClick={onLogout} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', backgroundColor: '#ef4444', color: 'white' }}>
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
}
