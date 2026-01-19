import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ role, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'bi-grid-fill', section: 'GENERAL', path: '/admin/dashboard' },
    { id: 'verify', label: 'Verify', icon: 'bi-shield-check', section: 'GENERAL', path: '/admin/verify' },
    { id: 'upload', label: 'Upload', icon: 'bi-cloud-upload', section: 'GENERAL', path: '/admin/upload' },
    { id: 'registry', label: 'Registry', icon: 'bi-file-text', section: 'GENERAL', path: '/admin/registry' },
    { id: 'users', label: 'Users', icon: 'bi-people', section: 'ADMINISTRATION', path: '/admin/users' },
    { id: 'security', label: 'Security', icon: 'bi-lock', section: 'ADMINISTRATION', path: '/admin/security' },
    { id: 'settings', label: 'Settings', icon: 'bi-gear', section: 'ADMINISTRATION', path: '/admin/settings' },
    { id: 'audit-logs', label: 'Audit Logs', icon: 'bi-clipboard-check', section: 'ADMINISTRATION', path: '/admin/audit-logs' },
    { id: 'tickets', label: 'Tickets', icon: 'bi-exclamation-circle', section: 'ADMINISTRATION', path: '/admin/tickets' }
  ];

  const staffMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'bi-grid-fill', section: 'GENERAL', path: '/staff/dashboard' },
    { id: 'verify', label: 'Verify', icon: 'bi-file-earmark-check', section: 'GENERAL', path: '/staff/verify' },
    { id: 'upload', label: 'Upload', icon: 'bi-cloud-upload', section: 'GENERAL', path: '/staff/upload' },
    { id: 'registry', label: 'Registry', icon: 'bi-file-text', section: 'GENERAL', path: '/staff/registry' },
    { id: 'report', label: 'Report', icon: 'bi-exclamation-triangle', section: 'ADMINISTRATION', path: '/staff/report' },
    { id: 'tickets', label: 'Tickets', icon: 'bi-ticket-detailed', section: 'ADMINISTRATION', path: '/staff/tickets' }
  ];

  const menuItems = role === 'admin' ? adminMenuItems : staffMenuItems;
  const sections = [...new Set(menuItems.map(item => item.section))];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div 
      className="text-white vh-100 d-flex flex-column" 
      style={{ 
        width: '250px', 
        backgroundColor: '#0D1526',
        position: 'fixed', 
        left: 0, 
        top: 0, 
        overflowY: 'auto',
        zIndex: 1000
      }}
    >
      {/* Header */}       
      <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div>
          <h5 className="mb-1 fw-bold" style={{ color: '#FFFFFF', fontSize: '1.3rem' }}>Parity</h5>
          <small style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', display: 'block' }}>Legal Document Verification System</small>
        </div>
      </div>

      {/* Menu */}
      <div className="flex-grow-1 p-4">
        {sections.map(section => (
          <div key={section} className="mb-4">
            <small 
              className="text-uppercase fw-bold d-block mb-3 ps-2" 
              style={{ 
                fontSize: '0.7rem',
                color: 'rgba(255,255,255,0.6)',
                letterSpacing: '0.5px',
                textAlign: 'left'
              }}
            >
              {section}
            </small>
            <div className="d-flex flex-column gap-2">
              {menuItems
                .filter(item => item.section === section)
                .map(item => {
                  const active = isActive(item.path);
                  return (
                    <button
                      key={item.id}
                      className="btn w-100 d-flex align-items-center"
                      onClick={() => navigate(item.path)}
                      style={{ 
                        padding: '0.75rem 1rem',
                        backgroundColor: active ? '#000000' : 'transparent',
                        color: '#FFFFFF',
                        border: active ? '2px solid #0D1526' : '2px solid transparent',
                        borderRadius: '8px',
                        transition: 'all 0.2s',
                        fontWeight: active ? '600' : '500',
                        justifyContent: 'flex-start',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <i className={`bi ${item.icon}`} style={{ 
                        fontSize: '1.25rem', 
                        marginRight: '12px', 
                        minWidth: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF'
                      }}></i>
                      <span style={{ fontSize: '0.95rem', color: '#FFFFFF' }}>{item.label}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button
          onClick={onLogout}
          className="btn btn-sm w-100 mt-3 d-flex align-items-center justify-content-start"
          style={{ 
            color: '#FFFFFF', 
            border: '1px solid rgba(255,255,255,0.3)',
            padding: '0.5rem 0.75rem',
            fontSize: '0.9rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <i className="bi bi-box-arrow-right" style={{ fontSize: '1.1rem', marginRight: '8px', color: '#FFFFFF' }}></i>
          <span style={{ color: '#FFFFFF' }}>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;