import { useState, useEffect } from 'react';
import { objectsApi, riskApi } from '../services/api';

const RISK_COLORS = { CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#eab308', LOW: '#22c55e' };

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, critical: 0, high: 0, medium: 0, low: 0 });
  const [conjunctions, setConjunctions] = useState([]);

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
        low: cons.filter(c => c.risk_level === 'LOW').length
      });
    } catch (e) { console.error(e); }
  };

  const scan = async () => {
    try { await riskApi.scan(); loadData(); } catch (e) { alert('Scan failed'); }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <button onClick={scan} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">Run Conjunction Scan</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Tracked Objects" value={stats.total} color="text-blue-400" icon="🛰️" />
        <StatCard label="Critical" value={stats.critical} color="text-red-400" icon="🔴" />
        <StatCard label="High Risk" value={stats.high} color="text-orange-400" icon="🟠" />
        <StatCard label="Medium" value={stats.medium} color="text-yellow-400" icon="🟡" />
        <StatCard label="Low" value={stats.low} color="text-green-400" icon="🟢" />
      </div>

      <div className="glass-panel p-6 rounded-xl">
        <h2 className="text-lg font-semibold text-white mb-4">Active Conjunctions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-sm">
                <th className="pb-2">Primary</th>
                <th className="pb-2">Secondary</th>
                <th className="pb-2">TCA (UTC)</th>
                <th className="pb-2">Min Dist (km)</th>
                <th className="pb-2">PoC</th>
                <th className="pb-2">Risk</th>
                <th className="pb-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {conjunctions.slice(0, 10).map((c) => (
                <tr key={c.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition">
                  <td className="py-2 text-sm text-slate-300">Obj #{c.primary_object_id}</td>
                  <td className="py-2 text-sm text-slate-300">Obj #{c.secondary_object_id}</td>
                  <td className="py-2 text-sm text-slate-300">{new Date(c.tca).toLocaleString()}</td>
                  <td className="py-2 text-sm text-slate-300">{c.min_distance_km?.toFixed(2)}</td>
                  <td className="py-2 text-sm text-slate-300">{c.poc?.toExponential(2)}</td>
                  <td className="py-2 text-sm font-medium" style={{ color: RISK_COLORS[c.risk_level] }}>{c.risk_level}</td>
                  <td className="py-2">
                    <button onClick={() => objectsApi.acknowledge(c.id)} className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded transition">Acknowledge</button>
                  </td>
                </tr>
              ))}
              {conjunctions.length === 0 && (
                <tr><td colSpan={7} className="py-4 text-center text-slate-500 text-sm">No active conjunctions.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon }) {
  return (
    <div className="glass-panel p-5 rounded-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
      <div className={`mt-2 h-1 w-full rounded-full bg-slate-700`}>
        <div className="h-full rounded-full" style={{ width: '60%', backgroundColor: color === 'text-red-400' ? '#ef4444' : color === 'text-orange-400' ? '#f97316' : color === 'text-yellow-400' ? '#eab308' : color === 'text-green-400' ? '#22c55e' : '#3b82f6' }} />
      </div>
    </div>
  );
}
