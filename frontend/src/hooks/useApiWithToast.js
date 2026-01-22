/**
 * Custom Hook: useApiWithToast
 * 
 * Combines API calls with automatic toast notifications
 * Handles loading states, errors, and success messages automatically
 * 
 * @example
 * const { execute, loading } = useApiWithToast();
 * 
 * const handleUpload = async () => {
 *   await execute(
 *     () => uploadDocument(file),
 *     'Document uploaded successfully!',
 *     'Failed to upload document'
 *   );
 * };
 */

import { useState } from 'react';
import { useToast } from '../components/Toast';
import { handleError } from '../utils/errors';

/**
 * Hook for API calls with automatic toast notifications
 * 
 * @returns {Object} - { execute, loading, error }
 */
export const useApiWithToast = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Execute an API call with automatic toast notifications
   * 
   * @param {Function} apiCall - Async function to execute
   * @param {string} successMessage - Message to show on success
   * @param {string} errorMessage - Message to show on error (optional)
   * @param {Object} options - Additional options
   * @returns {Promise} - Result of API call
   */
  const execute = async (
    apiCall,
    successMessage,
    errorMessage = 'An error occurred',
    options = {}
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiCall();
      
      // Show success toast
      if (successMessage && !options.silent) {
        toast.success(successMessage);
      }
      
      return result;
    } catch (err) {
      // Parse and handle error
      const parsedError = handleError(err, options.context || {});
      setError(parsedError);
      
      // Show error toast (use custom message or error message from server)
      if (!options.silent) {
        toast.error(errorMessage || parsedError.message);
      }
      
      // Re-throw if caller wants to handle it
      if (options.rethrow) {
        throw parsedError;
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset error state
   */
  const clearError = () => {
    setError(null);
  };

  return {
    execute,
    loading,
    error,
    clearError,
  };
};

/**
 * Hook for mutations (create, update, delete) with toast notifications
 * Provides dedicated methods for common CRUD operations
 */
export const useMutationWithToast = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeMutation = async (
    apiCall,
    options = {}
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiCall();
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      
      if (options.successMessage) {
        toast.success(options.successMessage);
      }
      
      return result;
    } catch (err) {
      const parsedError = handleError(err, options.context || {});
      setError(parsedError);
      
      if (options.onError) {
        options.onError(parsedError);
      }
      
      if (options.errorMessage) {
        toast.error(options.errorMessage);
      } else {
        toast.error(parsedError.message);
      }
      
      if (options.rethrow) {
        throw parsedError;
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create operation
   */
  const create = async (apiCall, itemName = 'Item') => {
    return executeMutation(apiCall, {
      successMessage: `${itemName} created successfully!`,
      errorMessage: `Failed to create ${itemName.toLowerCase()}`,
      context: { operation: 'create', item: itemName },
    });
  };

  /**
   * Update operation
   */
  const update = async (apiCall, itemName = 'Item') => {
    return executeMutation(apiCall, {
      successMessage: `${itemName} updated successfully!`,
      errorMessage: `Failed to update ${itemName.toLowerCase()}`,
      context: { operation: 'update', item: itemName },
    });
  };

  /**
   * Delete operation
   */
  const remove = async (apiCall, itemName = 'Item') => {
    return executeMutation(apiCall, {
      successMessage: `${itemName} deleted successfully!`,
      errorMessage: `Failed to delete ${itemName.toLowerCase()}`,
      context: { operation: 'delete', item: itemName },
    });
  };

  return {
    create,
    update,
    remove,
    execute: executeMutation,
    loading,
    error,
  };
};

/**
 * Hook for showing loading toast during long operations
 */
export const useLoadingToast = () => {
  const toast = useToast();
  const [toastId, setToastId] = useState(null);

  const showLoading = (message = 'Processing...') => {
    const id = toast.info(message, {
      autohide: false,
      title: 'Please wait',
    });
    setToastId(id);
    return id;
  };

  const hideLoading = () => {
    if (toastId) {
      toast.removeToast(toastId);
      setToastId(null);
    }
  };

  const updateToSuccess = (message) => {
    hideLoading();
    toast.success(message);
  };

  const updateToError = (message) => {
    hideLoading();
    toast.error(message);
  };

  return {
    showLoading,
    hideLoading,
    updateToSuccess,
    updateToError,
  };
};

export default useApiWithToast;
