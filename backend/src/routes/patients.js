import { Router } from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
router.use(authenticateToken);

// Get all patients
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM patients ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single patient
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM patients WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create patient
router.post('/', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, date_of_birth, gender, address, emergency_contact, insurance_provider, insurance_id, medical_history, status, assigned_doctor } = req.body;
    const result = await pool.query(
      `INSERT INTO patients (first_name, last_name, email, phone, date_of_birth, gender, address, emergency_contact, insurance_provider, insurance_id, medical_history, status, assigned_doctor)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [first_name, last_name, email, phone, date_of_birth, gender, address, emergency_contact, insurance_provider, insurance_id, medical_history, status || 'active', assigned_doctor]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update patient
router.put('/:id', async (req, res) => {
  try {
    const { first_name, last_name, email, phone, date_of_birth, gender, address, emergency_contact, insurance_provider, insurance_id, medical_history, status, assigned_doctor } = req.body;
    const result = await pool.query(
      `UPDATE patients SET first_name=$1, last_name=$2, email=$3, phone=$4, date_of_birth=$5, gender=$6, address=$7, emergency_contact=$8, insurance_provider=$9, insurance_id=$10, medical_history=$11, status=$12, assigned_doctor=$13, updated_at=NOW()
       WHERE id=$14 RETURNING *`,
      [first_name, last_name, email, phone, date_of_birth, gender, address, emergency_contact, insurance_provider, insurance_id, medical_history, status, assigned_doctor, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete patient
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM patients WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });
    res.json({ message: 'Patient deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
