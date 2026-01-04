import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button, Nav, Badge, Dropdown } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import './styles/AdminLayout.css';

const AdminLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname.includes(path);

  const getPageTitle = () => {
    if (location.pathname.includes('dashboard')) return 'Dashboard';
    if (location.pathname.includes('upload')) return 'Upload Document';
    if (location.pathname.includes('verify')) return 'Verify Document';
    if (location.pathname.includes('registry')) return 'Registry';
    if (location.pathname.includes('tickets')) return 'Tickets';
    return 'Admin Portal';
  };

  const getUserInitials = () => {
    if (user?.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    return 'AD';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return ( 
    <div className="admin-layout">
      <div className="admin-layout__container">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="admin-sidebar__brand">
            <div className="admin-sidebar__brand-icon">
              <i className="bi bi-shield-lock-fill"></i>
            </div>
            <div className="admin-sidebar__brand-text">
              <h4 className="admin-sidebar__brand-title">PARITY ADMIN</h4>
              <small className="admin-sidebar__brand-subtitle">Document Integrity System</small>
            </div>
          </div>

          <Nav className="admin-sidebar__nav">
            <Nav.Link 
              onClick={() => navigate('/admin/dashboard')}
              className={`admin-sidebar__link ${isActive('dashboard') ? 'admin-sidebar__link--active' : ''}`}
            >
              <span className="admin-sidebar__link-content">
                <span>
                  <i className="bi bi-speedometer2"></i>
                  <span>Dashboard</span>
                </span>
                <Badge bg="primary" pill className="admin-sidebar__badge"></Badge>
              </span>
            </Nav.Link>

            <Nav.Link 
              onClick={() => navigate('/admin/upload')}
              className={`admin-sidebar__link ${isActive('upload') ? 'admin-sidebar__link--active' : ''}`}
            >
              <span className="admin-sidebar__link-content">
                <span>
                  <i className="bi bi-cloud-upload"></i>
                  <span>Upload Document</span>
                </span>
                <Badge bg="primary" pill className="admin-sidebar__badge"></Badge>
              </span>
            </Nav.Link>

            <Nav.Link 
              onClick={() => navigate('/admin/verify')}
              className={`admin-sidebar__link ${isActive('verify') ? 'admin-sidebar__link--active' : ''}`}
            >
              <span className="admin-sidebar__link-content">
                <span>
                  <i className="bi bi-shield-check"></i>
                  <span>Verify Document</span>
                </span>
                <Badge bg="success" pill className="admin-sidebar__badge">New</Badge>
              </span>
            </Nav.Link>

            <Nav.Link 
              onClick={() => navigate('/admin/registry')}
              className={`admin-sidebar__link ${isActive('registry') ? 'admin-sidebar__link--active' : ''}`}
            >
              <span className="admin-sidebar__link-content">
                <span>
                  <i className="bi bi-folder-check"></i>
                  <span>Registry</span>
                </span>
                <Badge bg="info" pill className="admin-sidebar__badge">10</Badge>
              </span>
            </Nav.Link>

            <Nav.Link 
              onClick={() => navigate('/admin/tickets')}
              className={`admin-sidebar__link ${isActive('tickets') ? 'admin-sidebar__link--active' : ''}`}
            >
              <span className="admin-sidebar__link-content">
                <span>
                  <i className="bi bi-ticket"></i>
                  <span>Tickets</span>
                </span>
                <Badge bg="danger" pill className="admin-sidebar__badge">3</Badge>
              </span>
            </Nav.Link>
          </Nav>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          {/* Header */}
          <div className="admin-header">
            <h1 className="admin-header__title">{getPageTitle()}</h1>
            <div className="admin-header__user" ref={dropdownRef}>
              <div 
                className="admin-user-avatar" 
                title={user?.username || 'Admin User'}
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                {getUserInitials()}
              </div>
              
              {/* Profile Dropdown */}
              {showProfileDropdown && (
                <div className="admin-profile-dropdown">
                  <div className="admin-profile-dropdown__header">
                    <div className="admin-profile-dropdown__avatar">
                      {getUserInitials()}
                    </div>
                    <div className="admin-profile-dropdown__info">
                      <div className="admin-profile-dropdown__name">
                        {user?.username || 'Admin User'}
                      </div>
                      <div className="admin-profile-dropdown__role">
                        Administrator
                      </div>
                    </div>
                  </div>
                  <div className="admin-profile-dropdown__divider"></div>
                  <button
                    className="admin-profile-dropdown__logout"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    End Session
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Page Content */}
          <div className="admin-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;