import React, { useEffect, useState } from 'react';

export default function AlertDispatcher() {
  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState('');
  const [message, setMessage] = useState('Critical: vitals out of safe range. Please respond.');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [log, setLog] = useState([]);
  const [logLoading, setLogLoading] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const loadPatients = () => {
    fetch('/api/custom-views/patients', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`patients ${r.status}`);
        return r.json();
      })
      .then((d) => {
        const list = Array.isArray(d.patients) ? d.patients : [];
        setPatients(list);
        if (list.length && !patientId) setPatientId(String(list[0].id));
      })
      .catch((e) => setError(e.message));
  };

  const loadLog = () => {
    setLogLoading(true);
    fetch('/api/custom-views/dispatch-log', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`log ${r.status}`);
        return r.json();
      })
      .then((d) => setLog(Array.isArray(d.entries) ? d.entries : []))
      .catch(() => {})
      .finally(() => setLogLoading(false));
  };

  useEffect(() => {
    loadPatients();
    loadLog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError(null);
    setSuccess(null);
    setSending(true);
    try {
      const r = await fetch('/api/custom-views/dispatch-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patient_id: patientId ? Number(patientId) : null,
          message,
        }),
      });
      const data = await r.json();
      if (!r.ok || !data.success) {
        throw new Error(data.error || `Send failed: ${r.status}`);
      }
      setSuccess({ sid: data.sid, status: data.status, dispatched_at: data.dispatched_at });
      loadLog();
    } catch (err) {
      setError(err.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      data-testid="alert-dispatcher"
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
          Critical Alert SMS Dispatch
        </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#6b7280' }}>
          Stubbed Twilio-style dispatcher. Logs each send and shows delivery status.
        </p>
      </div>

      <form onSubmit={handleSend} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
          <label htmlFor="ad-patient" style={{ fontSize: 13, color: '#374151' }}>
            Patient:
          </label>
          <select
            id="ad-patient"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
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
        </div>

        <div style={{ marginBottom: 10 }}>
          <label htmlFor="ad-message" style={{ fontSize: 13, color: '#374151', display: 'block', marginBottom: 4 }}>
            Alert message:
          </label>
          <textarea
            id="ad-message"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid #d1d5db',
              fontSize: 14,
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={sending || !message.trim()}
          style={{
            padding: '8px 16px',
            background: sending ? '#fca5a5' : '#dc2626',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            cursor: sending || !message.trim() ? 'not-allowed' : 'pointer',
            fontWeight: 600,
          }}
        >
          {sending ? 'Sending...' : 'Send SMS'}
        </button>
      </form>

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

      {success && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            padding: 12,
            borderRadius: 8,
            fontSize: 13,
            color: '#065f46',
            marginBottom: 12,
          }}
        >
          Sent. SID: <code>{success.sid}</code> | status: {success.status}
        </div>
      )}

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h4 style={{ margin: 0, fontSize: 14, color: '#1f2937' }}>Recent dispatches</h4>
          <button
            type="button"
            onClick={loadLog}
            disabled={logLoading}
            style={{
              padding: '4px 10px',
              border: '1px solid #d1d5db',
              background: '#f9fafb',
              borderRadius: 6,
              cursor: logLoading ? 'wait' : 'pointer',
              fontSize: 12,
            }}
          >
            {logLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        <div
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            overflow: 'hidden',
            fontSize: 12,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '150px 1fr 200px 90px',
              padding: '6px 8px',
              background: '#f9fafb',
              fontWeight: 600,
              color: '#374151',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <div>Dispatched</div>
            <div>Patient / message</div>
            <div>SID</div>
            <div>Status</div>
          </div>
          {log.length === 0 && (
            <div style={{ padding: 12, color: '#6b7280' }}>No dispatches yet.</div>
          )}
          {log.map((row) => (
            <div
              key={row.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '150px 1fr 200px 90px',
                padding: '6px 8px',
                borderBottom: '1px solid #f3f4f6',
                color: '#111827',
              }}
            >
              <div>{row.dispatched_at ? new Date(row.dispatched_at).toLocaleString('en-US') : '-'}</div>
              <div>
                <div style={{ fontWeight: 600 }}>{row.patient_name || `Patient #${row.patient_id ?? 'N/A'}`}</div>
                <div style={{ color: '#4b5563' }}>{row.message}</div>
              </div>
              <div style={{ fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.sid}</div>
              <div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: row.status === 'delivered' ? '#dcfce7' : '#fee2e2',
                    color: row.status === 'delivered' ? '#166534' : '#991b1b',
                    fontWeight: 600,
                  }}
                >
                  {row.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
