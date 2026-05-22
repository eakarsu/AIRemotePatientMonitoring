import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../../.env') });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022';

// 3-strategy JSON parser
export function parseAIJson(content) {
  // Strategy 1: direct parse
  try { return JSON.parse(content); } catch {}
  // Strategy 2: extract from markdown code block
  const md = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (md) { try { return JSON.parse(md[1]); } catch {} }
  // Strategy 3: extract first {...} or [...] block
  const obj = content.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (obj) { try { return JSON.parse(obj[1]); } catch {} }
  return { raw: content };
}

// Sentinel error so route handlers can map to 503 when the LLM key is missing.
export class LLMUnavailableError extends Error {
  constructor(message = 'AI provider not configured (missing OPENROUTER_API_KEY)') {
    super(message);
    this.name = 'LLMUnavailableError';
    this.status = 503;
  }
}

async function callOpenRouter(systemPrompt, userMessage, jsonMode = false) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new LLMUnavailableError();
  }
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
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
      temperature: 0.3,
      max_tokens: 2000
    })
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message || 'OpenRouter API error');
  const content = data.choices?.[0]?.message?.content || 'No response generated';
  if (jsonMode) return parseAIJson(content);
  return content;
}

export async function analyzeHealthRisk(patientData) {
  const systemPrompt = `You are an AI medical risk assessment specialist. Analyze patient data and return a JSON object with:
{
  "overall_risk_level": "Low|Medium|High|Critical",
  "risk_score": 0-100,
  "key_risk_factors": ["..."],
  "vital_sign_concerns": [{"vital": "...", "value": "...", "concern": "..."}],
  "recommended_actions": ["..."],
  "monitoring_recommendations": ["..."],
  "summary": "..."
}
Return ONLY valid JSON.`;
  const userMessage = `Analyze this patient's health data:\n${JSON.stringify(patientData, null, 2)}`;
  return callOpenRouter(systemPrompt, userMessage, true);
}

export async function analyzeSymptoms(symptoms, patientHistory) {
  const systemPrompt = `You are an AI symptom analysis specialist. Return JSON:
{
  "symptom_summary": "...",
  "possible_conditions": [{"condition": "...", "likelihood": "High|Medium|Low", "rationale": "..."}],
  "urgency_level": "Routine|Urgent|Emergency",
  "recommended_tests": ["..."],
  "immediate_actions": ["..."],
  "red_flags": ["..."]
}
This is clinical decision support only. Return ONLY valid JSON.`;
  const userMessage = `Symptoms: ${symptoms}\nPatient History: ${patientHistory}`;
  return callOpenRouter(systemPrompt, userMessage, true);
}

export async function predictiveAnalytics(patientData, vitalHistory) {
  const systemPrompt = `You are an AI predictive analytics specialist. Return JSON:
{
  "trend_analysis": [{"vital": "...", "trend": "improving|stable|declining", "details": "..."}],
  "risk_trajectory": "improving|stable|declining",
  "adverse_event_probability": {"hospitalization": "...", "er_visit": "..."},
  "early_warning_indicators": ["..."],
  "preventive_interventions": ["..."],
  "monitoring_frequency": "..."
}
Return ONLY valid JSON.`;
  const userMessage = `Patient Profile:\n${JSON.stringify(patientData, null, 2)}\n\nVital Sign History:\n${JSON.stringify(vitalHistory, null, 2)}`;
  return callOpenRouter(systemPrompt, userMessage, true);
}

export async function treatmentRecommendations(patientData, currentMedications, diagnosis) {
  const systemPrompt = `You are an AI clinical decision support specialist. Return JSON:
{
  "treatment_assessment": "...",
  "medication_optimizations": [{"medication": "...", "suggestion": "..."}],
  "lifestyle_modifications": ["..."],
  "monitoring_parameters": ["..."],
  "potential_interactions": [{"drugs": "...", "risk": "..."}],
  "evidence_guidelines": ["..."],
  "followup_schedule": "..."
}
Decision support only - physician review required. Return ONLY valid JSON.`;
  const userMessage = `Patient: ${JSON.stringify(patientData, null, 2)}\nCurrent Medications: ${JSON.stringify(currentMedications, null, 2)}\nDiagnosis: ${diagnosis}`;
  return callOpenRouter(systemPrompt, userMessage, true);
}

