import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-content">
        <p>&copy; 2026 Riyaa Bridal Makeover Beauty Parlor. All rights reserved.</p>

        <div className="footer-links">
          <Link to="/">Home</Link>
          <Link to="/services">Services</Link>
          <Link to="/about">About</Link>
          <Link to="/book">Appointments</Link>
          <Link to="/admin" style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>
            Beautician Portal
          </Link>
        </div>

        <div className="social-links">
          <a href="#" aria-label="Facebook">
            Fb
          </a>
          <a href="#" aria-label="Instagram">
            Ig
          </a>
          <a href="#" aria-label="Threads">
            Th
          </a>
        </div>
      </div>
    </footer>
  );
}
