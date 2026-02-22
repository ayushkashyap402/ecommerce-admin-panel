import { api } from './api';

export const cartService = {
  // Cart Management
  getCarts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/cart?${queryString}`);
  },
  getCart: (id) => api.get(`/cart/${id}`),
  clearCart: (id) => api.delete(`/cart/${id}`),

  // Cart Analytics
  getAbandonedCarts: () => api.get('/cart/abandoned'),
  getActiveCarts: () => api.get('/cart/active'),
  getCartStats: () => api.get('/cart/stats'),
  getCartConversionRate: () => api.get('/cart/conversion-rate'),
};
