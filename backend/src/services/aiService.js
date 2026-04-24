import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../../.env') });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';

async function callOpenRouter(systemPrompt, userMessage) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'AI Remote Patient Monitoring'
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message || 'OpenRouter API error');
  }
  return data.choices?.[0]?.message?.content || 'No response generated';
}

export async function analyzeHealthRisk(patientData) {
  const systemPrompt = `You are an AI medical risk assessment specialist. Analyze patient data and provide a structured health risk assessment. Include:
1. Overall Risk Level (Low/Medium/High/Critical)
2. Key Risk Factors identified
3. Specific Concerns for each vital sign abnormality
4. Recommended Actions (prioritized)
5. Monitoring Recommendations
Format your response in clear sections with headers.`;

  const userMessage = `Analyze this patient's health data:\n${JSON.stringify(patientData, null, 2)}`;
  return callOpenRouter(systemPrompt, userMessage);
}

export async function analyzeSymptoms(symptoms, patientHistory) {
  const systemPrompt = `You are an AI symptom analysis specialist. Analyze the reported symptoms in context of patient history. Provide:
1. Symptom Analysis Summary
2. Possible Conditions (ranked by likelihood)
3. Urgency Level (Routine/Urgent/Emergency)
4. Recommended Tests or Examinations
5. Immediate Actions Suggested
6. Red Flags to Watch For
This is for clinical decision support only - not a diagnosis.`;

  const userMessage = `Symptoms: ${symptoms}\nPatient History: ${patientHistory}`;
  return callOpenRouter(systemPrompt, userMessage);
}

export async function predictiveAnalytics(patientData, vitalHistory) {
  const systemPrompt = `You are an AI predictive analytics specialist for patient monitoring. Based on vital sign trends and patient history, provide:
1. Trend Analysis for each vital sign
2. Predicted Risk Trajectory (improving/stable/declining)
3. Probability of Adverse Events (hospitalization, ER visit)
4. Early Warning Indicators detected
5. Preventive Interventions recommended
6. Suggested Monitoring Frequency adjustments
Use clinical reasoning and evidence-based guidelines.`;

  const userMessage = `Patient Profile:\n${JSON.stringify(patientData, null, 2)}\n\nVital Sign History:\n${JSON.stringify(vitalHistory, null, 2)}`;
  return callOpenRouter(systemPrompt, userMessage);
}

export async function treatmentRecommendations(patientData, currentMedications, diagnosis) {
  const systemPrompt = `You are an AI clinical decision support specialist. Based on the patient profile, current medications, and diagnosis, provide:
1. Treatment Assessment of current plan
2. Medication Optimization suggestions
3. Lifestyle Modifications recommended
4. Monitoring Parameters to track
5. Potential Drug Interactions to watch
6. Evidence-Based Guidelines referenced
7. Follow-up Schedule recommendations
This is decision support only - all recommendations require physician review.`;

  const userMessage = `Patient: ${JSON.stringify(patientData, null, 2)}\nCurrent Medications: ${JSON.stringify(currentMedications, null, 2)}\nDiagnosis: ${diagnosis}`;
  return callOpenRouter(systemPrompt, userMessage);
}

export async function generateCarePlanAI(patientData, conditions) {
  const systemPrompt = `You are an AI care plan specialist. Generate a comprehensive, personalized care plan including:
1. Care Plan Title and Summary
2. Primary Goals (SMART goals)
3. Interventions (specific, actionable steps)
4. Monitoring Schedule
5. Patient Education Points
6. Escalation Criteria
7. Expected Outcomes and Timeline
Base recommendations on current clinical guidelines.`;

  const userMessage = `Patient: ${JSON.stringify(patientData, null, 2)}\nConditions: ${conditions}`;
  return callOpenRouter(systemPrompt, userMessage);
}

export async function analyzeBillingOptimization(billingData, services) {
  const systemPrompt = `You are an AI healthcare billing optimization specialist. Analyze billing data and provide:
1. Revenue Analysis Summary
2. CPT Code Optimization suggestions
3. Insurance Reimbursement opportunities
4. Compliance Recommendations
5. Cost Reduction strategies
6. Revenue Growth opportunities
7. Billing Efficiency metrics`;

  const userMessage = `Billing Data: ${JSON.stringify(billingData, null, 2)}\nServices: ${JSON.stringify(services, null, 2)}`;
  return callOpenRouter(systemPrompt, userMessage);
}
