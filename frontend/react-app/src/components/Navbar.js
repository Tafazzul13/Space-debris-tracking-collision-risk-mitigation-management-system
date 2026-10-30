import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRealtime } from '../context/RealtimeContext';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { liveAlerts } = useRealtime();
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const navItems = [
    { to: '/', label: 'Mission Control', icon: '◈', end: true },
    { to: '/globe', label: 'Orbital View', icon: '○' },
    { to: '/conjunctions', label: 'Conjunctions', icon: '⊕' },
    { to: '/mitigation', label: 'Mitigation', icon: '↗' },
    { to: '/alerts', label: 'Alerts', icon: '◉', badge: liveAlerts.length },
  ];

  return (
    <nav className="navbar-root">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="navbar-brand">
          <div className="navbar-logo">
            <span>⬡</span>
          </div>
          <span className="navbar-title">SpaceDebris<span className="text-cyan">X</span></span>
          <div className="live-badge">
            <span className="live-dot" />
            LIVE
          </div>
        </div>

        {/* Nav links */}
        <div className="navbar-links">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
            </NavLink>
          ))}
        </div>

        {/* Right side status & user */}
        <div className="navbar-right">
          <div className="nav-clock">
            <span className="nav-clock-label">TELEMETRY UTC</span>
            <span className="nav-clock-time">{clock.toUTCString().slice(17, 25)}</span>
          </div>
          {user && (
            <div className="nav-user">
              <div className="nav-avatar">{user.username?.[0]?.toUpperCase() || 'U'}</div>
              <div>
                <div className="nav-username">{user.username}</div>
                <div className="nav-role">{user.role}</div>
              </div>
            </div>
          )}
          <button onClick={logout} className="nav-logout" title="Sign out">⏻</button>
        </div>
      </div>
    </nav>
  );
}