export async function generateCarePlanAI(patientData, conditions) {
  const systemPrompt = `You are an AI care plan specialist. Return JSON:
{
  "title": "...",
  "summary": "...",
  "primary_goals": [{"goal": "...", "timeline": "...", "metric": "..."}],
  "interventions": ["..."],
  "monitoring_schedule": "...",
  "patient_education": ["..."],
  "escalation_criteria": ["..."],
  "expected_outcomes": "..."
}
Return ONLY valid JSON.`;
  const userMessage = `Patient: ${JSON.stringify(patientData, null, 2)}\nConditions: ${conditions}`;
  return callOpenRouter(systemPrompt, userMessage, true);
}

export async function analyzeBillingOptimization(billingData, services) {
  const systemPrompt = `You are an AI healthcare billing optimization specialist. Return JSON:
{
  "revenue_analysis": "...",
  "cpt_optimizations": [{"current": "...", "suggested": "...", "impact": "..."}],
  "insurance_opportunities": ["..."],
  "compliance_recommendations": ["..."],
  "cost_reduction_strategies": ["..."],
  "revenue_growth_opportunities": ["..."],
  "efficiency_metrics": {"denial_rate": "...", "avg_reimbursement": "..."}
}
Return ONLY valid JSON.`;
  const userMessage = `Billing Data: ${JSON.stringify(billingData, null, 2)}\nServices: ${JSON.stringify(services, null, 2)}`;
  return callOpenRouter(systemPrompt, userMessage, true);
}

export async function generatePatientReport(patientData, vitals, medications, consultations) {
  const systemPrompt = `You are a clinical documentation specialist. Generate a comprehensive patient clinical summary. Return JSON:
{
  "report_title": "...",
  "summary": "...",
  "clinical_status": "...",
  "vital_signs_summary": "...",
  "medications_overview": "...",
  "recent_consultations": "...",
  "care_recommendations": ["..."],
  "follow_up_plan": "..."
}
Return ONLY valid JSON.`;
  const userMessage = `Patient: ${JSON.stringify(patientData)}\nVitals: ${JSON.stringify(vitals)}\nMedications: ${JSON.stringify(medications)}\nConsultations: ${JSON.stringify(consultations)}`;
  return callOpenRouter(systemPrompt, userMessage, true);
}

export async function checkMedicationInteractions(medications) {
  const systemPrompt = `You are a clinical pharmacology specialist. Analyze drug-drug interactions. Return JSON:
{
  "interaction_matrix": [
    {"drug_a": "...", "drug_b": "...", "severity": "minor|moderate|major|contraindicated", "description": "...", "recommendation": "..."}
  ],
  "high_risk_combinations": ["..."],
  "overall_risk": "Low|Medium|High|Critical",
  "monitoring_recommendations": ["..."],
  "safer_alternatives": [{"replace": "...", "with": "...", "rationale": "..."}]
}
Return ONLY valid JSON.`;
  const userMessage = `Analyze interactions for these medications: ${JSON.stringify(medications)}`;
  return callOpenRouter(systemPrompt, userMessage, true);
}

// Predict acute decompensation (HF/COPD/etc.) 48-72h ahead
export async function predictDecompensation(patientData, vitalHistory, conditions) {
  const systemPrompt = `You are an AI clinical decision support model for predicting acute decompensation events 48-72 hours ahead in chronic disease patients (HF, COPD, CKD, etc.). Return ONLY valid JSON:
{
  "predicted_event": "HF_exacerbation|COPD_exacerbation|sepsis|none|other",
  "horizon_hours": 48,
  "probability": 0.0,
  "risk_band": "low|moderate|high|critical",
  "drivers": [{"feature": "...", "value": "...", "weight": 0.0, "rationale": "..."}],
  "recommended_actions": [{"action": "...", "owner": "clinician|nurse|patient", "urgency": "stat|24h|routine"}],
  "patient_education_points": ["..."],
  "summary": "..."
}`;
  const userMessage = `Patient: ${JSON.stringify(patientData)}\nVital trend: ${JSON.stringify(vitalHistory)}\nConditions: ${JSON.stringify(conditions || [])}`;
  return callOpenRouter(systemPrompt, userMessage, true);
}

