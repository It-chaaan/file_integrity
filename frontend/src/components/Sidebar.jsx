import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Responsive sidebar navigation for admin/staff portals.
 * @param {Object} props
 * @param {{displayName?: string, roleLabel?: string}} [props.user] - Current user info for avatar/labels.
 * @param {'admin'|'staff'} props.role - Role to determine menu set.
 * @param {() => void} [props.onLogout] - Logout handler.
 * @param {boolean} [props.isOpen] - Whether sidebar is visible.
 * @param {() => void} [props.onToggle] - Toggle handler (used for mobile overlay).
 * @param {Object} [props.currentUser] - Full current user object with role.
 */
const Sidebar = ({ user, role, onLogout, isOpen, onToggle, currentUser }) => {
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

  const getInitials = (name) => {
    const safeName = String(name || '').trim();
    if (!safeName) return '?';
    return safeName
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const goToProfile = () => {
    navigate(role === 'admin' ? '/admin/profile' : '/staff/profile');
    if (isMobile && onToggle) {
      onToggle();
    }
  };

  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'bi-grid-fill', section: 'GENERAL', path: '/admin/dashboard' },
    { id: 'users', label: 'Users', icon: 'bi-people', section: 'ADMINISTRATION', path: '/admin/users' },
    ...(currentUser?.role === 'super_admin' 
      ? [{ id: 'security', label: 'Security', icon: 'bi-lock', section: 'ADMINISTRATION', path: '/admin/security' }]
      : []
    ),
    { id: 'audit-logs', label: 'Audit Logs', icon: 'bi-clipboard-check', section: 'ADMINISTRATION', path: '/admin/audit-logs' },
    { id: 'tickets', label: 'Tickets', icon: 'bi-exclamation-circle', section: 'ADMINISTRATION', path: '/admin/tickets' }
  ];

  const staffMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'bi-grid-fill', section: 'GENERAL', path: '/staff/dashboard' },
    { id: 'upload', label: 'Upload', icon: 'bi-cloud-upload', section: 'GENERAL', path: '/staff/upload' },
    { id: 'verify', label: 'Verify', icon: 'bi-shield-check', section: 'GENERAL', path: '/staff/verify' },
    { id: 'registry', label: 'Registry', icon: 'bi-file-text', section: 'GENERAL', path: '/staff/registry' },
    { id: 'report', label: 'Report', icon: 'bi-exclamation-triangle', section: 'GENERAL', path: '/staff/report' }
  ];

  const verifierMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'bi-grid-fill', section: 'GENERAL', path: '/staff/dashboard' },
    { id: 'verify', label: 'Verify', icon: 'bi-shield-check', section: 'GENERAL', path: '/staff/verify' }
  ];

  const menuItems = role === 'admin' ? adminMenuItems : (role === 'verifier' ? verifierMenuItems : staffMenuItems);
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
        className="text-dark vh-100 d-flex flex-column" 
        style={{ 
          width: (shouldShow || isMobile) ? getSidebarWidth() : '0',
          backgroundColor: '#FAFAFA',
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
            borderBottom: '1px solid rgba(0,0,0,0.1)',
          }}
        >
          <div>
            <h5 className="mb-1 fw-bold" style={{ 
              color: '#000000', 
              fontSize: isMobile ? '1.2rem' : (isTablet ? '1.15rem' : '1.3rem'),
            }}>Parity</h5>
            {!isMobile && (
              <small style={{ 
                color: 'rgba(0,0,0,0.7)', 
                fontSize: isTablet ? '0.65rem' : '0.7rem', 
                display: 'block',
              }}>Enterprise Integrity Platform</small>
            )}
          </div>

          {/* Close button for mobile */}
          {isMobile && (
            <button
              onClick={onToggle}
              className="btn btn-link text-dark p-0"
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
                  color: 'rgba(0,0,0,0.6)',
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
                          backgroundColor: active ? '#D1D5DB' : 'transparent',
                          color: '#000000',
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
                            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
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
                          color: '#000000'
                        }}></i>
                        <span style={{ 
                          fontSize: isMobile ? '0.95rem' : (isTablet ? '0.85rem' : '0.95rem'),
                          color: '#000000',
                        }}>{item.label}</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer - Profile Card with Logout Icon */}
        <div 
          style={{ 
            borderTop: '1px solid rgba(0,0,0,0.1)',
            marginTop: 'auto',
            padding: isMobile 
              ? '1rem 0.75rem 1rem 0.25rem' 
              : (isTablet ? '0.85rem 0.6rem 0.85rem 0.25rem' : '1rem 1rem 1rem 0.5rem')
          }}
        >
          {/* Profile Card */}
          <div
            style={{
              backgroundColor: 'transparent',
              color: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textAlign: 'left'
            }}
          >
            {/* Profile Info - Clickable */}
            <button
              onClick={goToProfile}
              className="btn btn-link text-dark p-0 d-flex align-items-center"
              style={{
                flex: 1,
                textDecoration: 'none',
                transition: 'opacity 0.2s',
                gap: isMobile ? '0.5rem' : '0.4rem',
                justifyContent: 'flex-start'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              {/* Avatar */}
              <div
                className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold"
                style={{ 
                  width: isMobile ? '36px' : '32px', 
                  height: isMobile ? '36px' : '32px', 
                  fontSize: isMobile ? '0.8rem' : '0.75rem',
                  flexShrink: 0
                }}
              >
                {getInitials(user?.displayName)}
              </div>

              {/* User Info */}
              <div style={{ textAlign: 'left', minWidth: 0 }}>
                <div 
                  style={{ 
                    fontSize: isMobile ? '0.9rem' : (isTablet ? '0.8rem' : '0.85rem'),
                    lineHeight: 1,
                    fontWeight: '500',
                    color: '#000000',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {user?.displayName || 'User'}
                </div>
                <small 
                  style={{ 
                    fontSize: isMobile ? '0.75rem' : (isTablet ? '0.7rem' : '0.75rem'),
                    color: 'rgba(0,0,0,0.6)',
                    display: 'block',
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {user?.roleLabel || 'User'}
                </small>
              </div>
            </button>

            {/* Logout Icon Button */}
            <button
              onClick={handleLogout}
              className="btn btn-link text-dark p-0 d-flex align-items-center justify-content-center"
              style={{ 
                fontSize: isMobile ? '1.1rem' : '1rem',
                lineHeight: 1,
                minWidth: '40px',
                minHeight: '40px',
                transition: 'opacity 0.2s',
                marginLeft: '0.5rem'
              }}
              title="Logout"
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <i className="bi bi-box-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

Sidebar.propTypes = {
  user: PropTypes.shape({
    displayName: PropTypes.string,
    roleLabel: PropTypes.string,
  }),
  role: PropTypes.oneOf(['admin', 'staff']).isRequired,
  onLogout: PropTypes.func,
  isOpen: PropTypes.bool,
  onToggle: PropTypes.func
};

export default Sidebar;