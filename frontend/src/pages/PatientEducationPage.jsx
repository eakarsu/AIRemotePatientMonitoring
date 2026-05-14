import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import AIOutput from '../components/AIOutput';

export default function PatientEducationPage() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [topic, setTopic] = useState('hypertension self-care');
  const [readingLevel, setReadingLevel] = useState('8th_grade');
  const [language, setLanguage] = useState('en');
  const [format, setFormat] = useState('bulleted');
  const [concerns, setConcerns] = useState('');
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
      const res = await fetch(`/api/ai/patient-education/${selectedPatient}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ topic, readingLevel, language, format, concerns })
      });
      if (res.status === 503) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'AI provider not configured. Set OPENROUTER_API_KEY on the server to enable education content generation.');
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setResult(data?.analysis || data);
    } catch (err) {
      setError(err.message || 'Education generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="detail-card" style={{ marginBottom: 24 }}>
        <div className="detail-header"><h2>📚 Patient Education Customizer</h2></div>
        <div className="detail-body">
          <p style={{ color: '#6b7280', marginBottom: 16 }}>
            Generate education content adapted to the patient's reading level and primary
            language. Plain-language summary, action steps, warning signs, and questions
            to ask their clinician.
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
            <label>Topic</label>
            <input
              className="form-control"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g., heart failure self-care, post-discharge medications, low-sodium diet"
            />
          </div>

          <div className="form-row" style={{ marginBottom: 16 }}>
            <div className="form-group">
              <label>Reading level</label>
              <select className="form-control" value={readingLevel} onChange={e => setReadingLevel(e.target.value)}>
                <option value="5th_grade">5th grade</option>
                <option value="8th_grade">8th grade</option>
                <option value="adult">Adult</option>
              </select>
            </div>
            <div className="form-group">
              <label>Language</label>
              <select className="form-control" value={language} onChange={e => setLanguage(e.target.value)}>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="zh">Chinese</option>
                <option value="vi">Vietnamese</option>
                <option value="ar">Arabic</option>
              </select>
            </div>
            <div className="form-group">
              <label>Format</label>
              <select className="form-control" value={format} onChange={e => setFormat(e.target.value)}>
                <option value="bulleted">Bulleted</option>
                <option value="narrative">Narrative</option>
                <option value="qa">Q &amp; A</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Specific concerns (optional)</label>
            <textarea
              className="form-control"
              rows={3}
              value={concerns}
              onChange={e => setConcerns(e.target.value)}
              placeholder="e.g., patient has limited refrigeration access, vision impairment, recently widowed..."
            />
          </div>

          {error && <div className="alert alert-danger" style={{ marginBottom: 12 }}>{error}</div>}

          <button className="btn btn-ai" onClick={run} disabled={loading}>
            {loading ? 'Generating education...' : 'Generate Patient Education'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading" style={{ padding: 40 }}>
          <div className="spinner"></div>AI is processing...
        </div>
      )}

      {result && !loading && (
        <AIOutput content={result} title="Patient Education" />
      )}
    </div>
  );
}
