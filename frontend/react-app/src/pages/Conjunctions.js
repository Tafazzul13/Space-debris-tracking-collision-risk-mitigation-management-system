import { useState, useEffect } from 'react';
import { objectsApi } from '../services/api';

export default function Conjunctions() {
  const [conjunctions, setConjunctions] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      const res = await objectsApi.conjunctions(filter || undefined);
      setConjunctions(res.data || []);
    } catch (e) { console.error(e); }
  };

  const RISK_COLORS = { CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#eab308', LOW: '#22c55e' };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Conjunction Analysis</h1>
        <div className="flex gap-2">
          {['', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-sm transition ${filter === f ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >{f || 'All'}</button>
          ))}
        </div>
      </div>

      <div className="glass-panel p-6 rounded-xl overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400 text-sm uppercase">
              <th className="pb-3">ID</th>
              <th className="pb-3">Primary Object</th>
              <th className="pb-3">Secondary Object</th>
              <th className="pb-3">TCA (UTC)</th>
              <th className="pb-3">Min Distance (km)</th>
              <th className="pb-3">PoC</th>
              <th className="pb-3">Risk Level</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {conjunctions.map((c) => (
              <tr key={c.id} className="border-b border-slate-800 hover:bg-slate-800/40 transition">
                <td className="py-3 text-sm text-slate-300">#{c.id}</td>
                <td className="py-3 text-sm text-slate-300">Obj #{c.primary_object_id}</td>
                <td className="py-3 text-sm text-slate-300">Obj #{c.secondary_object_id}</td>
                <td className="py-3 text-sm text-slate-300">{new Date(c.tca).toLocaleString()}</td>
                <td className="py-3 text-sm text-slate-300">{c.min_distance_km?.toFixed(3)}</td>
                <td className="py-3 text-sm text-slate-300">{c.poc?.toExponential(3)}</td>
                <td className="py-3 text-sm font-medium" style={{ color: RISK_COLORS[c.risk_level] }}>{c.risk_level}</td>
                <td className="py-3 text-sm">
                  <span className={`px-2 py-0.5 rounded text-xs ${c.is_acknowledged ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                    {c.is_acknowledged ? 'Acknowledged' : 'Active'}
                  </span>
                </td>
                <td className="py-3">
                  {!c.is_acknowledged && (
                    <button
                      onClick={() => objectsApi.acknowledge(c.id)}
                      className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1 rounded transition"
                    >Acknowledge</button>
                  )}
                </td>
              </tr>
            ))}
            {conjunctions.length === 0 && (
              <tr><td colSpan={9} className="py-8 text-center text-slate-500">No conjunctions found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
