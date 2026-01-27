import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Responsive top navigation bar with sidebar toggle.
 * @param {Object} props
 * @param {() => void} [props.onMenuToggle] - Callback to toggle sidebar visibility.
 */
const Topbar = ({ onMenuToggle }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 576);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 576 && window.innerWidth < 992);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 576);
      setIsTablet(width >= 576 && window.innerWidth < 992);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      
      {/* Right Section: Empty (Profile moved to Sidebar) */}
    </div>
  );
};

Topbar.propTypes = {
  onMenuToggle: PropTypes.func,
};

export default Topbar;