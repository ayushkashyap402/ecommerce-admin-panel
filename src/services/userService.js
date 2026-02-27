import { api } from './api';

export const userService = {
  // SuperAdmin endpoints
  getPlatformStats: () => api.get('/auth/superadmin/stats'),
  getAllUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/auth/superadmin/users?${queryString}`);
  },
  getUserById: (userId) => api.get(`/auth/superadmin/users/${userId}`),
  updateUserStatus: (userId, data) => api.patch(`/auth/superadmin/users/${userId}/status`, data),
  deleteUser: (userId) => api.delete(`/auth/superadmin/users/${userId}`),
};
