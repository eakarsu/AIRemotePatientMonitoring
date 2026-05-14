import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import AIOutput from '../components/AIOutput';

export default function CaregiverCoachingPage() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [caregiverRelationship, setCaregiverRelationship] = useState('');
  const [livingSituation, setLivingSituation] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState('');
  const [focusAreas, setFocusAreas] = useState('');
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
    setLoading(true); setError(''); setResult(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/ai/caregiver-coaching/${selectedPatient}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          caregiverContext: {
            relationship: caregiverRelationship || undefined,
            livingSituation: livingSituation || undefined,
            hoursPerWeek: hoursPerWeek || undefined
          },
          focusAreas: focusAreas ? focusAreas.split(',').map(s => s.trim()).filter(Boolean) : []
        })
      });
      if (res.status === 503) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'AI provider not configured. Set OPENROUTER_API_KEY on the server to enable caregiver coaching.');
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
        <div className="detail-header"><h2>🫶 Caregiver Coaching</h2></div>
        <div className="detail-body">
          <p style={{ color: '#6b7280', marginBottom: 16 }}>
            Practical, compassionate coaching for family/informal caregivers — skills, self-care, escalation criteria.
          </p>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Patient</label>
            <select className="form-control" value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
              <option value="">Choose a patient...</option>
              {patients.map(p => (<option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Caregiver relationship (optional)</label>
            <input className="form-control" value={caregiverRelationship} onChange={e => setCaregiverRelationship(e.target.value)}
              placeholder="e.g., adult daughter, spouse, neighbor" />
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Living situation (optional)</label>
            <input className="form-control" value={livingSituation} onChange={e => setLivingSituation(e.target.value)}
              placeholder="e.g., lives with patient, lives across town, long-distance" />
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Hours/week of caregiving (optional)</label>
            <input className="form-control" value={hoursPerWeek} onChange={e => setHoursPerWeek(e.target.value)}
              placeholder="e.g., 20" />
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Focus areas (comma-separated, optional)</label>
            <input className="form-control" value={focusAreas} onChange={e => setFocusAreas(e.target.value)}
              placeholder="e.g., medication management, fall prevention, dementia behaviors" />
          </div>
          {error && <div className="alert alert-danger" style={{ marginBottom: 12 }}>{error}</div>}
          <button className="btn btn-ai" onClick={run} disabled={loading}>
            {loading ? 'Generating coaching plan...' : 'Generate Caregiver Coaching'}
          </button>
        </div>
      </div>
      {loading && (<div className="loading" style={{ padding: 40 }}><div className="spinner"></div>AI is processing...</div>)}
      {result && !loading && (<AIOutput content={result} title="Caregiver Coaching" />)}
    </div>
  );
}
