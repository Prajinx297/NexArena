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
  const retriesRef = useRef(0);
  const maxRetries = 5;
  const urlRef = useRef(url);

  urlRef.current = url;

  const connect = useCallback(() => {
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

    ws.onerror = () => {
      setStatus('error');
    };

    ws.onclose = () => {
      setStatus('disconnected');
      if (retriesRef.current < maxRetries) {
        retriesRef.current += 1;
        setTimeout(() => connect(), 3000);
      }
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect, url]);

  const reconnect = useCallback(() => {
    retriesRef.current = 0;
    connect();
  }, [connect]);

  return { data, status, reconnect };
}
