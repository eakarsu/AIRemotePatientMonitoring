import React from 'react';
import CrudPage from '../components/CrudPage';

export default function EmergencyPage() {
  return (
    <CrudPage
      resource="emergency-protocols"
      title="Emergency Protocols"
      icon="🚨"
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'first_name', label: 'Patient', render: (_, row) => `${row.first_name} ${row.last_name}` },
        { key: 'protocol_name', label: 'Protocol' },
        { key: 'severity', label: 'Severity', badge: true },
        { key: 'trigger_condition', label: 'Trigger', render: v => v?.length > 40 ? v.slice(0, 40) + '...' : v },
        { key: 'status', label: 'Status', badge: true },
        { key: 'hospital_preference', label: 'Hospital' },
      ]}
      formFields={[
        { key: 'patient_id', label: 'Patient', type: 'patient_select', required: true },
        { key: 'protocol_name', label: 'Protocol Name', required: true },
        { key: 'trigger_condition', label: 'Trigger Condition', type: 'textarea' },
        { key: 'severity', label: 'Severity', type: 'select', options: ['low', 'medium', 'high', 'critical'] },
        { key: 'steps', label: 'Emergency Steps', type: 'textarea' },
        { key: 'emergency_contacts', label: 'Emergency Contacts', type: 'textarea' },
        { key: 'medications_to_administer', label: 'Medications to Administer', type: 'textarea' },
        { key: 'hospital_preference', label: 'Preferred Hospital' },
        { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] },
        { key: 'notes', label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
