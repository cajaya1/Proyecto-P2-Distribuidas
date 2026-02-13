import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Types
interface DeliveryTrendChartProps {
  data: number[];
  labels?: string[];
}

interface StatusDistributionChartProps {
  entregados: number;
  enCamino: number;
  pendientes: number;
}

interface ZoneComparisonChartProps {
  zonas: string[];
  pedidos: number[];
  entregados: number[];
}

interface RevenueChartProps {
  data: number[];
  labels: string[];
}

// Delivery Trend Chart (Bar)
export function DeliveryTrendChart({ data, labels }: DeliveryTrendChartProps) {
  const defaultLabels = labels || data.map((_, i) => `Día ${i + 1}`);

  const chartData = {
    labels: defaultLabels,
    datasets: [
      {
        label: 'Entregas',
        data: data,
        backgroundColor: 'rgba(37, 99, 235, 0.8)',
        borderColor: 'rgb(37, 99, 235)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div style={{ height: '250px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}

// Status Distribution Chart (Doughnut)
export function StatusDistributionChart({ entregados, enCamino, pendientes }: StatusDistributionChartProps) {
  const total = entregados + enCamino + pendientes;
  const percentage = total > 0 ? ((entregados / total) * 100).toFixed(1) : '0';

  const chartData = {
    labels: ['Entregados', 'En Camino', 'Pendientes'],
    datasets: [
      {
        data: [entregados, enCamino, pendientes],
        backgroundColor: [
          'rgba(16, 185, 129, 0.85)',
          'rgba(245, 158, 11, 0.85)',
          'rgba(59, 130, 246, 0.85)',
        ],
        borderColor: [
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(59, 130, 246)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
    },
  };

  return (
    <div style={{ height: '250px', position: 'relative' }}>
      <Doughnut data={chartData} options={options} />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '35%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>
          {percentage}%
        </div>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>Tasa Entrega</div>
      </div>
    </div>
  );
}

// Zone Comparison Chart (Grouped Bar)
export function ZoneComparisonChart({ zonas, pedidos, entregados }: ZoneComparisonChartProps) {
  const chartData = {
    labels: zonas,
    datasets: [
      {
        label: 'Total Pedidos',
        data: pedidos,
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Entregados',
        data: entregados,
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}

// Revenue Line Chart
export function RevenueChart({ data, labels }: RevenueChartProps) {
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Ingresos ($)',
        data: data,
        fill: true,
        borderColor: 'rgb(219, 39, 119)',
        backgroundColor: 'rgba(219, 39, 119, 0.1)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(219, 39, 119)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: (value: unknown) => `$${value}`,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div style={{ height: '250px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

// Performance Chart (Line with multiple datasets)
interface PerformanceChartProps {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    color: string;
  }>;
}

export function PerformanceChart({ labels, datasets }: PerformanceChartProps) {
  const chartData = {
    labels,
    datasets: datasets.map((ds) => ({
      label: ds.label,
      data: ds.data,
      borderColor: ds.color,
      backgroundColor: ds.color.replace(')', ', 0.1)').replace('rgb', 'rgba'),
      tension: 0.3,
      fill: false,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div style={{ height: '300px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

export default {
  DeliveryTrendChart,
  StatusDistributionChart,
  ZoneComparisonChart,
  RevenueChart,
  PerformanceChart,
};
