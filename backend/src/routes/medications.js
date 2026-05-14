import { Router } from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const [result, countResult] = await Promise.all([
      pool.query(`SELECT m.*, p.first_name, p.last_name FROM medications m JOIN patients p ON m.patient_id = p.id ORDER BY m.created_at DESC LIMIT $1 OFFSET $2`, [limit, offset]),
      pool.query('SELECT COUNT(*) FROM medications')
    ]);
    const total = parseInt(countResult.rows[0].count);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, p.first_name, p.last_name
      FROM medications m
      JOIN patients p ON m.patient_id = p.id
      WHERE m.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { patient_id, name, dosage, frequency, route, start_date, end_date, prescribing_doctor, status, side_effects, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO medications (patient_id, name, dosage, frequency, route, start_date, end_date, prescribing_doctor, status, side_effects, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [patient_id, name, dosage, frequency, route, start_date, end_date || null, prescribing_doctor, status || 'active', side_effects, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { patient_id, name, dosage, frequency, route, start_date, end_date, prescribing_doctor, status, side_effects, notes } = req.body;
    const result = await pool.query(
      `UPDATE medications SET patient_id=$1, name=$2, dosage=$3, frequency=$4, route=$5, start_date=$6, end_date=$7, prescribing_doctor=$8, status=$9, side_effects=$10, notes=$11, updated_at=NOW()
       WHERE id=$12 RETURNING *`,
      [patient_id, name, dosage, frequency, route, start_date, end_date || null, prescribing_doctor, status, side_effects, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM medications WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Medication deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
