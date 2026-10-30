import { useState, useEffect } from 'react';
import { objectsApi } from '../services/api';

const RISK_CONFIG = {
  CRITICAL: { color: '#ef4444', badge: 'badge-critical' },
  HIGH: { color: '#f97316', badge: 'badge-high' },
  MEDIUM: { color: '#eab308', badge: 'badge-medium' },
  LOW: { color: '#22c55e', badge: 'badge-low' },
};

export default function Conjunctions() {
  const [conjunctions, setConjunctions] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await objectsApi.conjunctions(filter !== 'ALL' ? filter : undefined);
      setConjunctions(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const acknowledge = async (id) => {
    try {
      await objectsApi.acknowledge(id);
      loadData();
    } catch (e) { alert('Failed to acknowledge'); }
  };

  const filtered = filter === 'ALL' ? conjunctions : conjunctions.filter(c => c.risk_level === filter);

  return (
    <div className="page-container animate-slide-in">
      <div className="section-header mb-6">
        <div>
          <h1 className="section-title">Conjunction Analysis</h1>
          <p className="section-subtitle">Detected close approaches and collision risk events</p>
        </div>
      </div>

      <div className="glass p-4 rounded-xl mb-6 flex flex-wrap gap-2">
        {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-500/10'
                : 'bg-white/5 text-slate-400 border border-border/50 hover:bg-white/10 hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="glass p-12 rounded-xl text-center">
          <div className="spinner mb-4" />
          <p className="text-slate-400">Loading conjunction data...</p>
        </div>
      ) : conjunctions.length === 0 ? (
        <div className="glass p-12 rounded-xl text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4 text-green-400">
            <span className="text-2xl">✓</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">All Clear</h3>
          <p className="text-slate-400">No active conjunctions detected.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th className="w-10">#</th>
                <th>Primary Object</th>
                <th>Secondary Object</th>
                <th className="w-64">Time of Closest Approach</th>
                <th className="w-48">Min Distance</th>
                <th className="w-40">Probability</th>
                <th className="w-40">Risk Level</th>
                <th className="w-48">Status</th>
                <th className="w-48">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const cfg = RISK_CONFIG[c.risk_level] || RISK_CONFIG.LOW;
                return (
                  <tr key={c.id} className="border-b border-slate-800/40 hover:bg-white/3 transition-colors group">
                    <td className="py-4 text-xs font-mono text-slate-500 font-medium">#{c.id}</td>
                    <td className="py-4 text-sm text-slate-300">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        Obj #{c.primary_object_id}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-slate-300">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-400" />
                        Obj #{c.secondary_object_id}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-slate-300 font-mono">{new Date(c.tca).toLocaleString()}</td>
                    <td className="py-4 text-sm text-slate-300">{c.min_distance_km?.toFixed(3)} km</td>
                    <td className="py-4 text-sm text-slate-300 font-mono">{c.poc?.toExponential(3)}</td>
                    <td className="py-4">
                      <span className={`badge ${cfg.badge}`}>{c.risk_level}</span>
                    </td>
                    <td className="py-4 text-sm">
                      <span className={`px-3 py-1.5 rounded text-xs font-medium ${
                        c.is_acknowledged
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {c.is_acknowledged ? 'Acknowledged' : 'Active'}
                      </span>
                    </td>
                    <td className="py-4 text-sm">
                      {!c.is_acknowledged && (
                        <button
                          onClick={() => acknowledge(c.id)}
                          className="w-full btn-primary text-xs py-2"
                        >
                          Acknowledge
                        </button>
                      )}
                      {c.is_acknowledged && (
                        <span className="text-xs text-green-400">Done</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
