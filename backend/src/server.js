import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import pool from './config/database.js';
import schema from './config/schema.js';
import seedData from './config/seed.js';

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

app.use(cors());
app.use(express.json());

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
