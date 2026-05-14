import { Router } from 'express';
import pool from '../config/database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

async function auditLog(pool, req, action, resourceId) {
  try {
    await pool.query(
      'INSERT INTO audit_logs (user_id, user_email, action, resource_type, resource_id, ip_address) VALUES ($1,$2,$3,$4,$5,$6)',
      [req.user?.id, req.user?.email, action, 'patient', resourceId, req.ip]
    );
  } catch {}
}

// GET all patients (with pagination)
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let query = 'SELECT * FROM patients';
    let countQuery = 'SELECT COUNT(*) FROM patients';
    const params = [];
    if (search) {
      query += ` WHERE (first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1)`;
      countQuery += ` WHERE (first_name ILIKE $1 OR last_name ILIKE $1 OR email ILIKE $1)`;
      params.push(`%${search}%`);
    }
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const [result, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, search ? [`%${search}%`] : [])
    ]);

    const total = parseInt(countResult.rows[0].count);
    res.json({
      data: result.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single patient (HIPAA audit log)
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM patients WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });
    // HIPAA audit log
    await auditLog(pool, req, 'VIEW_PATIENT', req.params.id);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET MEWS score for a patient
router.get('/:id/mews', async (req, res) => {
  try {
    const vitals = await pool.query(
      'SELECT * FROM vital_signs WHERE patient_id = $1 ORDER BY recorded_at DESC LIMIT 1',
      [req.params.id]
    );
    if (vitals.rows.length === 0) return res.status(404).json({ error: 'No vitals found for patient' });
    const v = vitals.rows[0];

    // MEWS calculation
    let score = 0;
    const breakdown = {};

    // Respiratory Rate
    const rr = v.respiratory_rate;
    if (rr !== null) {
      let rrScore = 0;
      if (rr < 9) rrScore = 2;
      else if (rr <= 14) rrScore = 0;
      else if (rr <= 20) rrScore = 1;
      else if (rr <= 29) rrScore = 2;
      else rrScore = 3;
      score += rrScore;
      breakdown.respiratory_rate = { value: rr, score: rrScore };
    }

    // Heart Rate
    const hr = v.heart_rate;
    if (hr !== null) {
      let hrScore = 0;
      if (hr < 40) hrScore = 2;
      else if (hr <= 50) hrScore = 1;
      else if (hr <= 100) hrScore = 0;
      else if (hr <= 110) hrScore = 1;
      else if (hr <= 129) hrScore = 2;
      else hrScore = 3;
      score += hrScore;
      breakdown.heart_rate = { value: hr, score: hrScore };
    }

    // Systolic BP
    const sbp = v.blood_pressure_systolic;
    if (sbp !== null) {
      let sbpScore = 0;
      if (sbp < 70) sbpScore = 3;
      else if (sbp <= 80) sbpScore = 2;
      else if (sbp <= 100) sbpScore = 1;
      else if (sbp <= 199) sbpScore = 0;
      else sbpScore = 2;
      score += sbpScore;
      breakdown.blood_pressure_systolic = { value: sbp, score: sbpScore };
    }

    // Temperature
    const temp = v.temperature;
    if (temp !== null) {
      const tempC = (temp - 32) * 5 / 9;
      let tempScore = 0;
      if (tempC < 35) tempScore = 2;
      else if (tempC <= 38.4) tempScore = 0;
      else tempScore = 2;
      score += tempScore;
      breakdown.temperature = { value: temp, value_celsius: tempC.toFixed(1), score: tempScore };
    }

    // SpO2 (not standard MEWS but clinically relevant)
    const spo2 = v.oxygen_saturation;
    if (spo2 !== null) {
      let spo2Score = 0;
      if (spo2 < 85) spo2Score = 3;
      else if (spo2 < 90) spo2Score = 2;
      else if (spo2 < 95) spo2Score = 1;
      breakdown.oxygen_saturation = { value: spo2, score: spo2Score };
      score += spo2Score;
    }

    let riskLevel = 'Low';
    if (score >= 5) riskLevel = 'Critical';
    else if (score >= 3) riskLevel = 'High';
    else if (score >= 1) riskLevel = 'Medium';

    await auditLog(pool, req, 'VIEW_MEWS', req.params.id);

    res.json({
      patient_id: req.params.id,
      mews_score: score,
      risk_level: riskLevel,
      breakdown,
      vitals_recorded_at: v.recorded_at,
      recommendation: score >= 5 ? 'Immediate medical review required' : score >= 3 ? 'Urgent clinical review' : score >= 1 ? 'Increased monitoring' : 'Routine monitoring'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create patient
router.post('/', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, date_of_birth, gender, address, emergency_contact, insurance_provider, insurance_id, medical_history, status, assigned_doctor } = req.body;
    const result = await pool.query(
      `INSERT INTO patients (first_name, last_name, email, phone, date_of_birth, gender, address, emergency_contact, insurance_provider, insurance_id, medical_history, status, assigned_doctor)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [first_name, last_name, email, phone, date_of_birth, gender, address, emergency_contact, insurance_provider, insurance_id, medical_history, status || 'active', assigned_doctor]
    );
    await auditLog(pool, req, 'CREATE_PATIENT', result.rows[0].id);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update patient
router.put('/:id', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, date_of_birth, gender, address, emergency_contact, insurance_provider, insurance_id, medical_history, status, assigned_doctor } = req.body;
    const result = await pool.query(
      `UPDATE patients SET first_name=$1, last_name=$2, email=$3, phone=$4, date_of_birth=$5, gender=$6, address=$7, emergency_contact=$8, insurance_provider=$9, insurance_id=$10, medical_history=$11, status=$12, assigned_doctor=$13, updated_at=NOW()
       WHERE id=$14 RETURNING *`,
      [first_name, last_name, email, phone, date_of_birth, gender, address, emergency_contact, insurance_provider, insurance_id, medical_history, status, assigned_doctor, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });
    await auditLog(pool, req, 'UPDATE_PATIENT', req.params.id);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete patient - admin only
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM patients WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });
    await auditLog(pool, req, 'DELETE_PATIENT', req.params.id);
    res.json({ message: 'Patient deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
