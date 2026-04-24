import React from 'react';
import CrudPage from '../components/CrudPage';

export default function DevicesPage() {
  return (
    <CrudPage
      resource="devices"
      title="Medical Devices"
      icon="📱"
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'first_name', label: 'Patient', render: (_, row) => `${row.first_name} ${row.last_name}` },
        { key: 'device_name', label: 'Device' },
        { key: 'device_type', label: 'Type' },
        { key: 'manufacturer', label: 'Manufacturer' },
        { key: 'status', label: 'Status', badge: true },
        { key: 'battery_level', label: 'Battery', render: v => {
          const color = v > 50 ? 'var(--success)' : v > 20 ? 'var(--warning)' : 'var(--danger)';
          return <span style={{ color, fontWeight: 600 }}>{v}%</span>;
        }},
        { key: 'last_reading', label: 'Last Reading', datetime: true },
      ]}
      formFields={[
        { key: 'patient_id', label: 'Patient', type: 'patient_select', required: true },
        { key: 'device_name', label: 'Device Name', required: true },
        { key: 'device_type', label: 'Device Type', type: 'select', options: ['Blood Glucose Monitor', 'Blood Pressure', 'Weight Scale', 'Oxygen Monitor', 'Cardiac Monitor', 'Medication Delivery', 'Pulmonary Function', 'Safety Device', 'Fitness Device', 'Neurological'] },
        { key: 'serial_number', label: 'Serial Number' },
        { key: 'manufacturer', label: 'Manufacturer' },
        { key: 'model', label: 'Model' },
        { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive', 'maintenance'] },
        { key: 'battery_level', label: 'Battery Level (%)', type: 'number' },
        { key: 'firmware_version', label: 'Firmware Version' },
        { key: 'assigned_date', label: 'Assigned Date', type: 'date' },
        { key: 'notes', label: 'Notes', type: 'textarea' },
      ]}
    />
  );
}
