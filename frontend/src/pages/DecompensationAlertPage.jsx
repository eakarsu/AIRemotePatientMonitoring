import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import AIOutput from '../components/AIOutput';

export default function DecompensationAlertPage() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [condition, setCondition] = useState('heart_failure');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getAll('patients', { limit: 200 })
      .then(r => setPatients(Array.isArray(r) ? r : (r?.data || [])))
      .catch(e => console.error(e));
  }, []);

  const runPrediction = async () => {
    if (!selectedPatient) {
      setError('Please select a patient.');
      return;
    }
    setLoading(true); setError(''); setResult(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/ai/decompensation-alert/${selectedPatient}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ condition })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setResult(data?.analysis || data);
    } catch (err) {
      setError(err.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="detail-card" style={{ marginBottom: 24 }}>
        <div className="detail-header"><h2>🚨 Decompensation Alert</h2></div>
        <div className="detail-body">
          <p style={{ color: '#6b7280', marginBottom: 16 }}>
            Predict 48–72h risk of clinical decompensation (HF / COPD / sepsis) using last 50 vitals.
          </p>

          <div className="form-row" style={{ marginBottom: 20 }}>
            <div className="form-group">
              <label>Patient</label>
              <select className="form-control" value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
                <option value="">Choose a patient...</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Condition focus</label>
              <select className="form-control" value={condition} onChange={e => setCondition(e.target.value)}>
                <option value="heart_failure">Heart Failure</option>
                <option value="copd">COPD</option>
                <option value="sepsis">Sepsis</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>

          {error && <div className="alert alert-danger" style={{ marginBottom: 12 }}>{error}</div>}

          <button className="btn btn-ai" onClick={runPrediction} disabled={loading}>
            {loading ? 'Analyzing...' : 'Run Decompensation Prediction'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading" style={{ padding: 40 }}>
          <div className="spinner"></div>AI is processing...
        </div>
      )}

      {result && !loading && (
        <AIOutput content={result} title="Decompensation Risk" />
      )}
    </div>
  );
}
