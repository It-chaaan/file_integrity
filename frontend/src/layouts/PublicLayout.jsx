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
      <nav 
        className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top shadow-sm" 
        style={{ padding: isMobile ? '0.75rem 0' : '1rem 0' }}
      >
        <div 
          className="container-fluid px-3 px-lg-4 d-flex align-items-center"
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            maxWidth: '1400px',
            margin: '0 auto'
          }}
        >
          {/* Left Section: Logo + Brand */}
          <Link 
            to="/" 
            className="navbar-brand d-flex align-items-center"
            style={{ 
              minHeight: isMobile ? '44px' : 'auto',
              margin: 0,
              padding: 0,
              flexShrink: 0
            }}
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
          
          {/* Right Section: Navigation Links + Login Button + Hamburger */}
          <div className="d-flex align-items-center gap-3" style={{ marginLeft: 'auto' }}>
            {!isMobile && (
              <>
                {/* Navigation Links - Hidden on mobile, shown on desktop */}
                <ul className="navbar-nav d-flex flex-row gap-0 mb-0" style={{ margin: 0 }}>
                  <li className="nav-item">
                    <Link 
                      to="/" 
                      className="nav-link px-3"
                      style={{ 
                        fontSize: '0.95rem',
                        padding: '0.5rem 0.75rem'
                      }}
                    >
                      Home
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link 
                      to="/how-it-works" 
                      className="nav-link px-3"
                      style={{ 
                        fontSize: '0.95rem',
                        padding: '0.5rem 0.75rem'
                      }}
                    >
                      How It Works
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link 
                      to="/about" 
                      className="nav-link px-3"
                      style={{ 
                        fontSize: '0.95rem',
                        padding: '0.5rem 0.75rem'
                      }}
                    >
                      About
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link 
                      to="/contact-sales" 
                      className="nav-link px-3"
                      style={{ 
                        fontSize: '0.95rem',
                        padding: '0.5rem 0.75rem'
                      }}
                    >
                      Contact
                    </Link>
                  </li>
                </ul>

                {/* Login Button */}
                <Link 
                  to="/login" 
                  className="btn btn-sm"
                  style={{ 
                    minHeight: '44px',
                    fontSize: '0.9rem',
                    padding: '0.5rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    flexShrink: 0,
                    backgroundColor: 'transparent',
                    color: '#0D1526',
                    border: '1px solid #D2D9E5',
                    fontWeight: '600'
                  }}
                >
                  Enterprise Login
                </Link>
              </>
            )}

            {/* Hamburger Toggle - Mobile only */}
            <button 
              className="navbar-toggler border-0" 
              type="button" 
              onClick={() => setNavExpanded(!navExpanded)}
              aria-expanded={navExpanded}
              aria-label="Toggle navigation"
              style={{ 
                minHeight: '44px',
                minWidth: '44px',
                padding: '0.5rem',
                display: isMobile ? 'flex' : 'none'
              }}
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu - Collapsible */}
        {isMobile && navExpanded && (
          <div className="container-fluid px-3 px-lg-4 mt-2">
            {/* Navigation Links - Full width on mobile */}
            <ul className="navbar-nav gap-1 mb-2">
              <li className="nav-item">
                <Link 
                  to="/" 
                  className="nav-link px-3 py-2"
                  style={{ 
                    fontSize: '1rem',
                    minHeight: '44px'
                  }}
                >
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/how-it-works" 
                  className="nav-link px-3 py-2"
                  style={{ 
                    fontSize: '1rem',
                    minHeight: '44px'
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
                    fontSize: '1rem',
                    minHeight: '44px'
                  }}
                >
                  About
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/contact-sales" 
                  className="nav-link px-3 py-2"
                  style={{ 
                    fontSize: '1rem',
                    minHeight: '44px'
                  }}
                >
                  Contact Sales
                </Link>
              </li>
            </ul>

            {/* Login Button - Full width on mobile */}
            <div className="d-grid px-3 pb-3">
              <Link 
                to="/login" 
                className="btn btn-lg"
                style={{ 
                  minHeight: '44px',
                  fontSize: '1rem',
                  backgroundColor: 'transparent',
                  color: '#0D1526',
                  border: '1px solid #D2D9E5',
                  fontWeight: '600'
                }}
              >
                Enterprise Login
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content - Responsive padding */}
      <main className="flex-grow-1" style={{ overflowX: 'hidden' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;