import React from 'react';
import CrudPage from '../components/CrudPage';

export default function CarePlansPage() {
  return (
    <CrudPage
      resource="care-plans"
      title="Care Plans"
      icon="📋"
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'first_name', label: 'Patient', render: (_, row) => `${row.first_name} ${row.last_name}` },
        { key: 'title', label: 'Plan Title' },
        { key: 'status', label: 'Status', badge: true },
        { key: 'created_by', label: 'Created By' },
        { key: 'start_date', label: 'Start', date: true },
        { key: 'end_date', label: 'End', date: true },
      ]}
      formFields={[
        { key: 'patient_id', label: 'Patient', type: 'patient_select', required: true },
        { key: 'title', label: 'Plan Title', required: true },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'goals', label: 'Goals', type: 'textarea' },
        { key: 'interventions', label: 'Interventions', type: 'textarea' },
        { key: 'start_date', label: 'Start Date', type: 'date' },
        { key: 'end_date', label: 'End Date', type: 'date' },
        { key: 'status', label: 'Status', type: 'select', options: ['active', 'completed', 'inactive'] },
        { key: 'created_by', label: 'Created By' },
      ]}
    />
  );
}
