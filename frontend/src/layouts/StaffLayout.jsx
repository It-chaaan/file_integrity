import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getCurrentUser, isAuthenticated, getCurrentSession, logout as performLogout, refreshCurrentUser } from '../services/auth';

const StaffLayout = () => {
  const navigate = useNavigate();
  const [isReady, setIsReady] = React.useState(false);
  const currentUser = getCurrentUser();
  
  // Redirect to login if not authenticated
  React.useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const authenticated = isAuthenticated() || (!!getCurrentSession());
      if (!authenticated) {
        navigate('/login');
      } else {
        setIsReady(true);
      }
    };
    
    // Use a small delay to ensure session is updated
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [navigate]);

  React.useEffect(() => {
    if (isReady) {
      refreshCurrentUser();
    }
  }, [isReady]);
  
  // Prepare user object with fallback
  const roleLabelMap = {
    super_admin: 'System Administrator',
    admin: 'Administrator',
    staff: 'Staff',
    verifier: 'Verifier',
    client: 'Enterprise User',
  };

  const normalizedRole = String(currentUser?.role || '').toLowerCase();
  const isStaffPortalRole = ['super_admin', 'admin', 'staff', 'verifier'].includes(normalizedRole);

  const displayName = currentUser
    ? [currentUser.first_name, currentUser.last_name].filter(Boolean).join(' ') || currentUser.username
    : 'Loading...';

  React.useEffect(() => {
    if (!isReady || !currentUser) return;
    if (!isStaffPortalRole) {
      navigate('/', { replace: true });
    }
  }, [currentUser, isReady, isStaffPortalRole, navigate]);

  const user = currentUser ? {
    displayName: displayName || 'Enterprise User',
    roleLabel: roleLabelMap[currentUser.role] || currentUser.role || 'Staff',
    role: normalizedRole === 'super_admin' ? 'admin' : (normalizedRole || 'staff')
  } : {
    displayName: 'Loading...'
  };

  // Responsive state management
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 576);
  const [isTablet, setIsTablet] = React.useState(window.innerWidth >= 576 && window.innerWidth < 992);
  const [sidebarOpen, setSidebarOpen] = React.useState(window.innerWidth >= 576); // Open by default on desktop/tablet

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 576);
      setIsTablet(width >= 576 && width < 992);
      
      // Auto-close mobile sidebar when resizing to larger screens, auto-open on larger screens
      if (width < 576) {
        setSidebarOpen(false);
      } else if (width >= 576) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to logout?')) return;
    try {
      await performLogout();
    } finally {
      navigate('/login');
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Calculate sidebar width for layout adjustments
  const getSidebarWidth = () => {
    if (!sidebarOpen) return 0; // Sidebar is hidden
    if (isMobile) return 0; // On mobile, sidebar is overlay
    if (isTablet) return 220;
    return 250;
  };

  const sidebarWidth = getSidebarWidth();

  if (!isReady) {
    return null;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      {/* Sidebar - Responsive */}
      <Sidebar
        user={user}
        role="staff"
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />

      {/* Main Content Area - Adjusts based on screen size */}
      <div style={{
        marginLeft: `${sidebarWidth}px`,
        width: `calc(100% - ${sidebarWidth}px)`,
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        flexDirection: 'column',
        transition: 'margin-left 0.3s ease, width 0.3s ease'
      }}>
        {/* Mobile menu toggle when sidebar is closed */}
        {isMobile && !sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="btn btn-light border"
            aria-label="Open sidebar menu"
            style={{
              position: 'fixed',
              top: '0.9rem',
              left: '0.9rem',
              zIndex: 1001,
              width: '44px',
              height: '44px',
              padding: 0,
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)'
            }}
          >
            <i className="bi bi-list" style={{ fontSize: '1.35rem', color: '#0D1526' }}></i>
          </button>
        )}

        {/* Page Content - Responsive padding */}
        <main style={{
          flex: 1,
          padding: isMobile ? '1rem' : (isTablet ? '1.25rem' : '1.5rem'),
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '100%',
          overflowX: 'hidden' // Prevent horizontal scroll
        }}>
          <div className="container-fluid">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;