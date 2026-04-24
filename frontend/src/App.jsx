import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PatientsPage from './pages/PatientsPage';
import VitalsPage from './pages/VitalsPage';
import MedicationsPage from './pages/MedicationsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import AlertsPage from './pages/AlertsPage';
import CarePlansPage from './pages/CarePlansPage';
import DevicesPage from './pages/DevicesPage';
import ConsultationsPage from './pages/ConsultationsPage';
import ReportsPage from './pages/ReportsPage';
import BillingPage from './pages/BillingPage';
import EmergencyPage from './pages/EmergencyPage';
import AIAnalyticsPage from './pages/AIAnalyticsPage';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) return <div className="loading"><div className="spinner"></div>Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />} />
        <Route path="/*" element={
          user ? (
            <Layout user={user} onLogout={handleLogout}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/patients" element={<PatientsPage />} />
                <Route path="/vitals" element={<VitalsPage />} />
                <Route path="/medications" element={<MedicationsPage />} />
                <Route path="/appointments" element={<AppointmentsPage />} />
                <Route path="/alerts" element={<AlertsPage />} />
                <Route path="/care-plans" element={<CarePlansPage />} />
                <Route path="/devices" element={<DevicesPage />} />
                <Route path="/consultations" element={<ConsultationsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/billing" element={<BillingPage />} />
                <Route path="/emergency" element={<EmergencyPage />} />
                <Route path="/ai-analytics" element={<AIAnalyticsPage />} />
              </Routes>
            </Layout>
          ) : <Navigate to="/login" />
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
