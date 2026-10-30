import { useEffect, useState } from 'react';
import { useRealtime } from '../context/RealtimeContext';

export default function LiveToastContainer() {
  const { liveAlerts } = useRealtime();
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (!liveAlerts.length) return;
    const latest = liveAlerts[0];
    const id = latest._receivedAt || Date.now();
    setToasts(prev => {
      if (prev.find(t => t._id === id)) return prev;
      return [{ ...latest, _id: id }, ...prev].slice(0, 3);
    });
    const timer = setTimeout(() => {
      setToasts(prev => prev.filter(t => t._id !== id));
    }, 6000);
    return () => clearTimeout(timer);
  }, [liveAlerts]);

  if (!toasts.length) return null;

  return (
    <div style={{ position: 'fixed', top: '4.5rem', right: '1.25rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      {toasts.map(t => (
        <div key={t._id} className="live-toast" data-severity={t.severity || 'INFO'}>
          <div className="live-toast-dot" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="live-toast-title">⚡ REALTIME ALERT • {t.severity || 'INFO'}</div>
            <div className="live-toast-msg">{t.message || 'Close approach trajectory flagged.'}</div>
          </div>
          <button onClick={() => setToasts(p => p.filter(x => x._id !== t._id))} className="live-toast-close">✕</button>
        </div>
      ))}
    </div>
  );
}
