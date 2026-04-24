import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const features = [
  { path: '/patients', icon: '👥', title: 'Patient Management', desc: 'Manage patient records and profiles' },
  { path: '/vitals', icon: '💓', title: 'Vital Signs', desc: 'Monitor real-time vital signs' },
  { path: '/medications', icon: '💊', title: 'Medications', desc: 'Track prescriptions and adherence' },
  { path: '/appointments', icon: '📅', title: 'Appointments', desc: 'Schedule and manage visits' },
  { path: '/alerts', icon: '🔔', title: 'Alert Management', desc: 'View and manage health alerts' },
  { path: '/care-plans', icon: '📋', title: 'Care Plans', desc: 'Personalized treatment plans' },
  { path: '/devices', icon: '📱', title: 'Medical Devices', desc: 'Monitor connected devices' },
  { path: '/consultations', icon: '🩺', title: 'Consultations', desc: 'Remote consultation records' },
  { path: '/reports', icon: '📈', title: 'Patient Reports', desc: 'Generate and view reports' },
  { path: '/billing', icon: '💰', title: 'Billing & Insurance', desc: 'Manage billing and claims' },
  { path: '/emergency', icon: '🚨', title: 'Emergency Protocols', desc: 'Emergency response plans' },
  { path: '/ai-analytics', icon: '🤖', title: 'AI Analytics', desc: 'AI-powered health insights' },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.dashboard().then(setStats).catch(console.error);
  }, []);

  return (
    <div>
      <div className="dashboard-grid">
        <div className="stat-card" onClick={() => navigate('/patients')}>
          <div className="card-icon">👥</div>
          <div className="card-label">Total Patients</div>
          <div className="card-value">{stats?.patients?.total || '...'}</div>
          <div className="card-sub" style={{ color: 'var(--danger)' }}>
            {stats?.patients?.critical || 0} critical
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/vitals')}>
          <div className="card-icon">💓</div>
          <div className="card-label">Vitals Today</div>
          <div className="card-value">{stats?.vitals?.total || '...'}</div>
          <div className="card-sub">Last 24 hours</div>
        </div>
        <div className="stat-card" onClick={() => navigate('/alerts')}>
          <div className="card-icon">🔔</div>
          <div className="card-label">Active Alerts</div>
          <div className="card-value">{stats?.alerts?.total || '...'}</div>
          <div className="card-sub" style={{ color: 'var(--danger)' }}>
            {stats?.alerts?.critical || 0} critical
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/appointments')}>
          <div className="card-icon">📅</div>
          <div className="card-label">Upcoming Appts</div>
          <div className="card-value">{stats?.appointments?.total || '...'}</div>
          <div className="card-sub">Scheduled</div>
        </div>
        <div className="stat-card" onClick={() => navigate('/devices')}>
          <div className="card-icon">📱</div>
          <div className="card-label">Active Devices</div>
          <div className="card-value">{stats?.devices?.total || '...'}</div>
          <div className="card-sub" style={{ color: 'var(--warning)' }}>
            {stats?.devices?.low_battery || 0} low battery
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/billing')}>
          <div className="card-icon">💰</div>
          <div className="card-label">Total Revenue</div>
          <div className="card-value">${Number(stats?.billing?.total_revenue || 0).toLocaleString()}</div>
          <div className="card-sub">${Number(stats?.billing?.outstanding || 0).toLocaleString()} outstanding</div>
        </div>
      </div>

      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px', color: 'var(--gray-800)' }}>All Features</h2>
      <div className="feature-grid">
        {features.map(f => (
          <div key={f.path} className="feature-card" onClick={() => navigate(f.path)}>
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
