import { createContext, useContext, useEffect, useRef, useState } from 'react';

const RealtimeContext = createContext(null);

export function RealtimeProvider({ children }) {
  const [liveAlerts, setLiveAlerts] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Use window.location.hostname and port 5000 in dev if needed, or window.location.host
    const wsHost = window.location.port === '3000' 
      ? `${window.location.hostname}:5000` 
      : window.location.host;
    const wsUrl = `${protocol}//${wsHost}`;
    let reconnectTimeout = null;

    function connect() {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('[WebSocket] Connected to Realtime Alert Stream');
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'ALERT') {
              setLiveAlerts(prev => [{ ...msg.data, _receivedAt: Date.now() }, ...prev].slice(0, 10));
            }
          } catch (e) {
            console.error('WS message error:', e);
          }
        };

        ws.onclose = () => {
          reconnectTimeout = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch (e) {
        reconnectTimeout = setTimeout(connect, 3000);
      }
    }

    connect();
    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return (
    <RealtimeContext.Provider value={{ liveAlerts }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export const useRealtime = () => {
  const ctx = useContext(RealtimeContext);
  return ctx || { liveAlerts: [] };
};
