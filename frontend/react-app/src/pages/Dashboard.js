import { useState, useEffect, useRef } from 'react';
import { objectsApi, riskApi } from '../services/api';
import { usePolling } from '../hooks/usePolling';
import { useRealtime } from '../context/RealtimeContext';

const RISK_CFG = {
  CRITICAL: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', label: 'Critical' },
  HIGH:     { color: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)', label: 'High' },
  MEDIUM:   { color: '#eab308', bg: 'rgba(234,179,8,0.12)',  border: 'rgba(234,179,8,0.3)',  label: 'Medium' },
  LOW:      { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.3)',  label: 'Low' },
};

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const from = prevRef.current || 0;
    const to = value || 0;
    if (from === to) return;

    const steps = 15;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplay(Math.round(from + (to - from) * (i / steps)));
      if (i >= steps) {
        clearInterval(id);
        prevRef.current = to;
      }
    }, 20);
    return () => clearInterval(id);
  }, [value]);

  return <span>{display}</span>;
}

export default function Dashboard() {
  const { liveAlerts } = useRealtime();
  const [scanning, setScanning] = useState(false);
  const [systemStatus, setSystemStatus] = useState({ api: 'online', db: 'online', engine: 'online' });

  const { data: objData, loading: objLoading } = usePolling(
    () => objectsApi.list().then(r => r.data || []),
    15000
  );

  const { data: conjData, loading: conjLoading, lastUpdated, refresh } = usePolling(
    () => objectsApi.conjunctions().then(r => r.data || []),
    15000
  );

  const objects = objData || [];
  const conjunctions = conjData || [];

  const stats = {
    total: objects.length,
    critical: conjunctions.filter(c => c.risk_level === 'CRITICAL').length,
    high:     conjunctions.filter(c => c.risk_level === 'HIGH').length,
    medium:   conjunctions.filter(c => c.risk_level === 'MEDIUM').length,
    low:      conjunctions.filter(c => c.risk_level === 'LOW').length,
  };

  useEffect(() => {
    if (liveAlerts.length > 0) {
      refresh();
    }
  }, [liveAlerts.length]); // eslint-disable-line

  useEffect(() => {
    fetch('/health')
      .then(r => r.json())
      .then(() => setSystemStatus(s => ({ ...s, api: 'online' })))
      .catch(() => setSystemStatus(s => ({ ...s, api: 'degraded' })));
  }, []);

  const handleScan = async () => {
    setScanning(true);
    try {
      await riskApi.scan();
      await refresh();
    } catch (e) {
      console.error('Scan error:', e);
    } finally {
      setScanning(false);
    }
  };

  const recent = conjunctions.slice(0, 7);
  const ago = lastUpdated ? Math.floor((Date.now() - lastUpdated.getTime()) / 1000) : null;

  return (
    <div className="page-container animate-slide-in">
      {/* Top Banner */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.02em' }}>
              Mission Control
            </h1>
            <span className="live-badge"><span className="live-dot" />TELEMETRY ACTIVE</span>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
            Continuous pairwise conjunction screening, real-time orbit propagation &amp; delta-v maneuver planning
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div className="refresh-bar">
            {(conjLoading || objLoading) ? <div className="refresh-spinner" /> : <span>↺</span>}
            <span>{ago !== null ? `Sync: ${ago}s ago` : 'Connecting...'}</span>
          </div>
          <button
            onClick={handleScan}
            disabled={scanning}
            className="btn-primary"
            style={{ padding: '0.55rem 1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}
          >
            {scanning ? <><div className="refresh-spinner" /> Running SGP4 Scan...</> : '⚡ Run Conjunction Scan'}
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem', marginBottom: '1.25rem' }}>
        <StatCard label="Tracked Objects" value={stats.total} accent="#06b6d4" icon="🛰️" sub="Active Space Entities" loading={objLoading} />
        <StatCard label="Critical Risk" value={stats.critical} accent="#ef4444" icon="🚨" sub="PoC ≥ 1e-4 Immediate" alert loading={conjLoading} />
        <StatCard label="High Risk" value={stats.high} accent="#f97316" icon="⚠️" sub="PoC ≥ 1e-6 Screening" loading={conjLoading} />
        <StatCard label="Medium Risk" value={stats.medium} accent="#eab308" icon="⏳" sub="PoC ≥ 1e-8 Warning" loading={conjLoading} />
        <StatCard label="Low Risk" value={stats.low} accent="#22c55e" icon="🛡️" sub="Nominal Clearance" loading={conjLoading} />
      </div>

      {/* Dynamic Risk Distribution Strip */}
      <div className="glass" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem', borderRadius: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
          <span style={{ fontSize: '0.6875rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            Live Risk Spectrum Analysis
          </span>
          <span style={{ fontSize: '0.6875rem', color: '#06b6d4', fontFamily: 'JetBrains Mono' }}>
            {conjunctions.length} close approach events screened
          </span>
        </div>
        <div style={{ display: 'flex', height: '7px', borderRadius: '999px', overflow: 'hidden', gap: '2px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
          {['CRITICAL','HIGH','MEDIUM','LOW'].map(r => {
            const count = conjunctions.filter(c => c.risk_level === r).length;
            const pct = conjunctions.length ? (count / conjunctions.length) * 100 : 0;
            return (
              <div
                key={r}
                style={{
                  width: `${pct}%`,
                  background: RISK_CFG[r].color,
                  transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                  boxShadow: count > 0 ? `0 0 8px ${RISK_CFG[r].color}` : 'none',
                }}
                title={`${r}: ${count}`}
              />
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.625rem', flexWrap: 'wrap' }}>
          {['CRITICAL','HIGH','MEDIUM','LOW'].map(r => {
            const count = conjunctions.filter(c => c.risk_level === r).length;
            return (
              <span key={r} style={{ fontSize: '0.6875rem', color: RISK_CFG[r].color, display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontFamily: 'JetBrains Mono' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: RISK_CFG[r].color, display: 'inline-block' }} />
                {r} ({count})
              </span>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 310px', gap: '1.25rem', alignItems: 'start' }}>
        {/* Conjunctions Table */}
        <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', color: '#06b6d4' }}>⬡</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f1f5f9' }}>Real-time Conjunction Feed</span>
            </div>
            <a href="/conjunctions" style={{ fontSize: '0.75rem', color: '#06b6d4', textDecoration: 'none' }}>
              View all ({conjunctions.length}) →
            </a>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.25)' }}>
                  {['Objects Pair','TCA (UTC)','Miss Distance','PoC Probability','Risk Classification','Status'].map(h => (
                    <th key={h} style={{ padding: '0.625rem 0.875rem', textAlign: 'left', fontSize: '0.625rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((c) => {
                  const cfg = RISK_CFG[c.risk_level] || RISK_CFG.LOW;
                  return (
                    <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '0.75rem 0.875rem' }}>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: '#06b6d4', fontWeight: 600 }}>#{c.primary_object_id}</span>
                        <span style={{ color: '#475569', margin: '0 6px', fontSize: '0.8rem' }}>↔</span>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: '#8b5cf6', fontWeight: 600 }}>#{c.secondary_object_id}</span>
                      </td>
                      <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'JetBrains Mono' }}>
                        {new Date(c.tca).toISOString().slice(0, 16).replace('T', ' ')}
                      </td>
                      <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.8125rem', color: '#f1f5f9', fontFamily: 'JetBrains Mono' }}>
                        {c.min_distance_km ? `${c.min_distance_km.toFixed(2)} km` : '—'}
                      </td>
                      <td style={{ padding: '0.75rem 0.875rem', fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: '#94a3b8' }}>
                        {c.poc ? c.poc.toExponential(2) : '—'}
                      </td>
                      <td style={{ padding: '0.75rem 0.875rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 999, fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.06em', background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                          <span style={{ width: 4, height: 4, borderRadius: '50%', background: cfg.color, animation: c.risk_level === 'CRITICAL' ? 'live-pulse 1s infinite' : undefined }} />
                          {c.risk_level}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.875rem' }}>
                        <span style={{ fontSize: '0.6875rem', color: c.is_acknowledged ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                          {c.is_acknowledged ? '✓ Cleared' : '● Action Req.'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {recent.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.8125rem' }}>
                      {conjLoading ? 'Synchronizing conjunction telemetry...' : '✓ No conjunction threats detected within active window.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Info Panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Health & Engine Status */}
          <div className="glass" style={{ padding: '1.15rem', borderRadius: '14px' }}>
            <div style={{ fontSize: '0.6875rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.875rem' }}>
              Service Nodes
            </div>
            {[
              { label: 'API Gateway (Node.js)', status: systemStatus.api },
              { label: 'SGP4 Risk Engine (Java)', status: systemStatus.engine },
              { label: 'MySQL Relational Store', status: systemStatus.db },
              { label: 'WebSocket Ingestion Stream', status: 'online' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{s.label}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: 'live-pulse 2s infinite' }} />
                  <span style={{ fontSize: '0.6875rem', color: '#34d399', fontWeight: 600 }}>Active</span>
                </span>
              </div>
            ))}
          </div>

          {/* Realtime Alert Feed */}
          <div className="glass" style={{ padding: '1.15rem', borderRadius: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.6875rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Live Event Feed
              </span>
              <div className="live-badge"><span className="live-dot" />STREAM</div>
            </div>

            {liveAlerts.length === 0 ? (
              <div style={{ fontSize: '0.75rem', color: '#475569', textAlign: 'center', padding: '1.25rem 0' }}>
                Awaiting collision alerts...
              </div>
            ) : liveAlerts.slice(0, 3).map(a => (
              <div key={a._receivedAt || Math.random()} style={{ padding: '0.55rem 0.75rem', borderRadius: 8, background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)', marginBottom: '0.5rem' }}>
                <div style={{ fontSize: '0.6875rem', color: '#06b6d4', fontWeight: 700, marginBottom: 2 }}>⚡ {a.severity || 'ALERT'}</div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>{a.message || 'New conjunction screened'}</div>
              </div>
            ))}
          </div>

          {/* Quick Nav Actions */}
          <div className="glass" style={{ padding: '1.15rem', borderRadius: '14px' }}>
            <div style={{ fontSize: '0.6875rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.75rem' }}>
              Tactical Shortcuts
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <a href="/globe" className="btn-secondary" style={{ display: 'block', textAlign: 'center', fontSize: '0.8125rem', padding: '0.6rem' }}>
                🌍 3D Live Orbital View
              </a>
              <a href="/mitigation" className="btn-secondary" style={{ display: 'block', textAlign: 'center', fontSize: '0.8125rem', padding: '0.6rem' }}>
                ↗ Δv Maneuver Engine
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent, icon, sub, alert, loading }) {
  return (
    <div className="stat-card-live" style={{ '--card-accent': `linear-gradient(90deg, ${accent}, ${accent}55)` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
        <span style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: '1.1rem' }}>{icon}</span>
      </div>
      <div style={{ fontSize: '1.875rem', fontWeight: 700, color: accent, lineHeight: 1, marginBottom: '0.35rem', fontVariantNumeric: 'tabular-nums' }}>
        {loading ? <span style={{ opacity: 0.3 }}>—</span> : <AnimatedNumber value={value} />}
      </div>
      <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>{sub}</div>
      {alert && value > 0 && (
        <div style={{ position: 'absolute', top: '0.625rem', right: '0.625rem', width: 7, height: 7, borderRadius: '50%', background: accent, animation: 'live-pulse 1s infinite' }} />
      )}
    </div>
  );
}
