import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import AIOutput from '../components/AIOutput';

export default function SharedDecisionPage() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [decisionTopic, setDecisionTopic] = useState('');
  const [values, setValues] = useState('');
  const [constraints, setConstraints] = useState('');
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
    if (!decisionTopic) { setError('Please describe the decision topic.'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/ai/shared-decision/${selectedPatient}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ decisionTopic, values, constraints })
      });
      if (res.status === 503) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'AI provider not configured. Set OPENROUTER_API_KEY on the server to enable shared decision-making.');
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
        <div className="detail-header"><h2>🤝 Shared Decision-Making Aid</h2></div>
        <div className="detail-body">
          <p style={{ color: '#6b7280', marginBottom: 16 }}>
            Generate a balanced option grid that helps patients and clinicians deliberate trade-offs neutrally.
          </p>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Patient</label>
            <select className="form-control" value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
              <option value="">Choose a patient...</option>
              {patients.map(p => (<option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Decision topic</label>
            <input className="form-control" value={decisionTopic} onChange={e => setDecisionTopic(e.target.value)}
              placeholder="e.g., anticoagulation in atrial fibrillation; dialysis modality choice" />
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Patient values (optional)</label>
            <textarea className="form-control" rows={2} value={values} onChange={e => setValues(e.target.value)}
              placeholder="e.g., wants to keep traveling, dislikes daily injections, fears bleeding" />
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Constraints (optional)</label>
            <input className="form-control" value={constraints} onChange={e => setConstraints(e.target.value)}
              placeholder="e.g., uninsured, rural area, language other than English" />
          </div>
          {error && <div className="alert alert-danger" style={{ marginBottom: 12 }}>{error}</div>}
          <button className="btn btn-ai" onClick={run} disabled={loading}>
            {loading ? 'Building option grid...' : 'Generate Decision Aid'}
          </button>
        </div>
      </div>
      {loading && (<div className="loading" style={{ padding: 40 }}><div className="spinner"></div>AI is processing...</div>)}
      {result && !loading && (<AIOutput content={result} title="Shared Decision-Making Aid" />)}
    </div>
  );
}
