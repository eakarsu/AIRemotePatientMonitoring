import { Router } from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

async function checkThresholdsAndAlert(pool, vitalRecord) {
  const alerts = [];
  const { patient_id, heart_rate, oxygen_saturation, id: vital_id } = vitalRecord;

  if (heart_rate !== null) {
    if (heart_rate > 120) {
      alerts.push({ message: `ALERT: Heart rate critically high (${heart_rate} bpm > 120)`, severity: 'critical', alert_type: 'tachycardia' });
    } else if (heart_rate < 40) {
      alerts.push({ message: `ALERT: Heart rate critically low (${heart_rate} bpm < 40)`, severity: 'critical', alert_type: 'bradycardia' });
    }
  }

  if (oxygen_saturation !== null && oxygen_saturation < 90) {
    alerts.push({ message: `ALERT: SpO2 critically low (${oxygen_saturation}% < 90%)`, severity: 'critical', alert_type: 'hypoxia' });
  }

  for (const alert of alerts) {
    await pool.query(
      'INSERT INTO alerts (patient_id, alert_type, severity, message, vital_sign_id, status) VALUES ($1,$2,$3,$4,$5,$6)',
      [patient_id, alert.alert_type, alert.severity, alert.message, vital_id, 'active']
    );
  }

  return alerts;
}

router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const [result, countResult] = await Promise.all([
      pool.query(`SELECT vs.*, p.first_name, p.last_name FROM vital_signs vs JOIN patients p ON vs.patient_id = p.id ORDER BY vs.recorded_at DESC LIMIT $1 OFFSET $2`, [limit, offset]),
      pool.query('SELECT COUNT(*) FROM vital_signs')
    ]);
    const total = parseInt(countResult.rows[0].count);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`SELECT vs.*, p.first_name, p.last_name FROM vital_signs vs JOIN patients p ON vs.patient_id = p.id WHERE vs.id = $1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/patient/:patientId', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const [result, countResult] = await Promise.all([
      pool.query('SELECT * FROM vital_signs WHERE patient_id = $1 ORDER BY recorded_at DESC LIMIT $2 OFFSET $3', [req.params.patientId, limit, offset]),
      pool.query('SELECT COUNT(*) FROM vital_signs WHERE patient_id = $1', [req.params.patientId])
    ]);
    const total = parseInt(countResult.rows[0].count);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { patient_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, temperature, oxygen_saturation, respiratory_rate, blood_glucose, weight, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO vital_signs (patient_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, temperature, oxygen_saturation, respiratory_rate, blood_glucose, weight, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [patient_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, temperature, oxygen_saturation, respiratory_rate, blood_glucose, weight, notes]
    );
    const vital = result.rows[0];
    const triggeredAlerts = await checkThresholdsAndAlert(pool, vital);
    res.status(201).json({ ...vital, triggered_alerts: triggeredAlerts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Device ingest endpoint - runs threshold rules automatically
router.post('/ingest', async (req, res) => {
  try {
    const { patient_id, device_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, temperature, oxygen_saturation, respiratory_rate, blood_glucose, weight } = req.body;
    if (!patient_id) return res.status(400).json({ error: 'patient_id required' });

    const result = await pool.query(
      `INSERT INTO vital_signs (patient_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, temperature, oxygen_saturation, respiratory_rate, blood_glucose, weight, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [patient_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, temperature, oxygen_saturation, respiratory_rate, blood_glucose, weight, `Auto-ingested from device ${device_id || 'unknown'}`]
    );
    const vital = result.rows[0];
    const triggeredAlerts = await checkThresholdsAndAlert(pool, vital);

    res.status(201).json({
      message: 'Vitals ingested',
      vital_id: vital.id,
      triggered_alerts: triggeredAlerts,
      alerts_count: triggeredAlerts.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { patient_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, temperature, oxygen_saturation, respiratory_rate, blood_glucose, weight, notes } = req.body;
    const result = await pool.query(
      `UPDATE vital_signs SET patient_id=$1, heart_rate=$2, blood_pressure_systolic=$3, blood_pressure_diastolic=$4, temperature=$5, oxygen_saturation=$6, respiratory_rate=$7, blood_glucose=$8, weight=$9, notes=$10
       WHERE id=$11 RETURNING *`,
      [patient_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, temperature, oxygen_saturation, respiratory_rate, blood_glucose, weight, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM vital_signs WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Record deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
