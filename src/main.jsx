import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import errorHandler from './utils/errorHandler';

// Request notification permission on app start
errorHandler.requestNotificationPermission();

// Log app initialization
console.log('🚀 Admin Panel starting...');
console.log('📊 Environment:', import.meta.env.MODE);
console.log('🔗 API URL:', import.meta.env.VITE_API_URL);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
