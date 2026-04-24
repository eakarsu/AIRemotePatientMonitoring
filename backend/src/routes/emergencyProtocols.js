import { Router } from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ep.*, p.first_name, p.last_name
      FROM emergency_protocols ep
      JOIN patients p ON ep.patient_id = p.id
      ORDER BY ep.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ep.*, p.first_name, p.last_name
      FROM emergency_protocols ep
      JOIN patients p ON ep.patient_id = p.id
      WHERE ep.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { patient_id, protocol_name, trigger_condition, severity, steps, emergency_contacts, medications_to_administer, hospital_preference, status, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO emergency_protocols (patient_id, protocol_name, trigger_condition, severity, steps, emergency_contacts, medications_to_administer, hospital_preference, status, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [patient_id, protocol_name, trigger_condition, severity, steps, emergency_contacts, medications_to_administer, hospital_preference, status || 'active', notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { patient_id, protocol_name, trigger_condition, severity, steps, emergency_contacts, medications_to_administer, hospital_preference, status, notes } = req.body;
    const result = await pool.query(
      `UPDATE emergency_protocols SET patient_id=$1, protocol_name=$2, trigger_condition=$3, severity=$4, steps=$5, emergency_contacts=$6, medications_to_administer=$7, hospital_preference=$8, status=$9, notes=$10, updated_at=NOW()
       WHERE id=$11 RETURNING *`,
      [patient_id, protocol_name, trigger_condition, severity, steps, emergency_contacts, medications_to_administer, hospital_preference, status, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM emergency_protocols WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Protocol deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
