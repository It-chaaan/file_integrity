/**
 * Error Handling Utilities
 * 
 * Provides comprehensive error handling, parsing, and user-friendly error messages
 * for the entire application.
 */

/**
 * Error Types
 * Categorizes different types of errors for proper handling
 */
export const ErrorTypes = {
  NETWORK: 'NETWORK',
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  VALIDATION: 'VALIDATION',
  NOT_FOUND: 'NOT_FOUND',
  SERVER: 'SERVER',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN: 'UNKNOWN',
};

/**
 * Error Severity Levels
 * Determines how errors should be displayed to users
 */
export const ErrorSeverity = {
  ERROR: 'error',     // Critical errors requiring immediate attention
  WARNING: 'warning', // Non-critical issues
  INFO: 'info',       // Informational messages
};

/**
 * Custom Application Error Class
 * Extends Error with additional context for better error handling
 */
export class AppError extends Error {
  constructor(message, type = ErrorTypes.UNKNOWN, severity = ErrorSeverity.ERROR, originalError = null) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Parse HTTP error responses into user-friendly messages
 * Handles various error formats from Django REST Framework
 * 
 * @param {Object} error - Error object from axios or API
 * @returns {AppError} - Formatted application error
 */
export const parseApiError = (error) => {
  // Network errors (no response)
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return new AppError(
        'Request timeout. Please check your internet connection and try again.',
        ErrorTypes.TIMEOUT,
        ErrorSeverity.ERROR,
        error
      );
    }
    
    return new AppError(
      'Network error. Please check your internet connection.',
      ErrorTypes.NETWORK,
      ErrorSeverity.ERROR,
      error
    );
  }

  const { status, data } = error.response;

  // Extract error message from various response formats
  let message = 'An unexpected error occurred';
  
  if (typeof data === 'string') {
    message = data;
  } else if (data?.message) {
    message = data.message;
  } else if (data?.detail) {
    message = data.detail;
  } else if (data?.error) {
    message = data.error;
  } else if (data?.errors) {
    // Handle validation errors (multiple fields)
    if (typeof data.errors === 'object') {
      const errorMessages = Object.entries(data.errors)
        .map(([field, errors]) => {
          const errorList = Array.isArray(errors) ? errors : [errors];
          return `${field}: ${errorList.join(', ')}`;
        })
        .join('; ');
      message = errorMessages;
    } else if (Array.isArray(data.errors)) {
      message = data.errors.join('; ');
    }
  }

  // Categorize by status code
  switch (status) {
    case 400:
      return new AppError(
        message || 'Invalid request. Please check your input.',
        ErrorTypes.VALIDATION,
        ErrorSeverity.WARNING,
        error
      );

    case 401:
      return new AppError(
        'Your session has expired. Please log in again.',
        ErrorTypes.AUTHENTICATION,
        ErrorSeverity.ERROR,
        error
      );

    case 403:
      return new AppError(
        'You do not have permission to perform this action.',
        ErrorTypes.AUTHORIZATION,
        ErrorSeverity.WARNING,
        error
      );

    case 404:
      return new AppError(
        message || 'The requested resource was not found.',
        ErrorTypes.NOT_FOUND,
        ErrorSeverity.INFO,
        error
      );

    case 409:
      return new AppError(
        message || 'This action conflicts with existing data.',
        ErrorTypes.VALIDATION,
        ErrorSeverity.WARNING,
        error
      );

    case 422:
      return new AppError(
        message || 'Validation failed. Please check your input.',
        ErrorTypes.VALIDATION,
        ErrorSeverity.WARNING,
        error
      );

    case 429:
      return new AppError(
        'Too many requests. Please wait a moment and try again.',
        ErrorTypes.NETWORK,
        ErrorSeverity.WARNING,
        error
      );

    case 500:
    case 502:
    case 503:
    case 504:
      return new AppError(
        'Server error. Our team has been notified. Please try again later.',
        ErrorTypes.SERVER,
        ErrorSeverity.ERROR,
        error
      );

    default:
      return new AppError(
        message,
        ErrorTypes.UNKNOWN,
        ErrorSeverity.ERROR,
        error
      );
  }
};

