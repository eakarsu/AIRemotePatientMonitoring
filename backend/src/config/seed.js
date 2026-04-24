const seedData = `
-- Seed Users
INSERT INTO users (email, password, full_name, role) VALUES
('admin@rpm.com', '$2a$10$8c5qVeRRv/.9FuCaqSuKFOLGKhR7o61cNQMjjMPD0y4xFumSTA7mq', 'Dr. Sarah Johnson', 'admin'),
('doctor@rpm.com', '$2a$10$8c5qVeRRv/.9FuCaqSuKFOLGKhR7o61cNQMjjMPD0y4xFumSTA7mq', 'Dr. Michael Chen', 'doctor')
ON CONFLICT (email) DO NOTHING;

-- Seed Patients (15+)
INSERT INTO patients (first_name, last_name, email, phone, date_of_birth, gender, address, emergency_contact, insurance_provider, insurance_id, medical_history, status, assigned_doctor) VALUES
('James', 'Wilson', 'james.wilson@email.com', '555-0101', '1958-03-15', 'Male', '123 Oak St, Boston, MA', 'Mary Wilson - 555-0201', 'Blue Cross', 'BC-10001', 'Type 2 Diabetes, Hypertension', 'active', 'Dr. Sarah Johnson'),
('Maria', 'Garcia', 'maria.garcia@email.com', '555-0102', '1965-07-22', 'Female', '456 Pine Ave, Boston, MA', 'Carlos Garcia - 555-0202', 'Aetna', 'AE-10002', 'Heart Failure, COPD', 'active', 'Dr. Sarah Johnson'),
('Robert', 'Brown', 'robert.brown@email.com', '555-0103', '1972-11-08', 'Male', '789 Elm Rd, Cambridge, MA', 'Linda Brown - 555-0203', 'United Health', 'UH-10003', 'Atrial Fibrillation', 'active', 'Dr. Michael Chen'),
('Susan', 'Davis', 'susan.davis@email.com', '555-0104', '1980-01-30', 'Female', '321 Maple Dr, Somerville, MA', 'Tom Davis - 555-0204', 'Cigna', 'CG-10004', 'Asthma, Anxiety', 'active', 'Dr. Michael Chen'),
('William', 'Martinez', 'william.martinez@email.com', '555-0105', '1955-09-12', 'Male', '654 Cedar Ln, Brookline, MA', 'Rosa Martinez - 555-0205', 'Medicare', 'MC-10005', 'CHF, Diabetes, CKD Stage 3', 'critical', 'Dr. Sarah Johnson'),
('Jennifer', 'Anderson', 'jennifer.anderson@email.com', '555-0106', '1990-05-18', 'Female', '987 Birch St, Newton, MA', 'Mike Anderson - 555-0206', 'Blue Cross', 'BC-10006', 'Gestational Diabetes', 'active', 'Dr. Sarah Johnson'),
('David', 'Taylor', 'david.taylor@email.com', '555-0107', '1948-12-03', 'Male', '147 Walnut Ave, Quincy, MA', 'Sarah Taylor - 555-0207', 'Medicare', 'MC-10007', 'COPD, Hypertension, Arthritis', 'active', 'Dr. Michael Chen'),
('Lisa', 'Thomas', 'lisa.thomas@email.com', '555-0108', '1975-06-25', 'Female', '258 Spruce Rd, Medford, MA', 'John Thomas - 555-0208', 'Aetna', 'AE-10008', 'Multiple Sclerosis', 'active', 'Dr. Sarah Johnson'),
('Michael', 'Jackson', 'michael.j@email.com', '555-0109', '1960-08-14', 'Male', '369 Ash Dr, Arlington, MA', 'Janet Jackson - 555-0209', 'United Health', 'UH-10009', 'Post-MI, Stent placement', 'monitoring', 'Dr. Michael Chen'),
('Patricia', 'White', 'patricia.white@email.com', '555-0110', '1985-02-28', 'Female', '741 Hickory Ln, Waltham, MA', 'George White - 555-0210', 'Cigna', 'CG-10010', 'Lupus, Hypertension', 'active', 'Dr. Sarah Johnson'),
('Charles', 'Harris', 'charles.harris@email.com', '555-0111', '1952-04-07', 'Male', '852 Poplar St, Malden, MA', 'Dorothy Harris - 555-0211', 'Medicare', 'MC-10011', 'Parkinson Disease, Fall Risk', 'critical', 'Dr. Michael Chen'),
('Nancy', 'Clark', 'nancy.clark@email.com', '555-0112', '1970-10-19', 'Female', '963 Willow Ave, Revere, MA', 'Bob Clark - 555-0212', 'Blue Cross', 'BC-10012', 'Breast Cancer Survivor, Lymphedema', 'active', 'Dr. Sarah Johnson'),
('Thomas', 'Lewis', 'thomas.lewis@email.com', '555-0113', '1945-07-31', 'Male', '174 Chestnut Rd, Chelsea, MA', 'Emma Lewis - 555-0213', 'Medicare', 'MC-10013', 'CHF, Pacemaker, CKD Stage 4', 'critical', 'Dr. Michael Chen'),
('Karen', 'Robinson', 'karen.robinson@email.com', '555-0114', '1988-03-11', 'Female', '285 Sycamore Dr, Everett, MA', 'Dan Robinson - 555-0214', 'Aetna', 'AE-10014', 'Type 1 Diabetes', 'active', 'Dr. Sarah Johnson'),
('Christopher', 'Walker', 'chris.walker@email.com', '555-0115', '1962-09-05', 'Male', '396 Magnolia Ln, Lynn, MA', 'Anne Walker - 555-0215', 'United Health', 'UH-10015', 'Obesity, Sleep Apnea, Hypertension', 'active', 'Dr. Michael Chen'),
('Emily', 'Young', 'emily.young@email.com', '555-0116', '1995-12-20', 'Female', '507 Dogwood St, Salem, MA', 'Mark Young - 555-0216', 'Cigna', 'CG-10016', 'Epilepsy', 'active', 'Dr. Sarah Johnson'),
('Daniel', 'King', 'daniel.king@email.com', '555-0117', '1978-06-14', 'Male', '618 Redwood Ave, Peabody, MA', 'Lisa King - 555-0217', 'Blue Cross', 'BC-10017', 'Crohn Disease, Anemia', 'monitoring', 'Dr. Michael Chen')
ON CONFLICT DO NOTHING;

-- Seed Vital Signs (15+ records)
INSERT INTO vital_signs (patient_id, heart_rate, blood_pressure_systolic, blood_pressure_diastolic, temperature, oxygen_saturation, respiratory_rate, blood_glucose, weight, notes, recorded_at) VALUES
(1, 82, 145, 92, 98.6, 96.5, 18, 185.0, 210.5, 'Elevated BP and glucose', NOW() - INTERVAL '1 hour'),
(2, 95, 160, 100, 99.1, 91.0, 24, 110.0, 165.0, 'Low O2 saturation, elevated HR', NOW() - INTERVAL '2 hours'),
(3, 110, 135, 85, 98.4, 97.0, 16, 95.0, 180.0, 'Irregular rhythm noted', NOW() - INTERVAL '3 hours'),
(4, 75, 120, 78, 98.2, 98.5, 14, 88.0, 135.0, 'Normal vitals', NOW() - INTERVAL '4 hours'),
(5, 88, 170, 105, 99.8, 89.0, 26, 250.0, 195.0, 'CRITICAL: Multiple elevated values', NOW() - INTERVAL '30 minutes'),
(6, 78, 125, 80, 98.5, 99.0, 16, 142.0, 155.0, 'Glucose slightly elevated', NOW() - INTERVAL '5 hours'),
(7, 72, 155, 95, 97.8, 90.5, 22, 100.0, 175.0, 'Low O2 typical for COPD', NOW() - INTERVAL '1 hour'),
(8, 80, 130, 82, 98.9, 97.5, 17, 92.0, 140.0, 'Stable vitals', NOW() - INTERVAL '6 hours'),
(9, 68, 128, 80, 98.3, 98.0, 15, 105.0, 190.0, 'Post-cardiac event monitoring', NOW() - INTERVAL '2 hours'),
(10, 85, 142, 90, 99.0, 96.0, 19, 98.0, 148.0, 'BP trending upward', NOW() - INTERVAL '3 hours'),
(11, 65, 138, 88, 98.1, 95.5, 16, 90.0, 160.0, 'Tremor noted during reading', NOW() - INTERVAL '4 hours'),
(12, 77, 118, 75, 98.7, 98.5, 15, 87.0, 145.0, 'Normal range', NOW() - INTERVAL '5 hours'),
(13, 92, 165, 102, 99.5, 88.0, 28, 110.0, 170.0, 'CRITICAL: O2 low, BP high', NOW() - INTERVAL '45 minutes'),
(14, 80, 115, 72, 98.4, 99.0, 14, 210.0, 130.0, 'High glucose - insulin adjusted', NOW() - INTERVAL '1 hour'),
(15, 90, 150, 96, 98.8, 94.0, 20, 102.0, 285.0, 'Weight management needed', NOW() - INTERVAL '6 hours'),
(1, 80, 140, 88, 98.5, 97.0, 17, 175.0, 210.0, 'Slight improvement in BP', NOW() - INTERVAL '12 hours'),
(2, 92, 155, 98, 98.8, 92.0, 22, 108.0, 165.0, 'O2 improved from previous', NOW() - INTERVAL '14 hours'),
(5, 90, 168, 103, 99.5, 90.0, 25, 240.0, 196.0, 'Still critical, monitoring closely', NOW() - INTERVAL '6 hours')
ON CONFLICT DO NOTHING;

-- Seed Medications (15+ records)
INSERT INTO medications (patient_id, name, dosage, frequency, route, start_date, end_date, prescribing_doctor, status, side_effects, notes) VALUES
(1, 'Metformin', '1000mg', 'Twice daily', 'Oral', '2024-01-15', NULL, 'Dr. Sarah Johnson', 'active', 'Nausea, diarrhea', 'Take with food'),
(1, 'Lisinopril', '20mg', 'Once daily', 'Oral', '2024-01-15', NULL, 'Dr. Sarah Johnson', 'active', 'Dry cough, dizziness', 'Monitor BP regularly'),
(2, 'Furosemide', '40mg', 'Once daily', 'Oral', '2023-11-01', NULL, 'Dr. Sarah Johnson', 'active', 'Dehydration, electrolyte imbalance', 'Monitor weight daily'),
(2, 'Carvedilol', '25mg', 'Twice daily', 'Oral', '2023-11-01', NULL, 'Dr. Sarah Johnson', 'active', 'Fatigue, dizziness', 'Do not stop abruptly'),
(3, 'Warfarin', '5mg', 'Once daily', 'Oral', '2024-02-01', NULL, 'Dr. Michael Chen', 'active', 'Bleeding risk', 'Regular INR monitoring required'),
(4, 'Albuterol', '90mcg', 'As needed', 'Inhaled', '2024-03-01', NULL, 'Dr. Michael Chen', 'active', 'Tremor, tachycardia', 'Use before exercise'),
(5, 'Insulin Glargine', '30 units', 'Once daily', 'Subcutaneous', '2023-06-15', NULL, 'Dr. Sarah Johnson', 'active', 'Hypoglycemia', 'Inject at same time daily'),
(5, 'Enalapril', '10mg', 'Twice daily', 'Oral', '2023-06-15', NULL, 'Dr. Sarah Johnson', 'active', 'Cough, hyperkalemia', 'Renal protection'),
(7, 'Tiotropium', '18mcg', 'Once daily', 'Inhaled', '2024-01-01', NULL, 'Dr. Michael Chen', 'active', 'Dry mouth', 'Use HandiHaler device'),
(8, 'Ocrelizumab', '600mg', 'Every 6 months', 'IV infusion', '2023-09-01', NULL, 'Dr. Sarah Johnson', 'active', 'Infusion reactions', 'Pre-medicate with steroids'),
(9, 'Aspirin', '81mg', 'Once daily', 'Oral', '2024-02-15', NULL, 'Dr. Michael Chen', 'active', 'GI bleeding', 'Lifelong therapy post-MI'),
(10, 'Hydroxychloroquine', '200mg', 'Twice daily', 'Oral', '2023-08-01', NULL, 'Dr. Sarah Johnson', 'active', 'Retinal toxicity', 'Annual eye exams required'),
(11, 'Levodopa/Carbidopa', '25/100mg', 'Three times daily', 'Oral', '2023-05-01', NULL, 'Dr. Michael Chen', 'active', 'Dyskinesia, nausea', 'Take on empty stomach'),
(13, 'Sacubitril/Valsartan', '97/103mg', 'Twice daily', 'Oral', '2023-04-01', NULL, 'Dr. Michael Chen', 'active', 'Hypotension, hyperkalemia', 'Monitor renal function'),
(14, 'Insulin Lispro', 'Sliding scale', 'With meals', 'Subcutaneous', '2024-01-01', NULL, 'Dr. Sarah Johnson', 'active', 'Hypoglycemia', 'Check glucose before meals'),
(15, 'Amlodipine', '10mg', 'Once daily', 'Oral', '2024-02-01', NULL, 'Dr. Michael Chen', 'active', 'Ankle edema', 'Monitor BP'),
(16, 'Levetiracetam', '500mg', 'Twice daily', 'Oral', '2024-03-01', NULL, 'Dr. Sarah Johnson', 'active', 'Drowsiness, mood changes', 'Do not stop abruptly')
ON CONFLICT DO NOTHING;

-- Seed Appointments (15+ records)
INSERT INTO appointments (patient_id, doctor_name, appointment_type, scheduled_date, duration_minutes, status, location, notes) VALUES
(1, 'Dr. Sarah Johnson', 'Follow-up', NOW() + INTERVAL '2 days', 30, 'scheduled', 'Clinic Room 101', 'Diabetes management review'),
(2, 'Dr. Sarah Johnson', 'Urgent', NOW() + INTERVAL '1 day', 45, 'scheduled', 'Clinic Room 102', 'Heart failure exacerbation'),
(3, 'Dr. Michael Chen', 'Routine', NOW() + INTERVAL '5 days', 30, 'scheduled', 'Telehealth', 'INR check and warfarin adjustment'),
(4, 'Dr. Michael Chen', 'Follow-up', NOW() + INTERVAL '7 days', 30, 'scheduled', 'Clinic Room 103', 'Asthma control assessment'),
(5, 'Dr. Sarah Johnson', 'Urgent', NOW() + INTERVAL '1 day', 60, 'scheduled', 'Clinic Room 101', 'Multiple comorbidity management'),
(6, 'Dr. Sarah Johnson', 'Routine', NOW() + INTERVAL '14 days', 30, 'scheduled', 'Clinic Room 104', 'Gestational diabetes monitoring'),
(7, 'Dr. Michael Chen', 'Follow-up', NOW() + INTERVAL '3 days', 30, 'scheduled', 'Telehealth', 'COPD exacerbation check'),
(8, 'Dr. Sarah Johnson', 'Specialist', NOW() + INTERVAL '10 days', 45, 'scheduled', 'Infusion Center', 'MS treatment review'),
(9, 'Dr. Michael Chen', 'Follow-up', NOW() + INTERVAL '4 days', 30, 'scheduled', 'Clinic Room 102', 'Post-MI cardiac rehab'),
(10, 'Dr. Sarah Johnson', 'Routine', NOW() + INTERVAL '21 days', 30, 'scheduled', 'Clinic Room 103', 'Lupus activity assessment'),
(11, 'Dr. Michael Chen', 'Urgent', NOW() + INTERVAL '2 days', 45, 'scheduled', 'Clinic Room 101', 'Parkinsons medication adjustment'),
(12, 'Dr. Sarah Johnson', 'Follow-up', NOW() + INTERVAL '30 days', 30, 'scheduled', 'Telehealth', 'Cancer survivorship visit'),
(13, 'Dr. Michael Chen', 'Urgent', NOW() + INTERVAL '1 day', 60, 'scheduled', 'Clinic Room 102', 'CHF decompensation concern'),
(14, 'Dr. Sarah Johnson', 'Routine', NOW() + INTERVAL '7 days', 30, 'scheduled', 'Clinic Room 104', 'T1D pump adjustment'),
(15, 'Dr. Michael Chen', 'Follow-up', NOW() + INTERVAL '14 days', 45, 'scheduled', 'Clinic Room 103', 'Weight management program'),
(1, 'Dr. Sarah Johnson', 'Telehealth', NOW() - INTERVAL '7 days', 30, 'completed', 'Telehealth', 'Reviewed glucose logs'),
(5, 'Dr. Sarah Johnson', 'Urgent', NOW() - INTERVAL '3 days', 45, 'completed', 'Clinic Room 101', 'Kidney function declining')
ON CONFLICT DO NOTHING;

-- Seed Alerts (15+ records)
INSERT INTO alerts (patient_id, alert_type, severity, message, status) VALUES
(5, 'Critical Vitals', 'critical', 'Blood pressure 170/105 - exceeds critical threshold', 'active'),
(5, 'High Glucose', 'critical', 'Blood glucose 250 mg/dL - immediate attention required', 'active'),
(2, 'Low O2', 'high', 'Oxygen saturation dropped to 91% - below safe threshold', 'active'),
(13, 'Critical Vitals', 'critical', 'O2 saturation 88%, BP 165/102 - multiple critical values', 'active'),
(1, 'Elevated BP', 'medium', 'Blood pressure 145/92 - above target range', 'active'),
(7, 'Low O2', 'high', 'Oxygen saturation 90.5% - monitor closely', 'active'),
(3, 'Irregular HR', 'high', 'Heart rate 110 bpm with irregular rhythm', 'active'),
(10, 'Elevated BP', 'medium', 'Blood pressure 142/90 - trending upward', 'active'),
(15, 'Elevated BP', 'medium', 'Blood pressure 150/96 - above target', 'active'),
(14, 'High Glucose', 'high', 'Blood glucose 210 mg/dL - insulin adjustment needed', 'active'),
(5, 'Medication Reminder', 'low', 'Insulin dose due in 30 minutes', 'active'),
(9, 'Device Alert', 'medium', 'BP monitor battery low - 15% remaining', 'active'),
(2, 'Weight Change', 'high', 'Weight gain of 3 lbs in 24 hours - possible fluid retention', 'active'),
(11, 'Fall Risk', 'high', 'Patient reported near-fall incident today', 'active'),
(13, 'Medication Interaction', 'medium', 'Potential interaction between new supplement and Sacubitril', 'active'),
(6, 'Glucose Trend', 'medium', 'Fasting glucose trending upward over past week', 'active')
ON CONFLICT DO NOTHING;

-- Seed Care Plans (15+ records)
INSERT INTO care_plans (patient_id, title, description, goals, interventions, start_date, end_date, status, created_by) VALUES
(1, 'Diabetes Management Plan', 'Comprehensive T2D management with lifestyle modifications', 'HbA1c below 7%, BP below 130/80', 'Diet counseling, exercise program, medication optimization', '2024-01-15', '2024-07-15', 'active', 'Dr. Sarah Johnson'),
(2, 'Heart Failure Care Plan', 'CHF management with daily monitoring', 'Reduce hospitalizations, maintain NYHA Class II', 'Daily weight checks, fluid restriction, medication adherence', '2023-11-01', '2024-11-01', 'active', 'Dr. Sarah Johnson'),
(3, 'Anticoagulation Management', 'Warfarin therapy management for AFib', 'INR 2.0-3.0 consistently', 'Weekly INR checks, diet education, medication management', '2024-02-01', '2025-02-01', 'active', 'Dr. Michael Chen'),
(4, 'Asthma Action Plan', 'Step-wise asthma management', 'Reduce rescue inhaler use to <2x/week', 'Peak flow monitoring, trigger avoidance, controller medications', '2024-03-01', '2025-03-01', 'active', 'Dr. Michael Chen'),
(5, 'Multi-Morbidity Management', 'Integrated care for CHF, diabetes, and CKD', 'Stabilize kidney function, optimize glucose control', 'Nephrology co-management, renal-safe medications, strict monitoring', '2023-06-15', '2024-06-15', 'active', 'Dr. Sarah Johnson'),
(6, 'Gestational Diabetes Plan', 'GDM management through pregnancy', 'Fasting glucose <95, post-meal <120', 'Diet modification, glucose monitoring 4x daily, possible insulin', '2024-03-01', '2024-09-01', 'active', 'Dr. Sarah Johnson'),
(7, 'COPD Management Plan', 'Pulmonary rehab and exacerbation prevention', 'Reduce exacerbations, improve exercise tolerance', 'Pulmonary rehab, vaccination, inhaler technique review', '2024-01-01', '2025-01-01', 'active', 'Dr. Michael Chen'),
(8, 'MS Disease Management', 'Disease-modifying therapy and symptom management', 'Reduce relapse rate, maintain mobility', 'Ocrelizumab infusions, PT/OT, fatigue management', '2023-09-01', '2024-09-01', 'active', 'Dr. Sarah Johnson'),
(9, 'Cardiac Rehabilitation', 'Post-MI recovery and secondary prevention', 'Complete Phase II rehab, reduce cardiac risk', 'Supervised exercise, risk factor modification, counseling', '2024-02-15', '2024-08-15', 'active', 'Dr. Michael Chen'),
(10, 'Lupus Management Plan', 'SLE disease control and flare prevention', 'SLEDAI score <4, reduce steroid dependence', 'HCQ compliance, sun protection, regular monitoring', '2023-08-01', '2024-08-01', 'active', 'Dr. Sarah Johnson'),
(11, 'Parkinson Fall Prevention', 'Mobility and safety program', 'Zero falls, maintain independence', 'PT assessment, home safety eval, medication timing', '2023-05-01', '2024-05-01', 'active', 'Dr. Michael Chen'),
(12, 'Cancer Survivorship Plan', 'Post-treatment monitoring and wellness', 'Early recurrence detection, quality of life', 'Surveillance imaging, lymphedema management, mental health', '2024-01-01', '2025-01-01', 'active', 'Dr. Sarah Johnson'),
(13, 'Advanced CHF Management', 'Stage D heart failure optimization', 'Reduce symptoms, avoid transplant listing', 'Advanced HF medications, device optimization, palliative care', '2023-04-01', '2024-04-01', 'active', 'Dr. Michael Chen'),
(14, 'T1D Technology Plan', 'Insulin pump and CGM optimization', 'Time in range >70%, reduce hypoglycemia', 'CGM review, pump settings optimization, carb counting', '2024-01-01', '2025-01-01', 'active', 'Dr. Sarah Johnson'),
(15, 'Weight Management Program', 'Comprehensive obesity management', 'Lose 10% body weight in 6 months', 'Nutritionist referral, exercise program, behavioral therapy', '2024-02-01', '2024-08-01', 'active', 'Dr. Michael Chen')
ON CONFLICT DO NOTHING;

-- Seed Medical Devices (15+ records)
INSERT INTO medical_devices (patient_id, device_name, device_type, serial_number, manufacturer, model, status, last_reading, battery_level, firmware_version, assigned_date, notes) VALUES
(1, 'Smart Glucometer', 'Blood Glucose Monitor', 'SG-2024-0001', 'Dexcom', 'G7', 'active', NOW() - INTERVAL '1 hour', 85, '2.1.0', '2024-01-15', 'Continuous glucose monitoring'),
(1, 'Digital BP Monitor', 'Blood Pressure', 'BP-2024-0001', 'Omron', 'Evolv', 'active', NOW() - INTERVAL '2 hours', 72, '1.5.2', '2024-01-15', 'Bluetooth enabled'),
(2, 'Smart Scale', 'Weight Scale', 'WS-2024-0001', 'Withings', 'Body+', 'active', NOW() - INTERVAL '6 hours', 90, '3.0.1', '2023-11-01', 'Daily weight monitoring for CHF'),
(2, 'Pulse Oximeter', 'Oxygen Monitor', 'PO-2024-0001', 'Masimo', 'MightySat', 'active', NOW() - INTERVAL '2 hours', 65, '2.0.0', '2023-11-01', 'Continuous O2 monitoring'),
(3, 'ECG Monitor', 'Cardiac Monitor', 'EC-2024-0001', 'AliveCor', 'KardiaMobile 6L', 'active', NOW() - INTERVAL '4 hours', 80, '1.8.0', '2024-02-01', 'AFib detection'),
(5, 'Insulin Pump', 'Medication Delivery', 'IP-2024-0001', 'Medtronic', '780G', 'active', NOW() - INTERVAL '30 minutes', 55, '4.0.2', '2023-06-15', 'Auto-mode enabled'),
(5, 'CGM Sensor', 'Glucose Monitor', 'CGM-2024-0001', 'Dexcom', 'G7', 'active', NOW() - INTERVAL '5 minutes', 95, '2.1.0', '2023-06-15', 'Replace sensor every 10 days'),
(7, 'Spirometer', 'Pulmonary Function', 'SP-2024-0001', 'Nuvoair', 'Air Next', 'active', NOW() - INTERVAL '8 hours', 78, '1.3.0', '2024-01-01', 'Daily PFT monitoring'),
(9, 'Cardiac Event Monitor', 'Cardiac Monitor', 'CM-2024-0001', 'Zio', 'Patch XT', 'active', NOW() - INTERVAL '1 minute', 40, '3.2.1', '2024-02-15', '14-day continuous monitoring'),
(11, 'Fall Detection Watch', 'Safety Device', 'FD-2024-0001', 'Apple', 'Watch Ultra 2', 'active', NOW() - INTERVAL '10 minutes', 60, '10.3', '2023-05-01', 'Auto fall detection and SOS'),
(13, 'Digital BP Monitor', 'Blood Pressure', 'BP-2024-0002', 'Omron', 'Complete', 'active', NOW() - INTERVAL '3 hours', 30, '1.5.2', '2023-04-01', 'ECG + BP combo device'),
(14, 'Insulin Pump', 'Medication Delivery', 'IP-2024-0002', 'Tandem', 't:slim X2', 'active', NOW() - INTERVAL '15 minutes', 70, '7.6.0', '2024-01-01', 'Control-IQ enabled'),
(14, 'CGM Sensor', 'Glucose Monitor', 'CGM-2024-0002', 'Dexcom', 'G7', 'active', NOW() - INTERVAL '5 minutes', 88, '2.1.0', '2024-01-01', 'Integrated with pump'),
(15, 'Smart Scale', 'Weight Scale', 'WS-2024-0002', 'Withings', 'Body Comp', 'active', NOW() - INTERVAL '12 hours', 95, '3.1.0', '2024-02-01', 'Body composition analysis'),
(15, 'Activity Tracker', 'Fitness Device', 'AT-2024-0001', 'Fitbit', 'Charge 6', 'active', NOW() - INTERVAL '5 minutes', 45, '2.0.3', '2024-02-01', 'Step and activity monitoring'),
(16, 'Seizure Detection', 'Neurological', 'SD-2024-0001', 'Empatica', 'Embrace2', 'active', NOW() - INTERVAL '1 minute', 75, '5.1.0', '2024-03-01', 'Electrodermal activity monitoring')
ON CONFLICT DO NOTHING;

-- Seed Consultations (15+ records)
INSERT INTO consultations (patient_id, doctor_name, consultation_type, scheduled_date, duration_minutes, status, diagnosis, treatment_plan, follow_up_date, notes) VALUES
(1, 'Dr. Sarah Johnson', 'Telehealth', NOW() - INTERVAL '7 days', 30, 'completed', 'T2D uncontrolled', 'Increase Metformin to 1000mg BID, add exercise', '2024-05-01', 'Patient reports non-compliance with diet'),
(2, 'Dr. Sarah Johnson', 'In-Person', NOW() - INTERVAL '3 days', 45, 'completed', 'CHF exacerbation', 'Increase Furosemide, restrict fluids to 1.5L/day', '2024-04-20', 'Weight gain 3 lbs, ankle edema noted'),
(3, 'Dr. Michael Chen', 'Telehealth', NOW() - INTERVAL '14 days', 30, 'completed', 'AFib - stable', 'Continue warfarin 5mg, INR 2.3 - in range', '2024-05-15', 'No bleeding events reported'),
(5, 'Dr. Sarah Johnson', 'In-Person', NOW() - INTERVAL '5 days', 60, 'completed', 'CKD progression', 'Refer to nephrology, adjust medications for GFR', '2024-04-15', 'GFR dropped to 35 from 42'),
(7, 'Dr. Michael Chen', 'Telehealth', NOW() - INTERVAL '10 days', 30, 'completed', 'COPD stable', 'Continue current regimen, flu vaccine due', '2024-05-01', 'No exacerbations in 3 months'),
(8, 'Dr. Sarah Johnson', 'In-Person', NOW() - INTERVAL '30 days', 45, 'completed', 'MS - relapse', 'Steroid pulse therapy, reschedule infusion', '2024-05-15', 'New T2 lesion on MRI'),
(9, 'Dr. Michael Chen', 'In-Person', NOW() - INTERVAL '7 days', 45, 'completed', 'Post-MI stable', 'Continue cardiac rehab Phase II', '2024-05-01', 'Exercise tolerance improving'),
(10, 'Dr. Sarah Johnson', 'Telehealth', NOW() - INTERVAL '21 days', 30, 'completed', 'Lupus flare', 'Short course prednisone, monitor kidneys', '2024-04-25', 'Joint pain and rash worsening'),
(11, 'Dr. Michael Chen', 'In-Person', NOW() - INTERVAL '14 days', 45, 'completed', 'PD - motor fluctuations', 'Adjust L-dopa timing, add entacapone', '2024-04-20', 'Wearing off between doses'),
(13, 'Dr. Michael Chen', 'In-Person', NOW() - INTERVAL '2 days', 60, 'completed', 'CHF decompensation', 'IV diuretics, monitor I/O, consider CRT-D', '2024-04-10', 'LVEF declined to 20%'),
(14, 'Dr. Sarah Johnson', 'Telehealth', NOW() - INTERVAL '7 days', 30, 'completed', 'T1D - hypoglycemia', 'Adjust basal rate, carb ratio changes', '2024-05-01', 'Two severe hypos last week'),
(15, 'Dr. Michael Chen', 'In-Person', NOW() - INTERVAL '14 days', 45, 'completed', 'Obesity management', 'Start GLP-1 agonist, dietitian referral', '2024-04-30', 'BMI 38.5, no contraindications'),
(4, 'Dr. Michael Chen', 'Telehealth', NOW() - INTERVAL '21 days', 30, 'completed', 'Asthma controlled', 'Step down to medium-dose ICS', '2024-05-15', 'No nighttime symptoms x 3 months'),
(6, 'Dr. Sarah Johnson', 'In-Person', NOW() - INTERVAL '7 days', 30, 'completed', 'GDM monitoring', 'Continue diet, start bedtime insulin', '2024-04-15', 'Fasting glucose consistently >100'),
(12, 'Dr. Sarah Johnson', 'Telehealth', NOW() - INTERVAL '30 days', 30, 'completed', 'Cancer surveillance', 'All labs normal, continue monitoring', '2024-07-01', 'No concerning findings')
ON CONFLICT DO NOTHING;

-- Seed Patient Reports (15+ records)
INSERT INTO patient_reports (patient_id, report_type, title, content, generated_by, date_range_start, date_range_end, status) VALUES
(1, 'Monthly Summary', 'January 2024 - Diabetes Report', 'Average glucose: 165 mg/dL. HbA1c estimated 7.8%. BP averaged 142/90. Medication compliance 85%.', 'System', '2024-01-01', '2024-01-31', 'completed'),
(2, 'Weekly Summary', 'CHF Weekly Report', 'Weight trend: +2 lbs. O2 average: 92%. Fluid intake: 1.8L/day avg. Two alerts triggered.', 'System', '2024-04-01', '2024-04-07', 'completed'),
(3, 'INR Report', 'Warfarin Monitoring Report', 'INR values: 2.1, 2.3, 2.5, 2.2. All within therapeutic range. No dose changes needed.', 'Dr. Michael Chen', '2024-03-01', '2024-03-31', 'completed'),
(5, 'Critical Review', 'Multi-Morbidity Assessment', 'GFR declining: 42 to 35. Glucose poorly controlled. CHF compensated. Urgent nephrology referral needed.', 'Dr. Sarah Johnson', '2024-03-01', '2024-04-01', 'completed'),
(7, 'Pulmonary Report', 'COPD Quarterly Review', 'FEV1: 55% predicted (stable). No exacerbations. O2 sat averaging 91%. Inhaler technique verified.', 'Dr. Michael Chen', '2024-01-01', '2024-03-31', 'completed'),
(9, 'Cardiac Report', 'Post-MI Recovery Progress', 'Exercise capacity improved 20%. Resting HR 68. No arrhythmias detected. Medication compliance 95%.', 'Dr. Michael Chen', '2024-02-15', '2024-04-01', 'completed'),
(11, 'Neurology Report', 'Parkinson Assessment', 'UPDRS score: 32 (moderate). Tremor stable. Gait deteriorating. Fall risk assessment: HIGH.', 'Dr. Michael Chen', '2024-03-01', '2024-04-01', 'completed'),
(13, 'Critical Review', 'Advanced CHF Assessment', 'LVEF 20%. BNP 1200. Weight fluctuating. Multiple ED visits. Consider advanced HF therapies.', 'Dr. Michael Chen', '2024-03-01', '2024-04-01', 'completed'),
(14, 'Diabetes Report', 'T1D Quarterly Review', 'Time in range: 58% (target >70%). Average glucose: 180. 5 hypoglycemic events. Pump settings need adjustment.', 'Dr. Sarah Johnson', '2024-01-01', '2024-03-31', 'completed'),
(15, 'Weight Management', 'Obesity Program Progress', 'Starting BMI: 39.2. Current BMI: 38.5. Weight loss: 4 lbs. Steps/day: 4500 avg. Diet compliance 60%.', 'Dr. Michael Chen', '2024-02-01', '2024-04-01', 'completed'),
(4, 'Respiratory Report', 'Asthma Control Assessment', 'ACT score: 22 (well-controlled). Peak flow: 85% personal best. Rescue inhaler use: 1x/week.', 'Dr. Michael Chen', '2024-01-01', '2024-03-31', 'completed'),
(6, 'Prenatal Report', 'GDM Monitoring Summary', 'Fasting glucose avg: 102. Post-meal avg: 135. Weight gain appropriate. No fetal concerns.', 'Dr. Sarah Johnson', '2024-03-01', '2024-04-01', 'completed'),
(8, 'Neurology Report', 'MS Disease Activity', 'No clinical relapses. New T2 lesion on MRI. EDSS: 2.5 (stable). Infusion tolerated well.', 'Dr. Sarah Johnson', '2023-09-01', '2024-03-31', 'completed'),
(10, 'Rheumatology Report', 'Lupus Activity Report', 'SLEDAI: 6 (moderate activity). Joint symptoms worsening. Kidney function stable. Anti-dsDNA elevated.', 'Dr. Sarah Johnson', '2024-01-01', '2024-04-01', 'completed'),
(12, 'Oncology Report', 'Cancer Survivorship Review', 'All tumor markers normal. CT chest clear. Lymphedema stable. Emotional health: PHQ-9 score 8.', 'Dr. Sarah Johnson', '2024-01-01', '2024-04-01', 'completed')
ON CONFLICT DO NOTHING;

-- Seed Billing (15+ records)
INSERT INTO billing (patient_id, service_type, amount, insurance_covered, patient_responsibility, billing_date, due_date, status, insurance_claim_id, cpt_code, notes) VALUES
(1, 'RPM Monthly - Diabetes', 150.00, 120.00, 30.00, '2024-03-01', '2024-04-01', 'paid', 'CLM-2024-0001', '99458', 'Monthly RPM monitoring fee'),
(2, 'RPM Monthly - CHF', 200.00, 180.00, 20.00, '2024-03-01', '2024-04-01', 'paid', 'CLM-2024-0002', '99458', 'Enhanced monitoring for CHF'),
(3, 'RPM Monthly - Cardiac', 150.00, 135.00, 15.00, '2024-03-01', '2024-04-01', 'paid', 'CLM-2024-0003', '99458', 'Cardiac monitoring with ECG'),
(4, 'RPM Monthly - Respiratory', 100.00, 80.00, 20.00, '2024-03-01', '2024-04-01', 'pending', 'CLM-2024-0004', '99457', 'Asthma monitoring'),
(5, 'RPM Monthly - Complex', 250.00, 225.00, 25.00, '2024-03-01', '2024-04-01', 'paid', 'CLM-2024-0005', '99458', 'Complex multi-morbidity monitoring'),
(6, 'RPM Monthly - Prenatal', 125.00, 112.50, 12.50, '2024-03-01', '2024-04-01', 'pending', 'CLM-2024-0006', '99457', 'GDM prenatal monitoring'),
(7, 'RPM Monthly - Pulmonary', 150.00, 135.00, 15.00, '2024-03-01', '2024-04-01', 'paid', 'CLM-2024-0007', '99458', 'COPD monitoring with spirometry'),
(8, 'RPM Monthly - Neuro', 175.00, 157.50, 17.50, '2024-03-01', '2024-04-01', 'overdue', 'CLM-2024-0008', '99458', 'MS disease monitoring'),
(9, 'RPM Monthly - Cardiac', 200.00, 180.00, 20.00, '2024-03-01', '2024-04-01', 'paid', 'CLM-2024-0009', '99458', 'Post-MI monitoring with event monitor'),
(10, 'RPM Monthly - Rheumatology', 125.00, 100.00, 25.00, '2024-03-01', '2024-04-01', 'pending', 'CLM-2024-0010', '99457', 'Lupus monitoring'),
(11, 'RPM Monthly - Neuro', 175.00, 157.50, 17.50, '2024-03-01', '2024-04-01', 'paid', 'CLM-2024-0011', '99458', 'Parkinson monitoring with fall detection'),
(12, 'RPM Monthly - Oncology', 100.00, 90.00, 10.00, '2024-03-01', '2024-04-01', 'paid', 'CLM-2024-0012', '99457', 'Cancer survivorship monitoring'),
(13, 'RPM Monthly - CHF Advanced', 250.00, 225.00, 25.00, '2024-03-01', '2024-04-01', 'paid', 'CLM-2024-0013', '99458', 'Advanced CHF monitoring'),
(14, 'RPM Monthly - T1D', 175.00, 157.50, 17.50, '2024-03-01', '2024-04-01', 'pending', 'CLM-2024-0014', '99458', 'T1D pump and CGM monitoring'),
(15, 'RPM Monthly - Weight', 100.00, 75.00, 25.00, '2024-03-01', '2024-04-01', 'overdue', 'CLM-2024-0015', '99457', 'Weight management monitoring'),
(1, 'Telehealth Visit', 75.00, 60.00, 15.00, '2024-03-15', '2024-04-15', 'pending', 'CLM-2024-0016', '99441', 'Telehealth follow-up'),
(5, 'Urgent Visit', 150.00, 135.00, 15.00, '2024-03-20', '2024-04-20', 'pending', 'CLM-2024-0017', '99215', 'Urgent office visit')
ON CONFLICT DO NOTHING;

-- Seed Emergency Protocols (15+ records)
INSERT INTO emergency_protocols (patient_id, protocol_name, trigger_condition, severity, steps, emergency_contacts, medications_to_administer, hospital_preference, status, notes) VALUES
(1, 'Hypoglycemia Protocol', 'Blood glucose below 70 mg/dL', 'high', '1. Check glucose immediately\n2. Give 15g fast-acting carbs\n3. Recheck in 15 minutes\n4. If unconscious, administer glucagon\n5. Call 911 if no improvement', 'Mary Wilson: 555-0201, Dr. Johnson: 555-1001', 'Glucagon 1mg IM if unconscious', 'Massachusetts General Hospital', 'active', 'Patient keeps glucagon kit at home'),
(2, 'CHF Decompensation Protocol', 'Weight gain >3 lbs/24hrs OR O2 <90%', 'critical', '1. Elevate head of bed\n2. Administer supplemental O2\n3. Take extra Furosemide 40mg\n4. Restrict fluids immediately\n5. Call cardiology on-call\n6. Go to ER if symptoms worsen', 'Carlos Garcia: 555-0202, Dr. Johnson: 555-1001', 'Furosemide 40mg PO, O2 2-4L NC', 'Brigham and Womens Hospital', 'active', 'Has home oxygen concentrator'),
(3, 'Bleeding Protocol', 'Signs of major bleeding on Warfarin', 'critical', '1. Apply direct pressure to wound\n2. Do NOT take next Warfarin dose\n3. Call Dr. Chen immediately\n4. Go to ER for INR check\n5. Vitamin K may be needed', 'Linda Brown: 555-0203, Dr. Chen: 555-1002', 'Vitamin K 10mg PO if INR >9', 'Beth Israel Hospital', 'active', 'High bleeding risk due to AFib anticoagulation'),
(5, 'Multi-System Emergency', 'Any critical vital sign abnormality', 'critical', '1. Assess ABCs immediately\n2. Check glucose - treat if <70\n3. Administer O2 if sat <92%\n4. Call 911 immediately\n5. Bring medication list to ER\n6. Notify all specialists', 'Rosa Martinez: 555-0205, Dr. Johnson: 555-1001', 'Glucose tabs, O2, Insulin per sliding scale', 'Massachusetts General Hospital', 'active', 'Complex patient - multiple organ involvement'),
(7, 'COPD Exacerbation Protocol', 'O2 sat <88% OR severe dyspnea', 'high', '1. Use rescue inhaler (Albuterol)\n2. Start supplemental O2 at 2L\n3. Take Prednisone 40mg if available\n4. Call pulmonology\n5. Go to ER if no improvement in 30 min', 'Sarah Taylor: 555-0207, Dr. Chen: 555-1002', 'Albuterol nebulizer, Prednisone 40mg', 'Mass General Hospital', 'active', 'Has nebulizer and O2 at home'),
(9, 'Chest Pain Protocol', 'New chest pain or pressure', 'critical', '1. Call 911 immediately\n2. Chew Aspirin 325mg\n3. Rest in comfortable position\n4. Use Nitroglycerin if prescribed\n5. Do NOT drive to hospital', 'Janet Jackson: 555-0209, Dr. Chen: 555-1002', 'Aspirin 325mg chew, Nitroglycerin 0.4mg SL', 'Brigham and Womens Hospital', 'active', 'History of MI - high risk for recurrence'),
(11, 'Fall Emergency Protocol', 'Any fall event detected', 'high', '1. Do not move if injury suspected\n2. Check for head injury\n3. Assess for fractures\n4. Call 911 if cannot get up safely\n5. Notify Dr. Chen', 'Dorothy Harris: 555-0211, Dr. Chen: 555-1002', 'None - assess before medicating', 'Beth Israel Hospital', 'active', 'High fall risk due to Parkinsons'),
(13, 'Advanced CHF Emergency', 'O2 <85% OR severe edema OR confusion', 'critical', '1. Call 911 immediately\n2. Sit upright, legs dangling\n3. Administer O2 at 4L\n4. Do NOT give extra fluids\n5. Bring device data to ER', 'Emma Lewis: 555-0213, Dr. Chen: 555-1002', 'O2 4L NC, Furosemide 80mg IV in ER', 'Brigham and Womens Hospital', 'active', 'End-stage CHF - DNR status confirmed'),
(14, 'Severe Hypoglycemia Protocol', 'Blood glucose <54 mg/dL', 'critical', '1. If conscious: 30g fast-acting carbs\n2. If unconscious: Glucagon 1mg IM\n3. Call 911\n4. Turn off insulin pump\n5. Recheck glucose every 5 minutes', 'Dan Robinson: 555-0214, Dr. Johnson: 555-1001', 'Glucagon 1mg IM, Glucose gel', 'Massachusetts General Hospital', 'active', 'T1D - carries glucagon pen'),
(16, 'Seizure Protocol', 'Seizure activity detected or witnessed', 'critical', '1. Clear area of hazards\n2. Do NOT restrain\n3. Time the seizure\n4. Call 911 if >5 minutes\n5. Place in recovery position after\n6. Administer rescue medication if prescribed', 'Mark Young: 555-0216, Dr. Johnson: 555-1001', 'Midazolam nasal spray if prolonged seizure', 'Massachusetts General Hospital', 'active', 'Breakthrough seizures possible'),
(4, 'Severe Asthma Attack', 'Peak flow <50% personal best', 'high', '1. Use rescue inhaler 4 puffs\n2. Wait 4 minutes\n3. If no improvement, repeat\n4. Start Prednisone 40mg\n5. Go to ER if still distressed', 'Tom Davis: 555-0204, Dr. Chen: 555-1002', 'Albuterol 4-8 puffs, Prednisone 40mg', 'Beth Israel Hospital', 'active', 'Carries EpiPen for allergic asthma triggers'),
(6, 'GDM Emergency Protocol', 'Glucose >250 OR signs of DKA', 'high', '1. Check for ketones\n2. If ketones positive, go to ER\n3. Hydrate with water\n4. Contact OB immediately\n5. Monitor fetal movement', 'Mike Anderson: 555-0206, Dr. Johnson: 555-1001', 'Insulin per correction factor', 'Brigham and Womens Hospital', 'active', 'Pregnant - OB must be involved in all emergencies'),
(10, 'Lupus Flare Protocol', 'New rash, fever >101, or joint crisis', 'medium', '1. Take temperature\n2. Start Prednisone burst if prescribed\n3. Contact rheumatology\n4. Go to ER if fever >103\n5. Avoid sun exposure', 'George White: 555-0210, Dr. Johnson: 555-1001', 'Prednisone 20mg if prescribed for flares', 'Beth Israel Hospital', 'active', 'Lupus nephritis risk - monitor for dark urine'),
(12, 'Lymphedema Emergency', 'Sudden arm swelling or redness with fever', 'medium', '1. Elevate affected arm\n2. Check temperature\n3. If fever >100.4, may be cellulitis\n4. Go to ER for antibiotics\n5. Remove compression garment if painful', 'Bob Clark: 555-0212, Dr. Johnson: 555-1001', 'Antibiotics if cellulitis suspected (ER)', 'Dana-Farber Cancer Center', 'active', 'Post-mastectomy - right arm at risk'),
(15, 'Sleep Apnea Emergency', 'Witnessed prolonged apnea or cyanosis', 'high', '1. Stimulate patient\n2. Reposition to side\n3. Check CPAP function\n4. Call 911 if not breathing\n5. Start CPR if needed', 'Anne Walker: 555-0215, Dr. Chen: 555-1002', 'None - supportive care only', 'Massachusetts General Hospital', 'active', 'Severe OSA - CPAP compliance 60%')
ON CONFLICT DO NOTHING;
`;

export default seedData;
