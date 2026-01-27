/**
 * Authentication Service Wrapper
 * 
 * This service provides a unified authentication interface
 * that works with both mock and real API through the adapter.
 * 
 * It maintains backward compatibility with existing code
 * while enabling real API integration.
 * 
 * Key Features:
 * - Seamless switching between mock and real auth
 * - Session management
 * - Role-based access control
 * - Token handling (for real API)
 */

import * as adapter from '../api/adapter';
import * as mockAuth from './mockAuth';

/**
 * Initialize authentication system
 * Call this on app startup
 */
export const initAuth = () => {
  adapter.initializeApp();
};

/**
 * Login with username and password
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<Object>} Session data with user info
 */
export const login = async (username, password) => {
  return await adapter.login(username, password);
};

/**
 * Verify 2FA code
 * @param {string} code - 6-digit verification code
 * @returns {Promise<Object>} Verification result
 */
export const verify2FA = async (code) => {
  return await adapter.verify2FA(code);
};

/**
 * Logout current user
 * Clears session data and tokens
 * @returns {Promise<void>}
 */
export const logout = async () => {
  return await adapter.logout();
};

/**
 * Get current authenticated user
 * Returns user profile/session data
 * @returns {Promise<Object>|Object} User data (async for real API, sync for mock)
 */
export const getCurrentUser = () => {
  // Normalize to always return a user object when possible
  const result = adapter.getCurrentUser();
  // Mock: synchronous session object; return nested user
  if (adapter.USE_MOCK_API && result && result.user) {
    return result.user;
  }
  return result; // Real API: Promise of user profile
};

/**
 * Get current session (backward compatible with mockAuth)
 * For mock mode: returns session object synchronously
 * For real mode: returns simple flag-based object
 * @returns {Object|null} Session object or null if not authenticated
 */
export const getCurrentSession = () => {
  if (adapter.USE_MOCK_API) {
    // Mock: get session directly from mockAuth (sync)
    return mockAuth.getCurrentSession();
  }
  // Real API: simple flag-based session representation
  return adapter.isAuthenticated() ? { verified: true } : null;
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return adapter.isAuthenticated();
};

/**
 * Check if user has required role
 * @param {string} requiredRole - 'admin', 'staff', or 'public'
 * @returns {boolean}
 */
export const hasRole = (requiredRole) => {
  return adapter.hasRole(requiredRole);
};

/**
 * Change user password
 * @param {Object} passwordData 
 * @param {string} passwordData.old_password - Current password
 * @param {string} passwordData.new_password - New password
 * @param {string} passwordData.new_password2 - Password confirmation
 * @returns {Promise<Object>}
 */
export const changePassword = async (passwordData) => {
  return await adapter.changePassword(passwordData);
};

/**
 * Initialize mock users (for development)
 * Only works in mock mode
 */
export const initializeMockUsers = () => {
  if (adapter.USE_MOCK_API) {
    adapter.initializeApp();
  }
};

// Export everything for backward compatibility
export default {
  initAuth,
  login,
  verify2FA,
  logout,
  getCurrentUser,
  getCurrentSession,
  isAuthenticated,
  hasRole,
  changePassword,
  initializeMockUsers,
};
