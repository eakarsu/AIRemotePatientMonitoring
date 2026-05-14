const API_BASE = '/api';

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  // Dashboard
  dashboard: () => request('/dashboard'),

  // CRUD operations with pagination
  getAll: (resource, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/${resource}${qs ? '?' + qs : ''}`);
  },
  getOne: (resource, id) => request(`/${resource}/${id}`),
  create: (resource, data) => request(`/${resource}`, { method: 'POST', body: JSON.stringify(data) }),
  update: (resource, id, data) => request(`/${resource}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (resource, id) => request(`/${resource}/${id}`, { method: 'DELETE' }),

  // Patient-specific
  getPatientVitals: (patientId, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/vitals/patient/${patientId}${qs ? '?' + qs : ''}`);
  },
  getMEWS: (patientId) => request(`/patients/${patientId}/mews`),

  // Vitals ingest
  ingestVitals: (data) => request('/vitals/ingest', { method: 'POST', body: JSON.stringify(data) }),

  // AI endpoints
  aiHealthRisk: (patientId) => request(`/ai/health-risk/${patientId}`, { method: 'POST' }),
  aiSymptomAnalysis: (patientId, symptoms) => request('/ai/symptom-analysis', { method: 'POST', body: JSON.stringify({ patient_id: patientId, symptoms }) }),
  aiPredictive: (patientId) => request(`/ai/predictive/${patientId}`, { method: 'POST' }),
  aiTreatment: (patientId, diagnosis) => request(`/ai/treatment/${patientId}`, { method: 'POST', body: JSON.stringify({ diagnosis }) }),
  aiCarePlan: (patientId, conditions) => request(`/ai/care-plan/${patientId}`, { method: 'POST', body: JSON.stringify({ conditions }) }),
  aiBilling: () => request('/ai/billing-optimization', { method: 'POST' }),
  aiGenerateReport: (patientId) => request(`/ai/patient-reports/${patientId}/generate`, { method: 'POST' }),
  aiCheckInteractions: (medications, patientId) => request('/ai/medications/check-interactions', { method: 'POST', body: JSON.stringify({ medications, patient_id: patientId }) }),
  aiHistory: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/ai/history${qs ? '?' + qs : ''}`);
  },
};
