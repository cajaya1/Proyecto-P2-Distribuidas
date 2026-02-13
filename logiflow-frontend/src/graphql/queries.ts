import { gql } from '@apollo/client';

// ========== PEDIDOS ==========
export const GET_PEDIDOS = gql`
  query GetPedidos($filtro: PedidoFiltro) {
    pedidos(filtro: $filtro) {
      id
      clienteId
      repartidorId
      direccionEntrega
      origen
      destino
      estado
      tarifa
      peso
      descripcion
      fechaCreacion
      fechaActualizacion
    }
  }
`;

export const GET_PEDIDO = gql`
  query GetPedido($id: ID!) {
    pedido(id: $id) {
      id
      clienteId
      repartidorId
      direccionEntrega
      origen
      destino
      estado
      tarifa
      peso
      descripcion
      fechaCreacion
      fechaActualizacion
    }
  }
`;

export const GET_PEDIDOS_POR_ESTADO = gql`
  query GetPedidosPorEstado($estado: String!) {
    pedidosPorEstado(estado: $estado) {
      id
      clienteId
      repartidorId
      direccionEntrega
      estado
      tarifa
      peso
      fechaCreacion
    }
  }
`;

// ========== VEHICULOS ==========
export const GET_VEHICULOS = gql`
  query GetVehiculos {
    vehiculos {
      id
      tipo
      placa
      modelo
      capacidadCarga
      estado
    }
  }
`;

export const GET_VEHICULOS_DISPONIBLES = gql`
  query GetVehiculosDisponibles {
    vehiculosDisponibles {
      id
      tipo
      placa
      modelo
      capacidadCarga
      estado
    }
  }
`;

export const GET_VEHICULO = gql`
  query GetVehiculo($id: ID!) {
    vehiculo(id: $id) {
      id
      tipo
      placa
      modelo
      capacidadCarga
      estado
    }
  }
`;

// ========== KPIs Y REPORTES ==========
export const GET_KPI_DIARIO = gql`
  query GetKPIDiario($fecha: String) {
    kpiDiario(fecha: $fecha) {
      fecha
      totalPedidos
      pedidosEntregados
      pedidosCancelados
      tiempoPromedioEntrega
      satisfaccionCliente
      costoPorEntrega
    }
  }
`;

export const GET_FLOTA_ACTIVA = gql`
  query GetFlotaActiva {
    flotaActiva {
      total
      disponibles
      enRuta
      enMantenimiento
    }
  }
`;
