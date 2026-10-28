import { mockService } from './mock-service.js';

const apiBaseUrl = document.querySelector('meta[name="api-base-url"]')?.content.trim().replace(/\/$/, '') || '';

async function request(path, options = {}) {
  const token = localStorage.getItem('@PaivaTeam:token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...(options.headers || {})
  };

  const response = await fetch(`${apiBaseUrl}${path}`, { ...options, headers });

  // Tratamento de Sessão Expirada
  if (response.status === 401) {
    localStorage.removeItem('@PaivaTeam:token');
    window.dispatchEvent(new CustomEvent('auth:expired')); // Avisa o app.js
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  const body = response.status === 204 ? null : await response.json().catch(() => null);
  
  if (!response.ok) {
    const error = new Error(body?.message || 'Não foi possível concluir esta operação.');
    error.status = response.status;
    error.code = body?.code;
    throw error;
  }
  
  return body;
}

const httpService = {
  // Autenticação
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  
  // Rotas do Sistema
  getDashboard: () => request('/dashboard'),
  getStudents: ({ query = '', status = 'Todos' } = {}) => request(`/students?query=${encodeURIComponent(query)}&status=${encodeURIComponent(status)}`),
  getStudent: (id) => request(`/students/${id}`),
  createStudent: (payload) => request('/students', { method: 'POST', body: JSON.stringify(payload) }),
  updateStudent: (id, payload) => request(`/students/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  toggleStudentStatus: (id) => request(`/students/${id}/status`, { method: 'PATCH' }),
  getClasses: () => request('/classes'),
  createClass: (payload) => request('/classes', { method: 'POST', body: JSON.stringify(payload) }),
  updateClass: (id, payload) => request(`/classes/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  closeClass: (id) => request(`/classes/${id}/close`, { method: 'POST' }),
  getPlans: () => request('/plans'),
  updatePlan: (id, payload) => request(`/plans/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  getCharges: () => request('/charges'),
  getFinancialOverview: () => request('/financial/overview'),
  registerPayment: (payload) => request('/payments', { method: 'POST', body: JSON.stringify(payload) }),
  getAttendance: (classId, date) => request(`/attendance?classId=${encodeURIComponent(classId)}&date=${encodeURIComponent(date)}`),
  saveAttendance: (payload) => request('/attendance', { method: 'PUT', body: JSON.stringify(payload) }),
  getAttendanceHistory: (classId) => request(`/attendance/history?classId=${encodeURIComponent(classId || '')}`),
  getGraduations: () => request('/graduations'),
  addGraduation: (payload) => request('/graduations', { method: 'POST', body: JSON.stringify(payload) })
};

export const api = apiBaseUrl ? httpService : mockService;
export const dataMode = apiBaseUrl ? 'api' : 'demo';
export const apiConfiguration = { apiBaseUrl };
