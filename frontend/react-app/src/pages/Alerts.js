import { useState, useEffect } from 'react';
import { objectsApi } from '../services/api';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const res = await objectsApi.alerts();
      setAlerts(res.data || []);
    } catch (e) { console.error(e); }
  };

  const SEVERITY_COLORS = { CRITICAL: '#ef4444', WARNING: '#f97316', INFO: '#3b82f6' };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Alert Center</h1>

      <div className="glass-panel p-6 rounded-xl overflow-y-auto max-h-[70vh]">
        {alerts.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">No alerts.</p>
        ) : (
          <div className="space-y-3">
            {alerts.map((a) => (
              <div key={a.id} className="p-4 rounded-lg border-l-4 bg-slate-800/50 border-slate-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-white">{a.severity}</span>
                  <span className="text-xs text-slate-500">{new Date(a.sent_at).toLocaleString()}</span>
                </div>
                <p className="text-sm text-slate-300">{a.message}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${SEVERITY_COLORS[a.severity]}`}>
                    {a.severity}
                  </span>
                  <span className={`text-xs ${a.is_read ? 'text-green-400' : 'text-yellow-400'}`}>
                    {a.is_read ? 'Read' : 'Unread'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
