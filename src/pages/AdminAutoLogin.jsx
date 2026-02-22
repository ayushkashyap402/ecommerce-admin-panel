import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { setAuthCookie } from '../services/api';
import { setAuth } from '../store/slices/authSlice';

export const AdminAutoLogin = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState('');
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double execution in React Strict Mode
    if (hasProcessed.current) {
      console.log('⏭️  Already processed, skipping...');
      return;
    }
    
    hasProcessed.current = true;
    
    // Security: Get storage key from URL (not the token itself)
    const storageKey = searchParams.get('key');
    console.log('🔑 Storage key from URL:', storageKey);

    // Security Check 1: Storage key must be present
    if (!storageKey) {
      setError('Invalid access. No authentication key provided.');
      setTimeout(() => navigate('/login', { replace: true }), 2000);
      return;
    }

    try {
      // Security Check 2: Retrieve impersonation data from localStorage
      console.log('📦 Checking localStorage for key:', storageKey);
      console.log('📦 All localStorage keys:', Object.keys(localStorage));
      const impersonationDataStr = localStorage.getItem(storageKey);
      console.log('📦 Retrieved data:', impersonationDataStr ? 'Found' : 'Not found');
      
      if (!impersonationDataStr) {
        throw new Error('Authentication key not found or expired');
      }

      // Parse the data
      const impersonationData = JSON.parse(impersonationDataStr);
      const { token, adminId, adminName, timestamp } = impersonationData;

      // Security Check 3: Verify data is recent (within 15 seconds)
      const now = Date.now();
      if (now - timestamp > 15000) {
        throw new Error('Authentication key has expired');
      }

      // Security Check 4: Token must be present
      if (!token) {
        throw new Error('Invalid authentication data');
      }

      // Immediately remove from localStorage (one-time use)
      localStorage.removeItem(storageKey);

      // Security Check 5: Validate token format (JWT has 3 parts)
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      // Security Check 6: Decode and validate payload
      const payload = JSON.parse(atob(parts[1]));

      // Security Check 7: Verify required fields
      if (!payload.sub || !payload.email || !payload.role) {
        throw new Error('Invalid token payload - missing required fields');
      }

      // Security Check 8: Verify it's an impersonation token
      if (!payload.isImpersonation) {
        throw new Error('Invalid token - not an impersonation token');
      }

      // Security Check 9: Verify role is admin (not superadmin)
      if (payload.role !== 'admin') {
        throw new Error('Invalid token - can only impersonate admin accounts');
      }

      // Security Check 10: Check token expiry
      const nowSec = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < nowSec) {
        throw new Error('Token has expired');
      }

      // Security Check 11: Verify impersonatedBy exists (must be from SuperAdmin)
      if (!payload.impersonatedBy) {
        throw new Error('Invalid token - missing impersonation source');
      }

      // Security Check 12: Verify adminId matches token
      if (payload.sub !== adminId) {
        throw new Error('Token mismatch - admin ID does not match');
      }

      // All security checks passed - proceed with login
      
      console.log('✅ All security checks passed!');
      console.log('📝 Token payload:', { email: payload.email, role: payload.role, sub: payload.sub });
      
      // For impersonated sessions, use sessionStorage (tab-specific)
      // This prevents interfering with other tabs
      sessionStorage.setItem('impersonated_token', token);
      sessionStorage.setItem('impersonated_user', JSON.stringify({
        email: payload.email,
        role: payload.role,
        username: payload.email.split('@')[0]
      }));

      // Dispatch setAuth to Redux
      dispatch(setAuth({
        token,
        username: payload.email.split('@')[0],
        role: payload.role,
      }));

      console.log('✅ Auto-login successful! Redirecting to dashboard...');

      // Clear URL parameters for security (remove key from URL)
      window.history.replaceState({}, document.title, '/');

      // Redirect to dashboard
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 500);

    } catch (error) {
      console.error('Auto-login failed:', error);
      setError(`Authentication failed: ${error.message}`);
      
      // Clear any potentially set cookies
      document.cookie = 'token=; path=/; max-age=0';
      
      // Clean up localStorage
      const storageKey = searchParams.get('key');
      if (storageKey) {
        localStorage.removeItem(storageKey);
      }
      
      // Redirect to login after showing error
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    }
  }, [searchParams, navigate, dispatch]);

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        gap={2}
        p={3}
      >
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          {error}
        </Alert>
        <Typography variant="body2" color="text.secondary">
          Redirecting to login...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      gap={2}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" color="text.secondary">
        Securely loading admin dashboard...
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Verifying authentication...
      </Typography>
    </Box>
  );
};
