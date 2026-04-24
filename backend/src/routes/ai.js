import { Router } from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { analyzeHealthRisk, analyzeSymptoms, predictiveAnalytics, treatmentRecommendations, generateCarePlanAI, analyzeBillingOptimization } from '../services/aiService.js';

const router = Router();
router.use(authenticateToken);

// AI Health Risk Assessment
router.post('/health-risk/:patientId', async (req, res) => {
  try {
    const patientResult = await pool.query('SELECT * FROM patients WHERE id = $1', [req.params.patientId]);
    if (patientResult.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });

    const vitalsResult = await pool.query(
      'SELECT * FROM vital_signs WHERE patient_id = $1 ORDER BY recorded_at DESC LIMIT 5',
      [req.params.patientId]
    );

    const medsResult = await pool.query(
      'SELECT * FROM medications WHERE patient_id = $1 AND status = $2',
      [req.params.patientId, 'active']
    );

    const patientData = {
      patient: patientResult.rows[0],
      recentVitals: vitalsResult.rows,
      activeMedications: medsResult.rows
    };

    const analysis = await analyzeHealthRisk(patientData);

    await pool.query(
      'INSERT INTO ai_analyses (patient_id, analysis_type, input_data, result, model_used) VALUES ($1,$2,$3,$4,$5)',
      [req.params.patientId, 'health_risk', JSON.stringify(patientData), analysis, process.env.OPENROUTER_MODEL]
    );

    res.json({ analysis, patient: patientResult.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Symptom Analysis
router.post('/symptom-analysis', async (req, res) => {
  try {
    const { patient_id, symptoms } = req.body;
    const patientResult = await pool.query('SELECT * FROM patients WHERE id = $1', [patient_id]);
    if (patientResult.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });

    const analysis = await analyzeSymptoms(symptoms, patientResult.rows[0].medical_history || 'No history available');

    await pool.query(
      'INSERT INTO ai_analyses (patient_id, analysis_type, input_data, result, model_used) VALUES ($1,$2,$3,$4,$5)',
      [patient_id, 'symptom_analysis', JSON.stringify({ symptoms }), analysis, process.env.OPENROUTER_MODEL]
    );

    res.json({ analysis, patient: patientResult.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Predictive Analytics
router.post('/predictive/:patientId', async (req, res) => {
  try {
    const patientResult = await pool.query('SELECT * FROM patients WHERE id = $1', [req.params.patientId]);
    if (patientResult.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });

    const vitalsResult = await pool.query(
      'SELECT * FROM vital_signs WHERE patient_id = $1 ORDER BY recorded_at DESC LIMIT 20',
      [req.params.patientId]
    );

    const analysis = await predictiveAnalytics(patientResult.rows[0], vitalsResult.rows);

    await pool.query(
      'INSERT INTO ai_analyses (patient_id, analysis_type, input_data, result, model_used) VALUES ($1,$2,$3,$4,$5)',
      [req.params.patientId, 'predictive', JSON.stringify({ patient: patientResult.rows[0], vitals: vitalsResult.rows }), analysis, process.env.OPENROUTER_MODEL]
    );

    res.json({ analysis, patient: patientResult.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Treatment Recommendations
router.post('/treatment/:patientId', async (req, res) => {
  try {
    const { diagnosis } = req.body;
    const patientResult = await pool.query('SELECT * FROM patients WHERE id = $1', [req.params.patientId]);
    if (patientResult.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });

    const medsResult = await pool.query(
      'SELECT * FROM medications WHERE patient_id = $1',
      [req.params.patientId]
    );

    const analysis = await treatmentRecommendations(
      patientResult.rows[0],
      medsResult.rows,
      diagnosis || patientResult.rows[0].medical_history
    );

    await pool.query(
      'INSERT INTO ai_analyses (patient_id, analysis_type, input_data, result, model_used) VALUES ($1,$2,$3,$4,$5)',
      [req.params.patientId, 'treatment', JSON.stringify({ diagnosis }), analysis, process.env.OPENROUTER_MODEL]
    );

    res.json({ analysis, patient: patientResult.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Care Plan Generation
router.post('/care-plan/:patientId', async (req, res) => {
  try {
    const { conditions } = req.body;
    const patientResult = await pool.query('SELECT * FROM patients WHERE id = $1', [req.params.patientId]);
    if (patientResult.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });

    const analysis = await generateCarePlanAI(
      patientResult.rows[0],
      conditions || patientResult.rows[0].medical_history
    );

    await pool.query(
      'INSERT INTO ai_analyses (patient_id, analysis_type, input_data, result, model_used) VALUES ($1,$2,$3,$4,$5)',
      [req.params.patientId, 'care_plan', JSON.stringify({ conditions }), analysis, process.env.OPENROUTER_MODEL]
    );

    res.json({ analysis, patient: patientResult.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Billing Optimization
router.post('/billing-optimization', async (req, res) => {
  try {
    const billingResult = await pool.query('SELECT * FROM billing ORDER BY created_at DESC LIMIT 50');
    const servicesResult = await pool.query('SELECT DISTINCT service_type, cpt_code, AVG(amount) as avg_amount FROM billing GROUP BY service_type, cpt_code');

    const analysis = await analyzeBillingOptimization(billingResult.rows, servicesResult.rows);

    await pool.query(
      'INSERT INTO ai_analyses (patient_id, analysis_type, input_data, result, model_used) VALUES ($1,$2,$3,$4,$5)',
      [null, 'billing_optimization', JSON.stringify({ records: billingResult.rows.length }), analysis, process.env.OPENROUTER_MODEL]
    );

    res.json({ analysis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get AI analysis history
router.get('/history', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT aa.*, p.first_name, p.last_name
      FROM ai_analyses aa
      LEFT JOIN patients p ON aa.patient_id = p.id
      ORDER BY aa.created_at DESC
      LIMIT 50
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
