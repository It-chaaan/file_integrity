import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const AdminLayout = () => {
  const user = {
    name: 'James Alba',
    initials: 'JA',
    role: 'admin'
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      window.location.href = '/login';
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{ 
        position: 'fixed', 
        left: 0, 
        top: 0, 
        width: '250px', 
        height: '100vh',
        zIndex: 1000,
        overflowY: 'auto'
      }}>
        <Sidebar 
          role="admin" 
          onLogout={handleLogout}
        />
      </div>

      {/* Main Content Area */}
      <div style={{ 
        marginLeft: '250px', 
        width: 'calc(100% - 250px)',
        minHeight: '100vh', 
        backgroundColor: '#f8f9fa',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Topbar */}
        <div style={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 999,
          backgroundColor: 'white',
          borderBottom: '1px solid #dee2e6'
        }}>
          <Topbar user={user} role="admin" />
        </div>

        {/* Page Content */}
        <main style={{ 
          flex: 1, 
          padding: '1.5rem',
          position: 'relative',
          zIndex: 1
        }}>
          <Outlet />
        </main>

        {/* Footer */}
        <footer style={{ 
          borderTop: '1px solid #dee2e6',
          backgroundColor: 'white',
          padding: '1rem 1.5rem',
          marginTop: 'auto'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <small style={{ color: '#6c757d' }}>© 2026 Parity</small>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;