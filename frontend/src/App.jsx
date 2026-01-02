import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RegistryProvider } from './contexts/RegistryContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public
import PublicLayout from './components/public/PublicLayout';

// Admin
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/pages/AdminDashboard';
import AdminUpload from './components/admin/pages/AdminUpload';
import AdminRegistry from './components/admin/pages/AdminRegistry';
import AdminVerifier from './components/admin/pages/AdminVerifier';
import AdminTickets from './components/admin/pages/AdminTickets';

function App() {
  return (
    <Router>
      <AuthProvider>
        <RegistryProvider>
          <Routes>
            <Route path="/" element={<PublicLayout />} />
            
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="upload" element={<AdminUpload />} />
              <Route path="registry" element={<AdminRegistry />} />
              <Route path="verify" element={<AdminVerifier />} />
              <Route path="tickets" element={<AdminTickets />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </RegistryProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;