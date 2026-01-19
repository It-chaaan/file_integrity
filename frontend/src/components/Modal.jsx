import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ show, onClose, title, children, footer, size = 'md' }) => {
  if (!show) return null;

  return (
    <>
      <div 
        className="modal-backdrop fade show" 
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      ></div>
      <div className="modal fade show d-block" tabIndex="-1">
        <div className={`modal-dialog modal-dialog-centered modal-${size}`}>
          <div className="modal-content">
            {title && (
              <div className="modal-header">
                <h5 className="modal-title">{title}</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={onClose}
                  aria-label="Close"
                ></button>
              </div>
            )}
            <div className="modal-body">
              {children}
            </div>
            {footer && (
              <div className="modal-footer">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;