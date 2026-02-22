import { api } from './api';

export const orderService = {
  // Order CRUD
  getOrders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/orders/admin/orders?${queryString}`);
  },
  getOrder: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (orderId, status) => api.patch(`/orders/${orderId}/status`, { status }),
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),

  // Order Management
  getOrdersByStatus: (status) => api.get(`/orders/status/${status}`),
  getOrdersByDateRange: (startDate, endDate) => 
    api.get(`/orders/date-range?start=${startDate}&end=${endDate}`),
  
  // Order Stats
  getOrderStats: () => api.get('/orders/stats'),
  getRevenueStats: (period = 'month') => api.get(`/orders/revenue?period=${period}`),
  getPendingOrders: () => api.get('/orders/pending'),
  getShippedOrders: () => api.get('/orders/shipped'),
  getDeliveredOrders: () => api.get('/orders/delivered'),
  
  // Auto-cancellation
  triggerAutoCancellation: () => api.post('/orders/admin/auto-cancel'),
  
  // Return Management
  getAdminReturns: (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString();
    return api.get(`/returns/admin/returns?${queryString}`);
  },
  getReturnStats: () => api.get('/returns/stats'),
  updateReturnStatus: (returnId, data) => api.patch(`/returns/${returnId}/status`, data),
  getReturnById: (returnId) => api.get(`/returns/${returnId}`),
  
  // SuperAdmin endpoints
  getAllOrders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/orders/superadmin/all?${queryString}`);
  },
};
