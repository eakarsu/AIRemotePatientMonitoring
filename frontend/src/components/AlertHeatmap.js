import React, { useEffect, useState } from 'react';

const SEVERITY_COLORS = {
  0: { bg: '#e6f4ea', label: 'None' },
  1: { bg: '#86efac', label: 'Low' },
  2: { bg: '#fbbf24', label: 'Amber' },
  3: { bg: '#ef4444', label: 'Red' },
};

function formatDay(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
}

export default function AlertHeatmap() {
  const [data, setData] = useState({ days: [], rows: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    fetch('/api/custom-views/alert-heatmap', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`Request failed: ${r.status}`);
        return r.json();
      })
      .then((d) => setData({ days: d.days || [], rows: d.rows || [] }))
      .catch((e) => setError(e.message || 'Failed to load heatmap'))
      .finally(() => setLoading(false));
  }, []);

  const { days, rows } = data;
  // CSS Grid: 1 patient-name column + N day columns
  const gridTemplateColumns = `minmax(180px, 220px) repeat(${days.length || 7}, minmax(60px, 1fr))`;

  return (
    <div
      data-testid="alert-heatmap"
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 12,
        padding: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 18, color: '#111827' }}>Alert Severity Heatmap</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#6b7280' }}>
            Max alert severity per patient per day (last 7 days)
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {Object.entries(SEVERITY_COLORS).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#374151' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: 14,
                  height: 14,
                  borderRadius: 4,
                  background: v.bg,
                  border: '1px solid rgba(0,0,0,0.08)',
                }}
              />
              {v.label}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ color: '#b91c1c', background: '#fee2e2', padding: 10, borderRadius: 6, marginBottom: 12 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 24, color: '#6b7280' }}>Loading heatmap...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns, gap: 6, minWidth: 540 }}>
            <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>Patient</div>
            {days.map((d) => (
              <div key={d} style={{ fontSize: 11, color: '#6b7280', textAlign: 'center', fontWeight: 600 }}>
                {formatDay(d)}
              </div>
            ))}
            {rows.map((row) => (
              <React.Fragment key={row.patient_id}>
                <div
                  style={{
                    fontSize: 13,
                    color: '#111827',
                    padding: '6px 8px',
                    background: '#f9fafb',
                    borderRadius: 6,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={row.patient_name}
                >
                  {row.patient_name}
                </div>
                {row.days.map((cell) => {
                  const sev = SEVERITY_COLORS[cell.severity] || SEVERITY_COLORS[0];
                  return (
                    <div
                      key={`${row.patient_id}-${cell.day}`}
                      title={`${row.patient_name} · ${cell.day} · ${sev.label}`}
                      style={{
                        background: sev.bg,
                        height: 34,
                        borderRadius: 6,
                        border: '1px solid rgba(0,0,0,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        color: cell.severity >= 2 ? '#111827' : '#374151',
                        fontWeight: cell.severity > 0 ? 600 : 400,
                      }}
                    >
                      {cell.severity > 0 ? sev.label : ''}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
            {rows.length === 0 && (
              <div style={{ gridColumn: `1 / span ${(days.length || 7) + 1}`, padding: 16, color: '#6b7280' }}>
                No patient data available.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
