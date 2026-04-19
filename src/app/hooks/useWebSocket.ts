import { useEffect, useRef, useState, useCallback } from 'react';
import type { ConnectionState } from '../types';

interface UseWebSocketReturn<T> {
  data: T | null;
  status: ConnectionState;
  reconnect: () => void;
}

export function useWebSocket<T = unknown>(url: string): UseWebSocketReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<ConnectionState>('connecting');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const retriesRef = useRef(0);
  const maxRetries = 5;
  const reconnectDelayMs = 3000;
  const shouldReconnectRef = useRef(true);
  const urlRef = useRef(url);

  urlRef.current = url;

  const connect = useCallback(() => {
    if (!urlRef.current) {
      setStatus('error');
      console.error('WebSocket URL is not configured');
      return;
    }

    if (wsRef.current) {
      wsRef.current.close();
    }

    setStatus('connecting');
    const ws = new WebSocket(urlRef.current);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
      retriesRef.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        setData(parsed);
      } catch (err) {
        console.error('WS parse error:', err);
      }
    };

    ws.onerror = (event) => {
      setStatus('error');
      console.error('WS error:', event);
    };

    ws.onclose = (event) => {
      setStatus('disconnected');
      if (shouldReconnectRef.current && !event.wasClean && retriesRef.current < maxRetries) {
        retriesRef.current += 1;
        reconnectTimeoutRef.current = window.setTimeout(() => connect(), reconnectDelayMs);
      }
    };
  }, []);

  useEffect(() => {
    shouldReconnectRef.current = true;
    connect();
    return () => {
      shouldReconnectRef.current = false;
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounted');
      }
    };
  }, [connect, url]);

  const reconnect = useCallback(() => {
    retriesRef.current = 0;
    connect();
  }, [connect]);

  return { data, status, reconnect };
}
