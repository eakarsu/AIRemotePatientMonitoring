import React, { useState } from 'react';
import { api } from '../services/api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAutoFill = () => {
    setEmail('admin@rpm.com');
    setPassword('admin123');
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
          <button className="btn-autofill" onClick={handleAutoFill}>
            Auto-fill Demo Credentials
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: '#9ca3af' }}>
          Demo: admin@rpm.com / admin123
        </p>
      </div>
    </div>
  );
}
