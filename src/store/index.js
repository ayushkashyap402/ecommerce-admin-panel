import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productsReducer from './products/productsSlice';
import ordersReducer from './orders/ordersSlice';
import cartReducer from './slices/cartSlice';
import liveReducer from './slices/liveSlice';

// Load state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('adminState');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

// Save state to localStorage
const saveState = (state) => {
  try {
    const serializedState = JSON.stringify({
      auth: state.auth, // Only persist auth state
    });
    localStorage.setItem('adminState', serializedState);
  } catch (err) {
    // Ignore write errors
  }
};

const persistedState = loadState();

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    orders: ordersReducer,
    carts: cartReducer,
    live: liveReducer,
  },
  preloadedState: persistedState,
});

// Subscribe to store changes and save to localStorage
store.subscribe(() => {
  saveState(store.getState());
});

// Expose store to window for API interceptor
if (typeof window !== 'undefined') {
  window.store = store;
}
