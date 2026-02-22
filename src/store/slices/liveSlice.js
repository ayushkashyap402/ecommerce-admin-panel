import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  stats: null,
  activeUsers: 0,
  currentOrders: [],
  liveRevenue: 0,
  isConnected: false,
  lastUpdate: null,
};

const liveSlice = createSlice({
  name: 'live',
  initialState,
  reducers: {
    setLiveStats: (state, action) => {
      state.stats = action.payload;
      state.lastUpdate = new Date().toISOString();
    },
    setActiveUsers: (state, action) => {
      state.activeUsers = action.payload;
    },
    setCurrentOrders: (state, action) => {
      state.currentOrders = action.payload;
    },
    setLiveRevenue: (state, action) => {
      state.liveRevenue = action.payload;
    },
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload;
    },
    updateLiveStats: (state, action) => {
      // Merge new stats with existing
      state.stats = { ...state.stats, ...action.payload };
      state.lastUpdate = new Date().toISOString();
    },
    clearLiveData: (state) => {
      state.stats = null;
      state.activeUsers = 0;
      state.currentOrders = [];
      state.liveRevenue = 0;
      state.isConnected = false;
      state.lastUpdate = null;
    },
  },
});

export const {
  setLiveStats,
  setActiveUsers,
  setCurrentOrders,
  setLiveRevenue,
  setConnectionStatus,
  updateLiveStats,
  clearLiveData,
} = liveSlice.actions;

export default liveSlice.reducer;
