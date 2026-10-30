import { useEffect, useState } from 'react';
import { objectsApi } from '../services/api';

const SEVERITY_CONFIG = {
  CRITICAL: { color: '#ef4444' },
  WARNING: { color: '#f97316' },
  INFO: { color: '#3b82f6' },
};

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const res = await objectsApi.alerts();
      setAlerts(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-container animate-slide-in">
      <div className="section-header mb-6">
        <div>
          <h1 className="section-title">Alert Center</h1>
          <p className="section-subtitle">System notifications and collision risk alerts</p>
        </div>
      </div>

      {loading ? (
        <div className="glass p-12 rounded-xl text-center">
          <div className="spinner mb-4" />
          <p className="text-slate-400">Loading alerts...</p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="glass p-12 rounded-xl text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4 text-green-400">
            <span className="text-2xl">✓</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Alerts</h3>
          <p className="text-slate-400">All systems nominal. No active alerts.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => {
            const color = SEVERITY_CONFIG[a.severity]?.color || '#3b82f6';
            return (
              <div
                key={a.id}
                className={`glass p-5 rounded-xl border-l-4 ${
                  a.severity === 'CRITICAL' ? 'border-red-500' : a.severity === 'WARNING' ? 'border-orange-500' : 'border-blue-500'
                } hover:bg-white/5 transition-colors`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center" style={{ color }}>
                      <span className="text-lg">𚀀</span>
                    </div>
                    <div>
                      <span className="font-semibold text-white">{a.severity}</span>
                      <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold ${
                        a.is_read ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {a.is_read ? 'Read' : 'New'}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">{new Date(a.sent_at).toLocaleString()}</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{a.message}</p>
                <div className="mt-3 pt-3 border-t border-slate-800/50 flex items-center gap-4">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Channel: {a.channel}</span>
                  <span className="ml-auto text-[10px] text-slate-500">ID: #{a.id}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