// Social Determinants of Health screen
export async function assessSocialDeterminants(patientData, screeningAnswers) {
  const systemPrompt = `You are an AI specialized in Social Determinants of Health (SDoH) screening (PRAPARE-style). Return ONLY valid JSON:
{
  "domains": {
    "food_insecurity": {"risk": "none|moderate|high", "evidence": []},
    "housing_instability": {"risk": "none|moderate|high", "evidence": []},
    "transportation": {"risk": "none|moderate|high", "evidence": []},
    "financial_strain": {"risk": "none|moderate|high", "evidence": []},
    "social_isolation": {"risk": "none|moderate|high", "evidence": []},
    "literacy_language": {"risk": "none|moderate|high", "evidence": []},
    "safety": {"risk": "none|moderate|high", "evidence": []}
  },
  "overall_risk": "low|moderate|high",
  "social_prescriptions": [{"resource": "", "category": "food|housing|transport|financial|mental_health|legal", "rationale": ""}],
  "care_team_alerts": [],
  "summary": ""
}`;
  const userMessage = `Patient: ${JSON.stringify(patientData)}\nScreening answers: ${JSON.stringify(screeningAnswers || {})}`;
  return callOpenRouter(systemPrompt, userMessage, true);
}

// Mental health screening (PHQ-9 / GAD-7 style)
export async function mentalHealthScreening(patientData, answers, instruments) {
  const systemPrompt = `You are an AI assisting with mental-health screening (PHQ-9, GAD-7, AUDIT-C). DO NOT provide diagnosis; provide screening interpretation only. Return ONLY valid JSON:
{
  "instruments_scored": [{"instrument": "PHQ-9", "raw_score": 0, "severity": "minimal|mild|moderate|moderately_severe|severe", "items_flagged": []}],
  "suicide_risk_flag": false,
  "suicide_risk_rationale": "",
  "follow_up_actions": [{"action": "", "urgency": "immediate|24h|routine", "owner": "clinician|behavioral_health|self"}],
  "safety_planning_required": false,
  "patient_resources": [{"resource": "988 Suicide & Crisis Lifeline", "context": "US"}],
  "summary": ""
}`;
  const userMessage = `Patient: ${JSON.stringify(patientData)}\nInstruments requested: ${JSON.stringify(instruments || ['PHQ-9'])}\nAnswers: ${JSON.stringify(answers || {})}`;
  return callOpenRouter(systemPrompt, userMessage, true);
}

// Medication regimen optimization (review-only; physician must approve)
export async function medicationOptimization(patientData, currentMedications, conditions, goals) {
  const systemPrompt = `You are an AI clinical decision support model performing a medication regimen review for a chronic-disease patient. Output is for clinician review only — DO NOT prescribe. Consider appropriateness, evidence-based guidelines, drug-disease interactions, drug-drug interactions, renal/hepatic dosing, polypharmacy burden, side-effect profile, and cost-tier (generic preferred where equivalent). Return ONLY valid JSON:
{
  "regimen_summary": "",
  "recommendations": [
    {"medication": "", "action": "continue|adjust_dose|switch|deprescribe|add", "rationale": "", "evidence_level": "A|B|C|expert", "monitoring": ""}
  ],
  "interaction_concerns": [{"drugs": "", "severity": "minor|moderate|major|contraindicated", "mitigation": ""}],
  "deprescribing_candidates": [{"medication": "", "reason": "", "taper_plan": ""}],
  "cost_optimizations": [{"replace": "", "with": "", "savings_estimate": ""}],
  "follow_up_labs": [],
  "patient_counseling_points": [],
  "summary": ""
}`;
  const userMessage = `Patient: ${JSON.stringify(patientData)}\nCurrent Medications: ${JSON.stringify(currentMedications)}\nConditions: ${JSON.stringify(conditions || [])}\nClinician Goals: ${goals || 'general optimization'}`;
  return callOpenRouter(systemPrompt, userMessage, true);
}

// Patient education content customizer (literacy + language adapted)
export async function customizePatientEducation(patientData, topic, options) {
  const opts = options || {};
  const systemPrompt = `You are an AI patient-education specialist. Generate education content adapted to the patient's reading level, primary language, and learning preferences. Stay in plain language; avoid medical jargon unless it is defined inline. Return ONLY valid JSON:
{
  "title": "",
  "reading_level": "5th_grade|8th_grade|adult",
  "language": "en|es|...",
  "summary": "",
  "key_points": [],
  "what_you_should_do": [],
  "warning_signs_call_provider": [],
  "lifestyle_actions": [],
  "myths_vs_facts": [{"myth": "", "fact": ""}],
  "questions_to_ask_your_clinician": [],
  "additional_resources": [{"name": "", "type": "video|article|hotline", "context": ""}]
}`;
  const userMessage = `Patient: ${JSON.stringify(patientData)}\nTopic: ${topic || 'general health'}\nReading level: ${opts.readingLevel || '8th_grade'}\nLanguage: ${opts.language || 'en'}\nFormat preference: ${opts.format || 'bulleted'}\nSpecific concerns: ${opts.concerns || 'none'}`;
  return callOpenRouter(systemPrompt, userMessage, true);
}

