import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, Shield, User } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      const res = await login(email, password);
      if (res.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate(from === '/' ? '/my-appointments' : from);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const autofillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <main className="section page-top-space">
      <div className="container">
        <div className="auth-wrapper card">
          <div className="auth-tabs">
            <div className="auth-tab active">Login</div>
            <Link to="/register" className="auth-tab">
              Register
            </Link>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2>Welcome Back</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
              Sign in to manage appointments and records.
            </p>
          </div>

          {error && (
            <div className="alert alert-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="contact-form" style={{ marginTop: '0' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* College Demo Credentials Helper */}
          <div
            style={{
              marginTop: '1.8rem',
              padding: '1rem',
              background: 'var(--surface-soft)',
              border: '1px solid var(--line)',
              borderRadius: '0.85rem',
              fontSize: '0.85rem',
            }}
          >
            <p style={{ fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>
              Quick Demo Accounts (PBL Testing):
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                onClick={() => autofillDemo('admin@riyaa.com', 'admin123')}
              >
                <Shield size={13} />
                <strong>Admin / Beautician:</strong> admin@riyaa.com (admin123)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                onClick={() => autofillDemo('priya@example.com', 'priya123')}
              >
                <User size={13} />
                <strong>Customer:</strong> priya@example.com (priya123)
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
