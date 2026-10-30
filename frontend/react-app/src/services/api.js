import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  login: (username, password) => API.post('/auth/login', { username, password }),
  me: () => API.get('/auth/me')
};

export const objectsApi = {
  list: () => API.get('/objects'),
  conjunctions: (riskLevel) => API.get('/conjunctions', { params: { riskLevel } }),
  acknowledge: (id, userId) => API.post(`/conjunctions/${id}/acknowledge`, null, { params: { userId } }),
  maneuvers: () => API.get('/maneuvers'),
  alerts: () => API.get('/alerts')
};

export const riskApi = {
  scan: () => API.post('/risk/scan'),
  ephemeris: (objectId, start, end) => API.get(`/risk/objects/${objectId}/ephemeris`, { params: { start, end } }),
  calculateDeltaV: (missDistanceKm, requiredMissDistanceKm) => API.post('/risk/calculate-dv', { missDistanceKm, requiredMissDistanceKm })
};

export const ingestApi = {
  tle: (category) => API.post('/ingest/tle', null, { params: { category } })
};
