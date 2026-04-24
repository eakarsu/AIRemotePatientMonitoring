import { Router } from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, p.first_name, p.last_name
      FROM patient_reports r
      JOIN patients p ON r.patient_id = p.id
      ORDER BY r.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, p.first_name, p.last_name
      FROM patient_reports r
      JOIN patients p ON r.patient_id = p.id
      WHERE r.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { patient_id, report_type, title, content, generated_by, date_range_start, date_range_end, status } = req.body;
    const result = await pool.query(
      `INSERT INTO patient_reports (patient_id, report_type, title, content, generated_by, date_range_start, date_range_end, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [patient_id, report_type, title, content, generated_by, date_range_start, date_range_end, status || 'completed']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { patient_id, report_type, title, content, generated_by, date_range_start, date_range_end, status } = req.body;
    const result = await pool.query(
      `UPDATE patient_reports SET patient_id=$1, report_type=$2, title=$3, content=$4, generated_by=$5, date_range_start=$6, date_range_end=$7, status=$8
       WHERE id=$9 RETURNING *`,
      [patient_id, report_type, title, content, generated_by, date_range_start, date_range_end, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM patient_reports WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Report deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
