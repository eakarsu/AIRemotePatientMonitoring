import React from 'react';
import VitalsTimeline from '../components/VitalsTimeline.js';
import AlertHeatmap from '../components/AlertHeatmap.js';
import DischargeSummaryExporter from '../components/DischargeSummaryExporter.js';
import AlertDispatcher from '../components/AlertDispatcher.js';

export default function CustomViewsPage() {
  return (
    <div style={{ padding: '8px 0' }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: '#111827' }}>Patient Analytics</h2>
        <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: 14 }}>
          Bespoke custom views for vitals trends and alert severity.
        </p>
      </div>
      <VitalsTimeline />
      <AlertHeatmap />

      <div style={{ marginTop: 24, marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: '#111827' }}>Patient Operations</h2>
        <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: 14 }}>
          Discharge documentation export and critical alert dispatch.
        </p>
      </div>
      <DischargeSummaryExporter />
      <AlertDispatcher />
    </div>
  );
}
