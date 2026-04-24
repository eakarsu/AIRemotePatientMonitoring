import { Router } from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT vs.*, p.first_name, p.last_name
      FROM vital_signs vs
      JOIN patients p ON vs.patient_id = p.id
      ORDER BY vs.recorded_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT vs.*, p.first_name, p.last_name
      FROM vital_signs vs
      JOIN patients p ON vs.patient_id = p.id
      WHERE vs.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/patient/:patientId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM vital_signs WHERE patient_id = $1 ORDER BY recorded_at DESC',
      [req.params.patientId]
    );
    res.json(result.rows);
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
    res.status(201).json(result.rows[0]);
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
