import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Logo from '../assets/icons/Logo - Integrity Verification.png';

const PublicLayout = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [navExpanded, setNavExpanded] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setNavExpanded(false);
  }, [location]);

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Header/Navbar - Fully Responsive */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top shadow-sm">
        <div className="container-fluid px-3 px-lg-4">
          {/* Brand/Logo - Touch-friendly */}
          <Link 
            to="/" 
            className="navbar-brand d-flex align-items-center py-2"
            style={{ minHeight: isMobile ? '44px' : 'auto' }}
          >
            <img 
              src={Logo} 
              alt="Parity Logo" 
              style={{ 
                width: isMobile ? '28px' : '32px', 
                height: isMobile ? '28px' : '32px', 
                objectFit: 'contain' 
              }}
              className="me-2"
            />
            <span className="fw-bold" style={{ fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
              Parity
            </span>
          </Link>
          
          {/* Hamburger Toggle - Touch-friendly */}
          <button 
            className="navbar-toggler border-0" 
            type="button" 
            onClick={() => setNavExpanded(!navExpanded)}
            aria-expanded={navExpanded}
            aria-label="Toggle navigation"
            style={{ 
              minHeight: '44px',
              minWidth: '44px',
              padding: '0.5rem'
            }}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          {/* Navigation Menu - Collapsible */}
          <div 
            className={`collapse navbar-collapse ${navExpanded ? 'show' : ''}`} 
            id="navbarNav"
          >
            {/* Navigation Links - Centered on desktop, stacked on mobile */}
            <ul className="navbar-nav mx-auto gap-1 mb-2 mb-lg-0">
              <li className="nav-item">
                <Link 
                  to="/" 
                  className="nav-link px-3 py-2"
                  style={{ 
                    fontSize: isMobile ? '1rem' : '0.95rem',
                    minHeight: isMobile ? '44px' : 'auto'
                  }}
                >
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/verify" 
                  className="nav-link px-3 py-2"
                  style={{ 
                    fontSize: isMobile ? '1rem' : '0.95rem',
                    minHeight: isMobile ? '44px' : 'auto'
                  }}
                >
                  Verify
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/how-it-works" 
                  className="nav-link px-3 py-2"
                  style={{ 
                    fontSize: isMobile ? '1rem' : '0.95rem',
                    minHeight: isMobile ? '44px' : 'auto'
                  }}
                >
                  How It Works
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/about" 
                  className="nav-link px-3 py-2"
                  style={{ 
                    fontSize: isMobile ? '1rem' : '0.95rem',
                    minHeight: isMobile ? '44px' : 'auto'
                  }}
                >
                  About
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/report" 
                  className="nav-link px-3 py-2"
                  style={{ 
                    fontSize: isMobile ? '1rem' : '0.95rem',
                    minHeight: isMobile ? '44px' : 'auto'
                  }}
                >
                  Report
                </Link>
              </li>
            </ul>

            {/* Login Button - Full width on mobile */}
            <div className={isMobile ? 'd-grid px-3 pb-3' : ''}>
              <Link 
                to="/login" 
                className={`btn btn-primary ${isMobile ? 'btn-lg' : 'btn-sm'}`}
                style={{ 
                  minHeight: '44px',
                  fontSize: isMobile ? '1rem' : '0.9rem'
                }}
              >
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Responsive padding */}
      <main className="flex-grow-1" style={{ overflowX: 'hidden' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;