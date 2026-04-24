import { Router } from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.*, p.first_name, p.last_name
      FROM medical_devices d
      JOIN patients p ON d.patient_id = p.id
      ORDER BY d.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.*, p.first_name, p.last_name
      FROM medical_devices d
      JOIN patients p ON d.patient_id = p.id
      WHERE d.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { patient_id, device_name, device_type, serial_number, manufacturer, model, status, battery_level, firmware_version, assigned_date, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO medical_devices (patient_id, device_name, device_type, serial_number, manufacturer, model, status, battery_level, firmware_version, assigned_date, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [patient_id, device_name, device_type, serial_number, manufacturer, model, status || 'active', battery_level, firmware_version, assigned_date, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { patient_id, device_name, device_type, serial_number, manufacturer, model, status, battery_level, firmware_version, assigned_date, notes } = req.body;
    const result = await pool.query(
      `UPDATE medical_devices SET patient_id=$1, device_name=$2, device_type=$3, serial_number=$4, manufacturer=$5, model=$6, status=$7, battery_level=$8, firmware_version=$9, assigned_date=$10, notes=$11, updated_at=NOW()
       WHERE id=$12 RETURNING *`,
      [patient_id, device_name, device_type, serial_number, manufacturer, model, status, battery_level, firmware_version, assigned_date, notes, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM medical_devices WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Device deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
