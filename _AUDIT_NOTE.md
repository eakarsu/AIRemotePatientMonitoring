# Audit Note — AIRemotePatientMonitoring

## Original audit recommendations (batch_07.md §15)

**Missing AI endpoints:** `/decompensation-alert`, `/medication-optimization`, `/social-determinants-assessment`, `/mental-health-screening`, `/patient-education-customizer`.

**Missing non-AI features:** wearable integration, CGM pipeline, refill automation, telehealth, patient messaging, PHR export.

**Custom suggestions:** predictive decompensation alerts, shared decision-making tool, social prescribing, longitudinal trajectory, cost-aware treatment planning, caregiver coaching.

## Implemented this pass (3 mechanical)
1. `POST /api/ai/decompensation-alert/:patientId` — 48–72h decompensation prediction (HF/COPD/sepsis), uses last 50 vitals.
2. `POST /api/ai/social-determinants/:patientId` — PRAPARE-style SDoH screening with social prescriptions.
3. `POST /api/ai/mental-health-screening/:patientId` — PHQ-9/GAD-7 screen interpretation (no diagnosis), suicide-risk flag, follow-up actions.

Added 3 service methods (predictDecompensation, assessSocialDeterminants, mentalHealthScreening), wired through `/api/ai` router. All persist to `ai_analyses`. Reuses `callOpenRouter`, `aiRateLimiter`, `authenticateToken`. Syntax-checked.

## Backlog (prioritized)
1. `POST /api/ai/medication-optimization` (mechanical follow-up; review for appropriateness/cost/SE).
2. `POST /api/ai/patient-education-customizer` (mechanical).
3. Wearable / CGM ingestion (NEEDS-CREDS — Apple HealthKit, Oura, Dexcom).
4. Telehealth + secure messaging (NEEDS-CREDS).
5. Refill automation (NEEDS-PRODUCT-DECISION + e-prescribing creds).
6. PHR export (mechanical, FHIR formatting).

## Apply pass 3 (frontend)

Action: LEFT-AS-IS — frontend already wired to backend AI endpoints with JWT Bearer auth from localStorage. No idempotent changes required. See `_AUDIT/apply3_logs/ab3_66.md`.

## Apply pass 4 (mechanical backlog)

Implemented 4 new mechanical AI endpoints (cap 5; backlog items 1 & 2 already done in pass 2; PHR/FHIR export skipped because it is data-formatting not LLM-based):

Backend (`backend/src/services/aiService.js` — 4 new functions; `backend/src/routes/ai.js` — 4 new routes):
1. **`POST /api/ai/shared-decision/:patientId`** — neutral option-grid for shared decision-making (`sharedDecisionMakingAid`).
2. **`POST /api/ai/longitudinal-trajectory/:patientId`** — multi-month trajectory analysis using up to 200 historical vitals (`longitudinalTrajectory`).
3. **`POST /api/ai/cost-aware-plan/:patientId`** — tiered treatment plan balancing efficacy and out-of-pocket cost (`costAwareTreatmentPlan`).
4. **`POST /api/ai/caregiver-coaching/:patientId`** — practical coaching for family/informal caregivers (`caregiverCoaching`).

All four reuse the existing `callOpenRouter` helper, the existing `LLMUnavailableError` -> 503 mapping via `sendAIError`, JWT auth, AI rate-limiter, and `persistAI` to `ai_analyses`.

Frontend (4 new pages following existing `MedicationOptimizationPage.jsx` pattern):
- `src/pages/SharedDecisionPage.jsx`
- `src/pages/LongitudinalTrajectoryPage.jsx`
- `src/pages/CostAwarePlanPage.jsx`
- `src/pages/CaregiverCoachingPage.jsx`
- Routes added in `src/App.jsx`; nav links added in `src/components/Layout.jsx` (under "AI Features"). Each page handles 503 with a clear "set OPENROUTER_API_KEY" message and uses the existing `AIOutput` component + JWT bearer from `localStorage`.

NOT implemented (skipped per category):
- Wearable / CGM ingestion (Apple HealthKit, Oura, Dexcom) — NEEDS-CREDS.
- Telehealth + secure messaging — NEEDS-CREDS.
- Refill automation / e-prescribing — NEEDS-PRODUCT-DECISION + creds.
- PHR/FHIR export — not LLM-based; outside scope of this pass (mechanical-but-non-LLM data formatting).

Syntax: `@babel/parser` parses all modified/new files (.js + .jsx). No new deps. No `npm install`. Smoke test skipped.
