import { useState } from 'react';
import { riskApi } from '../services/api';

export default function Mitigation() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [missDistance, setMissDistance] = useState('5.0');
  const [requiredDistance, setRequiredDistance] = useState('10.0');

  const calculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await riskApi.calculateDeltaV(parseFloat(missDistance), parseFloat(requiredDistance));
      setResult(res);
    } catch (err) {
      alert('Calculation failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white">Collision Avoidance Maneuver Planner</h1>

      <div className="glass-panel p-6 rounded-xl">
        <h2 className="text-lg font-semibold text-white mb-4">Delta-v Calculator</h2>
        <form onSubmit={calculate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-400">Current Miss Distance (km)</label>
            <input
              type="number" step="0.1" value={missDistance} onChange={(e) => setMissDistance(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-400">Required Miss Distance (km)</label>
            <input
              type="number" step="0.1" value={requiredDistance} onChange={(e) => setRequiredDistance(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div className="flex h-10 w-full justify-center items-center">
            <button type="submit" disabled={loading} className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white px-6 py-2 rounded font-semibold transition">
              {loading ? 'Calculating...' : 'Calculate Δv'}
            </button>
          </div>
        </form>
      </div>

      {result && (
        <div className="glass-panel p-6 rounded-xl border border-cyan-500/30">
          <h3 className="text-lg font-semibold text-cyan-400 mb-3">Recommended Maneuver</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-700 pb-2">
              <span className="text-slate-400">Required Delta-v</span>
              <span className="text-white font-mono">{result.toFixed(4)} m/s</span>
            </div>
            <div className="flex justify-between border-b border-slate-700 pb-2">
              <span className="text-slate-400">Direction</span>
              <span className="text-white">Prograde (raise orbit)</span>
            </div>
            <div className="flex justify-between border-b border-slate-700 pb-2">
              <span className="text-slate-400">Estimated Burn Time</span>
              <span className="text-white">~10 seconds</span>
            </div>
            <div className="pt-3">
              <span className="text-xs text-slate-500">Note: This is a simplified calculation. Execute via mission control.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
