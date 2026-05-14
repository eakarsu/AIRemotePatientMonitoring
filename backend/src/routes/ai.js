import { Router } from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';
import {
  analyzeHealthRisk, analyzeSymptoms, predictiveAnalytics,
  treatmentRecommendations, generateCarePlanAI, analyzeBillingOptimization,
  generatePatientReport, checkMedicationInteractions,
  predictDecompensation, assessSocialDeterminants, mentalHealthScreening,
  medicationOptimization, customizePatientEducation,
  sharedDecisionMakingAid, longitudinalTrajectory, costAwareTreatmentPlan, caregiverCoaching,
  LLMUnavailableError,
  OPENROUTER_MODEL
} from '../services/aiService.js';

function sendAIError(res, err) {
  if (err instanceof LLMUnavailableError) {
    return res.status(503).json({ error: err.message, code: 'LLM_UNAVAILABLE' });
  }
  return res.status(500).json({ error: err.message });
}

const router = Router();
router.use(authenticateToken);
router.use(aiRateLimiter);

async function persistAI(patientId, type, inputData, result) {
  try {
    await pool.query(
      'INSERT INTO ai_analyses (patient_id, analysis_type, input_data, result, model_used) VALUES ($1,$2,$3,$4,$5)',
      [patientId, type, JSON.stringify(inputData), JSON.stringify(result), OPENROUTER_MODEL]
    );
  } catch {}
}

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
    await persistAI(req.params.patientId, 'health_risk', patientData, analysis);
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
    await persistAI(patient_id, 'symptom_analysis', { symptoms }, analysis);
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
    await persistAI(req.params.patientId, 'predictive', { patient: patientResult.rows[0], vitals: vitalsResult.rows }, analysis);
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

    const medsResult = await pool.query('SELECT * FROM medications WHERE patient_id = $1', [req.params.patientId]);
    const analysis = await treatmentRecommendations(patientResult.rows[0], medsResult.rows, diagnosis || patientResult.rows[0].medical_history);
    await persistAI(req.params.patientId, 'treatment', { diagnosis }, analysis);
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

    const analysis = await generateCarePlanAI(patientResult.rows[0], conditions || patientResult.rows[0].medical_history);
    await persistAI(req.params.patientId, 'care_plan', { conditions }, analysis);
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
    await persistAI(null, 'billing_optimization', { records: billingResult.rows.length }, analysis);
    res.json({ analysis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Patient Report Generator
router.post('/patient-reports/:patientId/generate', async (req, res) => {
  try {
    const patientResult = await pool.query('SELECT * FROM patients WHERE id = $1', [req.params.patientId]);
    if (patientResult.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });

    const [vitals, meds, consultations] = await Promise.all([
      pool.query('SELECT * FROM vital_signs WHERE patient_id = $1 ORDER BY recorded_at DESC LIMIT 10', [req.params.patientId]),
      pool.query('SELECT * FROM medications WHERE patient_id = $1', [req.params.patientId]),
      pool.query('SELECT * FROM consultations WHERE patient_id = $1 ORDER BY scheduled_date DESC LIMIT 5', [req.params.patientId])
    ]);

    const report = await generatePatientReport(
      patientResult.rows[0], vitals.rows, meds.rows, consultations.rows
    );

    // Save to patient_reports table
    const saved = await pool.query(
      `INSERT INTO patient_reports (patient_id, report_type, title, content, generated_by)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.params.patientId, 'ai_clinical_summary', report.report_title || 'AI Clinical Summary', JSON.stringify(report), 'AI']
    );

    await persistAI(req.params.patientId, 'patient_report', { patientId: req.params.patientId }, report);
    res.json({ report, saved_report: saved.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Medication Interactions Checker
router.post('/medications/check-interactions', async (req, res) => {
  try {
    const { medications, patient_id } = req.body;
    if (!medications || !Array.isArray(medications)) {
      return res.status(400).json({ error: 'medications array required' });
    }

    const analysis = await checkMedicationInteractions(medications);
    await persistAI(patient_id || null, 'medication_interactions', { medications }, analysis);
    res.json({ analysis, medications_checked: medications });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Decompensation Alert (predict acute event 48-72h ahead)
router.post('/decompensation-alert/:patientId', async (req, res) => {
  try {
    const patientResult = await pool.query('SELECT * FROM patients WHERE id = $1', [req.params.patientId]);
    if (patientResult.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });
    const vitalsResult = await pool.query(
      'SELECT * FROM vital_signs WHERE patient_id = $1 ORDER BY recorded_at DESC LIMIT 50',
      [req.params.patientId]
    );
    const conditions = req.body?.conditions || (patientResult.rows[0].conditions || []);
    const analysis = await predictDecompensation(patientResult.rows[0], vitalsResult.rows, conditions);
    await persistAI(req.params.patientId, 'decompensation_alert', { conditions }, analysis);
    res.json({ analysis, patient: patientResult.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Social Determinants assessment
router.post('/social-determinants/:patientId', async (req, res) => {
  try {
    const patientResult = await pool.query('SELECT * FROM patients WHERE id = $1', [req.params.patientId]);
    if (patientResult.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });
    const analysis = await assessSocialDeterminants(patientResult.rows[0], req.body?.screeningAnswers || {});
    await persistAI(req.params.patientId, 'social_determinants', req.body?.screeningAnswers || {}, analysis);
    res.json({ analysis, patient: patientResult.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mental Health screening (PHQ-9/GAD-7 etc.)
router.post('/mental-health-screening/:patientId', async (req, res) => {
  try {
    const patientResult = await pool.query('SELECT * FROM patients WHERE id = $1', [req.params.patientId]);
    if (patientResult.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });
    const { answers, instruments } = req.body || {};
    const analysis = await mentalHealthScreening(patientResult.rows[0], answers || {}, instruments || ['PHQ-9']);
    await persistAI(req.params.patientId, 'mental_health_screening', { answers, instruments }, analysis);
    res.json({ analysis, patient: patientResult.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Medication Regimen Optimization (clinician decision-support)
router.post('/medication-optimization/:patientId', async (req, res) => {
  try {
    const patientResult = await pool.query('SELECT * FROM patients WHERE id = $1', [req.params.patientId]);
    if (patientResult.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });
    const medsResult = await pool.query('SELECT * FROM medications WHERE patient_id = $1', [req.params.patientId]);
    const conditions = req.body?.conditions || (patientResult.rows[0].conditions || []);
    const goals = req.body?.goals || '';
    const analysis = await medicationOptimization(patientResult.rows[0], medsResult.rows, conditions, goals);
    await persistAI(req.params.patientId, 'medication_optimization', { conditions, goals }, analysis);
    res.json({ analysis, patient: patientResult.rows[0] });
  } catch (err) {
    sendAIError(res, err);
  }
});

// Patient Education Customizer (literacy + language adapted)
router.post('/patient-education/:patientId', async (req, res) => {
  try {
    const patientResult = await pool.query('SELECT * FROM patients WHERE id = $1', [req.params.patientId]);
    if (patientResult.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });
    const { topic, readingLevel, language, format, concerns } = req.body || {};
    const analysis = await customizePatientEducation(
      patientResult.rows[0],
      topic || 'general wellness',
      { readingLevel, language, format, concerns }
    );
    await persistAI(req.params.patientId, 'patient_education', { topic, readingLevel, language }, analysis);
    res.json({ analysis, patient: patientResult.rows[0] });
  } catch (err) {
    sendAIError(res, err);
  }
});

// Shared Decision-Making Aid
router.post('/shared-decision/:patientId', async (req, res) => {
  try {
    const patientResult = await pool.query('SELECT * FROM patients WHERE id = $1', [req.params.patientId]);
    if (patientResult.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });
    const { decisionTopic, values, constraints } = req.body || {};
    if (!decisionTopic) return res.status(400).json({ error: 'decisionTopic is required' });
    const analysis = await sharedDecisionMakingAid(patientResult.rows[0], decisionTopic, { values, constraints });
    await persistAI(req.params.patientId, 'shared_decision', { decisionTopic, values, constraints }, analysis);
    res.json({ analysis, patient: patientResult.rows[0] });
  } catch (err) {
    sendAIError(res, err);
  }
});

// Longitudinal Trajectory Analysis
router.post('/longitudinal-trajectory/:patientId', async (req, res) => {
  try {
    const patientResult = await pool.query('SELECT * FROM patients WHERE id = $1', [req.params.patientId]);
    if (patientResult.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });
    const vitalsResult = await pool.query(
      'SELECT * FROM vital_signs WHERE patient_id = $1 ORDER BY recorded_at ASC LIMIT 200',
      [req.params.patientId]
    );
    const conditions = req.body?.conditions || (patientResult.rows[0].conditions || []);
    const analysis = await longitudinalTrajectory(patientResult.rows[0], vitalsResult.rows, conditions);
    await persistAI(req.params.patientId, 'longitudinal_trajectory', { conditions, vitalsCount: vitalsResult.rows.length }, analysis);
    res.json({ analysis, patient: patientResult.rows[0] });
  } catch (err) {
    sendAIError(res, err);
  }
});

// Cost-Aware Treatment Plan
router.post('/cost-aware-plan/:patientId', async (req, res) => {
  try {
    const patientResult = await pool.query('SELECT * FROM patients WHERE id = $1', [req.params.patientId]);
    if (patientResult.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });
    const { diagnosis, formularyContext } = req.body || {};
    if (!diagnosis) return res.status(400).json({ error: 'diagnosis is required' });
    const analysis = await costAwareTreatmentPlan(patientResult.rows[0], diagnosis, formularyContext);
    await persistAI(req.params.patientId, 'cost_aware_plan', { diagnosis, formularyContext }, analysis);
    res.json({ analysis, patient: patientResult.rows[0] });
  } catch (err) {
    sendAIError(res, err);
  }
});

// Caregiver Coaching
router.post('/caregiver-coaching/:patientId', async (req, res) => {
  try {
    const patientResult = await pool.query('SELECT * FROM patients WHERE id = $1', [req.params.patientId]);
    if (patientResult.rows.length === 0) return res.status(404).json({ error: 'Patient not found' });
    const { caregiverContext, focusAreas } = req.body || {};
    const analysis = await caregiverCoaching(patientResult.rows[0], caregiverContext || {}, focusAreas || []);
    await persistAI(req.params.patientId, 'caregiver_coaching', { caregiverContext, focusAreas }, analysis);
    res.json({ analysis, patient: patientResult.rows[0] });
  } catch (err) {
    sendAIError(res, err);
  }
});

// Get AI analysis history (paginated)
router.get('/history', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const [result, countResult] = await Promise.all([
      pool.query(`SELECT aa.*, p.first_name, p.last_name FROM ai_analyses aa LEFT JOIN patients p ON aa.patient_id = p.id ORDER BY aa.created_at DESC LIMIT $1 OFFSET $2`, [limit, offset]),
      pool.query('SELECT COUNT(*) FROM ai_analyses')
    ]);
    const total = parseInt(countResult.rows[0].count);
    res.json({ data: result.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
