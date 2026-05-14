import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import AIOutput from '../components/AIOutput';

export default function MentalHealthScreeningPage() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [phq9, setPhq9] = useState('');
  const [gad7, setGad7] = useState('');
  const [notes, setNotes] = useState('');
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
      const res = await fetch(`/api/ai/mental-health-screening/${selectedPatient}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          phq9Score: phq9 === '' ? undefined : Number(phq9),
          gad7Score: gad7 === '' ? undefined : Number(gad7),
          notes
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setResult(data?.analysis || data);
    } catch (err) {
      setError(err.message || 'Screening failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="detail-card" style={{ marginBottom: 24 }}>
        <div className="detail-header"><h2>🧠 Mental Health Screening</h2></div>
        <div className="detail-body">
          <p style={{ color: '#6b7280', marginBottom: 16 }}>
            PHQ-9 / GAD-7 interpretation (no diagnosis). Includes suicide-risk flag and recommended follow-up.
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

          <div className="form-row" style={{ marginBottom: 16 }}>
            <div className="form-group">
              <label>PHQ-9 score (0-27)</label>
              <input
                type="number" min="0" max="27"
                className="form-control"
                value={phq9}
                onChange={e => setPhq9(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>GAD-7 score (0-21)</label>
              <input
                type="number" min="0" max="21"
                className="form-control"
                value={gad7}
                onChange={e => setGad7(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Clinical notes (optional)</label>
            <textarea
              className="form-control"
              rows={4}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Recent stressors, medications, prior history, etc..."
            />
          </div>

          {error && <div className="alert alert-danger" style={{ marginBottom: 12 }}>{error}</div>}

          <button className="btn btn-ai" onClick={run} disabled={loading}>
            {loading ? 'Screening...' : 'Run Mental Health Screening'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading" style={{ padding: 40 }}>
          <div className="spinner"></div>AI is processing...
        </div>
      )}

      {result && !loading && (
        <AIOutput content={result} title="Mental Health Screening" />
      )}
    </div>
  );
}
