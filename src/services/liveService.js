import { api, API_BASE_URL } from './api';

export const liveService = {
  getLiveStats: () => api.get('/live/stats'),
  getActiveUsers: () => api.get('/live/active-users'),
  getCurrentOrders: () => api.get('/live/current-orders'),
  getLiveRevenue: () => api.get('/live/revenue'),

  subscribeToLiveUpdates: (onMessage) => {
    const base = (typeof API_BASE_URL === 'string' && API_BASE_URL.trim()) ? API_BASE_URL.trim() : 'http://localhost:8080/api';
    const url = base.replace(/\/$/, '') + '/live/events';
    const eventSource = new EventSource(url);
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Error parsing live event:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Live service error:', error);
    };

    return eventSource;
  },
};
