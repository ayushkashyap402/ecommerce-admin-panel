import { api } from './api';

export const productService = {
  // Product CRUD
  getProducts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/products?${queryString}`);
  },
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (productData) => api.post('/products', productData),
  updateProduct: (id, productData) => api.put(`/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/products/${id}`),

  // Product Categories
  getCategories: () => api.get('/products/categories'),
  createCategory: (categoryData) => api.post('/products/categories', categoryData),
  updateCategory: (id, categoryData) => api.put(`/products/categories/${id}`, categoryData),
  deleteCategory: (id) => api.delete(`/products/categories/${id}`),

  // Product Stats (with optional admin filtering for SuperAdmin)
  getProductStats: (viewAsAdminId = null) => {
    const params = viewAsAdminId ? `?viewAsAdminId=${viewAsAdminId}` : '';
    return api.get(`/products/stats${params}`);
  },
  getLowStockProducts: (viewAsAdminId = null) => {
    const params = viewAsAdminId ? `?viewAsAdminId=${viewAsAdminId}` : '';
    return api.get(`/products/low-stock${params}`);
  },
  getTopSellingProducts: () => api.get('/products/top-selling'),
};
