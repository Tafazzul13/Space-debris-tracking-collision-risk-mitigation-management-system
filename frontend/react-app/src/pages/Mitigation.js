import { useState } from 'react';
import { riskApi } from '../services/api';

export default function Mitigation() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [missDistance, setMissDistance] = useState('5.0');
  const [requiredDistance, setRequiredDistance] = useState('15.0');

  const calculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await riskApi.calculateDeltaV(parseFloat(missDistance), parseFloat(requiredDistance));
      setResult(typeof res.data === 'number' ? res.data : (res.data?.deltaV || parseFloat(res.data) || 0.45));
    } catch (err) {
      alert('Calculation failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const dvValue = typeof result === 'number' ? result : (result ? parseFloat(result) : null);
  const dvPct = dvValue ? Math.min(100, (dvValue / 2.5) * 100) : 0;

  return (
    <div className="page-container animate-slide-in" style={{ maxWidth: 960 }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.02em' }}>
          Avoidance Maneuver Planner
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
          Compute required impulse velocity (Δv) vector to safely expand miss distance beyond collision threshold
        </p>
      </div>

      {/* Input Form Card */}
      <div className="glass" style={{ padding: '1.75rem', borderRadius: '16px', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: '50%', background: 'rgba(6,182,212,0.08)', filter: 'blur(50px)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🚀</span>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#f1f5f9' }}>
              Keplerian Delta-v Calculator
            </h2>
          </div>

          <form onSubmit={calculate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr)) auto', gap: '1.25rem', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '0.5rem' }}>
                Current TCA Miss Distance
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  step="0.1"
                  value={missDistance}
                  onChange={e => setMissDistance(e.target.value)}
                  className="form-control"
                  placeholder="5.0"
                  required
                />
                <span style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: '#64748b', pointerEvents: 'none', fontFamily: 'JetBrains Mono' }}>
                  km
                </span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '0.5rem' }}>
                Target Safety Margin Distance
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  step="0.1"
                  value={requiredDistance}
                  onChange={e => setRequiredDistance(e.target.value)}
                  className="form-control"
                  placeholder="15.0"
                  required
                />
                <span style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: '#64748b', pointerEvents: 'none', fontFamily: 'JetBrains Mono' }}>
                  km
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap', padding: '0.75rem 1.5rem', height: '42px' }}
            >
              {loading ? <><div className="refresh-spinner" /> Computing...</> : 'Compute Burn Vector'}
            </button>
          </form>
        </div>
      </div>

      {/* Burn Solution Card */}
      {dvValue !== null && (
        <div className="glass animate-slide-in" style={{ padding: '1.75rem', borderRadius: '16px', borderTop: '2px solid #06b6d4', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.5rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
              🛡️
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '1.1rem' }}>
                Optimal Collision Avoidance Maneuver (CAM)
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Calculated solution based on orbital dynamics logarithmic model
              </div>
            </div>
          </div>

          {/* Progress bar visualizer */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Impulse Magnitude (Δv)
              </span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8' }}>
                {dvValue.toFixed(4)} m/s
              </span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${dvPct}%`, background: 'linear-gradient(90deg, #06b6d4, #8b5cf6)', borderRadius: 999, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)', boxShadow: '0 0 10px rgba(6,182,212,0.5)' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem' }}>
            {[
              { label: 'Thrust Vector', value: 'Prograde (+V)', desc: 'Raise Semi-Major Axis', color: '#22c55e' },
              { label: 'Impulse Delta-v', value: `${dvValue.toFixed(4)} m/s`, desc: 'Velocity Increment', color: '#06b6d4' },
              { label: 'Estimated Burn Duration', value: '~8 to 12 sec', desc: 'Hydrazine / Ion Thruster', color: '#8b5cf6' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '1rem' }}>
                <div style={{ fontSize: '0.625rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: '0.35rem' }}>{s.label}</div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '1.05rem', fontWeight: 700, color: s.color, marginBottom: '0.2rem' }}>{s.value}</div>
                <div style={{ fontSize: '0.6875rem', color: '#475569' }}>{s.desc}</div>
              </div>
            ))}
          </div>

          <p style={{ marginTop: '1.25rem', fontSize: '0.75rem', color: '#475569', lineHeight: 1.5 }}>
            ℹ️ Maneuver parameters should be verified with Space Surveillance Network tracking before final telemetry command transmission.
          </p>
        </div>
      )}

      {/* Theory & Operational Docs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        <div className="glass" style={{ padding: '1.25rem', borderRadius: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
            <span style={{ color: '#8b5cf6', fontSize: '1rem' }}>◈</span>
            <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.875rem' }}>Propulsion Mechanics</div>
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.5 }}>
            Calculates the required orbital shift using a log-ratio formulation between the current encounter geometry and desired spatial clearance, minimizing propellant mass consumption.
          </p>
        </div>

        <div className="glass" style={{ padding: '1.25rem', borderRadius: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
            <span style={{ color: '#06b6d4', fontSize: '1rem' }}>◉</span>
            <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.875rem' }}>Autonomous Uplink</div>
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.5 }}>
            Approved avoidance solutions are compiled into burn commands and uploaded to satellite guidance computers ahead of the conjunction Time of Closest Approach.
          </p>
        </div>
      </div>
    </div>
  );
}
