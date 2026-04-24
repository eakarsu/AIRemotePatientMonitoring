import React, { useState } from 'react';
import CrudPage from '../components/CrudPage';
import AIOutput from '../components/AIOutput';
import { api } from '../services/api';

export default function PatientsPage() {
  return (
    <CrudPage
      resource="patients"
      title="Patients"
      icon="👥"
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'first_name', label: 'First Name' },
        { key: 'last_name', label: 'Last Name' },
        { key: 'phone', label: 'Phone' },
        { key: 'gender', label: 'Gender' },
        { key: 'status', label: 'Status', badge: true },
        { key: 'assigned_doctor', label: 'Doctor' },
      ]}
      formFields={[
        { key: 'first_name', label: 'First Name', required: true },
        { key: 'last_name', label: 'Last Name', required: true },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'phone', label: 'Phone' },
        { key: 'date_of_birth', label: 'Date of Birth', type: 'date' },
        { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
        { key: 'address', label: 'Address', type: 'textarea' },
        { key: 'emergency_contact', label: 'Emergency Contact' },
        { key: 'insurance_provider', label: 'Insurance Provider' },
        { key: 'insurance_id', label: 'Insurance ID' },
        { key: 'medical_history', label: 'Medical History', type: 'textarea' },
        { key: 'status', label: 'Status', type: 'select', options: ['active', 'critical', 'monitoring', 'inactive'] },
        { key: 'assigned_doctor', label: 'Assigned Doctor' },
      ]}
      aiFeature={(patient) => <PatientAI patient={patient} />}
    />
  );
}

function PatientAI({ patient }) {
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeAI, setActiveAI] = useState(null);

  const runAI = async (type) => {
    setLoading(true);
    setActiveAI(type);
    try {
      let result;
      if (type === 'risk') result = await api.aiHealthRisk(patient.id);
      else if (type === 'predictive') result = await api.aiPredictive(patient.id);
      else if (type === 'treatment') result = await api.aiTreatment(patient.id);
      else if (type === 'care-plan') result = await api.aiCarePlan(patient.id);
      setAiResult(result.analysis);
    } catch (err) {
      setAiResult('Error: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="detail-card">
      <div className="detail-header">
        <h2>🤖 AI Analysis</h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn btn-ai btn-sm" onClick={() => runAI('risk')} disabled={loading}>
            Health Risk Assessment
          </button>
          <button className="btn btn-ai btn-sm" onClick={() => runAI('predictive')} disabled={loading}>
            Predictive Analytics
          </button>
          <button className="btn btn-ai btn-sm" onClick={() => runAI('treatment')} disabled={loading}>
            Treatment Recommendations
          </button>
          <button className="btn btn-ai btn-sm" onClick={() => runAI('care-plan')} disabled={loading}>
            Generate Care Plan
          </button>
        </div>
      </div>
      <div className="detail-body">
        {loading && <div className="loading"><div className="spinner"></div>AI is analyzing patient data...</div>}
        {aiResult && !loading && (
          <AIOutput content={aiResult} title={`AI ${activeAI} Analysis for ${patient.first_name} ${patient.last_name}`} />
        )}
      </div>
    </div>
  );
}