/**
 * Format error for logging
 * Creates a structured error object for logging services
 * 
 * @param {Error|AppError} error - Error to format
 * @param {Object} context - Additional context (component, action, etc.)
 * @returns {Object} - Formatted error object
 */
export const formatErrorForLogging = (error, context = {}) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    message: error.message,
    type: error.type || ErrorTypes.UNKNOWN,
    severity: error.severity || ErrorSeverity.ERROR,
    stack: error.stack,
    context: {
      ...context,
      userAgent: navigator.userAgent,
      url: window.location.href,
    },
  };

  // Add original error details if available
  if (error.originalError) {
    errorLog.originalError = {
      message: error.originalError.message,
      status: error.originalError.response?.status,
      statusText: error.originalError.response?.statusText,
      url: error.originalError.config?.url,
      method: error.originalError.config?.method,
    };
  }

  return errorLog;
};

/**
 * Log error to console in development, and to external service in production
 * 
 * @param {Error|AppError} error - Error to log
 * @param {Object} context - Additional context
 */
export const logError = (error, context = {}) => {
  const errorLog = formatErrorForLogging(error, context);

  // Always log to console in development
  if (import.meta.env.DEV) {
    console.error('🔴 Error:', errorLog);
  }

  // In production, send to error logging service (e.g., Sentry, LogRocket)
  if (import.meta.env.PROD) {
    // TODO: Integrate with error logging service
    // Example: Sentry.captureException(error, { extra: errorLog });
  }
};

/**
 * Handle errors consistently across the application
 * Logs error and returns user-friendly message
 * 
 * @param {Error} error - Error to handle
 * @param {Object} context - Additional context
 * @returns {AppError} - Parsed application error
 */
export const handleError = (error, context = {}) => {
  // If already an AppError, just log it
  if (error instanceof AppError) {
    logError(error, context);
    return error;
  }

  // Parse API errors
  if (error.response || error.request) {
    const appError = parseApiError(error);
    logError(appError, context);
    return appError;
  }

  // Generic JavaScript errors
  const appError = new AppError(
    error.message || 'An unexpected error occurred',
    ErrorTypes.UNKNOWN,
    ErrorSeverity.ERROR,
    error
  );
  
  logError(appError, context);
  return appError;
};

/**
 * Create a standardized error response
 * Useful for consistent error returns in services
 * 
 * @param {string} message - Error message
 * @param {string} type - Error type
 * @returns {Object} - Error response object
 */
export const createErrorResponse = (message, type = ErrorTypes.UNKNOWN) => {
  return {
    success: false,
    error: message,
    type,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Retry logic for failed operations
 * Useful for transient network errors
 * 
 * @param {Function} operation - Async operation to retry
 * @param {number} maxRetries - Maximum number of retries (default: 3)
 * @param {number} delay - Delay between retries in ms (default: 1000)
 * @returns {Promise} - Result of operation
 */
export const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on authentication/authorization errors
      const parsedError = error.response ? parseApiError(error) : error;
      if (
        parsedError.type === ErrorTypes.AUTHENTICATION ||
        parsedError.type === ErrorTypes.AUTHORIZATION
      ) {
        throw parsedError;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  throw handleError(lastError, { retries: maxRetries });
};

/**
 * Safe async operation wrapper
 * Returns [error, data] tuple similar to Go's error handling
 * 
 * @param {Promise} promise - Promise to execute
 * @returns {Promise<[Error|null, any|null]>} - [error, data] tuple
 */
export const safeAsync = async (promise) => {
  try {
    const data = await promise;
    return [null, data];
  } catch (error) {
    return [handleError(error), null];
  }
};

/**
 * Validation error helper
 * Creates validation errors for form fields
 * 
 * @param {Object} errors - Field errors object
 * @returns {AppError} - Validation error
 */
export const createValidationError = (errors) => {
  const messages = Object.entries(errors)
    .map(([field, message]) => `${field}: ${message}`)
    .join('; ');
  
  return new AppError(
    messages,
    ErrorTypes.VALIDATION,
    ErrorSeverity.WARNING
  );
};

export default {
  ErrorTypes,
  ErrorSeverity,
  AppError,
  parseApiError,
  handleError,
  logError,
  createErrorResponse,
  retryOperation,
  safeAsync,
  createValidationError,
};
