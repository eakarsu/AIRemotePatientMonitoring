import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import pool from './config/database.js';
import schema from './config/schema.js';
import seedData from './config/seed.js';
import { generalLimiter } from './middleware/rateLimiter.js';

import authRoutes from './routes/auth.js';
import patientRoutes from './routes/patients.js';
import vitalRoutes from './routes/vitals.js';
import medicationRoutes from './routes/medications.js';
import appointmentRoutes from './routes/appointments.js';
import alertRoutes from './routes/alerts.js';
import carePlanRoutes from './routes/carePlans.js';
import deviceRoutes from './routes/devices.js';
import consultationRoutes from './routes/consultations.js';
import reportRoutes from './routes/reports.js';
import billingRoutes from './routes/billing.js';
import emergencyRoutes from './routes/emergencyProtocols.js';
import aiRoutes from './routes/ai.js';
import customViewsRoutes from './routes/customViews.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(helmet());
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(generalLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/vitals', vitalRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/care-plans', carePlanRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/emergency-protocols', emergencyRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/patient-reports', reportRoutes);
app.use('/api/custom-views', customViewsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Dashboard stats
app.get('/api/dashboard', async (req, res) => {
  try {
    const [patients, vitals, alerts, appointments, devices, billing] = await Promise.all([
      pool.query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = \'critical\') as critical FROM patients'),
      pool.query('SELECT COUNT(*) as total FROM vital_signs WHERE recorded_at > NOW() - INTERVAL \'24 hours\''),
      pool.query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE severity = \'critical\') as critical FROM alerts WHERE status = \'active\''),
      pool.query('SELECT COUNT(*) as total FROM appointments WHERE scheduled_date > NOW() AND status = \'scheduled\''),
      pool.query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE battery_level < 20) as low_battery FROM medical_devices WHERE status = \'active\''),
      pool.query('SELECT COALESCE(SUM(amount), 0) as total_revenue, COALESCE(SUM(patient_responsibility), 0) as outstanding FROM billing')
    ]);

    res.json({
      patients: patients.rows[0],
      vitals: vitals.rows[0],
      alerts: alerts.rows[0],
      appointments: appointments.rows[0],
      devices: devices.rows[0],
      billing: billing.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Initialize DB
async function initDatabase() {
  try {
    await pool.query(schema);
    console.log('Database schema created successfully');

    const userCheck = await pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCheck.rows[0].count) === 0) {
      await pool.query(seedData);
      console.log('Seed data inserted successfully');
    } else {
      console.log('Database already seeded, skipping...');
    }
  } catch (err) {
    console.error('Database initialization error:', err.message);
  }
}

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
});

// AI feature mount: decompensation-alert
import aiDecompensationalertRoutes from './routes/ai-decompensation-alert.js';
app.use('/api/ai/decompensation-alert', aiDecompensationalertRoutes);
// === Batch 07 Gaps & Frontend Mounts (converted from CommonJS require() to dynamic ESM imports) ===
const gapMounts = [
  ['/api/gap-no-decompensationalert-predict-acute-events', './routes/gap-no-decompensationalert-predict-acute-events.js'],
  ['/api/gap-no-medicationoptimization-appropriateness-co', './routes/gap-no-medicationoptimization-appropriateness-co.js'],
  ['/api/gap-no-socialdeterminantsassessment', './routes/gap-no-socialdeterminantsassessment.js'],
  ['/api/gap-no-mentalhealthscreening-phq9-gad7-automatio', './routes/gap-no-mentalhealthscreening-phq9-gad7-automatio.js'],
  ['/api/gap-no-patienteducationcustomizer-literacylangua', './routes/gap-no-patienteducationcustomizer-literacylangua.js'],
  ['/api/gap-no-anomaly-detection-on-vitals-stream', './routes/gap-no-anomaly-detection-on-vitals-stream.js'],
  ['/api/gap-no-wearable-integration-apple-health-fitbit', './routes/gap-no-wearable-integration-apple-health-fitbit.js'],
  ['/api/gap-no-cgm-data-pipeline-dexcom-libre', './routes/gap-no-cgm-data-pipeline-dexcom-libre.js'],
  ['/api/gap-no-medication-refill-automation-pharmacy-int', './routes/gap-no-medication-refill-automation-pharmacy-int.js'],
  ['/api/gap-no-telehealth-video-integration', './routes/gap-no-telehealth-video-integration.js'],
  ['/api/gap-no-patient-messaging-secure-inbox', './routes/gap-no-patient-messaging-secure-inbox.js'],
  ['/api/gap-no-phr-export-ccda-fhir-bulk', './routes/gap-no-phr-export-ccda-fhir-bulk.js'],
  ['/api/gap-no-ehr-hl7fhir-connector', './routes/gap-no-ehr-hl7fhir-connector.js'],
  ['/api/gap-no-caregiver-portal', './routes/gap-no-caregiver-portal.js'],
];
for (const [mountPath, modulePath] of gapMounts) {
  try {
    const mod = await import(modulePath);
    app.use(mountPath, mod.default || mod);
  } catch (e) {
    console.warn(`Skipping mount ${mountPath}: ${e.message}`);
  }
}
// === End Batch 07 ===
