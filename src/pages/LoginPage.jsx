import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  CircularProgress,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff,
  ShoppingBag
} from '@mui/icons-material';
import { setAuth } from '../store/slices/authSlice';
import { authService } from '../services/authService';
import { setAuthCookie } from '../services/api';
import { useErrorHandler } from '../hooks/useErrorHandler';
import ErrorAlert from '../components/ui/ErrorAlert';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { error, loading, handleError, clearError } = useErrorHandler();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await authService.login(credentials);
      
      setAuthCookie(response.token);
      
      dispatch(setAuth({
        token: response.token,
        username: response.user?.username || response.user?.email,
        role: response.user?.role,
      }));

      navigate('/');
    } catch (err) {
      handleError(err, { component: 'LoginPage', action: 'login' });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        height: '100%',
        width: '100vw',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {loading && <LoadingSpinner message="Signing in..." overlay />}

      {/* Left Side - Gradient Section */}
      <Box
        sx={{
          width: { xs: '100%', md: '50%' },
          height: { xs: '40vh', md: '100vh' },
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 4, md: 8 },
          color: 'white',
          textAlign: 'center',
          flexShrink: 0,
        }}
      >
        {/* Logo Icon */}
        <Box
          sx={{
            width: 100,
            height: 100,
            borderRadius: '24px',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 4,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}
        >
          <ShoppingBag sx={{ fontSize: 50, color: 'white' }} />
        </Box>

        {/* Heading */}
        <Typography
          variant="h2"
          sx={{
            fontWeight: 700,
            mb: 3,
            fontSize: { xs: '2rem', md: '3rem' },
          }}
        >
          Hello OutfitGo!
        </Typography>

        {/* Description */}
        <Typography
          variant="h6"
          sx={{
            opacity: 0.95,
            maxWidth: '500px',
            lineHeight: 1.6,
            fontWeight: 400,
            fontSize: { xs: '1rem', md: '1.25rem' },
          }}
        >
          Manage your e-commerce store efficiently. Track orders, manage inventory, and grow your business with powerful admin tools.
        </Typography>
      </Box>

      {/* Right Side - Login Form */}
      <Box
        sx={{
          width: { xs: '100%', md: '50%' },
          height: { xs: '60vh', md: '100vh' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, md: 4 },
          background: '#f8f9fa',
          overflowY: 'auto',
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: '480px',
            background: 'white',
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
            p: { xs: 4, md: 6 },
          }}
        >
          {/* Form Header */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#1a1a1a',
              mb: 1,
            }}
          >
            OutfitGo Admin
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: '#6b7280',
              mb: 4,
            }}
          >
            Sign in to access your dashboard
          </Typography>

          {/* Error Alert */}
          {error && (
            <Box sx={{ mb: 3 }}>
              <ErrorAlert error={error} onClose={clearError} />
            </Box>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit}>
            {/* Email Input */}
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={credentials.email}
              onChange={handleChange}
              required
              disabled={loading}
              autoComplete="email"
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  background: '#f9fafb',
                  '& fieldset': {
                    borderColor: '#e5e7eb',
                  },
                  '&:hover fieldset': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                    borderWidth: '2px',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#667eea',
                },
              }}
            />

            {/* Password Input */}
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={credentials.password}
              onChange={handleChange}
              required
              disabled={loading}
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  background: '#f9fafb',
                  '& fieldset': {
                    borderColor: '#e5e7eb',
                  },
                  '&:hover fieldset': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#667eea',
                    borderWidth: '2px',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#667eea',
                },
              }}
            />

            {/* Remember Me Checkbox */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                  sx={{
                    color: '#667eea',
                    '&.Mui-checked': {
                      color: '#667eea',
                    },
                  }}
                />
              }
              label={
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  Remember me
                </Typography>
              }
              sx={{ mb: 3 }}
            />

            {/* Login Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.75,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
                  transform: 'translateY(-2px)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
                '&:disabled': {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  opacity: 0.6,
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                'Sign In'
              )}
            </Button>

            {/* Footer */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                © 2024 OutfitGo. All rights reserved.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
