import { useState, useCallback } from 'react';
import errorHandler from '../utils/errorHandler';

export const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleError = useCallback((error, context = {}) => {
    let errorMessage = 'An unexpected error occurred';
    
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.response) {
      errorMessage = errorHandler.handleApiError(error, context);
    } else if (error?.details) {
      errorMessage = errorHandler.handleValidationError(error, context);
    } else {
      errorMessage = error?.message || errorMessage;
    }

    setError(errorMessage);
    errorHandler.showError(errorMessage);
    
    // Auto-clear error after 5 seconds
    setTimeout(() => {
      setError(null);
    }, 5000);

    return errorMessage;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const executeWithErrorHandling = useCallback(async (asyncFn, context = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFn();
      return result;
    } catch (err) {
      handleError(err, context);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  return {
    error,
    loading,
    setError,
    clearError,
    handleError,
    executeWithErrorHandling
  };
};
