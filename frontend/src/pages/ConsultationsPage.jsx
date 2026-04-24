import React from 'react';
import CrudPage from '../components/CrudPage';

export default function ConsultationsPage() {
  return (
    <CrudPage
      resource="consultations"
      title="Consultations"
      icon="🩺"
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'first_name', label: 'Patient', render: (_, row) => `${row.first_name} ${row.last_name}` },
        { key: 'doctor_name', label: 'Doctor' },
        { key: 'consultation_type', label: 'Type' },
        { key: 'scheduled_date', label: 'Date', datetime: true },
        { key: 'status', label: 'Status', badge: true },
        { key: 'diagnosis', label: 'Diagnosis', render: v => v?.length > 30 ? v.slice(0, 30) + '...' : (v || '-') },
      ]}
      formFields={[
        { key: 'patient_id', label: 'Patient', type: 'patient_select', required: true },
        { key: 'doctor_name', label: 'Doctor Name' },
        { key: 'consultation_type', label: 'Type', type: 'select', options: ['In-Person', 'Telehealth', 'Phone'] },
        { key: 'scheduled_date', label: 'Date', type: 'datetime-local' },
        { key: 'duration_minutes', label: 'Duration (min)', type: 'number' },
        { key: 'status', label: 'Status', type: 'select', options: ['scheduled', 'completed', 'cancelled'] },
        { key: 'diagnosis', label: 'Diagnosis', type: 'textarea' },
        { key: 'treatment_plan', label: 'Treatment Plan', type: 'textarea' },
        { key: 'follow_up_date', label: 'Follow-up Date', type: 'date' },
        { key: 'notes', label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
