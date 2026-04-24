import { Router } from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, p.first_name, p.last_name
      FROM consultations c
      JOIN patients p ON c.patient_id = p.id
      ORDER BY c.scheduled_date DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, p.first_name, p.last_name
      FROM consultations c
      JOIN patients p ON c.patient_id = p.id
      WHERE c.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { patient_id, doctor_name, consultation_type, scheduled_date, duration_minutes, status, diagnosis, treatment_plan, follow_up_date, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO consultations (patient_id, doctor_name, consultation_type, scheduled_date, duration_minutes, status, diagnosis, treatment_plan, follow_up_date, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [patient_id, doctor_name, consultation_type, scheduled_date, duration_minutes || 30, status || 'scheduled', diagnosis, treatment_plan, follow_up_date, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { patient_id, doctor_name, consultation_type, scheduled_date, duration_minutes, status, diagnosis, treatment_plan, follow_up_date, notes } = req.body;
    const result = await pool.query(
      `UPDATE consultations SET patient_id=$1, doctor_name=$2, consultation_type=$3, scheduled_date=$4, duration_minutes=$5, status=$6, diagnosis=$7, treatment_plan=$8, follow_up_date=$9, notes=$10, updated_at=NOW()
       WHERE id=$11 RETURNING *`,
      [patient_id, doctor_name, consultation_type, scheduled_date, duration_minutes, status, diagnosis, treatment_plan, follow_up_date, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM consultations WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Consultation deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
