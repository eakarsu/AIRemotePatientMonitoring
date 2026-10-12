import React, { useState } from 'react';
import { api } from '../services/api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const demoEmail = import.meta.env.VITE_DEMO_EMAIL || '';
  const demoPassword = import.meta.env.VITE_DEMO_PASSWORD || '';
  const demoConfigured = Boolean(demoEmail && demoPassword);

  const handleAutoFill = () => {
    if (!demoConfigured) {
      setError('Demo credentials are not configured for this app. Use your existing account credentials.');
      return;
    }
    setError('');
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(email, password);
      onLogin(data.user, data.token);
    } catch (err) {
      setError(err.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo">🏥</div>
        <h1>RPM Platform</h1>
        <p className="subtitle">AI Remote Patient Monitoring System</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button type="button" className="btn-autofill" onClick={handleAutoFill} disabled={loading || !demoConfigured}>
            Fill Demo Credentials
          </button>
          {!demoConfigured && <p role="status" style={{ fontSize: '12px', color: '#64748b' }}>Demo credentials are unavailable in this frontend configuration.</p>}
        </div>
      </div>
    </div>
  );
}
