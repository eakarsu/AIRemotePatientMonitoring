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

  // CRUD operations for all entities
  getAll: (resource) => request(`/${resource}`),
  getOne: (resource, id) => request(`/${resource}/${id}`),
  create: (resource, data) => request(`/${resource}`, { method: 'POST', body: JSON.stringify(data) }),
  update: (resource, id, data) => request(`/${resource}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (resource, id) => request(`/${resource}/${id}`, { method: 'DELETE' }),

  // AI endpoints
  aiHealthRisk: (patientId) => request(`/ai/health-risk/${patientId}`, { method: 'POST' }),
  aiSymptomAnalysis: (patientId, symptoms) => request('/ai/symptom-analysis', { method: 'POST', body: JSON.stringify({ patient_id: patientId, symptoms }) }),
  aiPredictive: (patientId) => request(`/ai/predictive/${patientId}`, { method: 'POST' }),
  aiTreatment: (patientId, diagnosis) => request(`/ai/treatment/${patientId}`, { method: 'POST', body: JSON.stringify({ diagnosis }) }),
  aiCarePlan: (patientId, conditions) => request(`/ai/care-plan/${patientId}`, { method: 'POST', body: JSON.stringify({ conditions }) }),
  aiBilling: () => request('/ai/billing-optimization', { method: 'POST' }),
  aiHistory: () => request('/ai/history'),
};
