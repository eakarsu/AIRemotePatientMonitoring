import { Router } from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT cp.*, p.first_name, p.last_name
      FROM care_plans cp
      JOIN patients p ON cp.patient_id = p.id
      ORDER BY cp.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT cp.*, p.first_name, p.last_name
      FROM care_plans cp
      JOIN patients p ON cp.patient_id = p.id
      WHERE cp.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { patient_id, title, description, goals, interventions, start_date, end_date, status, created_by } = req.body;
    const result = await pool.query(
      `INSERT INTO care_plans (patient_id, title, description, goals, interventions, start_date, end_date, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [patient_id, title, description, goals, interventions, start_date, end_date, status || 'active', created_by]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { patient_id, title, description, goals, interventions, start_date, end_date, status, created_by } = req.body;
    const result = await pool.query(
      `UPDATE care_plans SET patient_id=$1, title=$2, description=$3, goals=$4, interventions=$5, start_date=$6, end_date=$7, status=$8, created_by=$9, updated_at=NOW()
       WHERE id=$10 RETURNING *`,
      [patient_id, title, description, goals, interventions, start_date, end_date, status, created_by, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM care_plans WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Care plan deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
