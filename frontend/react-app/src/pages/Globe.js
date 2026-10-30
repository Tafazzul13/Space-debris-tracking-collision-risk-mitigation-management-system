import { useState, useEffect, useRef } from 'react';
import { objectsApi } from '../services/api';

export default function GlobeView() {
  const canvasRef = useRef(null);
  const [objects, setObjects] = useState([]);
  const [stats, setStats] = useState({ total: 0, critical: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await objectsApi.list();
      const objs = res.data || [];
      setObjects(objs);
      setStats({ total: objs.length, critical: 0 });
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height, cx, cy, r;
    let rotation = 0;
    let animId;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width;
      canvas.height = height;
      cx = width / 2;
      cy = height / 2;
      r = Math.min(width, height) * 0.38;
    };
    resize();
    window.addEventListener('resize', resize);

    const stars = Array.from({ length: 150 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      s: Math.random() * 2,
      o: Math.random(),
    }));

    function draw() {
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#020617');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#fff';
      stars.forEach((s) => {
        ctx.globalAlpha = s.o;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.s, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      rotation += 0.0015;

      const earthGlow = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r * 1.3);
      earthGlow.addColorStop(0, 'rgba(6, 182, 212, 0.15)');
      earthGlow.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = earthGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.3, 0, Math.PI * 2);
      ctx.fill();

      const earthGrad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.2, cx, cy, r);
      earthGrad.addColorStop(0, '#1e3a8a');
      earthGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = earthGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.95, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - r, cy);
      ctx.lineTo(cx + r, cy);
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx, cy + r);
      ctx.stroke();

      objects.forEach((obj) => {
        const angle = ((obj.lon || (obj.id * 37)) / 180) * Math.PI + rotation;
        const alt = obj.alt || 400;
        const dist = 1 + alt / 1500;
        const x = cx + Math.cos(angle) * r * dist * 0.55;
        const y = cy + Math.sin(angle) * r * dist * 0.3;

        const visible = Math.cos(angle) > -0.8;
        if (!visible) return;

        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, r * dist * 0.5, 0, Math.PI * 2);
        ctx.stroke();

        const color = obj.type === 'DEBRIS' ? '#ef4444' : obj.type === 'ROCKET_BODY' ? '#f97316' : '#06b6d4';
        ctx.shadowBlur = 12;
        ctx.shadowColor = color;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(obj.name || `Obj #${obj.id}`, x, y - 12);
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [objects]);

  return (
    <div className="page-container animate-slide-in">
      <div className="section-header mb-6">
        <div>
          <h1 className="section-title">Orbital View</h1>
          <p className="section-subtitle">Live satellite and debris positions around Earth</p>
        </div>
      </div>

      <div className="glass p-1 mb-6 relative overflow-hidden">
        <div className="relative z-10 rounded-xl border border-border/50 bg-black/40 backdrop-blur-sm overflow-hidden aspect-video w-full min-h-[500px]">
          <canvas ref={canvasRef} className="w-full h-full block" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatMini label="Total Objects" value={stats.total} color="text-cyan-400" icon="🛰️" />
        <StatMini label="Critical Debris" value={stats.critical} color="text-red-400" icon="🔴" />
        <StatMini label="Active Orbits" value={Math.max(1, Math.floor(stats.total / 3))} color="text-green-400" icon="🔄" />
        <StatMini label="Coverage" value="100%" color="text-purple-400" icon="🌍" />
      </div>
    </div>
  );
}

function StatMini({ label, value, color, icon }) {
  return (
    <div className="glass p-4 rounded-xl flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-cyan-400">
        <span className="text-lg">{icon}</span>
      </div>
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{label}</p>
        <p className="text-lg font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
