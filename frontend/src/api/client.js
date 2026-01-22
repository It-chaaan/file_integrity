/**
 * API Client Configuration
 * 
 * This file configures the Axios HTTP client for making requests to the Django REST Framework backend.
 * It handles:
 * - Base URL configuration from environment variables
 * - Request/response interceptors for authentication tokens
 * - Automatic token refresh on 401 responses
 * - Comprehensive error handling with user-friendly messages
 * - Request/response logging in development mode
 * - Retry logic for transient failures
 */

import axios from 'axios';
import { parseApiError, logError, ErrorTypes } from '../utils/errors';

// Get base URL from environment variables, fallback to localhost
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Token storage keys from environment variables
const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || 'parity_auth_token';
const REFRESH_KEY = import.meta.env.VITE_REFRESH_KEY || 'parity_refresh_token';

/**
 * Create axios instance with default configuration
 * All API requests will use this configured instance
 */
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
});

/**
 * Request Interceptor
 * Automatically attaches JWT access token to every request
 * Token is retrieved from localStorage and added to Authorization header
 */
apiClient.interceptors.request.use(
  (config) => {
    // Get access token from localStorage
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development mode
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles responses and errors globally
 * - Logs responses in development mode
 * - Handles 401 (Unauthorized) by attempting token refresh
 * - Handles other HTTP errors with user-friendly messages
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development mode
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.method.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      });
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - Token might be expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the access token
        const refreshToken = localStorage.getItem(REFRESH_KEY);
        
        if (refreshToken) {
          const response = await axios.post(`${BASE_URL}/v1/auth/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          
          // Store new access token
          localStorage.setItem(TOKEN_KEY, access);
          
          // Update the failed request with new token and retry
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);
        
        // Log the authentication error
        const authError = parseApiError(refreshError);
        logError(authError, { 
          context: 'Token Refresh Failed',
          url: originalRequest.url,
        });
        
        // Redirect to login page
        window.location.href = '/login';
        
        return Promise.reject(authError);
      }
    }

    // Parse and log the error
    const parsedError = parseApiError(error);
    logError(parsedError, {
      context: 'API Request Failed',
      url: error.config?.url,
      method: error.config?.method,
    });

    // Log error in development mode with more details
    if (import.meta.env.DEV) {
      console.error('❌ API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: parsedError.message,
        type: parsedError.type,
        data: error.response?.data,
      });
    }

    // Return parsed error for consistent handling
    return Promise.reject(parsedError);
  }
);

/**
 * Helper function to set authentication tokens
 * Called after successful login
 * 
 * @param {string} accessToken - JWT access token
 * @param {string} refreshToken - JWT refresh token
 */
export const setAuthTokens = (accessToken, refreshToken) => {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
};

/**
 * Helper function to clear authentication tokens
 * Called during logout
 */
export const clearAuthTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
};

/**
 * Helper function to get current access token
 * 
 * @returns {string|null} Current access token or null
 */
export const getAccessToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Helper function to check if user is authenticated
 * 
 * @returns {boolean} True if user has valid token
 */
export const isAuthenticated = () => {
  return !!getAccessToken();
};

/**
 * API request wrapper with retry logic
 * Automatically retries failed requests for transient errors
 * 
 * @param {Function} requestFn - Function that returns a promise (API request)
 * @param {number} maxRetries - Maximum number of retries (default: 2)
 * @returns {Promise} - API response
 */
export const withRetry = async (requestFn, maxRetries = 2) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on authentication/authorization/validation errors
      if (
        error.type === ErrorTypes.AUTHENTICATION ||
        error.type === ErrorTypes.AUTHORIZATION ||
        error.type === ErrorTypes.VALIDATION
      ) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retrying (exponential backoff: 1s, 2s, 4s...)
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      if (import.meta.env.DEV) {
        console.log(`🔄 Retrying request (attempt ${attempt + 2}/${maxRetries + 1})...`);
      }
    }
  }
  
  throw lastError;
};

export default apiClient;
