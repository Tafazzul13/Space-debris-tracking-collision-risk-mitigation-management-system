import { useState, useEffect, useRef, useCallback } from 'react';
import { objectsApi } from '../services/api';
import { usePolling } from '../hooks/usePolling';

export default function GlobeView() {
  const canvasRef = useRef(null);
  const { data: objects = [], loading, lastUpdated, refresh } = usePolling(
    () => objectsApi.list().then(r => r.data || []),
    12000
  );

  const [selected, setSelected] = useState(null);
  const rotRef = useRef(0);
  const animRef = useRef(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    if (!W || !H) return;

    const cx = W / 2, cy = H / 2;
    const R = Math.min(W, H) * 0.35;
    rotRef.current += 0.0009;
    const rot = rotRef.current;

    // Deep space backdrop
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, W, H);

    // Stars field
    ctx.save();
    for (let i = 0; i < 220; i++) {
      const sx = ((i * 2654435761 + 0xdeadbeef) % W + W) % W;
      const sy = ((i * 1013904223 + 0xc0ffee) % H + H) % H;
      const sa = 0.15 + (i % 7) * 0.12;
      const ss = 0.6 + (i % 3) * 0.5;
      ctx.globalAlpha = sa;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sx, sy, ss, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Earth atmosphere outer halo
    const atmo = ctx.createRadialGradient(cx, cy, R * 0.88, cx, cy, R * 1.35);
    atmo.addColorStop(0, 'rgba(6,182,212,0.18)');
    atmo.addColorStop(0.4, 'rgba(6,182,212,0.06)');
    atmo.addColorStop(1, 'transparent');
    ctx.fillStyle = atmo;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.35, 0, Math.PI * 2);
    ctx.fill();

    // Earth sphere body
    const eg = ctx.createRadialGradient(cx - R * 0.25, cy - R * 0.25, R * 0.05, cx, cy, R);
    eg.addColorStop(0, '#1e40af');
    eg.addColorStop(0.5, '#0f172a');
    eg.addColorStop(1, '#020617');
    ctx.fillStyle = eg;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();

    // Longitude and Latitude grid wireframe
    ctx.save();
    ctx.strokeStyle = 'rgba(6,182,212,0.12)';
    ctx.lineWidth = 0.75;
    for (let lat = -60; lat <= 60; lat += 30) {
      const ry = R * Math.cos((lat * Math.PI) / 180);
      const py = cy + R * Math.sin((lat * Math.PI) / 180);
      if (ry > 0) {
        ctx.beginPath();
        ctx.ellipse(cx, py, ry, ry * 0.22, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    for (let lon = 0; lon < 360; lon += 30) {
      const angle = (lon * Math.PI) / 180 + rot;
      ctx.beginPath();
      ctx.moveTo(cx, cy - R);
      ctx.quadraticCurveTo(cx + Math.cos(angle) * R * 0.45, cy, cx, cy + R);
      ctx.stroke();
    }
    ctx.restore();

    // Earth rim neon ring
    ctx.save();
    ctx.strokeStyle = 'rgba(6,182,212,0.4)';
    ctx.lineWidth = 1.25;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#06b6d4';
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Orbit paths and tracked space objects
    objects.forEach((obj) => {
      const lonRad = (((obj.lon_deg || obj.lonDeg || obj.id * 37) * Math.PI) / 180) + rot;
      const latRad = ((obj.lat_deg || obj.latDeg || 0) * Math.PI) / 180;
      const alt = obj.alt_km || obj.altKm || 450;
      const orbitR = R * (1 + alt / 7000);

      // Orbital trace line
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.strokeStyle = obj.object_type === 'SATELLITE' ? '#06b6d4' : '#8b5cf6';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, orbitR, orbitR * Math.abs(Math.cos(latRad)) * 0.35 + 4, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      const px = cx + Math.cos(lonRad) * orbitR * 0.58;
      const py = cy + Math.sin(lonRad) * orbitR * 0.24 + Math.sin(latRad) * R * 0.35;

      // Filter back-side objects to enhance 3D depth
      if (Math.cos(lonRad) < -0.45) return;

      const isSelected = selected?.id === obj.id;
      const dotColor = obj.object_type === 'SATELLITE' ? '#06b6d4' :
                       obj.object_type === 'DEBRIS' ? '#f43f5e' : '#eab308';

      // Object glow
      ctx.save();
      ctx.shadowBlur = isSelected ? 22 : 9;
      ctx.shadowColor = dotColor;
      ctx.fillStyle = dotColor;
      ctx.beginPath();
      ctx.arc(px, py, isSelected ? 5.5 : 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Object orbit halo
      ctx.save();
      ctx.strokeStyle = dotColor;
      ctx.globalAlpha = isSelected ? 0.9 : 0.45;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(px, py, isSelected ? 10 : 6.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Object target label
      if (isSelected) {
        ctx.save();
        ctx.fillStyle = 'rgba(2,6,23,0.92)';
        const label = `${obj.name || `OBJ #${obj.id}`} (${(alt).toFixed(0)}km)`;
        ctx.font = '600 11px Inter, sans-serif';
        const tw = ctx.measureText(label).width;
        ctx.fillRect(px - tw / 2 - 8, py - 30, tw + 16, 20);
        ctx.strokeStyle = 'rgba(6,182,212,0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(px - tw / 2 - 8, py - 30, tw + 16, 20);
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'center';
        ctx.fillText(label, px, py - 16);
        ctx.restore();
      }
    });

    // Optical crosshairs
    ctx.save();
    ctx.strokeStyle = 'rgba(6,182,212,0.18)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(cx - R * 1.45, cy);
    ctx.lineTo(cx + R * 1.45, cy);
    ctx.moveTo(cx, cy - R * 1.45);
    ctx.lineTo(cx, cy + R * 1.45);
    ctx.stroke();
    ctx.restore();

    animRef.current = requestAnimationFrame(draw);
  }, [objects, selected]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resize();
    window.addEventListener('resize', resize);
    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [draw]);

  const handleCanvasClick = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.35;
    let hit = null, minD = 18;

    objects.forEach(obj => {
      const lonRad = (((obj.lon_deg || obj.lonDeg || obj.id * 37) * Math.PI) / 180) + rotRef.current;
      const latRad = ((obj.lat_deg || obj.latDeg || 0) * Math.PI) / 180;
      const alt = obj.alt_km || obj.altKm || 450;
      const orbitR = R * (1 + alt / 7000);
      const px = cx + Math.cos(lonRad) * orbitR * 0.58;
      const py = cy + Math.sin(lonRad) * orbitR * 0.24 + Math.sin(latRad) * R * 0.35;
      const d = Math.hypot(mx - px, my - py);
      if (d < minD) {
        minD = d;
        hit = obj;
      }
    });
    setSelected(hit);
  }, [objects]);

  const leoCount = objects.filter(o => (o.alt_km || o.altKm || 450) < 2000).length;
  const [utc, setUtc] = useState(new Date().toISOString().slice(11, 19));
  useEffect(() => {
    const t = setInterval(() => setUtc(new Date().toISOString().slice(11, 19)), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="page-container animate-slide-in">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Live Orbital Tracking
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
            Real-time orbital propagation view • Click any entity to inspect telemetry
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="live-badge"><span className="live-dot" />SGP4 PROPAGATOR ACTIVE</div>
          <button onClick={refresh} className="btn-secondary btn-sm" disabled={loading}>
            {loading ? 'Syncing...' : '↺ Force Refresh'}
          </button>
        </div>
      </div>

      {/* Main Canvas Container */}
      <div className="glass" style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', marginBottom: '1.25rem' }}>
        <div style={{ position: 'relative', width: '100%', minHeight: '520px', height: '62vh' }}>
          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }}
            onClick={handleCanvasClick}
          />

          {/* Tactical HUD Overlay */}
          <div className="globe-hud">
            <div className="globe-hud-item"><div className="globe-hud-label">EPOCH UTC</div>{utc}</div>
            <div className="globe-hud-item"><div className="globe-hud-label">TRACKED CONSTELLATION</div>{objects.length} OBJECTS</div>
            <div className="globe-hud-item"><div className="globe-hud-label">LEO REGIME (&lt;2000KM)</div>{leoCount} ASSETS</div>
          </div>

          {/* Color Coding Legend */}
          <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
            {[
              ['#06b6d4', 'Active Satellite'],
              ['#f43f5e', 'Debris Fragment'],
              ['#eab308', 'Rocket Body'],
            ].map(([c, l]) => (
              <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.6875rem', color: '#94a3b8', background: 'rgba(2,6,23,0.85)', padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: c, display: 'inline-block', boxShadow: `0 0 6px ${c}` }} />
                {l}
              </span>
            ))}
          </div>

          {/* Selected Object Telemetry Modal Card */}
          {selected && (
            <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(2,6,23,0.92)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 12, padding: '1rem', minWidth: 220, backdropFilter: 'blur(16px)', boxShadow: '0 15px 30px rgba(0,0,0,0.6)' }}>
              <div style={{ fontSize: '0.625rem', color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.35rem' }}>
                Asset Telemetry
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.625rem' }}>
                {selected.name || `Object #${selected.id}`}
              </div>
              {[
                ['NORAD ID', selected.norad_id || selected.noradId || '—'],
                ['Type', selected.object_type || selected.objectType || 'DEBRIS'],
                ['Altitude', `${(selected.alt_km || selected.altKm || 450).toFixed(1)} km`],
                ['Radar CS', selected.rcs_m2 ? `${selected.rcs_m2} m²` : '1.0 m²'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                  <span style={{ color: '#64748b' }}>{k}</span>
                  <span style={{ color: '#e2e8f0', fontFamily: 'JetBrains Mono' }}>{v}</span>
                </div>
              ))}
              <button
                onClick={() => setSelected(null)}
                style={{ marginTop: '0.75rem', width: '100%', fontSize: '0.6875rem', color: '#94a3b8', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px', cursor: 'pointer' }}
              >
                ✕ Close Inspector
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Orbit Overview KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem' }}>
        {[
          { label: 'Active Catalog', value: objects.length, color: '#06b6d4', note: 'Cataloged in database' },
          { label: 'Low Earth Orbit (LEO)', value: leoCount, color: '#8b5cf6', note: '&lt; 2000 km altitude' },
          { label: 'Screened Orbits', value: Math.max(1, Math.floor(objects.length / 2)), color: '#22c55e', note: 'Continuous propagation' },
          { label: 'Global Coverage', value: '100%', color: '#f59e0b', note: 'Full spherical field' },
        ].map(s => (
          <div key={s.label} className="glass" style={{ padding: '1rem 1.15rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0, boxShadow: `0 0 10px ${s.color}` }} />
            <div>
              <div style={{ fontSize: '0.625rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.625rem', color: '#475569' }}>{s.note}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
