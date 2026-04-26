/**
 * Error Context Utility
 * 
 * Provides functions to add meaningful context to API errors
 * Improves error debugging by including operation details and recovery suggestions
 */

import { AppError, ErrorTypes, ErrorSeverity } from '../../utils/errors';

/**
 * Wrap an API call with context-aware error handling
 * Adds operation details and recovery suggestions to error messages
 * 
 * @param {Function} apiCall - The async API function to call
 * @param {string} operation - Operation name (e.g., 'document.upload')
 * @param {Object} context - Additional context information
 * @param {string} context.resource - Resource type (e.g., 'document', 'user')
 * @param {string} context.action - Action being performed (e.g., 'upload', 'verify')
 * @param {string} context.resourceId - Optional resource ID
 * @returns {Promise} - Result from API call or throws AppError with context
 * 
 * @example
 * const result = await withErrorContext(
 *   () => uploadDocument(file),
 *   'document.upload',
 *   { resource: 'document', action: 'upload' }
 * );
 */
export const withErrorContext = async (apiCall, operation, context = {}) => {
  try {
    return await apiCall();
  } catch (error) {
    // If already an AppError, enhance it with context
    if (error instanceof AppError) {
      error.context = { ...error.context, ...context, operation };
      throw error;
    }

    // Parse API error and add context
    const apiError = error.response || error.request ? parseApiErrorWithContext(error, context) : error;
    
    // Wrap in AppError with context
    throw new AppError(
      buildErrorMessage(apiError, context),
      ErrorTypes.API_ERROR,
      ErrorSeverity.ERROR,
      apiError,
      { ...context, operation }
    );
  }
};

/**
 * Parse API error response and add context
 * 
 * @param {Error} error - Axios error object
 * @param {Object} context - Additional context
 * @returns {Error} - Enhanced error with context
 */
export const parseApiErrorWithContext = (error, context = {}) => {
  const statusCode = error.response?.status;
  const errorData = error.response?.data || {};
  
  const contextError = new Error();
  contextError.status = statusCode;
  contextError.data = errorData;
  contextError.context = context;
  contextError.original = error;
  
  return contextError;
};

/**
 * Build a user-friendly error message with context and recovery suggestions
 * 
 * @param {Error} error - The error object
 * @param {Object} context - Context information
 * @returns {string} - Formatted error message
 */
export const buildErrorMessage = (error, context = {}) => {
  const { resource = 'operation', action = 'perform' } = context;
  const status = error.status || error.response?.status;
  
  // Build base message
  let message = `Failed to ${action} ${resource}`;
  
  // Add status-specific details
  if (status === 401) {
    message += ': Authentication required. Please log in again.';
  } else if (status === 403) {
    message += ': You do not have permission to perform this action.';
  } else if (status === 404) {
    message += ': The resource was not found.';
  } else if (status === 409) {
    message += ': This resource already exists or conflicts with existing data.';
  } else if (status === 413) {
    message += ': File is too large. Please check the file size limit.';
  } else if (status === 422 || status === 400) {
    message += ': Invalid data provided. Please check your input.';
  } else if (status === 429) {
    message += ': Too many requests. Please try again later.';
  } else if (status === 500) {
    message += ': Server error. Please try again later or contact support.';
  } else if (status === 503) {
    message += ': Service temporarily unavailable. Please try again later.';
  } else if (error.message) {
    message += `: ${error.message}`;
  }
  
  return message;
};

/**
 * Get recovery suggestions based on error type
 * Helps users understand what to do when an error occurs
 * 
 * @param {Error} error - The error object
 * @param {Object} context - Context information
 * @returns {Array<string>} - Array of suggested recovery actions
 */
export const getRecoverySuggestions = (error, context = {}) => {
  const status = error.status || error.response?.status;
  const { resource = 'resource' } = context;
  const suggestions = [];
  
  if (status === 401) {
    suggestions.push('Log out and log back in');
    suggestions.push('Check if your session has expired');
    suggestions.push('Clear browser cache and cookies');
  } else if (status === 403) {
    suggestions.push(`Contact your administrator for ${resource} access`);
    suggestions.push('Verify your user role and permissions');
  } else if (status === 404) {
    suggestions.push(`Verify the ${resource} exists`);
    suggestions.push('Try searching for the resource again');
    suggestions.push('The resource may have been deleted');
  } else if (status === 409) {
    suggestions.push('Check if the resource already exists');
    suggestions.push('Use a different identifier or name');
    suggestions.push('Try again with different data');
  } else if (status === 413) {
    suggestions.push('Reduce the file size');
    suggestions.push('Compress the file before uploading');
    suggestions.push('Split the file into multiple smaller files');
  } else if (status === 422 || status === 400) {
    suggestions.push('Check all required fields are filled');
    suggestions.push('Verify the data format is correct');
    suggestions.push('Check for special characters that need escaping');
  } else if (status === 429) {
    suggestions.push('Wait a few minutes before trying again');
    suggestions.push('Reduce the frequency of your requests');
  } else if (status === 500 || status === 503) {
    suggestions.push('Try again in a few moments');
    suggestions.push('Contact support if the problem persists');
    suggestions.push('Check the system status page');
  } else {
    suggestions.push('Check your internet connection');
    suggestions.push('Try again in a moment');
    suggestions.push('Contact support if the problem persists');
  }
  
  return suggestions;
};

/**
 * Format error with full context for logging
 * Includes operation, resource, recovery suggestions
 * 
 * @param {Error} error - The error object
 * @param {Object} context - Context information
 * @returns {Object} - Formatted error object for logging
 */
export const formatErrorWithContext = (error, context = {}) => {
  const message = buildErrorMessage(error, context);
  const suggestions = getRecoverySuggestions(error, context);
  
  return {
    message,
    operation: context.operation,
    resource: context.resource,
    action: context.action,
    suggestions,
    status: error.status || error.response?.status,
    timestamp: new Date().toISOString(),
    ...context,
  };
};

export default {
  withErrorContext,
  parseApiErrorWithContext,
  buildErrorMessage,
  getRecoverySuggestions,
  formatErrorWithContext,
};
