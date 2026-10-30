import { useState, useEffect } from 'react';
import { objectsApi } from '../services/api';
import { usePolling } from '../hooks/usePolling';
import { useRealtime } from '../context/RealtimeContext';
import axios from 'axios';

const SEV = {
  CRITICAL: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: '#ef4444', icon: '🚨' },
  WARNING:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: '#f59e0b', icon: '⚠️' },
  INFO:     { color: '#38bdf8', bg: 'rgba(56,189,248,0.08)', border: '#38bdf8', icon: 'ℹ️' },
};

export default function Alerts() {
  const { liveAlerts } = useRealtime();
  const [markingRead, setMarkingRead] = useState(new Set());

  const { data, loading, refresh } = usePolling(
    () => objectsApi.alerts().then(r => r.data || []),
    15000
  );

  const alerts = data || [];

  useEffect(() => {
    if (liveAlerts.length > 0) refresh();
  }, [liveAlerts.length]); // eslint-disable-line

  const markRead = async (id) => {
    setMarkingRead(prev => new Set([...prev, id]));
    try {
      await axios.put(`/api/alerts/${id}/read`, null, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      await refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setMarkingRead(prev => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
    }
  };

  const unread = alerts?.filter(a => !a.is_read).length || 0;

  return (
    <div className="page-container animate-slide-in">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Alert Operations Center
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
            Automated alerts dispatched from continuous pairwise screening
            {unread > 0 && (
              <span style={{ marginLeft: '0.625rem', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 999, padding: '2px 8px', fontSize: '0.6875rem', fontWeight: 700 }}>
                {unread} UNREAD
              </span>
            )}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="live-badge"><span className="live-dot" />WEBSOCKET STREAM ACTIVE</div>
          <button onClick={refresh} className="btn-secondary btn-sm" disabled={loading}>
            {loading ? 'Syncing...' : '↺ Refresh'}
          </button>
        </div>
      </div>

      {/* Live Push Banner */}
      {liveAlerts.length > 0 && (
        <div style={{ marginBottom: '1.25rem', padding: '0.875rem 1.15rem', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.25)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#06b6d4', flexShrink: 0, animation: 'live-pulse 1.2s infinite' }} />
          <span style={{ fontSize: '0.8125rem', color: '#cbd5e1' }}>
            <strong style={{ color: '#06b6d4' }}>⚡ Real-time Stream:</strong> {liveAlerts.length} live broadcast{liveAlerts.length > 1 ? 's' : ''} received over active WebSocket connection.
          </span>
          <button onClick={refresh} className="btn-primary btn-sm" style={{ marginLeft: 'auto', padding: '0.35rem 0.75rem' }}>
            Synchronize Feed
          </button>
        </div>
      )}

      {loading && alerts.length === 0 ? (
        <div className="glass" style={{ padding: '3.5rem', borderRadius: 16, textAlign: 'center', color: '#64748b' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }} />
          Polling collision risk alerts...
        </div>
      ) : alerts.length === 0 ? (
        <div className="glass" style={{ padding: '3.5rem', borderRadius: 16, textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🛡️</div>
          <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '1.1rem', marginBottom: '0.25rem' }}>Sector Nominal</div>
          <div style={{ color: '#64748b', fontSize: '0.875rem' }}>No collision alerts active at this epoch.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {alerts.map(a => {
            const s = SEV[a.severity] || SEV.INFO;
            return (
              <div
                key={a.id}
                style={{
                  background: s.bg,
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderLeft: `4px solid ${s.border}`,
                  borderRadius: 14,
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  transition: 'all 0.2s',
                  opacity: a.is_read ? 0.65 : 1,
                }}
              >
                <span style={{ fontSize: '1.35rem', flexShrink: 0, marginTop: 2 }}>{s.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: s.color, letterSpacing: '0.04em' }}>
                      {a.severity} CONJUNCTION ALERT
                    </span>
                    {!a.is_read && (
                      <span style={{ fontSize: '0.625rem', fontWeight: 700, background: 'rgba(6,182,212,0.18)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 999, padding: '1px 7px' }}>
                        NEW
                      </span>
                    )}
                    <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: 'auto', fontFamily: 'JetBrains Mono' }}>
                      {new Date(a.sent_at).toISOString().slice(0, 19).replace('T', ' ')} UTC
                    </span>
                  </div>

                  <p style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                    {a.message}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.6875rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'JetBrains Mono' }}>
                      CHANNEL: {a.channel || 'IN_APP'} • ALERT #{a.id}
                      {a.min_distance_km ? ` • MISS: ${parseFloat(a.min_distance_km).toFixed(2)} km` : ''}
                      {a.poc ? ` • PoC: ${parseFloat(a.poc).toExponential(2)}` : ''}
                    </span>

                    {!a.is_read && (
                      <button
                        onClick={() => markRead(a.id)}
                        disabled={markingRead.has(a.id)}
                        style={{ marginLeft: 'auto', fontSize: '0.6875rem', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '3px 10px', cursor: 'pointer' }}
                      >
                        {markingRead.has(a.id) ? '...' : 'Mark as Read'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
