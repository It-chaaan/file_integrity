/**
 * Toast Notification System
 * 
 * Provides a React Context-based toast notification system
 * for displaying success, error, warning, and info messages to users.
 * Uses React Bootstrap's Toast component for consistent styling.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Toast, ToastContainer } from 'react-bootstrap';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info 
} from 'lucide-react';

/**
 * Toast Context
 * Provides toast functionality throughout the application
 */
const ToastContext = createContext(null);

/**
 * Toast Types
 * Maps to Bootstrap variants and icons
 */
export const ToastType = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

/**
 * Toast Configuration
 * Default settings for different toast types
 */
const toastConfig = {
  [ToastType.SUCCESS]: {
    bg: 'success',
    icon: CheckCircle,
    title: 'Success',
    duration: 4000,
  },
  [ToastType.ERROR]: {
    bg: 'danger',
    icon: XCircle,
    title: 'Error',
    duration: 6000,
  },
  [ToastType.WARNING]: {
    bg: 'warning',
    icon: AlertTriangle,
    title: 'Warning',
    duration: 5000,
  },
  [ToastType.INFO]: {
    bg: 'info',
    icon: Info,
    title: 'Info',
    duration: 4000,
  },
};

/**
 * Toast Provider Component
 * Wraps the app to expose toast helpers via context.
 * @param {Object} props
 * @param {React.ReactNode} props.children - App subtree to wrap.
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  /**
   * Remove a toast by ID
   * 
   * @param {number} id - Toast ID
   */
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  /**
   * Add a new toast notification
   * 
   * @param {string} message - Toast message
   * @param {string} type - Toast type (success, error, warning, info)
   * @param {Object} options - Additional options (title, duration, etc.)
   */
  const addToast = useCallback((message, type = ToastType.INFO, options = {}) => {
    const id = Date.now() + Math.random();
    const config = toastConfig[type] || toastConfig[ToastType.INFO];
    
    const toast = {
      id,
      message,
      type,
      title: options.title || config.title,
      duration: options.duration || config.duration,
      icon: config.icon,
      bg: config.bg,
      autohide: options.autohide !== false,
    };

    setToasts(prev => [...prev, toast]);

    // Auto-remove toast after duration
    if (toast.autohide) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration);
    }

    return id;
  }, [removeToast]);

  /**
   * Clear all toasts
   */
  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  /**
   * Convenience methods for different toast types
   */
  const success = useCallback((message, options) => {
    return addToast(message, ToastType.SUCCESS, options);
  }, [addToast]);

  const error = useCallback((message, options) => {
    return addToast(message, ToastType.ERROR, options);
  }, [addToast]);

  const warning = useCallback((message, options) => {
    return addToast(message, ToastType.WARNING, options);
  }, [addToast]);

  const info = useCallback((message, options) => {
    return addToast(message, ToastType.INFO, options);
  }, [addToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer 
        position="top-end" 
        className="p-3" 
        style={{ 
          position: 'fixed', 
          top: 20, 
          right: 20, 
          zIndex: 9999 
        }}
      >
        {toasts.map(toast => (
          <ToastNotification
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
};

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Individual Toast Notification Component
 * @param {{toast: Object, onClose: () => void}} props
 */
const ToastNotification = ({ toast, onClose }) => {
  const Icon = toast.icon;

  return (
    <Toast
      bg={toast.bg}
      onClose={onClose}
      show={true}
      autohide={toast.autohide}
      delay={toast.duration}
      className="text-white"
    >
      <Toast.Header closeButton className={`bg-${toast.bg} text-white`}>
        <Icon size={18} className="me-2" />
        <strong className="me-auto">{toast.title}</strong>
      </Toast.Header>
      <Toast.Body className="text-white">
        {toast.message}
      </Toast.Body>
    </Toast>
  );
};

ToastNotification.propTypes = {
  toast: PropTypes.shape({
    id: PropTypes.number.isRequired,
    message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
    type: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    duration: PropTypes.number.isRequired,
    icon: PropTypes.elementType.isRequired,
    bg: PropTypes.string.isRequired,
    autohide: PropTypes.bool,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

/**
 * useToast Hook
 * Access toast functionality in any component
 * 
 * @returns {Object} Toast methods
 * 
 * @example
 * const toast = useToast();
 * toast.success('Document uploaded successfully!');
 * toast.error('Failed to save changes');
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
};

/**
 * withToast HOC
 * Inject toast functionality into class components.
 * @param {React.ComponentType<any>} Component - Component to wrap.
 * @returns {React.ComponentType<any>} Wrapped component with toast prop.
 */
export const withToast = (WrappedComponent) => {
  function WithToast(props) {
    const toast = useToast();
    return <WrappedComponent {...props} toast={toast} />;
  }

  WithToast.displayName = `withToast(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  return WithToast;
};

export default ToastProvider;
