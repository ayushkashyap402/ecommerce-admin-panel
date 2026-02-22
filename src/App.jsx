import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store } from './store';
import { useAppSelector } from './store/hooks';
import { ErrorBoundary } from './utils/errorHandler';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { AdminAutoLogin } from './pages/AdminAutoLogin';
import { setAuth, logout } from './store/slices/authSlice';

// Import role-specific pages
import * as AdminPages from './pages/admin';
import * as SuperAdminPages from './pages/superadmin';

// Helper to get cookie
function getCookie(name) {
  const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
  return v ? v.pop() : null;
}

// Helper to decode JWT
function decodeJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (e) {
    return null;
  }
}

function PrivateRoute({ children }) {
  const { token, role } = useAppSelector((s) => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  if (!['admin', 'superadmin'].includes(role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function SuperAdminRoute({ children }) {
  const { token, role } = useAppSelector((s) => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  if (role !== 'superadmin') {
    return <Navigate to="/" replace />;
  }
  return children;
}

// Role-based page selector component
function RoleBasedPage({ adminPage: AdminPage, superAdminPage: SuperAdminPage }) {
  const { role } = useAppSelector((s) => s.auth);
  const isSuperAdmin = role === 'superadmin';
  return isSuperAdmin ? <SuperAdminPage /> : <AdminPage />;
}

function AppContent() {
  const dispatch = useDispatch();
  const reduxToken = useAppSelector((s) => s.auth.token);

  // Sync auth on app load
  useEffect(() => {
    // Check sessionStorage first (impersonated sessions - tab-specific)
    const sessionToken = sessionStorage.getItem('impersonated_token');
    const sessionUserStr = sessionStorage.getItem('impersonated_user');
    
    if (sessionToken && sessionUserStr) {
      console.log('🔄 Loading impersonated session from sessionStorage');
      try {
        const sessionUser = JSON.parse(sessionUserStr);
        dispatch(setAuth({
          token: sessionToken,
          username: sessionUser.username,
          role: sessionUser.role,
        }));
        return; // Don't check cookie if sessionStorage has token
      } catch (e) {
        console.error('Failed to parse session user:', e);
      }
    }
    
    // Check cookie (normal sessions - shared across tabs)
    const cookieToken = getCookie('token');
    
    // If cookie has token but Redux doesn't, or tokens are different
    if (cookieToken && cookieToken !== reduxToken) {
      console.log('🔄 Syncing auth from cookie to Redux');
      const payload = decodeJWT(cookieToken);
      
      if (payload && payload.email && payload.role) {
        dispatch(setAuth({
          token: cookieToken,
          username: payload.email.split('@')[0],
          role: payload.role,
        }));
      }
    }
    // If Redux has token but neither sessionStorage nor cookie has it, logout
    else if (reduxToken && !sessionToken && !cookieToken) {
      console.log('🚪 No valid token found, logging out');
      dispatch(logout());
    }
  }, [dispatch, reduxToken]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin-login" element={<AdminAutoLogin />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route 
          index 
          element={
            <RoleBasedPage 
              adminPage={AdminPages.DashboardPage} 
              superAdminPage={SuperAdminPages.DashboardPage} 
            />
          } 
        />
        <Route 
          path="products" 
          element={
            <React.Suspense fallback={<div>Loading...</div>}>
              <RoleBasedPage 
                adminPage={AdminPages.ProductsPage} 
                superAdminPage={SuperAdminPages.ProductsPage} 
              />
            </React.Suspense>
          } 
        />
        <Route 
          path="orders" 
          element={
            <React.Suspense fallback={<div>Loading...</div>}>
              <RoleBasedPage 
                adminPage={AdminPages.OrdersPage} 
                superAdminPage={SuperAdminPages.OrdersPage} 
              />
            </React.Suspense>
          } 
        />
        <Route 
          path="analytics" 
          element={
            <React.Suspense fallback={<div>Loading...</div>}>
              <RoleBasedPage 
                adminPage={AdminPages.AnalyticsPage} 
                superAdminPage={SuperAdminPages.AnalyticsPage} 
              />
            </React.Suspense>
          } 
        />
        <Route 
          path="returns" 
          element={
            <React.Suspense fallback={<div>Loading...</div>}>
              <AdminPages.ReturnsPage />
            </React.Suspense>
          } 
        />
        <Route
          path="admins"
          element={
            <SuperAdminRoute>
              <React.Suspense fallback={<div>Loading...</div>}>
                <SuperAdminPages.AdminsPage />
              </React.Suspense>
            </SuperAdminRoute>
          }
        />
        <Route
          path="admin-view/:adminId/*"
          element={
            <SuperAdminRoute>
              <React.Suspense fallback={<div>Loading...</div>}>
                <SuperAdminPages.AdminViewPage />
              </React.Suspense>
            </SuperAdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AppContent />
      </Provider>
    </ErrorBoundary>
  );
}
