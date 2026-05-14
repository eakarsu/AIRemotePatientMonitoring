import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import AIOutput from '../components/AIOutput';

export default function MedicationOptimizationPage() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [conditions, setConditions] = useState('');
  const [goals, setGoals] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getAll('patients', { limit: 200 })
      .then(r => setPatients(Array.isArray(r) ? r : (r?.data || [])))
      .catch(e => console.error(e));
  }, []);

  const run = async () => {
    if (!selectedPatient) {
      setError('Please select a patient.');
      return;
    }
    setLoading(true); setError(''); setResult(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/ai/medication-optimization/${selectedPatient}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          conditions: conditions
            ? conditions.split(',').map(s => s.trim()).filter(Boolean)
            : undefined,
          goals
        })
      });
      if (res.status === 503) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'AI provider not configured. Set OPENROUTER_API_KEY on the server to enable medication optimization.');
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setResult(data?.analysis || data);
    } catch (err) {
      setError(err.message || 'Optimization failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="detail-card" style={{ marginBottom: 24 }}>
        <div className="detail-header"><h2>💊 Medication Regimen Optimization</h2></div>
        <div className="detail-body">
          <p style={{ color: '#6b7280', marginBottom: 16 }}>
            Clinician decision-support: review for appropriateness, interactions, deprescribing
            candidates, and cost optimization. Physician approval required before any changes.
          </p>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Patient</label>
            <select className="form-control" value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
              <option value="">Choose a patient...</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Active conditions (comma-separated, optional)</label>
            <input
              className="form-control"
              value={conditions}
              onChange={e => setConditions(e.target.value)}
              placeholder="e.g., heart_failure, type_2_diabetes, ckd_stage_3"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Clinician goals (optional)</label>
            <textarea
              className="form-control"
              rows={3}
              value={goals}
              onChange={e => setGoals(e.target.value)}
              placeholder="e.g., reduce polypharmacy burden, improve renal safety, lower out-of-pocket cost..."
            />
          </div>

          {error && <div className="alert alert-danger" style={{ marginBottom: 12 }}>{error}</div>}

          <button className="btn btn-ai" onClick={run} disabled={loading}>
            {loading ? 'Reviewing regimen...' : 'Run Medication Optimization'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading" style={{ padding: 40 }}>
          <div className="spinner"></div>AI is processing...
        </div>
      )}

      {result && !loading && (
        <AIOutput content={result} title="Medication Optimization" />
      )}
    </div>
  );
}
