/**
 * =============================================================================
 * ADMIN LAYOUT - ADMINISTRATOR PORTAL WRAPPER
 * =============================================================================
 * 
 * This layout component wraps all administrator portal pages and provides:
 * - Authentication protection (redirects to login if not authenticated)
 * - Navigation sidebar with admin menu items
 * - Top navigation bar with user info and logout
 * - Responsive layout that adapts to mobile, tablet, and desktop
 * 
 * AUTHENTICATION:
 * - Checks authentication status on mount
 * - Redirects unauthenticated users to /login
 * - Uses 100ms delay to ensure session data is loaded
 * 
 * RESPONSIVE BEHAVIOR:
 * - Mobile (<576px): Sidebar overlay, collapsible
 * - Tablet (576-992px): Fixed sidebar, 220px width
 * - Desktop (>992px): Fixed sidebar, 250px width
 * 
 * FOR BACKEND DEVELOPERS:
 * - Authentication check uses isAuthenticated() from services/auth.js
 * - User data retrieved via getCurrentUser()
 * - Logout clears session and redirects to /login
 * 
 * FOR TESTERS:
 * - Test authentication: Try accessing /admin without login
 * - Test responsive: Resize browser window to test sidebar behavior
 * - Test logout: Click user profile → logout button
 * =============================================================================
 */

import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

// ============================================================================
// SHARED COMPONENTS
// ============================================================================
import Sidebar from '../components/Sidebar';

// ============================================================================
// AUTHENTICATION SERVICES
// ============================================================================
import { getCurrentUser, isAuthenticated, getCurrentSession, logout as performLogout, refreshCurrentUser } from '../services/auth';

/**
 * Admin Layout Component
 * 
 * Provides the layout structure for all admin portal pages.
 * Handles authentication, responsive design, and navigation.
 * 
 * @component
 * @returns {JSX.Element} Admin layout with sidebar, topbar, and page content
 */
