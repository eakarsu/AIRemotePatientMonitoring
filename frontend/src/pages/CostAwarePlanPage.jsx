import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import AIOutput from '../components/AIOutput';

export default function CostAwarePlanPage() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [formularyContext, setFormularyContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getAll('patients', { limit: 200 })
      .then(r => setPatients(Array.isArray(r) ? r : (r?.data || [])))
      .catch(e => console.error(e));
  }, []);

  const run = async () => {
    if (!selectedPatient) { setError('Please select a patient.'); return; }
    if (!diagnosis) { setError('Please enter a diagnosis.'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/ai/cost-aware-plan/${selectedPatient}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ diagnosis, formularyContext })
      });
      if (res.status === 503) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'AI provider not configured. Set OPENROUTER_API_KEY on the server to enable cost-aware planning.');
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setResult(data?.analysis || data);
    } catch (err) {
      setError(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="detail-card" style={{ marginBottom: 24 }}>
        <div className="detail-header"><h2>💵 Cost-Aware Treatment Plan</h2></div>
        <div className="detail-body">
          <p style={{ color: '#6b7280', marginBottom: 16 }}>
            Build tiered treatment options that balance clinical effectiveness with patient out-of-pocket cost and adherence risk.
          </p>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Patient</label>
            <select className="form-control" value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
              <option value="">Choose a patient...</option>
              {patients.map(p => (<option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Diagnosis</label>
            <input className="form-control" value={diagnosis} onChange={e => setDiagnosis(e.target.value)}
              placeholder="e.g., type 2 diabetes, hypertension stage 2" />
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Formulary / insurance context (optional)</label>
            <textarea className="form-control" rows={3} value={formularyContext} onChange={e => setFormularyContext(e.target.value)}
              placeholder="e.g., Medicaid formulary, $40 generic copay tier, no specialty drug coverage" />
          </div>
          {error && <div className="alert alert-danger" style={{ marginBottom: 12 }}>{error}</div>}
          <button className="btn btn-ai" onClick={run} disabled={loading}>
            {loading ? 'Building tiered plan...' : 'Generate Cost-Aware Plan'}
          </button>
        </div>
      </div>
      {loading && (<div className="loading" style={{ padding: 40 }}><div className="spinner"></div>AI is processing...</div>)}
      {result && !loading && (<AIOutput content={result} title="Cost-Aware Treatment Plan" />)}
    </div>
  );
}
