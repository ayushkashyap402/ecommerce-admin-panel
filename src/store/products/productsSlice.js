import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export const fetchProducts = createAsyncThunk(
  'admin/products/fetch',
  async () => api.get('/products')
);

export const createProduct = createAsyncThunk(
  'admin/products/create',
  async (body) => api.post('/products', body)
);

export const updateProduct = createAsyncThunk(
  'admin/products/update',
  async ({ id, ...body }) => api.put(`/products/${id}`, body)
);

export const deleteProduct = createAsyncThunk(
  'admin/products/delete',
  async (id) => {
    await api.delete(`/products/${id}`);
    return id;
  }
);

const productsSlice = createSlice({
  name: 'adminProducts',
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchProducts.fulfilled, (s, a) => {
        s.loading = false;
        s.list = Array.isArray(a.payload) ? a.payload : (a.payload?.products || a.payload?.data || []);
      })
      .addCase(fetchProducts.rejected, (s, a) => { s.loading = false; s.error = a.error.message; })
      .addCase(createProduct.fulfilled, (s, a) => { s.list.push(a.payload); })
      .addCase(updateProduct.fulfilled, (s, a) => {
        const i = s.list.findIndex((p) => p._id === a.payload._id);
        if (i >= 0) s.list[i] = a.payload;
      })
      .addCase(deleteProduct.fulfilled, (s, a) => {
        s.list = s.list.filter((p) => p._id !== a.payload);
      });
  },
});

export default productsSlice.reducer;
