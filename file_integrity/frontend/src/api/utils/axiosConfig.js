/**
 * Axios Configuration Utility
 * 
 * Provides centralized functions for creating axios request configurations
 * Reduces duplication and ensures consistency across API calls
 */

/**
 * Create standard axios config with common settings
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.method - HTTP method (GET, POST, etc.)
 * @param {Object} options.headers - Additional headers
 * @param {string} options.responseType - Response type (json, blob, etc.)
 * @param {number} options.timeout - Request timeout in ms
 * @returns {Object} - Axios config object
 * 
 * @example
 * const config = createAxiosConfig({
 *   method: 'GET',
 *   headers: { 'Accept': 'application/json' }
 * });
 */
export const createAxiosConfig = (options = {}) => {
  const config = {
    method: options.method || 'GET',
    timeout: options.timeout || 15000,
  };
  
  // Add headers if provided
  if (options.headers && Object.keys(options.headers).length > 0) {
    config.headers = options.headers;
  }
  
  // Add response type if provided
  if (options.responseType) {
    config.responseType = options.responseType;
  }
  
  return config;
};

/**
 * Create config for file download
 * Sets proper headers and response type for blob responses
 * 
 * @returns {Object} - Axios config for file download
 * 
 * @example
 * const config = createDownloadConfig('document.pdf');
 * const response = await apiClient.get('/documents/123/download', config);
 */
export const createDownloadConfig = () => {
  return {
    responseType: 'blob',
    headers: {
      'Accept': '*/*',
    },
    timeout: 30000, // Longer timeout for downloads
  };
};

/**
 * Create config for JSON responses
 * Ensures proper content type negotiation
 * 
 * @param {Object} headers - Additional headers
 * @returns {Object} - Axios config for JSON
 */
export const createJsonConfig = (headers = {}) => {
  return {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...headers,
    },
  };
};

/**
 * Create config for form-urlencoded data
 * Used for standard form submissions
 * 
 * @param {Object} headers - Additional headers
 * @returns {Object} - Axios config for form data
 */
export const createFormUrlEncodedConfig = (headers = {}) => {
  return {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...headers,
    },
  };
};

/**
 * Create pagination params for list endpoints
 * Standardizes pagination across API calls
 * 
 * @param {Object} options - Pagination options
 * @param {number} options.page - Page number (1-indexed)
 * @param {number} options.pageSize - Items per page
 * @param {string} options.ordering - Sort field and direction
 * @returns {Object} - Query parameters for pagination
 * 
 * @example
 * const params = createPaginationParams({
 *   page: 2,
 *   pageSize: 20,
 *   ordering: '-created_at'
 * });
 */
export const createPaginationParams = (options = {}) => {
  const params = {};
  
  if (options.page) {
    params.page = options.page;
  }
  
  if (options.pageSize) {
    params.page_size = options.pageSize;
  }
  
  if (options.ordering) {
    params.ordering = options.ordering;
  }
  
  return params;
};

/**
 * Create filter params from a filter object
 * Converts filter definitions into query parameters
 * 
 * @param {Object} filters - Filter definitions
 * @returns {Object} - Query parameters for filtering
 * 
 * @example
 * const params = createFilterParams({
 *   status: 'verified',
 *   dateFrom: '2026-01-01',
 *   dateTo: '2026-12-31'
 * });
 */
export const createFilterParams = (filters = {}) => {
  const params = {};
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      // Convert camelCase to snake_case
      const paramKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      params[paramKey] = value;
    }
  });
  
  return params;
};

/**
 * Merge query parameters for requests
 * Combines pagination, filters, and search parameters
 * 
 * @param {Object} options - Parameter options
 * @param {Object} options.pagination - Pagination params
 * @param {Object} options.filters - Filter params
 * @param {string} options.search - Search query
 * @returns {Object} - Combined query parameters
 * 
 * @example
 * const params = mergeQueryParams({
 *   pagination: { page: 1, pageSize: 20 },
 *   filters: { status: 'active' },
 *   search: 'test'
 * });
 */
export const mergeQueryParams = (options = {}) => {
  const params = {};
  
  // Add pagination params
  if (options.pagination) {
    Object.assign(params, createPaginationParams(options.pagination));
  }
  
  // Add filter params
  if (options.filters) {
    Object.assign(params, createFilterParams(options.filters));
  }
  
  // Add search param
  if (options.search) {
    params.search = options.search;
  }
  
  return params;
};

/**
 * Create request interceptor config
 * Sets up headers, authentication, timeouts consistently
 * 
 * @param {Object} options - Interceptor options
 * @param {string} options.authToken - Bearer token for Authorization header
 * @param {Object} options.customHeaders - Custom headers to add
 * @returns {Object} - Config with interceptor settings
 */
export const createInterceptorConfig = (options = {}) => {
  const config = {};
  
  const headers = { ...options.customHeaders };
  
  // Add auth token if provided
  if (options.authToken) {
    headers.Authorization = `Bearer ${options.authToken}`;
  }
  
  if (Object.keys(headers).length > 0) {
    config.headers = headers;
  }
  
  return config;
};

/**
 * Create retry config for failed requests
 * Specifies retry behavior for transient errors
 * 
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries
 * @param {number} options.initialDelay - Initial delay in ms
 * @returns {Object} - Retry configuration
 */
export const createRetryConfig = (options = {}) => {
  return {
    maxRetries: options.maxRetries || 2,
    initialDelay: options.initialDelay || 1000,
    backoffMultiplier: 2, // Exponential backoff
  };
};

export default {
  createAxiosConfig,
  createDownloadConfig,
  createJsonConfig,
  createFormUrlEncodedConfig,
  createPaginationParams,
  createFilterParams,
  mergeQueryParams,
  createInterceptorConfig,
  createRetryConfig,
};
