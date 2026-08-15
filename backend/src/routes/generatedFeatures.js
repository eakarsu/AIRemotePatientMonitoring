import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

export const FEATURES = Object.freeze({
  "cf-caregiver-support-coaching": "Caregiver Support Coaching",
  "cf-costaware-treatment-planning": "Costaware Treatment Planning",
  "cf-longitudinal-health-trajectory": "Longitudinal Health Trajectory",
  "cf-predictive-decompensation-alerts": "Predictive Decompensation Alerts",
  "cf-shared-decisionmaking-tool": "Shared Decisionmaking Tool",
  "cf-social-prescribing-recommendations": "Social Prescribing Recommendations",
  "gap-no-anomaly-detection-on-vitals-stream": "No Anomaly Detection On Vitals Stream",
  "gap-no-caregiver-portal": "No Caregiver Portal",
  "gap-no-cgm-data-pipeline-dexcom-libre": "No Cgm Data Pipeline Dexcom Libre",
  "gap-no-decompensationalert-predict-acute-events": "No Decompensationalert Predict Acute Events",
  "gap-no-ehr-hl7fhir-connector": "No Ehr Hl7fhir Connector",
  "gap-no-medication-refill-automation-pharmacy-int": "No Medication Refill Automation Pharmacy Int",
  "gap-no-medicationoptimization-appropriateness-co": "No Medicationoptimization Appropriateness Co",
  "gap-no-mentalhealthscreening-phq9-gad7-automatio": "No Mentalhealthscreening Phq9 Gad7 Automatio",
  "gap-no-patient-messaging-secure-inbox": "No Patient Messaging Secure Inbox",
  "gap-no-patienteducationcustomizer-literacylangua": "No Patienteducationcustomizer Literacylangua",
  "gap-no-phr-export-ccda-fhir-bulk": "No Phr Export Ccda Fhir Bulk",
  "gap-no-socialdeterminantsassessment": "No Socialdeterminantsassessment",
  "gap-no-telehealth-video-integration": "No Telehealth Video Integration",
  "gap-no-wearable-integration-apple-health-fitbit": "No Wearable Integration Apple Health Fitbit",
});

const SYSTEM_PROMPT = `You are a senior domain analyst providing decision support. Return only valid JSON:
{
  "summary": "concise executive finding",
  "confidence": 0,
  "key_findings": [{"finding":"string","evidence":"string","severity":"low|medium|high|critical"}],
  "risks": [{"risk":"string","mitigation":"string"}],
  "prioritized_actions": [{"priority":1,"action":"string","owner":"string","deadline":"string"}],
  "assumptions": ["string"],
  "missing_information": ["string"],
  "follow_up_questions": ["string"]
}
Use only facts supplied by the user. Clearly label assumptions and missing evidence. Do not claim an external integration, notification, approval, transaction, diagnosis, or operational action was executed. A qualified human remains responsible for consequential decisions.`;

function parseContent(content) {
  if (typeof content !== 'string') return content;
  const cleaned = content.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  try { return JSON.parse(cleaned); } catch { return content; }
}

for (const [endpoint, title] of Object.entries(FEATURES)) {
  router.post(`/${endpoint}`, authenticateToken, async (req, res) => {
    const input = typeof req.body?.input === 'string' ? req.body.input.trim() : '';
    if (input.length < 10) return res.status(400).json({ error: 'ValidationError', message: 'Input must contain at least 10 characters.' });
    if (!process.env.OPENROUTER_API_KEY) return res.status(503).json({ error: 'AIServiceNotConfigured', message: 'OPENROUTER_API_KEY is required for AI analysis.' });

    const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';
    const baseUrl = (process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1').replace(/\/$/, '');
    try {
      const providerResponse = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, 'Content-Type': 'application/json', 'HTTP-Referer': process.env.APP_URL || 'http://localhost', 'X-Title': process.env.APP_NAME || 'AI Operations Suite' },
        body: JSON.stringify({ model, temperature: 0.2, max_tokens: 1200, messages: [{ role: 'system', content: `${SYSTEM_PROMPT}\n\nFeature: ${title}` }, { role: 'user', content: input.slice(0, 12000) }] }),
        signal: AbortSignal.timeout(45000),
      });
      const provider = await providerResponse.json();
      const content = provider?.choices?.[0]?.message?.content;
      if (!providerResponse.ok || provider?.error || typeof content !== 'string' || !content.trim()) throw new Error(provider?.error?.message || `OpenRouter HTTP ${providerResponse.status}`);
      return res.json({ feature: endpoint.replace(/\/run$/, ''), title, result: parseContent(content), model: provider.model || model, usage: provider.usage || null, disclaimer: 'Decision support only. Verify source evidence and obtain qualified human approval before consequential action.' });
    } catch (error) {
      console.error(`[generated-ai:${endpoint}]`, error.message);
      return res.status(502).json({ error: 'AIServiceError', message: 'The AI provider could not complete this analysis. Please retry or escalate for manual review.' });
    }
  });
}

export default router;

