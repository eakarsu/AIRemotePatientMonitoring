import React from 'react';
import CrudPage from '../components/CrudPage';

export default function AlertsPage() {
  return (
    <CrudPage
      resource="alerts"
      title="Alerts"
      icon="🔔"
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'first_name', label: 'Patient', render: (_, row) => `${row.first_name} ${row.last_name}` },
        { key: 'alert_type', label: 'Alert Type' },
        { key: 'severity', label: 'Severity', badge: true },
        { key: 'message', label: 'Message', render: v => v?.length > 50 ? v.slice(0, 50) + '...' : v },
        { key: 'status', label: 'Status', badge: true },
        { key: 'created_at', label: 'Created', datetime: true },
      ]}
      formFields={[
        { key: 'patient_id', label: 'Patient', type: 'patient_select', required: true },
        { key: 'alert_type', label: 'Alert Type', required: true },
        { key: 'severity', label: 'Severity', type: 'select', options: ['low', 'medium', 'high', 'critical'], required: true },
        { key: 'message', label: 'Message', type: 'textarea', required: true },
        { key: 'status', label: 'Status', type: 'select', options: ['active', 'acknowledged', 'resolved'] },
      ]}
    />
  );
}
