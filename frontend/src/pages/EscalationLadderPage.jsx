import React, { useEffect, useState } from 'react';

export default function EscalationLadderPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/escalation-ladder')
      .then((res) => res.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  if (!data) return <div className="detail-card"><h2>RPM Escalation Ladder</h2><p>Loading escalation ladder...</p></div>;

  return (
    <div>
      <div className="detail-card" style={{ marginBottom: 24 }}>
        <div className="detail-header"><h2>RPM Escalation Ladder</h2></div>
        <div className="detail-body">
          <p style={{ color: '#6b7280' }}>Prioritized alert escalation for chronic condition monitoring and emergency protocol routing.</p>
          <div className="stats-grid">
            <div className="stat-card"><h3>{data.summary.activeAlerts}</h3><p>Active Alerts</p></div>
            <div className="stat-card"><h3>{data.summary.nurseEscalations}</h3><p>Nurse Escalations</p></div>
            <div className="stat-card"><h3>{data.summary.providerReviews}</h3><p>Provider Reviews</p></div>
            <div className="stat-card"><h3>{data.summary.emergencyProtocols}</h3><p>Emergency Protocols</p></div>
          </div>
        </div>
      </div>
      <div className="detail-card" style={{ marginBottom: 24 }}>
        <div className="detail-header"><h2>Condition Ladders</h2></div>
        <div className="detail-body">
          {data.ladders.map((item) => (
            <div className="activity-item" key={item.condition}>
              <strong>{item.condition}</strong>
              <p>{item.trigger}</p>
              <small>{item.step} - {item.escalation}</small>
            </div>
          ))}
        </div>
      </div>
      <div className="detail-card">
        <div className="detail-header"><h2>Escalation Queue</h2></div>
        <div className="detail-body">
          {data.queue.map((item) => (
            <div className="activity-item" key={item.patient}>
              <strong>{item.patient} - {item.condition}</strong>
              <p>{item.alert}</p>
              <small>{item.owner} due {item.due}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
