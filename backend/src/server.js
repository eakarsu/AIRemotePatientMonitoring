import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import pool from './config/database.js';
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
import escalationLadderRoutes from './routes/escalationLadder.js';
import generatedFeaturesRoutes from './routes/generatedFeatures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
if ((process.env.JWT_SECRET || '').length < 32 || !process.env.GOVERNANCE_TENANT_ID || !process.env.DATABASE_URL) throw new Error('JWT_SECRET, GOVERNANCE_TENANT_ID, and DATABASE_URL are required');

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
app.use('/api/escalation-ladder', escalationLadderRoutes);
app.use('/api', generatedFeaturesRoutes);
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
app.use('/api/governed-remote-monitoring', require('./governance/index.cjs'));

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

app.listen(PORT, () => { console.log(`Backend server running on http://localhost:${PORT}`); });
