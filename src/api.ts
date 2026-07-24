// Client-side API helper for HealthOrbit

const API_BASE = '/api';

function getHeaders() {
  const token = localStorage.getItem('sihrms_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function request(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {}),
    },
  };

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (netErr) {
    throw new Error('Unable to connect to the server. Please try again.');
  }

  const contentType = response.headers.get('content-type');
  const isJson = !!(contentType && contentType.includes('application/json'));
  
  let data: any = null;
  if (isJson) {
    try {
      data = await response.json();
    } catch (e) {
      // Fallback if JSON is malformed
    }
  }

  if (response.status === 401) {
    localStorage.removeItem('sihrms_token');
    window.dispatchEvent(new CustomEvent('healthorbit-session-expired'));
  }

  if (!response.ok) {
    if (!isJson || data === null) {
      throw new Error('Unable to connect to the server. Please try again.');
    }
    const errMsg = (data && (typeof data.error === 'object' ? data.error.message : data.error) || data.message) || `HTTP Error ${response.status}`;
    throw new Error(errMsg);
  }

  if (data === null) {
    throw new Error('Unable to connect to the server. Please try again.');
  }

  return data;
}

export const api = {
  // Auth
  register: (body: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),

  // Patient
  getPatientDashboard: () => request('/patient/dashboard'),
  updateProfile: (body: any) => request('/patient/profile', { method: 'PUT', body: JSON.stringify(body) }),
  uploadRecord: (body: any) => request('/patient/upload-record', { method: 'POST', body: JSON.stringify(body) }),
  deleteRecord: (id: string) => request(`/patient/delete-record/${id}`, { method: 'DELETE' }),
  respondAccess: (id: string, status: 'approved' | 'rejected') => request(`/patient/respond-access/${id}`, { method: 'POST', body: JSON.stringify({ status }) }),
  getAccessHistory: () => request('/patient/access-history'),
  getEmergencyProfile: (patientId: string) => request(`/patient/emergency-profile/${patientId}`),
  getNotifications: () => request('/patient/notifications'),
  markNotificationRead: (id: string) => request(`/patient/notifications/read/${id}`, { method: 'POST' }),
  markAllNotificationsRead: () => request('/patient/notifications/read-all', { method: 'POST' }),

  // Doctor
  getDoctorDashboard: () => request('/doctor/dashboard'),
  searchPatient: (patientId: string) => request('/doctor/search-patient', { method: 'POST', body: JSON.stringify({ patientId }) }),
  searchPatientByQuery: (query: string) => request('/doctor/search-patient', { method: 'POST', body: JSON.stringify({ query }) }),
  updateDoctorProfile: (body: any) => request('/doctor/profile', { method: 'PUT', body: JSON.stringify(body) }),
  logAction: (action: string, details: string) => request('/audit/log-action', { method: 'POST', body: JSON.stringify({ action, details }) }),
  requestAccess: (patientId: string, recordId: string) => request('/doctor/request-access', { method: 'POST', body: JSON.stringify({ patientId, recordId }) }),
  addPrescription: (body: any) => request('/doctor/add-prescription', { method: 'POST', body: JSON.stringify(body) }),

  // Admin
  getAdminDashboard: () => request('/admin/dashboard'),
  verifyDoctor: (userId: string, verify: boolean) => request(`/admin/verify-doctor/${userId}`, { method: 'POST', body: JSON.stringify({ verify }) }),
  addHospital: (body: any) => request('/admin/add-hospital', { method: 'POST', body: JSON.stringify(body) }),
};
