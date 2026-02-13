import { useEffect, useRef, useState, useCallback } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { WEBSOCKET_URL } from '../config/constants';

export interface WebSocketMessage {
  type: string;
  payload: unknown;
  timestamp: string;
}

export interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  topics?: string[];
  autoConnect?: boolean;
}

export interface UseWebSocketReturn {
  connected: boolean;
  connecting: boolean;
  error: Error | null;
  connect: () => void;
  disconnect: () => void;
  sendMessage: (destination: string, body: unknown) => void;
  subscribe: (topic: string, callback: (msg: WebSocketMessage) => void) => () => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    topics = [],
    autoConnect = false,
  } = options;

  const clientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<Map<string, () => void>>(new Map());
  
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getToken = useCallback(() => {
    return localStorage.getItem('token');
  }, []);

  const connect = useCallback(() => {
    if (clientRef.current?.active) {
      console.log('[WebSocket] Already connected');
      return;
    }

    const token = getToken();
    if (!token) {
      const err = new Error('No authentication token available');
      setError(err);
      onError?.(err);
      return;
    }

    setConnecting(true);
    setError(null);

    // Build WebSocket URL with token
    const wsUrl = `${WEBSOCKET_URL}?token=${encodeURIComponent(token)}`;

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        if (import.meta.env.DEV) {
          console.log('[STOMP Debug]:', str);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        console.log('[WebSocket] Connected');
        setConnected(true);
        setConnecting(false);
        
        // Subscribe to default topics
        topics.forEach((topic) => {
          subscribeToTopic(client, topic);
        });

        onConnect?.();
      },
      onDisconnect: () => {
        console.log('[WebSocket] Disconnected');
        setConnected(false);
        setConnecting(false);
        onDisconnect?.();
      },
      onStompError: (frame) => {
        const errMsg = frame.headers?.message || 'STOMP error';
        console.error('[WebSocket] STOMP error:', errMsg);
        const err = new Error(errMsg);
        setError(err);
        onError?.(err);
      },
    });

    clientRef.current = client;
    client.activate();
  }, [getToken, onConnect, onDisconnect, onError, topics]);

  const subscribeToTopic = useCallback((client: Client, topic: string) => {
    const subscription = client.subscribe(topic, (message: IMessage) => {
      try {
        const parsed: WebSocketMessage = JSON.parse(message.body);
        onMessage?.(parsed);
      } catch {
        // If not JSON, wrap in message
        const msg: WebSocketMessage = {
          type: 'raw',
          payload: message.body,
          timestamp: new Date().toISOString(),
        };
        onMessage?.(msg);
      }
    });

    subscriptionsRef.current.set(topic, () => subscription.unsubscribe());
  }, [onMessage]);

  const disconnect = useCallback(() => {
    if (clientRef.current?.active) {
      // Unsubscribe all
      subscriptionsRef.current.forEach((unsub) => unsub());
      subscriptionsRef.current.clear();
      
      clientRef.current.deactivate();
      clientRef.current = null;
      setConnected(false);
    }
  }, []);

  const sendMessage = useCallback((destination: string, body: unknown) => {
    if (!clientRef.current?.active) {
      console.error('[WebSocket] Cannot send - not connected');
      return;
    }

    clientRef.current.publish({
      destination,
      body: JSON.stringify(body),
      headers: {
        'content-type': 'application/json',
      },
    });
  }, []);

  const subscribe = useCallback((topic: string, callback: (msg: WebSocketMessage) => void): (() => void) => {
    if (!clientRef.current?.active) {
      console.error('[WebSocket] Cannot subscribe - not connected');
      return () => {};
    }

    const subscription = clientRef.current.subscribe(topic, (message: IMessage) => {
      try {
        const parsed: WebSocketMessage = JSON.parse(message.body);
        callback(parsed);
      } catch {
        callback({
          type: 'raw',
          payload: message.body,
          timestamp: new Date().toISOString(),
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    connected,
    connecting,
    error,
    connect,
    disconnect,
    sendMessage,
    subscribe,
  };
}

// Hook for specific topics
export function usePedidoUpdates(pedidoId: string | number, onUpdate: (data: unknown) => void) {
  const { subscribe, connected, connect } = useWebSocket({ autoConnect: true });

  useEffect(() => {
    if (!connected) {
      connect();
      return;
    }

    const unsubscribe = subscribe(
      `/topic/pedidos/${pedidoId}`,
      (msg) => onUpdate(msg.payload)
    );

    return unsubscribe;
  }, [connected, connect, subscribe, pedidoId, onUpdate]);
}

export function useTrackingUpdates(onUpdate: (data: unknown) => void) {
  const { subscribe, connected, connect } = useWebSocket({ autoConnect: true });

  useEffect(() => {
    if (!connected) {
      connect();
      return;
    }

    const unsubscribe = subscribe('/topic/tracking', (msg) => onUpdate(msg.payload));
    return unsubscribe;
  }, [connected, connect, subscribe, onUpdate]);
}

export default useWebSocket;
