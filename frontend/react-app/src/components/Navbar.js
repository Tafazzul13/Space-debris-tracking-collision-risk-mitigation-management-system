import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
        <span className="font-bold text-xl text-white tracking-tight">SpaceDebris<span className="text-cyan-400">X</span></span>
      </div>
      <div className="flex items-center gap-4">
        <NavLink to="/" className={`px-3 py-2 rounded-md text-sm font-medium transition ${''}`} end>Dashboard</NavLink>
        <NavLink to="/globe" className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition">3D Globe</NavLink>
        <NavLink to="/conjunctions" className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition">Conjunctions</NavLink>
        <NavLink to="/mitigation" className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition">Mitigation</NavLink>
        <NavLink to="/alerts" className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition">Alerts</NavLink>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-400">{user?.username}</span>
        <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">{user?.role}</span>
        <button onClick={logout} className="px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded transition">Sign out</button>
      </div>
    </nav>
  );
}
