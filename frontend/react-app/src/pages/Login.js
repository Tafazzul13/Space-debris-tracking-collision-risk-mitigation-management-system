import { useState, useNavigate } from 'react';
import { authApi } from '../services/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login(username, password);
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoCreds = [
    { username: 'admin', password: 'admin', role: 'ADMIN' },
    { username: 'analyst', password: 'analyst', role: 'ANALYST' },
    { username: 'operator', password: 'operator', role: 'OPERATOR' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="glass-panel w-full max-w-md p-8 rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">🛰️</span>
          </div>
          <h1 className="text-2xl font-bold text-white">SpaceDebrisX</h1>
          <p className="text-slate-400 text-sm">Sign in to access the system</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-400 font-medium">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., admin"
              className="bg-slate-900 border border-slate-700 rounded px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-slate-400 font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-slate-900 border border-slate-700 rounded px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition"
              required
            />
          </div>
          {error && <div className="text-sm text-red-400 bg-red-900/20 px-3 py-2 rounded border border-red-500/30">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white font-semibold py-3 rounded-lg transition"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 border-t border-slate-800 pt-6">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Demo Credentials</h3>
          <div className="space-y-2 text-sm text-slate-400">
            {demoCreds.map((c) => (
              <div key={c.username} className="flex justify-between">
                <span>{c.username}</span>
                <span className="font-mono text-cyan-400">{c.password}</span>
                <span className="text-xs bg-slate-800 px-2 py-0.5 rounded">{c.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
