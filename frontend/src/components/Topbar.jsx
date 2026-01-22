import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Topbar = ({ user, role, onLogout, onMenuToggle }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 576);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 576 && window.innerWidth < 992);

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 576);
      setIsTablet(width >= 576 && width < 992);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const goToProfile = () => {
    setOpen(false);
    navigate(role === 'admin' ? '/admin/profile' : '/staff/profile');
  };

  const handleLogoutClick = () => {
    setOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div 
      className="bg-white border-bottom d-flex justify-content-between align-items-center" 
      style={{ 
        padding: isMobile ? '0.75rem 1rem' : (isTablet ? '0.85rem 1.25rem' : '1rem 1.5rem'),
        transition: 'all 0.3s ease',
        position: 'relative'
      }}
    >
      {/* Left Section: Mobile Menu Button or App Name */}
      <div className="d-flex align-items-center gap-2">
        {/* Hamburger Menu Button - Mobile & Desktop */}
        <button 
          className="btn btn-link p-0" 
          onClick={onMenuToggle}
          style={{ 
            minHeight: '44px',
            minWidth: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="Toggle sidebar menu"
        >
          <i className="bi bi-list" style={{ fontSize: '1.75rem', color: '#0D1526' }}></i>
        </button>

        {/* App Name/Logo - Shows on mobile */}
        {isMobile && (
          <div>
            <h6 className="mb-0 fw-bold" style={{ color: '#0D1526', fontSize: '1.1rem' }}>
              Parity
            </h6>
          </div>
        )}
      </div>
      
      {/* Right Section: User Profile */}
      <div className="d-flex align-items-center" ref={dropdownRef}>
        <button
          className="d-flex align-items-center btn btn-link text-decoration-none text-dark p-0"
          onClick={() => setOpen(!open)}
          style={{ 
            minHeight: isMobile ? '44px' : 'auto',
            gap: '0.5rem'
          }}
          aria-label="User menu"
        >
          {/* User Avatar */}
          <div
            className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold"
            style={{ 
              width: isMobile ? '36px' : '40px', 
              height: isMobile ? '36px' : '40px', 
              fontSize: isMobile ? '0.8rem' : '0.9rem',
              flexShrink: 0
            }}
          >
            {getInitials(user.name)}
          </div>

          {/* User Info - Hidden on mobile, shown on tablet+ */}
          {!isMobile && (
            <div className="text-start">
              <div 
                className="fw-bold" 
                style={{ 
                  fontSize: isTablet ? '0.85rem' : '0.9rem',
                  lineHeight: 1.2
                }}
              >
                {user.name}
              </div>
              <small 
                className="text-muted text-capitalize" 
                style={{ 
                  fontSize: isTablet ? '0.75rem' : '0.8rem',
                  display: 'block',
                  lineHeight: 1.2
                }}
              >
                {role}
              </small>
            </div>
          )}

          {/* Dropdown Caret */}
          <i className="bi bi-caret-down-fill text-muted" style={{ fontSize: '0.75rem' }}></i>
        </button>

        {/* Dropdown Menu */}
        {open && (
          <div 
            className="dropdown-menu dropdown-menu-end show shadow-lg" 
            style={{ 
              position: 'absolute',
              right: isMobile ? '0.5rem' : '1rem',
              top: isMobile ? '100%' : '120%',
              minWidth: isMobile ? '200px' : '220px',
              maxWidth: isMobile ? '90vw' : '280px',
              borderRadius: '8px',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              marginTop: '0.5rem',
              zIndex: 1050
            }}
          >
            {/* User Info Header - Shows on mobile in dropdown */}
            {isMobile && (
              <div className="px-3 py-2 border-bottom">
                <div className="fw-bold" style={{ fontSize: '0.9rem' }}>{user.name}</div>
                <small className="text-muted text-capitalize">{role}</small>
              </div>
            )}

            {/* Profile Settings */}
            <button 
              className="dropdown-item d-flex align-items-center" 
              onClick={goToProfile}
              style={{ 
                padding: isMobile ? '0.75rem 1rem' : '0.65rem 1rem',
                fontSize: isMobile ? '0.95rem' : '0.9rem',
                minHeight: isMobile ? '44px' : 'auto'
              }}
            >
              <i className="bi bi-person-gear me-2" style={{ fontSize: '1.1rem' }}></i>
              Profile Settings
            </button>

            {/* Divider */}
            <div className="dropdown-divider my-0"></div>

            {/* Logout */}
            <button 
              className="dropdown-item text-danger d-flex align-items-center" 
              onClick={handleLogoutClick}
              style={{ 
                padding: isMobile ? '0.75rem 1rem' : '0.65rem 1rem',
                fontSize: isMobile ? '0.95rem' : '0.9rem',
                minHeight: isMobile ? '44px' : 'auto'
              }}
            >
              <i className="bi bi-box-arrow-right me-2" style={{ fontSize: '1.1rem' }}></i>
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Topbar;