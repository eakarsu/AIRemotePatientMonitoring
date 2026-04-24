import { Router } from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, p.first_name, p.last_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      ORDER BY a.scheduled_date ASC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, p.first_name, p.last_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      WHERE a.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { patient_id, doctor_name, appointment_type, scheduled_date, duration_minutes, status, location, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO appointments (patient_id, doctor_name, appointment_type, scheduled_date, duration_minutes, status, location, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [patient_id, doctor_name, appointment_type, scheduled_date, duration_minutes || 30, status || 'scheduled', location, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { patient_id, doctor_name, appointment_type, scheduled_date, duration_minutes, status, location, notes } = req.body;
    const result = await pool.query(
      `UPDATE appointments SET patient_id=$1, doctor_name=$2, appointment_type=$3, scheduled_date=$4, duration_minutes=$5, status=$6, location=$7, notes=$8, updated_at=NOW()
       WHERE id=$9 RETURNING *`,
      [patient_id, doctor_name, appointment_type, scheduled_date, duration_minutes, status, location, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM appointments WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
