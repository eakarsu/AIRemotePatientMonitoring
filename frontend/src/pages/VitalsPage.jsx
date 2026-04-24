import React from 'react';
import CrudPage from '../components/CrudPage';

export default function VitalsPage() {
  return (
    <CrudPage
      resource="vitals"
      title="Vital Signs"
      icon="💓"
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'first_name', label: 'Patient', render: (_, row) => `${row.first_name} ${row.last_name}` },
        { key: 'heart_rate', label: 'HR', render: v => v ? `${v} bpm` : '-' },
        { key: 'blood_pressure_systolic', label: 'BP', render: (_, row) => row.blood_pressure_systolic ? `${row.blood_pressure_systolic}/${row.blood_pressure_diastolic}` : '-' },
        { key: 'oxygen_saturation', label: 'O2 Sat', render: v => v ? `${v}%` : '-' },
        { key: 'temperature', label: 'Temp', render: v => v ? `${v}°F` : '-' },
        { key: 'blood_glucose', label: 'Glucose', render: v => v ? `${v} mg/dL` : '-' },
        { key: 'recorded_at', label: 'Recorded', datetime: true },
      ]}
      formFields={[
        { key: 'patient_id', label: 'Patient', type: 'patient_select', required: true },
        { key: 'heart_rate', label: 'Heart Rate (bpm)', type: 'number' },
        { key: 'blood_pressure_systolic', label: 'BP Systolic', type: 'number' },
        { key: 'blood_pressure_diastolic', label: 'BP Diastolic', type: 'number' },
        { key: 'temperature', label: 'Temperature (°F)', type: 'number', step: '0.1' },
        { key: 'oxygen_saturation', label: 'O2 Saturation (%)', type: 'number', step: '0.1' },
        { key: 'respiratory_rate', label: 'Respiratory Rate', type: 'number' },
        { key: 'blood_glucose', label: 'Blood Glucose (mg/dL)', type: 'number', step: '0.1' },
        { key: 'weight', label: 'Weight (lbs)', type: 'number', step: '0.1' },
        { key: 'notes', label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
