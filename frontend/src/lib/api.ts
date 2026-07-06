const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const { supabase } = await import('./supabase');
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Patients
  getPatients: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchWithAuth(`/api/patients${query}`);
  },
  getPatient: (id: string) => fetchWithAuth(`/api/patients/${id}`),
  createPatient: (data: any) => fetchWithAuth('/api/patients', { method: 'POST', body: JSON.stringify(data) }),
  updatePatient: (id: string, data: any) => fetchWithAuth(`/api/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePatient: (id: string) => fetchWithAuth(`/api/patients/${id}`, { method: 'DELETE' }),

  // Appointments
  getAppointments: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchWithAuth(`/api/appointments${query}`);
  },
  getAppointment: (id: string) => fetchWithAuth(`/api/appointments/${id}`),
  createAppointment: (data: any) => fetchWithAuth('/api/appointments', { method: 'POST', body: JSON.stringify(data) }),
  updateAppointment: (id: string, data: any) => fetchWithAuth(`/api/appointments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAppointment: (id: string) => fetchWithAuth(`/api/appointments/${id}`, { method: 'DELETE' }),

  // Prescriptions
  getPrescriptions: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchWithAuth(`/api/prescriptions${query}`);
  },
  createPrescription: (data: any) => fetchWithAuth('/api/prescriptions', { method: 'POST', body: JSON.stringify(data) }),
  voiceToPrescription: (data: any) => fetchWithAuth('/api/prescriptions/voice', { method: 'POST', body: JSON.stringify(data) }),

  // Queue
  getQueue: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchWithAuth(`/api/queue${query}`);
  },
  addToQueue: (data: any) => fetchWithAuth('/api/queue', { method: 'POST', body: JSON.stringify(data) }),
  callNextPatient: (id: string) => fetchWithAuth(`/api/queue/${id}/call`, { method: 'PUT' }),
  completeQueueEntry: (id: string) => fetchWithAuth(`/api/queue/${id}/complete`, { method: 'PUT' }),

  // Billing
  getBilling: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchWithAuth(`/api/billing${query}`);
  },
  createBill: (data: any) => fetchWithAuth('/api/billing', { method: 'POST', body: JSON.stringify(data) }),
  recordPayment: (id: string, data: any) => fetchWithAuth(`/api/billing/${id}/pay`, { method: 'POST', body: JSON.stringify(data) }),

  // Reports
  getReports: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchWithAuth(`/api/reports${query}`);
  },
  uploadReport: (data: any) => fetchWithAuth('/api/reports', { method: 'POST', body: JSON.stringify(data) }),

  // Notifications
  getNotifications: () => fetchWithAuth('/api/notifications'),
  markNotificationsRead: () => fetchWithAuth('/api/notifications/read', { method: 'PUT' }),

  // AI
  aiChat: (data: { message: string; language?: string; history?: any[] }) =>
    fetchWithAuth('/api/ai/chat', { method: 'POST', body: JSON.stringify(data) }),
  ocrScan: (data: { imageBase64: string; mimeType?: string; patient_id?: number }) =>
    fetchWithAuth('/api/ai/ocr', { method: 'POST', body: JSON.stringify(data) }),

  // Analytics
  getAnalytics: () => fetchWithAuth('/api/analytics'),
};

export default api;
