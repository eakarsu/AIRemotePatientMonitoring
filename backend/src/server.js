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
// === Batch 07 Gaps & Frontend Mounts ===
app.use('/api/gap-no-decompensationalert-predict-acute-events', require('./routes/gap-no-decompensationalert-predict-acute-events'));
app.use('/api/gap-no-medicationoptimization-appropriateness-co', require('./routes/gap-no-medicationoptimization-appropriateness-co'));
app.use('/api/gap-no-socialdeterminantsassessment', require('./routes/gap-no-socialdeterminantsassessment'));
app.use('/api/gap-no-mentalhealthscreening-phq9-gad7-automatio', require('./routes/gap-no-mentalhealthscreening-phq9-gad7-automatio'));
app.use('/api/gap-no-patienteducationcustomizer-literacylangua', require('./routes/gap-no-patienteducationcustomizer-literacylangua'));
app.use('/api/gap-no-anomaly-detection-on-vitals-stream', require('./routes/gap-no-anomaly-detection-on-vitals-stream'));
app.use('/api/gap-no-wearable-integration-apple-health-fitbit', require('./routes/gap-no-wearable-integration-apple-health-fitbit'));
app.use('/api/gap-no-cgm-data-pipeline-dexcom-libre', require('./routes/gap-no-cgm-data-pipeline-dexcom-libre'));
app.use('/api/gap-no-medication-refill-automation-pharmacy-int', require('./routes/gap-no-medication-refill-automation-pharmacy-int'));
app.use('/api/gap-no-telehealth-video-integration', require('./routes/gap-no-telehealth-video-integration'));
app.use('/api/gap-no-patient-messaging-secure-inbox', require('./routes/gap-no-patient-messaging-secure-inbox'));
app.use('/api/gap-no-phr-export-ccda-fhir-bulk', require('./routes/gap-no-phr-export-ccda-fhir-bulk'));
app.use('/api/gap-no-ehr-hl7fhir-connector', require('./routes/gap-no-ehr-hl7fhir-connector'));
app.use('/api/gap-no-caregiver-portal', require('./routes/gap-no-caregiver-portal'));
// === End Batch 07 ===
