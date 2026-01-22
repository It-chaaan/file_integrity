import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ role, onLogout, isOpen, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 576);
  const [isTablet, setIsTablet] = React.useState(window.innerWidth >= 576 && window.innerWidth < 992);

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 576);
      setIsTablet(width >= 576 && width < 992);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on mobile after navigation
  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile && onToggle) {
      onToggle();
    }
  };

  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'bi-grid-fill', section: 'GENERAL', path: '/admin/dashboard' },
    { id: 'upload', label: 'Upload', icon: 'bi-cloud-upload', section: 'GENERAL', path: '/admin/upload' },
    { id: 'verify', label: 'Verify', icon: 'bi-shield-check', section: 'GENERAL', path: '/admin/verify' },
    { id: 'registry', label: 'Registry', icon: 'bi-file-text', section: 'GENERAL', path: '/admin/registry' },
    { id: 'users', label: 'Users', icon: 'bi-people', section: 'ADMINISTRATION', path: '/admin/users' },
    { id: 'tickets', label: 'Tickets', icon: 'bi-exclamation-circle', section: 'ADMINISTRATION', path: '/admin/tickets' },
    { id: 'security', label: 'Security', icon: 'bi-lock', section: 'ADMINISTRATION', path: '/admin/security' },
    { id: 'audit-logs', label: 'Audit Logs', icon: 'bi-clipboard-check', section: 'ADMINISTRATION', path: '/admin/audit-logs' },
    { id: 'settings', label: 'Settings', icon: 'bi-gear', section: 'ADMINISTRATION', path: '/admin/settings' }
  ];

  const staffMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'bi-grid-fill', section: 'GENERAL', path: '/staff/dashboard' },
    { id: 'verify', label: 'Verify', icon: 'bi-shield-check', section: 'GENERAL', path: '/staff/verify' },
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

  // Determine sidebar width based on screen size
  const getSidebarWidth = () => {
    if (isMobile) return '280px'; // Full mobile sidebar
    if (isTablet) return '220px';
    return '250px';
  };

  // Determine if sidebar should be visible
  const shouldShow = isOpen;

  return (
    <>
      {/* Mobile Overlay - Click to close sidebar */}
      {isMobile && isOpen && (
        <div 
          onClick={onToggle}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}

      {/* Sidebar Container */}
      <div 
        className="text-white vh-100 d-flex flex-column" 
        style={{ 
          width: (shouldShow || isMobile) ? getSidebarWidth() : '0',
          backgroundColor: '#0D1526',
          position: 'fixed', 
          left: 0, 
          top: 0, 
          overflowY: 'auto',
          overflowX: 'hidden',
          zIndex: 1000,
          transition: 'transform 0.3s ease, width 0.3s ease',
          transform: shouldShow ? 'translateX(0)' : 'translateX(-100%)',
          boxShadow: shouldShow ? '2px 0 12px rgba(0, 0, 0, 0.15)' : 'none',
          WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
          visibility: shouldShow ? 'visible' : 'hidden'
        }}
      >
        {/* Header */}       
        <div 
          className="d-flex justify-content-between align-items-center"
          style={{ 
            padding: isMobile ? '1rem' : (isTablet ? '1rem' : '1.25rem 1.5rem'),
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div>
            <h5 className="mb-1 fw-bold" style={{ 
              color: '#FFFFFF', 
              fontSize: isMobile ? '1.2rem' : (isTablet ? '1.15rem' : '1.3rem'),
            }}>Parity</h5>
            {!isMobile && (
              <small style={{ 
                color: 'rgba(255,255,255,0.7)', 
                fontSize: isTablet ? '0.65rem' : '0.7rem', 
                display: 'block',
              }}>Legal Document Verification</small>
            )}
          </div>

          {/* Close button for mobile */}
          {isMobile && (
            <button
              onClick={onToggle}
              className="btn btn-link text-white p-0"
              style={{ fontSize: '1.5rem', lineHeight: 1 }}
              aria-label="Close sidebar"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>

        {/* Menu */}
        <div 
          className="flex-grow-1" 
          style={{ 
            padding: isMobile ? '1rem' : (isTablet ? '1rem 0.75rem' : '1.5rem 1rem')
          }}
        >
          {sections.map(section => (
            <div key={section} className="mb-4">
              <small 
                className="text-uppercase fw-bold d-block mb-3" 
                style={{ 
                  fontSize: isMobile ? '0.7rem' : '0.65rem',
                  color: 'rgba(255,255,255,0.6)',
                  letterSpacing: '0.5px',
                  paddingLeft: '0.5rem'
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
                        onClick={() => handleNavigation(item.path)}
                        style={{ 
                          padding: isMobile ? '0.75rem 1rem' : (isTablet ? '0.65rem 0.85rem' : '0.75rem 1rem'),
                          backgroundColor: active ? '#000000' : 'transparent',
                          color: '#FFFFFF',
                          border: active ? '2px solid #0D1526' : '2px solid transparent',
                          borderRadius: '8px',
                          transition: 'all 0.2s',
                          fontWeight: active ? '600' : '500',
                          justifyContent: 'flex-start',
                          textAlign: 'left',
                          minHeight: isMobile ? '44px' : 'auto' // Touch-friendly on mobile
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
                          fontSize: isMobile ? '1.25rem' : '1.15rem', 
                          marginRight: '12px', 
                          minWidth: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF'
                        }}></i>
                        <span style={{ 
                          fontSize: isMobile ? '0.95rem' : (isTablet ? '0.85rem' : '0.95rem'),
                          color: '#FFFFFF',
                        }}>{item.label}</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer - Logout Button (optional, can be added if needed) */}
        {isMobile && (
          <div 
            style={{ 
              padding: '1rem',
              borderTop: '1px solid rgba(255,255,255,0.08)'
            }}
          >
            <button
              onClick={onLogout}
              className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center"
              style={{ minHeight: '44px' }}
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              Logout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;