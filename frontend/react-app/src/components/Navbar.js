import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: '📊' },
    { to: '/globe', label: 'Orbital View', icon: '🛰️' },
    { to: '/conjunctions', label: 'Conjunctions', icon: '📈' },
    { to: '/mitigation', label: 'Mitigation', icon: '🚀' },
    { to: '/alerts', label: 'Alerts', icon: '𚀀' },
  ];

  return (
    <nav className="glass fixed top-0 left-0 right-0 z-50 h-16 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <span className="text-white text-sm font-bold">S</span>
          </div>
          <span className="font-bold text-xl text-white tracking-tight">SpaceDebris<span className="text-cyan-400">X</span></span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-lg shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <span className="mr-2">{item.icon}</span> <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-medium text-white">{user?.username}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-400">
              {user?.role}
            </span>
          </div>
          <button onClick={logout} className="btn-icon text-slate-400 hover:text-red-400 hover:bg-red-500/10">
            🚪
          </button>
        </div>
      </div>
    </nav>
  );
}
