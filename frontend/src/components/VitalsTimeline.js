import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function VitalsTimeline() {
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState('');
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const load = (patientId) => {
    setLoading(true);
    setError(null);
    const url = patientId
      ? `/api/custom-views/vitals-timeline?patient_id=${patientId}`
      : '/api/custom-views/vitals-timeline';
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (!r.ok) throw new Error(`Request failed: ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data.patients)) setPatients(data.patients);
        if (data.patient_id) setSelected(String(data.patient_id));
        setSeries(Array.isArray(data.series) ? data.series : []);
      })
      .catch((e) => setError(e.message || 'Failed to load timeline'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const v = e.target.value;
    setSelected(v);
    load(v);
  };

  return (
    <div
      data-testid="vitals-timeline"
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 18, color: '#111827' }}>Patient Vitals Timeline</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#6b7280' }}>
            Heart rate, blood pressure, SpO2 and glucose over time
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label htmlFor="vt-patient" style={{ fontSize: 13, color: '#374151' }}>Patient:</label>
          <select
            id="vt-patient"
            value={selected}
            onChange={handleChange}
            style={{
              padding: '6px 10px',
              borderRadius: 8,
              border: '1px solid #d1d5db',
              minWidth: 220,
              fontSize: 14,
            }}
          >
            {patients.length === 0 && <option value="">Loading patients...</option>}
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div style={{ color: '#b91c1c', background: '#fee2e2', padding: 10, borderRadius: 6, marginBottom: 12 }}>
          {error}
        </div>
      )}

      <div style={{ width: '100%', height: 360 }}>
        {loading && series.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6b7280' }}>
            Loading vitals...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="heart_rate" name="Heart Rate (bpm)" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="blood_pressure" name="BP Systolic (mmHg)" stroke="#6366f1" strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="spo2" name="SpO2 (%)" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="glucose" name="Glucose (mg/dL)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
