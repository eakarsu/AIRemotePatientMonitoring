# Governed remote patient monitoring operations

## Intended use and limits

The governed API evaluates bounded observations, device calibration, uncertainty, and follow-up proposals. It is non-diagnostic and cannot autonomously triage emergencies, change medication, refill prescriptions, or message a patient. Qualified clinicians independently review every clinical action; emergency procedures remain external and human-led.

## Data and integrations

Signed tenant/role claims, patient scope, consent/retention, units, timestamps, device and rule/model versions, independent clinical approval, and audit history are mandatory. EHR/FHIR, laboratory, device, pharmacy, scheduling, payer, and secure-messaging actions enter a typed idempotent outbox with leased claims, bounded retries, and dead letters.

## Deploy, rollback, and recovery

Run `./start.sh check`, back up PostgreSQL and referenced clinical records, then use `ALLOW_SCHEMA_MIGRATION=1 ./start.sh migrate`. No schema or seed operation occurs at server startup. Reconcile clinical and delivery receipts before replay. Validate sensitivity, specificity, cohorts, false-negative escalation, latency, and device failure modes. Alert on stale/calibration-invalid readings, unsafe autonomous-action attempts, self-approval, and dead letters.
