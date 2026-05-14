import axios, { AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data?.data ?? response.data,
  async (error: AxiosError) => {
    const original = error.config as any;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/api/v1/auth/refresh`, { refreshToken });
          const { accessToken } = res.data.data || res.data;
          localStorage.setItem('accessToken', accessToken);
          original.headers.Authorization = `Bearer ${accessToken}`;
          return api(original);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      } else {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

// API methods
export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
};

export const robotsApi = {
  list: (params?: Record<string, string>) => api.get('/robots', { params }),
  get: (id: string) => api.get(`/robots/${id}`),
  history: (id: string) => api.get(`/robots/${id}/service-history`),
  create: (data: any) => api.post('/robots', data),
  update: (id: string, data: any) => api.put(`/robots/${id}`, data),
};

export const serviceOrdersApi = {
  list: (params?: Record<string, string>) => api.get('/service-orders', { params }),
  get: (id: string) => api.get(`/service-orders/${id}`),
  create: (data: any) => api.post('/service-orders', data),
  update: (id: string, data: any) => api.put(`/service-orders/${id}`, data),
  assign: (id: string, data: { technicianId: string; scheduledDate?: string }) =>
    api.post(`/service-orders/${id}/assign`, data),
  start: (id: string) => api.post(`/service-orders/${id}/start`),
  complete: (id: string, resolutionNotes: string) =>
    api.post(`/service-orders/${id}/complete`, { resolutionNotes }),
  cancel: (id: string, reason: string) => api.post(`/service-orders/${id}/cancel`, { reason }),
};

export const maintenanceApi = {
  list: (params?: Record<string, string>) => api.get('/maintenance', { params }),
  upcoming: (days?: number) => api.get('/maintenance/upcoming', { params: { days } }),
  overdue: () => api.get('/maintenance/overdue'),
  acknowledgeAlert: (alertId: string) => api.put(`/maintenance/alerts/${alertId}/acknowledge`),
};

export const techniciansApi = {
  list: (params?: Record<string, string>) => api.get('/technicians', { params }),
  get: (id: string) => api.get(`/technicians/${id}`),
  schedule: (id: string) => api.get(`/technicians/${id}/schedule`),
};

export const companiesApi = {
  clients: {
    list: (params?: Record<string, string>) => api.get('/client-companies', { params }),
    get: (id: string) => api.get(`/client-companies/${id}`),
    create: (data: any) => api.post('/client-companies', data),
  },
  endUsers: {
    list: (params?: Record<string, string>) => api.get('/end-user-companies', { params }),
    get: (id: string) => api.get(`/end-user-companies/${id}`),
    create: (data: any) => api.post('/end-user-companies', data),
  },
};

export const checklistsApi = {
  templates: (params?: Record<string, string>) => api.get('/checklist-templates', { params }),
  orderChecklists: (orderId: string) => api.get(`/service-orders/${orderId}/checklists`),
  submitResponses: (instanceId: string, responses: any[]) =>
    api.post(`/checklists/${instanceId}/responses`, { responses }),
};

export const reportsApi = {
  dashboard: (params?: Record<string, string>) => api.get('/reports/dashboard', { params }),
  serviceSummary: (params?: Record<string, string>) =>
    api.get('/reports/service-summary', { params }),
  robot: (id: string) => api.get(`/reports/robots/${id}`),
  maintenanceCompliance: () => api.get('/reports/maintenance-compliance'),
};

export const notificationsApi = {
  list: () => api.get('/notifications'),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export const geographyApi = {
  countries: () => api.get('/countries'),
};

export const equipmentApi = {
  brands: () => api.get('/brands'),
  models: (brandId?: string) => api.get('/models', { params: brandId ? { brandId } : {} }),
};
