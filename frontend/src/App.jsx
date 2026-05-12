/**
 * =============================================================================
 * APP.JSX - MAIN APPLICATION ENTRY POINT
 * =============================================================================
 * 
 * This is the root component of the File Integrity Verification System.
 * It sets up the application routing structure and initializes core services.
 * 
 * ROUTING STRUCTURE:
 * - Public Routes (/)         → Accessible without authentication
 * - Auth Routes (/login)      → Login and 2FA authentication
 * - Admin Routes (/admin)     → Administrator portal (requires admin role)
 * - Staff Routes (/staff)     → Staff portal (requires staff role)
 * 
 * INITIALIZATION:
 * - Initializes authentication system on mount
 * - Prepares app for backend API usage
 * 
 * FOR BACKEND DEVELOPERS:
 * - Authentication is checked in layout components (AdminLayout, StaffLayout)
 * - Unauthenticated users are redirected to /login
 * 
 * FOR TESTERS:
 * - All routes are defined here
 * - Use /login for authentication testing
 * - Admin features: /admin/* (e.g., /admin/dashboard, /admin/users)
 * - Staff features: /staff/* (e.g., /staff/dashboard, /staff/upload)
 * =============================================================================
 */

import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================
import AdminLayout from './layouts/AdminLayout';
import StaffLayout from './layouts/StaffLayout';
import PublicLayout from './layouts/PublicLayout';

// ============================================================================
// ROUTE CONFIGURATIONS
// ============================================================================
import adminRoutes from './routes/admin.routes';
import staffRoutes from './routes/staff.routes';
import publicRoutes from './routes/public.routes';

// ============================================================================
// AUTHENTICATION PAGES
// ============================================================================
import Login from './pages/auth/Login';
import TwoFactor from './pages/auth/TwoFactor';
import UserAgreement from './pages/auth/UserAgreement';

// ============================================================================
// SERVICES
// ============================================================================
import { initAuth } from './services/auth';

/**
 * Main Application Component
 * 
 * Initializes the application and sets up routing structure.
 * 
 * @component
 * @returns {JSX.Element} Application routing tree
 */
function App() {
  /**
   * Application Initialization Effect
   * 
   * Runs once on component mount to initialize authentication.
   */
  useEffect(() => {
    try {
      initAuth();
    } catch (error) {
      // Avoid blocking app boot if auth init fails.
    }
  }, []); // Empty dependency array = run once on mount

  return (
    <Routes>
      {/* ================================================================== */}
      {/* PUBLIC ROUTES - No authentication required                        */}
      {/* ================================================================== */}
      {/* Base path: /                                                       */}
      {/* Pages: Home, Verify, How It Works, About, Report                  */}
      {/* ================================================================== */}
      <Route path="/" element={<PublicLayout />}>
        {publicRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>

      {/* ================================================================== */}
      {/* AUTHENTICATION ROUTES - Login and 2FA                             */}
      {/* ================================================================== */}
      {/* /login           → Username/password authentication                */}
      {/* /two-factor      → 2FA code verification                           */}
      {/* /user-agreement  → Enterprise System Usage Agreement               */}
      {/* ================================================================== */}
      <Route path="/login" element={<Login />} />
      <Route path="/two-factor" element={<TwoFactor />} />
      <Route path="/user-agreement" element={<UserAgreement />} />

      {/* ================================================================== */}
      {/* ADMIN ROUTES - Administrator portal                               */}
      {/* ================================================================== */}
      {/* Base path: /admin                                                  */}
      {/* Requires: Admin role                                               */}
      {/* Features: Dashboard, Users, Security, Audit Logs, Settings         */}
      {/* ================================================================== */}
      <Route path="/admin" element={<AdminLayout />}>
        {adminRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>

      {/* ================================================================== */}
      {/* STAFF ROUTES - Staff portal                                       */}
      {/* ================================================================== */}
      {/* Base path: /staff                                                  */}
      {/* Requires: Staff role                                               */}
      {/* Features: Dashboard, Upload, Verify, Registry, Tickets             */}
      {/* ================================================================== */}
      <Route path="/staff" element={<StaffLayout />}>
        {staffRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>

      {/* ================================================================== */}
      {/* FALLBACK ROUTE - Redirect unknown paths to home                   */}
      {/* ================================================================== */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;