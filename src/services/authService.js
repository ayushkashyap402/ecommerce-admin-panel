import { api } from './api';

// Backend auth-service exposes admin routes under /auth/admin (e.g. /auth/admin/login)
export const authService = {
  login: (credentials) => api.post('/auth/admin/login', credentials),
  logout: () => Promise.resolve(),
  getProfile: () => api.get('/auth/admin/me'),
  updateProfile: (data) => api.put('/auth/admin/me', data),

  getAdmins: () => api.get('/auth/admin/admins'),
  createAdmin: (adminData) => api.post('/auth/admin/admins', adminData),
  updateAdmin: (id, adminData) => api.put(`/auth/admin/admins/${id}`, adminData),
  deleteAdmin: (id) => api.delete(`/auth/admin/admins/${id}`),
  getAdminStats: () => api.get('/auth/admin/admins/stats'),
  
  // Generate impersonation token for viewing admin dashboard
  generateImpersonationToken: (adminId) => api.post(`/auth/impersonate/${adminId}`),
};
