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
    <div className="page-container animate-slide-in max-w-4xl mx-auto">
      <div className="section-header mb-8">
        <div>
          <h1 className="section-title">Maneuver Planner</h1>
          <p className="section-subtitle">Calculate collision avoidance delta-v and plan mitigation trajectories</p>
        </div>
      </div>

      <div className="glass p-8 rounded-2xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <span className="text-cyan-400">🚀</span>
            Delta-v Calculator
          </h2>
          <form onSubmit={calculate} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">Current Miss Distance</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={missDistance}
                  onChange={(e) => setMissDistance(e.target.value)}
                  className="form-control"
                  placeholder="5.0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">km</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">Required Miss Distance</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={requiredDistance}
                  onChange={(e) => setRequiredDistance(e.target.value)}
                  className="form-control"
                  placeholder="10.0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">km</span>
              </div>
            </div>
            <div className="flex h-10 w-full justify-center items-center">
              <button type="submit" disabled={loading} className="btn-primary px-8">
                {loading ? 'Calculating...' : 'Compute Δv'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {result && (
        <div className="glass p-8 rounded-2xl border border-cyan-500/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
              <span className="text-xl">🛡️</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Recommended Maneuver</h3>
              <p className="text-sm text-slate-400">Collision avoidance burn calculated</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-4 border border-border/50">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Required Delta-v</p>
              <p className="text-lg font-mono font-bold text-cyan-400">{result.toFixed(4)} m/s</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-border/50">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Burn Direction</p>
              <p className="text-lg font-mono font-bold text-green-400">Prograde (Raise Orbit)</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-border/50">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Estimated Burn Time</p>
              <p className="text-lg font-mono font-bold text-blue-400">~10 seconds</p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-800/50">
            <p className="text-xs text-slate-500">
              Note: This is a simplified calculation. Final maneuver parameters must be verified by mission control before execution.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-xl border border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-purple-400">
              <span className="text-lg">⏰</span>
            </div>
            <h3 className="text-sm font-semibold text-white">How It Works</h3>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            The calculator uses a logarithmic scaling model based on the ratio between current and required miss distance. Typical avoidance maneuvers range from 0.1 to 1.0 m/s.
          </p>
        </div>
        <div className="glass p-6 rounded-xl border border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-blue-400">
              <span className="text-lg">🛡️</span>
            </div>
            <h3 className="text-sm font-semibold text-white">Execution</h3>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            Once calculated, the maneuver plan is sent to the spacecraft's attitude control system. The burn is executed at the predicted time of closest approach.
          </p>
        </div>
      </div>
    </div>
  );
}
