import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import AIOutput from '../components/AIOutput';

export default function AIAnalyticsPage() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [activeType, setActiveType] = useState('');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    api.getAll('patients').then(setPatients).catch(console.error);
  }, []);

  const runAnalysis = async (type) => {
    if (!selectedPatient && type !== 'billing') {
      alert('Please select a patient first');
      return;
    }
    setLoading(true);
    setActiveType(type);
    try {
      let result;
      switch (type) {
        case 'health-risk':
          result = await api.aiHealthRisk(selectedPatient);
          break;
        case 'symptom':
          if (!symptoms.trim()) { alert('Please enter symptoms'); setLoading(false); return; }
          result = await api.aiSymptomAnalysis(selectedPatient, symptoms);
          break;
        case 'predictive':
          result = await api.aiPredictive(selectedPatient);
          break;
        case 'treatment':
          result = await api.aiTreatment(selectedPatient);
          break;
        case 'care-plan':
          result = await api.aiCarePlan(selectedPatient);
          break;
        case 'billing':
          result = await api.aiBilling();
          break;
      }
      setAiResult(result.analysis);
    } catch (err) {
      setAiResult('Error: ' + err.message);
    }
    setLoading(false);
  };

  const loadHistory = async () => {
    try {
      const data = await api.aiHistory();
      setHistory(data);
      setShowHistory(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const typeLabels = {
    'health-risk': 'Health Risk Assessment',
    'symptom': 'Symptom Analysis',
    'predictive': 'Predictive Analytics',
    'treatment': 'Treatment Recommendations',
    'care-plan': 'AI Care Plan Generation',
    'billing': 'Billing Optimization',
  };

  return (
    <div>
      <div className="detail-card" style={{ marginBottom: '24px' }}>
        <div className="detail-header">
          <h2>🤖 AI-Powered Analytics</h2>
          <button className="btn btn-secondary btn-sm" onClick={loadHistory}>View History</button>
        </div>
        <div className="detail-body">
          <div className="form-row" style={{ marginBottom: '20px' }}>
            <div className="form-group">
              <label>Select Patient</label>
              <select
                className="form-control"
                value={selectedPatient}
                onChange={e => setSelectedPatient(e.target.value)}
              >
                <option value="">Choose a patient...</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.first_name} {p.last_name} - {p.medical_history?.slice(0, 40) || 'No history'}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Symptoms (for Symptom Analysis)</label>
              <input
                className="form-control"
                value={symptoms}
                onChange={e => setSymptoms(e.target.value)}
                placeholder="e.g., chest pain, shortness of breath, fatigue..."
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <button className="btn btn-ai" onClick={() => runAnalysis('health-risk')} disabled={loading}>
              Health Risk Assessment
            </button>
            <button className="btn btn-ai" onClick={() => runAnalysis('symptom')} disabled={loading}>
              Symptom Analysis
            </button>
            <button className="btn btn-ai" onClick={() => runAnalysis('predictive')} disabled={loading}>
              Predictive Analytics
            </button>
            <button className="btn btn-ai" onClick={() => runAnalysis('treatment')} disabled={loading}>
              Treatment Recommendations
            </button>
            <button className="btn btn-ai" onClick={() => runAnalysis('care-plan')} disabled={loading}>
              Generate Care Plan
            </button>
            <button className="btn btn-ai" onClick={() => runAnalysis('billing')} disabled={loading}>
              Billing Optimization
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="loading" style={{ padding: '40px' }}>
          <div className="spinner"></div>
          AI is processing your request...
        </div>
      )}

      {aiResult && !loading && (
        <AIOutput content={aiResult} title={typeLabels[activeType] || 'AI Analysis'} />
      )}

      {showHistory && (
        <div className="detail-card" style={{ marginTop: '24px' }}>
          <div className="detail-header">
            <h2>Analysis History</h2>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowHistory(false)}>Close</button>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Patient</th>
                  <th>Type</th>
                  <th>Model</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map(h => (
                  <tr key={h.id}>
                    <td>{new Date(h.created_at).toLocaleString()}</td>
                    <td>{h.first_name ? `${h.first_name} ${h.last_name}` : 'System'}</td>
                    <td><span className="badge badge-medium">{h.analysis_type}</span></td>
                    <td>{h.model_used}</td>
                    <td>
                      <button className="btn btn-sm btn-outline" onClick={() => { setAiResult(h.result); setActiveType(h.analysis_type); setShowHistory(false); }}>
                        View Result
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
