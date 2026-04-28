import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';

/**
 * Responsive modal with backdrop, body scroll lock, and size presets.
 * @param {Object} props
 * @param {boolean} props.show - Whether the modal is visible.
 * @param {() => void} props.onClose - Callback when closing (backdrop or close button).
 * @param {string|React.ReactNode} [props.title] - Modal title.
 * @param {React.ReactNode} props.children - Modal body content.
 * @param {React.ReactNode} [props.footer] - Footer content (e.g., action buttons).
 * @param {'sm'|'md'|'lg'|'xl'} [props.size='md'] - Size preset.
 */
const Modal = ({ show, onClose, title, children, footer, size = 'md' }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 576);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 576);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  if (!show) return null;

  return (
    <>
      {/* Backdrop - Responsive */}
      <div 
        className="modal-backdrop fade show" 
        style={{ 
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1040 
        }}
        onClick={onClose}
      ></div>

      {/* Modal - Responsive */}
      <div 
        className="modal fade show d-block" 
        tabIndex="-1"
        style={{ zIndex: 1050 }}
      >
        <div 
          className={`modal-dialog ${isMobile ? 'modal-fullscreen-sm-down' : 'modal-dialog-centered'} modal-${size} modal-dialog-scrollable`}
          style={{
            margin: isMobile ? '0' : '1.75rem auto',
            maxWidth: isMobile ? '100%' : (size === 'sm' ? '400px' : size === 'lg' ? '800px' : size === 'xl' ? '1140px' : '600px')
          }}
        >
          <div 
            className="modal-content"
            style={{
              borderRadius: isMobile ? '0' : '12px',
              minHeight: isMobile ? '100vh' : 'auto',
              maxHeight: isMobile ? '100vh' : '90vh',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Modal Header - Touch-friendly */}
            {title && (
              <div 
                className="modal-header" 
                style={{ 
                  padding: isMobile ? '1rem 1.25rem' : '1rem 1.5rem',
                  borderBottom: '1px solid #dee2e6'
                }}
              >
                <h5 
                  className="modal-title fw-semibold" 
                  style={{ fontSize: isMobile ? '1.15rem' : '1.25rem' }}
                >
                  {title}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={onClose}
                  aria-label="Close"
                  style={{
                    minHeight: isMobile ? '44px' : 'auto',
                    minWidth: isMobile ? '44px' : 'auto'
                  }}
                ></button>
              </div>
            )}

            {/* Modal Body - Scrollable with proper padding */}
            <div 
              className="modal-body" 
              style={{ 
                padding: isMobile ? '1rem 1.25rem' : '1.5rem',
                overflowY: 'auto',
                flex: 1
              }}
            >
              {children}
            </div>

            {/* Modal Footer - Responsive button layout */}
            {footer && (
              <div 
                className="modal-footer" 
                style={{ 
                  padding: isMobile ? '1rem 1.25rem' : '1rem 1.5rem',
                  borderTop: '1px solid #dee2e6',
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? '0.75rem' : '0.5rem'
                }}
              >
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

Modal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
};

export default Modal;