// Test connection to backend API
import { api } from '../services/api';

export const testConnection = async () => {
  try {
    console.log('Testing API connection...');
    
    // Test health endpoint
    const healthResponse = await fetch(`${import.meta.env.VITE_API_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData);
    
    // Test auth service
    try {
      const authResponse = await api.get('/auth/health');
      console.log('Auth service:', authResponse);
    } catch (err) {
      console.log('Auth service error:', err.message);
    }
    
    return true;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
};
