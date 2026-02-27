import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export const fetchOrders = createAsyncThunk(
  'admin/orders/fetch',
  async () => {
    const response = await api.get('/orders/admin/orders');
    return response;
  }
);

const ordersSlice = createSlice({
  name: 'adminOrders',
  initialState: { list: [], pagination: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (s) => { 
        s.loading = true; 
        s.error = null; 
      })
      .addCase(fetchOrders.fulfilled, (s, a) => { 
        s.loading = false; 
        // Backend returns { orders: [], pagination: {} }
        s.list = Array.isArray(a.payload.orders) ? a.payload.orders : (Array.isArray(a.payload) ? a.payload : []);
        s.pagination = a.payload.pagination || null;
      })
      .addCase(fetchOrders.rejected, (s, a) => { 
        s.loading = false; 
        s.error = a.error.message; 
      });
  },
});

export default ordersSlice.reducer;
