import { Router } from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, p.first_name, p.last_name
      FROM alerts a
      JOIN patients p ON a.patient_id = p.id
      ORDER BY a.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, p.first_name, p.last_name
      FROM alerts a
      JOIN patients p ON a.patient_id = p.id
      WHERE a.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { patient_id, alert_type, severity, message, vital_sign_id, status } = req.body;
    const result = await pool.query(
      `INSERT INTO alerts (patient_id, alert_type, severity, message, vital_sign_id, status)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [patient_id, alert_type, severity, message, vital_sign_id || null, status || 'active']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { patient_id, alert_type, severity, message, status, acknowledged_by } = req.body;
    const acknowledged_at = status === 'acknowledged' ? new Date() : null;
    const result = await pool.query(
      `UPDATE alerts SET patient_id=$1, alert_type=$2, severity=$3, message=$4, status=$5, acknowledged_by=$6, acknowledged_at=$7
       WHERE id=$8 RETURNING *`,
      [patient_id, alert_type, severity, message, status, acknowledged_by, acknowledged_at, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM alerts WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Alert deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
