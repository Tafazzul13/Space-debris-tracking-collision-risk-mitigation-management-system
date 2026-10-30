import { useState, useEffect } from 'react';
import { objectsApi, riskApi } from '../services/api';

const RISK_CONFIG = {
  CRITICAL: { color: '#ef4444', badge: 'badge-critical' },
  HIGH: { color: '#f97316', badge: 'badge-high' },
  MEDIUM: { color: '#eab308', badge: 'badge-medium' },
  LOW: { color: '#22c55e', badge: 'badge-low' },
};

const ICONS = {
  satellite: '🛰️',
  warning: '🔴',
  check: '✓',
  clock: '⏰',
  trending: '📈',
};

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, critical: 0, high: 0, medium: 0, low: 0 });
  const [conjunctions, setConjunctions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [objRes, conjRes] = await Promise.all([objectsApi.list(), objectsApi.conjunctions()]);
      const objs = objRes.data || [];
      const cons = conjRes.data || [];
      setConjunctions(cons);
      setStats({
        total: objs.length,
        critical: cons.filter(c => c.risk_level === 'CRITICAL').length,
        high: cons.filter(c => c.risk_level === 'HIGH').length,
        medium: cons.filter(c => c.risk_level === 'MEDIUM').length,
        low: cons.filter(c => c.risk_level === 'LOW').length,
      });
    } catch (e) { console.error(e); }
  };

  const handleScan = async () => {
    setLoading(true);
    try {
      await riskApi.scan();
      loadData();
    } catch (e) { alert('Scan failed'); }
    finally { setLoading(false); }
  };

  const recent = conjunctions.slice(0, 5);

  return (
    <div className="page-container animate-slide-in">
      <div className="section-header mb-6">
        <div>
          <h1 className="section-title">Mission Control</h1>
          <p className="section-subtitle">Real-time space debris tracking and collision risk analysis</p>
        </div>
        <button
          onClick={handleScan}
          disabled={loading}
          className="btn-primary animate-pulse-glow"
        >
          {loading ? 'Scanning...' : 'Run Conjunction Scan'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard
          label="Tracked Objects"
          value={stats.total}
          icon={ICONS.satellite}
          color="text-cyan-400"
          glow="rgba(6, 182, 212, 0.2)"
        />
        <StatCard
          label="Critical"
          value={stats.critical}
          icon={ICONS.warning}
          color="text-red-400"
          glow="rgba(239, 68, 68, 0.2)"
          critical
        />
        <StatCard
          label="High Risk"
          value={stats.high}
          icon={ICONS.warning}
          color="text-orange-400"
          glow="rgba(249, 115, 22, 0.2)"
        />
        <StatCard
          label="Medium"
          value={stats.medium}
          icon={ICONS.clock}
          color="text-yellow-400"
          glow="rgba(234, 179, 8, 0.2)"
        />
        <StatCard
          label="Low"
          value={stats.low}
          icon={ICONS.check}
          color="text-green-400"
          glow="rgba(34, 197, 94, 0.2)"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-cyan-400">{ICONS.satellite}</span>
            Active Conjunctions
          </h2>
          <div className="overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="pb-3 text-sm font-semibold text-slate-400 uppercase tracking-wider">Pair</th>
                  <th className="pb-3 text-sm font-semibold text-slate-400 uppercase tracking-wider">TCA</th>
                  <th className="pb-3 text-sm font-semibold text-slate-400 uppercase tracking-wider">Distance</th>
                  <th className="pb-3 text-sm font-semibold text-slate-400 uppercase tracking-wider">PoC</th>
                  <th className="pb-3 text-sm font-semibold text-slate-400 uppercase tracking-wider">Risk</th>
                  <th className="pb-3 text-sm font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((c) => {
                  const cfg = RISK_CONFIG[c.risk_level] || RISK_CONFIG.LOW;
                  return (
                    <tr key={c.id} className="border-b border-slate-800/50 hover:bg-white/2 transition-colors">
                      <td className="py-3 text-sm text-slate-300">
                        <span className="font-mono text-xs text-slate-500 mr-2">#{c.primary_object_id}</span>
                        <span className="text-white font-medium">↔</span>
                        <span className="font-mono text-xs text-slate-500 ml-2">#{c.secondary_object_id}</span>
                      </td>
                      <td className="py-3 text-sm text-slate-300">{new Date(c.tca).toLocaleString()}</td>
                      <td className="py-3 text-sm text-slate-300">{c.min_distance_km?.toFixed(2)} km</td>
                      <td className="py-3 text-sm text-slate-300 font-mono">{c.poc?.toExponential(2)}</td>
                      <td className="py-3">
                        <span className={`badge ${cfg.badge} badge-pulse`}>{c.risk_level}</span>
                      </td>
                      <td className="py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${c.is_acknowledged ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                          {c.is_acknowledged ? 'Acknowledged' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {recent.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 text-sm">No active conjunctions.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <div className="glass p-5 rounded-xl">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">API Gateway</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-green-400 font-medium">Online</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Risk Engine</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-green-400 font-medium">Online</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Database</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-green-400 font-medium">Connected</span>
                </span>
              </div>
            </div>
          </div>

          <div className="glass p-5 rounded-xl">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleScan}
                disabled={loading}
                className="w-full btn-primary text-left py-3"
              >
                <span>{ICONS.trending}</span> Run Risk Analysis
              </button>
              <button className="w-full btn-secondary text-left py-3">
                <span>{ICONS.satellite}</span> View Orbital Map
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, glow, critical }) {
  return (
    <div className={`stat-card ${critical ? 'critical' : ''} group`} style={{ boxShadow: `0 0 20px ${glow}` }}>
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
          <span className="text-lg">{icon}</span>
        </div>
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
      </div>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </div>
  );
}
