import React, { useEffect, useState } from 'react';

export default function DischargeSummaryExporter() {
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    fetch('/api/custom-views/patients', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`Failed: ${r.status}`);
        return r.json();
      })
      .then((d) => {
        const list = Array.isArray(d.patients) ? d.patients : [];
        setPatients(list);
        if (list.length && !selected) setSelected(String(list[0].id));
      })
      .catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = async () => {
    setError(null);
    setLoading(true);
    setLastResult(null);
    try {
      const url = `/api/custom-views/export-discharge?patient_id=${encodeURIComponent(selected || '')}`;
      const r = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) {
        const txt = await r.text();
        throw new Error(`Export failed: ${r.status} ${txt}`);
      }
      const contentType = r.headers.get('content-type') || '';
      const blob = await r.blob();
      const objectUrl = URL.createObjectURL(blob);

      // Trigger download
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `discharge_summary_patient_${selected || 'unknown'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setLastResult({
        contentType,
        bytes: blob.size,
        filename: a.download,
        url: objectUrl,
      });
    } catch (e) {
      setError(e.message || 'Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-testid="discharge-summary-exporter"
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 18, color: '#111827' }}>
          Patient Discharge Summary - PDF Export
        </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#6b7280' }}>
          Generate a printable discharge summary PDF with patient details, vitals, medications, and care plan.
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 12,
        }}
      >
        <label htmlFor="ds-patient" style={{ fontSize: 13, color: '#374151' }}>
          Patient:
        </label>
        <select
          id="ds-patient"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          style={{
            padding: '6px 10px',
            borderRadius: 8,
            border: '1px solid #d1d5db',
            minWidth: 240,
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
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || !selected}
          style={{
            padding: '8px 16px',
            background: loading ? '#93c5fd' : '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            cursor: loading || !selected ? 'not-allowed' : 'pointer',
            fontWeight: 600,
          }}
        >
          {loading ? 'Generating...' : 'Generate PDF'}
        </button>
      </div>

      {error && (
        <div
          style={{
            color: '#b91c1c',
            background: '#fee2e2',
            padding: 10,
            borderRadius: 6,
            marginBottom: 12,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {lastResult && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            padding: 12,
            borderRadius: 8,
            fontSize: 13,
            color: '#065f46',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 4 }}>PDF generated and downloaded.</div>
          <div>File: {lastResult.filename}</div>
          <div>Content-Type: {lastResult.contentType}</div>
          <div>Size: {lastResult.bytes} bytes</div>
          <div style={{ marginTop: 6 }}>
            <a
              href={lastResult.url}
              target="_blank"
              rel="noreferrer"
              style={{ color: '#047857', fontWeight: 600 }}
            >
              Open in new tab
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
