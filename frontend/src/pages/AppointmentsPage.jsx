import React from 'react';
import CrudPage from '../components/CrudPage';

export default function AppointmentsPage() {
  return (
    <CrudPage
      resource="appointments"
      title="Appointments"
      icon="📅"
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'first_name', label: 'Patient', render: (_, row) => `${row.first_name} ${row.last_name}` },
        { key: 'doctor_name', label: 'Doctor' },
        { key: 'appointment_type', label: 'Type' },
        { key: 'scheduled_date', label: 'Date', datetime: true },
        { key: 'duration_minutes', label: 'Duration', render: v => `${v} min` },
        { key: 'status', label: 'Status', badge: true },
        { key: 'location', label: 'Location' },
      ]}
      formFields={[
        { key: 'patient_id', label: 'Patient', type: 'patient_select', required: true },
        { key: 'doctor_name', label: 'Doctor Name', required: true },
        { key: 'appointment_type', label: 'Type', type: 'select', options: ['Routine', 'Follow-up', 'Urgent', 'Specialist', 'Telehealth'] },
        { key: 'scheduled_date', label: 'Scheduled Date', type: 'datetime-local', required: true },
        { key: 'duration_minutes', label: 'Duration (minutes)', type: 'number' },
        { key: 'status', label: 'Status', type: 'select', options: ['scheduled', 'completed', 'cancelled', 'no-show'] },
        { key: 'location', label: 'Location' },
        { key: 'notes', label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
