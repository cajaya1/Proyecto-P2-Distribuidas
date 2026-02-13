// URLs de los servicios backend - detectar ambiente
const isDev = import.meta.env?.DEV ?? false;

export const API_BASE_URL = isDev ? 'http://localhost:8085' : '';
export const GRAPHQL_URL = isDev ? 'http://localhost:8088/graphql' : '/api/graphql';
export const WEBSOCKET_URL = isDev ? 'http://localhost:9089/ws' : '/ws';
export const PEDIDO_API_URL = isDev ? 'http://localhost:9082' : '';

export const ROLES = {
  CLIENTE: 'CLIENTE',
  REPARTIDOR: 'REPARTIDOR',
  SUPERVISOR: 'SUPERVISOR',
  GERENTE: 'GERENTE',
  ADMIN: 'ADMIN',
} as const;

export type Role = keyof typeof ROLES;

export const PEDIDO_ESTADOS = {
  RECIBIDO: 'RECIBIDO',
  ASIGNADO: 'ASIGNADO',
  EN_CAMINO: 'EN_CAMINO',
  EN_ENTREGA: 'EN_ENTREGA',
  ENTREGADO: 'ENTREGADO',
  CANCELADO: 'CANCELADO',
} as const;

export type PedidoEstado = keyof typeof PEDIDO_ESTADOS;

export const ESTADO_COLORS: Record<PedidoEstado, string> = {
  RECIBIDO: 'badge-info',
  ASIGNADO: 'badge-warning',
  EN_CAMINO: 'badge-warning',
  EN_ENTREGA: 'badge-warning',
  ENTREGADO: 'badge-success',
  CANCELADO: 'badge-danger',
};

export const VEHICULO_TIPOS = {
  MOTORIZADO: 'MOTORIZADO',
  AUTO: 'AUTO',
  CAMIONETA: 'CAMIONETA',
  CAMION: 'CAMION',
} as const;

export type VehiculoTipo = keyof typeof VEHICULO_TIPOS;
