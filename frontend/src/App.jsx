import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import StaffLayout from './layouts/StaffLayout';
import PublicLayout from './layouts/PublicLayout';
import adminRoutes from './routes/admin.routes';
import staffRoutes from './routes/staff.routes';
import publicRoutes from './routes/public.routes';
import Login from './pages/auth/Login';
import TwoFactor from './pages/auth/TwoFactor';
// UPDATED: Use unified auth initialization instead of direct mock
import { initAuth } from './services/auth';
import { initializeMockData } from './services/mockStorage';

function App() {
  useEffect(() => {
    // UPDATED: Initialize auth system (handles both mock and real API)
    try {
      initAuth();
      // Initialize mock data ONLY when in mock mode
      if (import.meta.env.VITE_USE_MOCK_API !== 'false') {
        initializeMockData();
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  }, []);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicLayout />}>
        {publicRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>

      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/two-factor" element={<TwoFactor />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        {adminRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>

      {/* Staff Routes */}
      <Route path="/staff" element={<StaffLayout />}>
        {staffRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>

      {/* Redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;