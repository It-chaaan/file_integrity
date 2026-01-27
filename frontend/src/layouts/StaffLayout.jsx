import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { getCurrentUser, isAuthenticated, getCurrentSession, logout as performLogout } from '../services/auth';

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
  
  // Prepare user object with fallback
  const user = currentUser ? {
    name: currentUser.name || 'Staff User',
    initials: currentUser.name ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'ST',
    role: currentUser.role || 'staff'
  } : {
    name: 'Loading...',
    initials: '...',
    role: 'staff'
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
        {/* Topbar - Sticky with responsive padding */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 998,
          backgroundColor: 'white',
          borderBottom: '1px solid #dee2e6',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
        }}>
          <Topbar
            onMenuToggle={toggleSidebar}
          />
        </div>

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