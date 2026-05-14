import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import AIOutput from '../components/AIOutput';

export default function SocialDeterminantsPage() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
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
      const res = await fetch(`/api/ai/social-determinants/${selectedPatient}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ notes })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setResult(data?.analysis || data);
    } catch (err) {
      setError(err.message || 'Assessment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="detail-card" style={{ marginBottom: 24 }}>
        <div className="detail-header"><h2>🏘️ Social Determinants Assessment</h2></div>
        <div className="detail-body">
          <p style={{ color: '#6b7280', marginBottom: 16 }}>
            PRAPARE-style screening: housing, food, transportation, social support, employment — with social prescriptions.
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
            <label>Clinician / intake notes (optional)</label>
            <textarea
              className="form-control"
              rows={5}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Anything relevant from intake or recent visits..."
            />
          </div>

          {error && <div className="alert alert-danger" style={{ marginBottom: 12 }}>{error}</div>}

          <button className="btn btn-ai" onClick={run} disabled={loading}>
            {loading ? 'Assessing...' : 'Run SDoH Assessment'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading" style={{ padding: 40 }}>
          <div className="spinner"></div>AI is processing...
        </div>
      )}

      {result && !loading && (
        <AIOutput content={result} title="Social Determinants" />
      )}
    </div>
  );
}
