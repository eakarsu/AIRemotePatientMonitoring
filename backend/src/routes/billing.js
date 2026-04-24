import { Router } from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*, p.first_name, p.last_name
      FROM billing b
      JOIN patients p ON b.patient_id = p.id
      ORDER BY b.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*, p.first_name, p.last_name
      FROM billing b
      JOIN patients p ON b.patient_id = p.id
      WHERE b.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { patient_id, service_type, amount, insurance_covered, patient_responsibility, billing_date, due_date, status, insurance_claim_id, cpt_code, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO billing (patient_id, service_type, amount, insurance_covered, patient_responsibility, billing_date, due_date, status, insurance_claim_id, cpt_code, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [patient_id, service_type, amount, insurance_covered, patient_responsibility, billing_date, due_date, status || 'pending', insurance_claim_id, cpt_code, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { patient_id, service_type, amount, insurance_covered, patient_responsibility, billing_date, due_date, status, insurance_claim_id, cpt_code, notes } = req.body;
    const result = await pool.query(
      `UPDATE billing SET patient_id=$1, service_type=$2, amount=$3, insurance_covered=$4, patient_responsibility=$5, billing_date=$6, due_date=$7, status=$8, insurance_claim_id=$9, cpt_code=$10, notes=$11, updated_at=NOW()
       WHERE id=$12 RETURNING *`,
      [patient_id, service_type, amount, insurance_covered, patient_responsibility, billing_date, due_date, status, insurance_claim_id, cpt_code, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM billing WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Billing record deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
