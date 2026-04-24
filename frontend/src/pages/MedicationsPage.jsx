import React from 'react';
import CrudPage from '../components/CrudPage';

export default function MedicationsPage() {
  return (
    <CrudPage
      resource="medications"
      title="Medications"
      icon="💊"
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'first_name', label: 'Patient', render: (_, row) => `${row.first_name} ${row.last_name}` },
        { key: 'name', label: 'Medication' },
        { key: 'dosage', label: 'Dosage' },
        { key: 'frequency', label: 'Frequency' },
        { key: 'route', label: 'Route' },
        { key: 'status', label: 'Status', badge: true },
        { key: 'prescribing_doctor', label: 'Prescriber' },
      ]}
      formFields={[
        { key: 'patient_id', label: 'Patient', type: 'patient_select', required: true },
        { key: 'name', label: 'Medication Name', required: true },
        { key: 'dosage', label: 'Dosage' },
        { key: 'frequency', label: 'Frequency' },
        { key: 'route', label: 'Route', type: 'select', options: ['Oral', 'Inhaled', 'Subcutaneous', 'IV infusion', 'Topical', 'Intramuscular'] },
        { key: 'start_date', label: 'Start Date', type: 'date' },
        { key: 'end_date', label: 'End Date', type: 'date' },
        { key: 'prescribing_doctor', label: 'Prescribing Doctor' },
        { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive', 'discontinued'] },
        { key: 'side_effects', label: 'Side Effects', type: 'textarea' },
        { key: 'notes', label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
