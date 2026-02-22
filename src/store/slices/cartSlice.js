import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  carts: [],
  activeCarts: [],
  abandonedCarts: [],
  stats: null,
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'carts',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setCarts: (state, action) => {
      state.carts = action.payload;
      state.loading = false;
      state.error = null;
    },
    setActiveCarts: (state, action) => {
      state.activeCarts = action.payload;
    },
    setAbandonedCarts: (state, action) => {
      state.abandonedCarts = action.payload;
    },
    setCartStats: (state, action) => {
      state.stats = action.payload;
    },
    clearCartData: (state) => {
      state.carts = [];
      state.activeCarts = [];
      state.abandonedCarts = [];
      state.stats = null;
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setCarts,
  setActiveCarts,
  setAbandonedCarts,
  setCartStats,
  clearCartData,
} = cartSlice.actions;

export default cartSlice.reducer;
