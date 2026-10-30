import { useState } from 'react';
import { authApi } from '../services/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login(username, password);
      localStorage.setItem('token', res.data.token);
      window.location.href = '/';
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoCreds = [
    { username: 'admin', password: 'admin', role: 'ADMIN' },
    { username: 'analyst', password: 'analyst', role: 'ANALYST' },
    { username: 'operator', password: 'operator', role: 'OPERATOR' },
  ];

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-brand">
            <div className="login-icon">
              <span className="text-xl">🛰️</span>
            </div>
            <div>
              <h1 className="login-title">SpaceDebris<span className="text-cyan-400">X</span></h1>
              <p className="login-subtitle">Space Debris Tracking & Collision Risk Management</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., admin"
              className="form-control"
              required
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="form-control"
              required
              autoComplete="current-password"
            />
          </div>
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="demo-credentials">
          <div className="demo-title">Demo Credentials</div>
          {demoCreds.map((c) => (
            <div key={c.username} className="demo-row">
              <span>{c.username}</span>
              <span className="cred">{c.password}</span>
              <span className="text-xs bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{c.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