const AdminLayout = () => {
  const navigate = useNavigate();
  
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // Track if authentication check is complete
  const [isReady, setIsReady] = React.useState(false);
  
  // Get current user data from authentication service
  const currentUser = getCurrentUser();
  
  // ============================================================================
  // AUTHENTICATION PROTECTION
  // ============================================================================
  /**
   * Authentication Guard Effect
   * 
   * Runs on component mount to verify user is authenticated.
   * Uses a 100ms delay to ensure session data is fully loaded.
   * 
   * Flow:
   * 1. Wait 100ms for session to load
   * 2. Check authentication status
   * 3. Redirect to /login if not authenticated
   * 4. Set isReady=true if authenticated
   */
  React.useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated() || (!!getCurrentSession());
      if (!authenticated) {
        // User is not authenticated, redirect to login
        navigate('/login');
      } else {
        // User is authenticated, allow access
        setIsReady(true);
      }
    };
    
    // Small delay ensures session data is loaded
    // Important for handling page refresh and direct URL access
    const timer = setTimeout(checkAuth, 100);
    
    // Cleanup: Clear timeout if component unmounts
    return () => clearTimeout(timer);
  }, [navigate]);

  React.useEffect(() => {
    if (isReady) {
      refreshCurrentUser();
    }
  }, [isReady]);

  const normalizedRole = String(currentUser?.role || '').toLowerCase();
  const isAdminRole = ['super_admin', 'admin'].includes(normalizedRole);

  React.useEffect(() => {
    if (!isReady || !currentUser) return;
    if (!isAdminRole) {
      navigate(normalizedRole === 'staff' || normalizedRole === 'verifier' ? '/staff/dashboard' : '/', { replace: true });
    }
  }, [currentUser, isAdminRole, isReady, navigate, normalizedRole]);

  // Redirect non-super_admin users away from security page
  React.useEffect(() => {
    if (!isReady || !currentUser) return;
    const isSuperAdmin = normalizedRole === 'super_admin';
    if (!isSuperAdmin && window.location.pathname === '/admin/security') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [currentUser, isReady, navigate, normalizedRole]);
  
  // ============================================================================
  // USER DATA PREPARATION
  // ============================================================================
  /**
   * Prepare user object with fallback values
   * 
   * Extracts user info for display in topbar:
   * - name: Full name or "Admin User" as fallback
   * - initials: First letters of name for avatar (e.g., "JD" for "John Doe")
   * - role: User role (admin, staff)
   */
  const roleLabelMap = {
    super_admin: 'System Administrator',
    admin: 'Administrator',
    staff: 'Staff',
    verifier: 'Verifier',
    client: 'Enterprise User',
  };

  const displayName = currentUser
    ? [currentUser.first_name, currentUser.last_name].filter(Boolean).join(' ') || currentUser.username
    : 'Loading...';

  const user = currentUser ? {
    displayName: displayName || 'System Administrator',
    roleLabel: roleLabelMap[currentUser.role] || currentUser.role || 'Administrator',
    role: isAdminRole ? 'admin' : normalizedRole || 'admin'
  } : {
    displayName: 'Loading...'
  };

  // ============================================================================
  // RESPONSIVE LAYOUT STATE
  // ============================================================================
  /**
   * Responsive breakpoints:
   * - Mobile: < 576px (sidebar overlay)
   * - Tablet: 576-992px (sidebar 220px)
   * - Desktop: > 992px (sidebar 250px)
   */
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 576);
  const [isTablet, setIsTablet] = React.useState(window.innerWidth >= 576 && window.innerWidth < 992);
  const [sidebarOpen, setSidebarOpen] = React.useState(window.innerWidth >= 576);

  /**
   * Window Resize Handler
   * 
   * Updates responsive state when browser window is resized.
   * Automatically opens/closes sidebar based on screen size.
   */
  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
      // Update breakpoint states
      setIsMobile(width < 576);
      setIsTablet(width >= 576 && width < 992);
      
      // Auto-manage sidebar visibility
      if (width < 576) {
        setSidebarOpen(false); // Close on mobile
      } else if (width >= 576) {
        setSidebarOpen(true); // Open on tablet/desktop
      }
    };

    // Register resize listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup: Remove listener on unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  /**
   * Logout Handler
   * 
   * Prompts user for confirmation before logging out.
   * Redirects to login page on confirmation.
   * 
   * Note: Full page navigation clears all state and session data.
   */
  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to logout?')) return;
    try {
      await performLogout();
    } finally {
      navigate('/login');
    }
  };

  /**
   * Sidebar Toggle Handler
   * 
   * Opens/closes sidebar (primarily for mobile/tablet views).
   */
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // ============================================================================
  // LAYOUT CALCULATIONS
  // ============================================================================
  
  /**
   * Calculate Sidebar Width
   * 
   * Determines sidebar width based on screen size and open/closed state.
   * 
   * @returns {number} Sidebar width in pixels
   * - 0px: Sidebar hidden or mobile (overlay mode)
   * - 220px: Tablet
   * - 250px: Desktop
   */
  const getSidebarWidth = () => {
    if (!sidebarOpen) return 0;
    if (isMobile) return 0; // Overlay on mobile, doesn't affect layout
    if (isTablet) return 220;
    return 250;
  };

  const sidebarWidth = getSidebarWidth();

  if (!isReady) {
    return null;
  }

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      {/* ================================================================ */}
      {/* SIDEBAR - Navigation Menu                                        */}
      {/* ================================================================ */}
      {/* Displays admin menu items: Dashboard, Users, Security, etc.     */}
      {/* Responsive: Overlay on mobile, fixed on tablet/desktop           */}
      {/* ================================================================ */}
      <Sidebar
        user={user}
        currentUser={currentUser}
        role={isAdminRole ? 'admin' : normalizedRole || 'admin'}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />

      {/* ================================================================ */}
      {/* MAIN CONTENT AREA                                                */}
      {/* ================================================================ */}
      {/* Adjusts width based on sidebar visibility                        */}
      {/* Contains page content (via <Outlet />)                           */}
      {/* ================================================================ */}
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

export default AdminLayout;