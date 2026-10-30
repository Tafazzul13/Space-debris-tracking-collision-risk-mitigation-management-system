import { useState, useEffect } from 'react';
import { objectsApi } from '../services/api';
import { usePolling } from '../hooks/usePolling';
import { useRealtime } from '../context/RealtimeContext';

const RISK_CFG = {
  CRITICAL: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)' },
  HIGH:     { color: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.35)' },
  MEDIUM:   { color: '#eab308', bg: 'rgba(234,179,8,0.12)',  border: 'rgba(234,179,8,0.35)'  },
  LOW:      { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.35)'  },
};

export default function Conjunctions() {
  const [filter, setFilter] = useState('ALL');
  const [acking, setAcking] = useState(new Set());
  const { liveAlerts } = useRealtime();

  const { data, loading, lastUpdated, refresh } = usePolling(
    () => objectsApi.conjunctions().then(r => r.data || []),
    15000
  );

  const conjunctions = data || [];

  useEffect(() => {
    if (liveAlerts.length > 0) refresh();
  }, [liveAlerts.length]); // eslint-disable-line

  const filtered = filter === 'ALL' ? conjunctions : conjunctions.filter(c => c.risk_level === filter);
  const counts = { ALL: conjunctions.length, CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  conjunctions.forEach(c => {
    if (counts[c.risk_level] !== undefined) counts[c.risk_level]++;
  });

  const acknowledge = async (id) => {
    setAcking(prev => new Set([...prev, id]));
    try {
      await objectsApi.acknowledge(id);
      await refresh();
    } catch {
      alert('Failed to acknowledge conjunction');
    } finally {
      setAcking(prev => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
    }
  };

  const ago = lastUpdated ? Math.floor((Date.now() - lastUpdated.getTime()) / 1000) : null;

  return (
    <div className="page-container animate-slide-in">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Conjunction Analysis
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
            Pairwise trajectory intersections screened within 50 km window • Auto-polling real-time
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'JetBrains Mono' }}>
            {loading ? '↺ Synchronizing...' : ago !== null ? `Synced ${ago}s ago` : ''}
          </span>
          <button onClick={refresh} className="btn-secondary btn-sm" disabled={loading}>
            {loading ? '...' : '↺ Force Refresh'}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(f => {
          const cfg = RISK_CFG[f];
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '0.4rem 0.875rem',
                borderRadius: 999,
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: active ? (cfg?.bg || 'rgba(6,182,212,0.15)') : 'rgba(255,255,255,0.03)',
                color: active ? (cfg?.color || '#06b6d4') : '#64748b',
                border: `1px solid ${active ? (cfg?.border || 'rgba(6,182,212,0.3)') : 'rgba(255,255,255,0.07)'}`,
                boxShadow: active ? `0 0 10px ${cfg?.color || '#06b6d4'}33` : 'none',
              }}
            >
              {f} {counts[f] > 0 && <span style={{ opacity: 0.8, marginLeft: 4 }}>({counts[f]})</span>}
            </button>
          );
        })}
      </div>

      {/* Main Table */}
      <div className="table-container" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              {['Event ID', 'Target Pair', 'Time of Closest Approach (TCA)', 'Miss Distance', 'Collision PoC', 'Risk Level', 'Mitigation Status', 'Action'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const cfg = RISK_CFG[c.risk_level] || RISK_CFG.LOW;
              return (
                <tr key={c.id}>
                  <td>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: '#475569' }}>#{c.id}</span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8125rem', color: '#06b6d4', fontWeight: 600 }}>Obj #{c.primary_object_id}</span>
                    <span style={{ color: '#475569', margin: '0 8px' }}>↔</span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8125rem', color: '#8b5cf6', fontWeight: 600 }}>Obj #{c.secondary_object_id}</span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8125rem', color: '#e2e8f0' }}>
                      {new Date(c.tca).toISOString().slice(0, 19).replace('T', ' ')} UTC
                    </span>
                  </td>
                  <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8125rem', color: '#38bdf8', fontWeight: 600 }}>
                    {c.min_distance_km ? `${c.min_distance_km.toFixed(3)} km` : '—'}
                  </td>
                  <td>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: '#94a3b8' }}>
                      {c.poc ? c.poc.toExponential(3) : '—'}
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 999, fontSize: '0.6875rem', fontWeight: 700, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.color }} />
                      {c.risk_level}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', color: c.is_acknowledged ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                      {c.is_acknowledged ? '✓ Cleared' : '● Unacknowledged'}
                    </span>
                  </td>
                  <td>
                    {!c.is_acknowledged ? (
                      <button
                        onClick={() => acknowledge(c.id)}
                        disabled={acking.has(c.id)}
                        className="btn-primary"
                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', borderRadius: 6 }}
                      >
                        {acking.has(c.id) ? 'Saving...' : 'Acknowledge'}
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#475569' }}>Resolved</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#64748b', fontSize: '0.875rem' }}>
                  {loading ? 'Refreshing conjunction matrix...' : '✓ No conjunction events matching selected filter.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
