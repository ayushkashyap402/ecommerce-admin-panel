import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export const fetchOrders = createAsyncThunk(
  'admin/orders/fetch',
  async () => {
    console.log('Fetching orders from API...');
    const response = await api.get('/orders/admin/orders');
    console.log('Orders API response:', response);
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
        console.log('Orders fetch pending...');
        s.loading = true; 
        s.error = null; 
      })
      .addCase(fetchOrders.fulfilled, (s, a) => { 
        console.log('Orders fetch fulfilled:', a.payload);
        console.log('Orders array:', a.payload.orders);
        console.log('First order:', a.payload.orders?.[0]);
        s.loading = false; 
        // Backend returns { orders: [], pagination: {} }
        s.list = Array.isArray(a.payload.orders) ? a.payload.orders : (Array.isArray(a.payload) ? a.payload : []);
        s.pagination = a.payload.pagination || null;
      })
      .addCase(fetchOrders.rejected, (s, a) => { 
        console.log('Orders fetch rejected:', a.error);
        s.loading = false; 
        s.error = a.error.message; 
      });
  },
});

export default ordersSlice.reducer;
