import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, User, LogOut, ShieldCheck, Sparkles } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="site-header scrolled">
      <nav className="navbar container">
        <Link className="logo" to="/" onClick={closeMenu}>
          <Sparkles size={20} color="var(--primary)" />
          Riyaa Bridal Makeover
          <span className="logo-badge">PBL</span>
        </Link>

        <button
          className={`nav-toggle ${isOpen ? 'active' : ''}`}
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`nav-menu ${isOpen ? 'open' : ''}`}>
          <li>
            <NavLink to="/" end onClick={closeMenu}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/services" onClick={closeMenu}>
              Services
            </NavLink>
          </li>
          <li>
            <NavLink to="/about" onClick={closeMenu}>
              About
            </NavLink>
          </li>
          <li>
            <NavLink to="/book" onClick={closeMenu}>
              Book Now
            </NavLink>
          </li>

          {/* Customer only link */}
          {isAuthenticated && !isAdmin && (
            <li>
              <NavLink to="/my-appointments" onClick={closeMenu}>
                My Bookings
              </NavLink>
            </li>
          )}

          {/* Admin only link */}
          {isAuthenticated && isAdmin && (
            <li>
              <NavLink to="/admin" onClick={closeMenu} style={{ color: 'var(--primary-dark)', fontWeight: 700 }}>
                Admin Portal
              </NavLink>
            </li>
          )}

          {/* Authentication Actions */}
          <li style={{ marginTop: isOpen ? '0.6rem' : '0' }}>
            {isAuthenticated ? (
              <div className="nav-actions">
                <span className="user-badge" title={user.email}>
                  {isAdmin ? <ShieldCheck size={14} /> : <User size={14} />}
                  {user.name.split(' ')[0]}
                </span>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={handleLogout}
                  title="Logout from session"
                >
                  <LogOut size={13} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="nav-actions">
                <Link to="/login" className="btn btn-primary btn-sm" onClick={closeMenu}>
                  Login
                </Link>
              </div>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
}