// Shared decision-making aid (option grid for clinician/patient)
export async function sharedDecisionMakingAid(patientData, decisionTopic, options) {
  const systemPrompt = `You are an AI shared-decision-making facilitator. Build a balanced option grid that helps a patient and clinician deliberate. Avoid recommending a specific choice; present trade-offs neutrally. Return ONLY valid JSON:
{
  "decision_topic": "",
  "patient_centered_summary": "",
  "options": [
    {"name": "", "what_it_is": "", "pros": [], "cons": [], "typical_outcome": "", "evidence_quality": "high|moderate|low", "cost_band": "low|medium|high"}
  ],
  "questions_for_patient": [],
  "questions_for_clinician": [],
  "values_clarification_prompts": [],
  "next_steps": []
}`;
  const opts = options || {};
  const userMessage = `Patient: ${JSON.stringify(patientData)}\nDecision topic: ${decisionTopic}\nPreferences/values: ${opts.values || 'unspecified'}\nConstraints: ${opts.constraints || 'none'}`;
  return callOpenRouter(systemPrompt, userMessage, true);
}

// Longitudinal trajectory analysis (multi-month)
export async function longitudinalTrajectory(patientData, vitalHistory, conditions) {
  const systemPrompt = `You are an AI clinical analyst examining a multi-month longitudinal trajectory for a chronically-ill patient. Identify trends, inflection points, and projected trajectory. Return ONLY valid JSON:
{
  "horizon_months": 0,
  "trends": [{"metric": "", "direction": "improving|stable|declining", "slope_note": "", "confidence": "high|medium|low"}],
  "inflection_points": [{"date_or_window": "", "metric": "", "interpretation": ""}],
  "projected_trajectory_6mo": "",
  "projected_trajectory_12mo": "",
  "actionable_levers": [],
  "data_gaps": [],
  "summary": ""
}`;
  const userMessage = `Patient: ${JSON.stringify(patientData)}\nConditions: ${JSON.stringify(conditions || [])}\nVital history (chronological): ${JSON.stringify(vitalHistory || [])}`;
  return callOpenRouter(systemPrompt, userMessage, true);
}

// Cost-aware treatment planning
export async function costAwareTreatmentPlan(patientData, diagnosis, formularyContext) {
  const systemPrompt = `You are an AI clinical-economics specialist. Build a treatment plan that balances clinical effectiveness with patient out-of-pocket cost and adherence. Stay within evidence-based standard of care; flag any trade-offs. Return ONLY valid JSON:
{
  "diagnosis": "",
  "tiers": [
    {"tier_name": "low_cost|standard|premium", "regimen": [{"item": "", "monthly_cost_estimate": "", "evidence_level": "A|B|C"}], "expected_clinical_outcome": "", "adherence_risk": "low|medium|high"}
  ],
  "preferred_recommendation": "",
  "rationale": "",
  "patient_assistance_programs": [],
  "decision_factors_for_clinician": [],
  "summary": ""
}`;
  const userMessage = `Patient: ${JSON.stringify(patientData)}\nDiagnosis: ${diagnosis}\nFormulary / insurance context: ${formularyContext || 'unspecified'}`;
  return callOpenRouter(systemPrompt, userMessage, true);
}

// Caregiver coaching
export async function caregiverCoaching(patientData, caregiverContext, focusAreas) {
  const systemPrompt = `You are an AI caregiver-support coach. Generate practical, compassionate coaching for a family or informal caregiver. Cover skills, self-care, escalation criteria, and resources. Return ONLY valid JSON:
{
  "caregiver_role_summary": "",
  "skill_modules": [{"title": "", "why_it_matters": "", "key_actions": [], "common_pitfalls": []}],
  "daily_routine_suggestions": [],
  "warning_signs_call_clinician": [],
  "self_care_for_caregiver": [],
  "respite_resources": [{"name": "", "type": "", "context": ""}],
  "summary": ""
}`;
  const userMessage = `Patient: ${JSON.stringify(patientData)}\nCaregiver context: ${JSON.stringify(caregiverContext || {})}\nFocus areas: ${JSON.stringify(focusAreas || [])}`;
  return callOpenRouter(systemPrompt, userMessage, true);
}

export { OPENROUTER_MODEL };
