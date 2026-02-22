// Global Error Handler for Admin Panel
import React from 'react';

class ErrorHandler {
  constructor() {
    this.errors = [];
    this.maxErrors = 100; // Keep last 100 errors
  }

  // Log error to console with detailed information
  logError(error, context = {}) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      message: error.message || 'Unknown error',
      stack: error.stack,
      context,
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      userId: this.getCurrentUserId(),
    };

    // Add to error log
    this.errors.push(errorInfo);
    
    // Keep only last maxErrors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Console logging with colors
    if (typeof console !== 'undefined') {
      console.group(`🚨 Error: ${errorInfo.message}`);
      console.error('Error Details:', errorInfo);
      console.groupEnd();
    }

    // Send to error reporting service (if configured)
    this.reportError(errorInfo);
  }

  // Handle API errors
  handleApiError(error, context = {}) {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          errorMessage = data?.message || 'Invalid request data';
          break;
        case 401:
          errorMessage = 'Authentication required. Please login again.';
          break;
        case 403:
          errorMessage = 'Access denied. You don\'t have permission for this action.';
          break;
        case 404:
          errorMessage = 'Requested resource not found.';
          break;
        case 429:
          errorMessage = 'Too many requests. Please try again later.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = data?.message || `Server error (${status})`;
      }
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = 'Network error. Please check your internet connection.';
    } else {
      // Something else happened
      errorMessage = error.message || 'An unexpected error occurred';
    }

    this.logError(error, { ...context, type: 'API_ERROR', errorMessage });
    return errorMessage;
  }

  // Handle validation errors
  handleValidationError(error, context = {}) {
    const errorMessage = error.details?.map(err => err.message).join(', ') || 
                        error.message || 
                        'Validation failed';
    
    this.logError(error, { ...context, type: 'VALIDATION_ERROR', errorMessage });
    return errorMessage;
  }

  // Get current user ID from Redux store
  getCurrentUserId() {
    try {
      const state = require('./store').store.getState();
      return state.auth?.user?.id || 'anonymous';
    } catch {
      return 'anonymous';
    }
  }

  // Report error to external service (optional)
  async reportError(errorInfo) {
    // Only report in production
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
      try {
        // You can integrate with error reporting services like Sentry, LogRocket, etc.
        // For now, just log to console
        if (typeof console !== 'undefined') {
          console.log('📊 Error reported:', errorInfo);
        }
      } catch (reportingError) {
        if (typeof console !== 'undefined') {
          console.error('Failed to report error:', reportingError);
        }
      }
    }
  }

  // Get all errors
  getErrors() {
    return this.errors;
  }

  // Clear error log
  clearErrors() {
    this.errors = [];
  }

  // Show error notification
  showError(message, type = 'error') {
    // You can integrate with toast notifications here
    if (typeof console !== 'undefined') {
      console.error(`🚨 ${type.toUpperCase()}: ${message}`);
    }
    
    // Show browser notification if supported
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Admin Panel Error', {
        body: message,
        icon: '/favicon.ico'
      });
    }
  }

  // Show success notification
  showSuccess(message) {
    if (typeof console !== 'undefined') {
      console.log(`✅ SUCCESS: ${message}`);
    }
    
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Admin Panel Success', {
        body: message,
        icon: '/favicon.ico'
      });
    }
  }

  // Show warning notification
  showWarning(message) {
    if (typeof console !== 'undefined') {
      console.warn(`⚠️ WARNING: ${message}`);
    }
    
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Admin Panel Warning', {
        body: message,
        icon: '/favicon.ico'
      });
    }
  }

  // Request notification permission
  requestNotificationPermission() {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }
}

// Create global error handler instance
const errorHandler = new ErrorHandler();

// Global error boundary component
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    errorHandler.logError(error, {
      componentStack: errorInfo?.componentStack || 'No stack available',
      type: 'REACT_ERROR'
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '8px',
          margin: '20px'
        }}>
          <h2>Something went wrong!</h2>
          <p>An error occurred while rendering this component.</p>
          <details style={{ marginTop: '10px', textAlign: 'left' }}>
            <summary>Error Details</summary>
            <pre style={{ fontSize: '12px', overflow: 'auto' }}>
              {this.state.error?.toString()}
            </pre>
          </details>
          <button 
            onClick={() => typeof window !== 'undefined' && window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Global error handler for unhandled errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorHandler.logError(event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      type: 'UNHANDLED_ERROR'
    });
  });

  // Global error handler for unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    errorHandler.logError(event.reason, {
      type: 'UNHANDLED_PROMISE_REJECTION'
    });
    event.preventDefault();
  });
}

export default errorHandler;
