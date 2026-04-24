import React, { useState } from 'react';
import CrudPage from '../components/CrudPage';
import AIOutput from '../components/AIOutput';
import { api } from '../services/api';

export default function BillingPage() {
  return (
    <div>
      <BillingAIPanel />
      <CrudPage
        resource="billing"
        title="Billing Records"
        icon="💰"
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'first_name', label: 'Patient', render: (_, row) => `${row.first_name} ${row.last_name}` },
          { key: 'service_type', label: 'Service' },
          { key: 'amount', label: 'Amount', render: v => `$${Number(v).toFixed(2)}` },
          { key: 'insurance_covered', label: 'Insurance', render: v => `$${Number(v).toFixed(2)}` },
          { key: 'patient_responsibility', label: 'Patient Owes', render: v => `$${Number(v).toFixed(2)}` },
          { key: 'cpt_code', label: 'CPT' },
          { key: 'status', label: 'Status', badge: true },
        ]}
        formFields={[
          { key: 'patient_id', label: 'Patient', type: 'patient_select', required: true },
          { key: 'service_type', label: 'Service Type', required: true },
          { key: 'amount', label: 'Total Amount ($)', type: 'number', step: '0.01' },
          { key: 'insurance_covered', label: 'Insurance Covered ($)', type: 'number', step: '0.01' },
          { key: 'patient_responsibility', label: 'Patient Responsibility ($)', type: 'number', step: '0.01' },
          { key: 'billing_date', label: 'Billing Date', type: 'date' },
          { key: 'due_date', label: 'Due Date', type: 'date' },
          { key: 'status', label: 'Status', type: 'select', options: ['pending', 'paid', 'overdue', 'denied'] },
          { key: 'insurance_claim_id', label: 'Insurance Claim ID' },
          { key: 'cpt_code', label: 'CPT Code' },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ]}
      />
    </div>
  );
}

function BillingAIPanel() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);
    try {
      const data = await api.aiBilling();
      setResult(data.analysis);
    } catch (err) {
      setResult('Error: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <button className="btn btn-ai" onClick={analyze} disabled={loading}>
        {loading ? 'Analyzing...' : '🤖 AI Billing Optimization'}
      </button>
      {loading && <div className="loading" style={{ marginTop: '12px' }}><div className="spinner"></div>Analyzing billing data...</div>}
      {result && !loading && <AIOutput content={result} title="AI Billing Optimization Analysis" />}
    </div>
  );
}
