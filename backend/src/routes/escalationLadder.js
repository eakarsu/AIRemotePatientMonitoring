import express from 'express';

const router = express.Router();

router.get('/', (_req, res) => {
  res.json({
    feature: 'RPM Escalation Ladder',
    summary: { activeAlerts: 31, nurseEscalations: 12, providerReviews: 5, emergencyProtocols: 2 },
    ladders: [
      { condition: 'Heart failure', trigger: 'Weight +3 lb/24h and SpO2 < 92%', step: 'Nurse call within 30 minutes', escalation: 'Provider review if dyspnea present' },
      { condition: 'Hypertension', trigger: 'SBP > 180 or DBP > 110', step: 'Repeat reading and medication adherence check', escalation: 'Same-day provider callback' },
      { condition: 'Diabetes', trigger: 'Glucose < 54 or > 300 mg/dL', step: 'Immediate patient contact', escalation: 'Emergency protocol if symptomatic' }
    ],
    queue: [
      { patient: 'Eli Morris', condition: 'Heart failure', alert: 'Weight spike with low SpO2', owner: 'RPM Nurse', due: '15 min' },
      { patient: 'Priya Shah', condition: 'Hypertension', alert: 'SBP 186 repeat confirmed', owner: 'Provider', due: '45 min' },
      { patient: 'Andre Bell', condition: 'Diabetes', alert: 'Night hypoglycemia trend', owner: 'Care Manager', due: 'Today' }
    ]
  });
});

export default router;
