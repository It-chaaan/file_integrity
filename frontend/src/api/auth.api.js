/**
 * Authentication API Module
 * 
 * This module handles all authentication-related API calls to the Django REST Framework backend.
 * Endpoints managed:
 * - User registration
 * - Login (with JWT token generation)
 * - Logout
 * - Token refresh
 * - Two-factor authentication (2FA)
 * - User profile management
 * - Password change
 * 
 * All functions return promises that resolve with the response data or reject with an error.
 */

import apiClient, { clearAuthTokens, setAuthTokens } from './client';
import { withErrorContext } from './utils/errorContext';

/**
 * Register a new user account.
 * @param {Object} userData
 * @param {string} userData.username
 * @param {string} userData.email
 * @param {string} userData.password
 * @param {string} userData.password2
 * @param {string} [userData.first_name]
 * @param {string} [userData.last_name]
 * @returns {Promise<Object>} Created user data.
 */
export const register = async (userData) => {
  const response = await withErrorContext(
    () => apiClient.post('/v1/auth/register/', userData),
    'auth.register',
    { resource: 'user', action: 'register' }
  );
  return response.data;
};

/**
 * Login user and retrieve JWT tokens (tokens stored via client helpers).
 * @param {string} username - Username or email.
 * @param {string} password - User password.
 * @param {string} [trustedDeviceToken] - Optional trusted-device token.
 * @returns {Promise<Object>} User data and tokens.
 */
export const login = async (username, password, trustedDeviceToken = null) => {
  const response = await withErrorContext(
    () => apiClient.post('/v1/auth/login/', trustedDeviceToken ? { username, password, trusted_device_token: trustedDeviceToken } : { username, password }),
    'auth.login',
    { resource: 'session', action: 'login' }
  );

  const { access, refresh, requires_two_factor: requiresTwoFactor } = response.data;

  // Store tokens automatically
  if (!requiresTwoFactor && access && refresh) {
    setAuthTokens(access, refresh);
  }

  return response.data;
};

/**
 * Logout current user (clears stored tokens).
 * @returns {Promise<Object>} Logout confirmation.
 */
export const logout = async () => {
  const response = await withErrorContext(
    () => apiClient.post('/v1/auth/logout/'),
    'auth.logout',
    { resource: 'session', action: 'logout' }
  );
  
  // Clear tokens from localStorage
  clearAuthTokens();
  
  return response.data;
};

/**
 * Refresh JWT access token using refresh token.
 * @param {string} refreshToken - JWT refresh token.
 * @returns {Promise<Object>} New access token.
 */
export const refreshToken = async (refreshToken) => {
  const response = await withErrorContext(
    () => apiClient.post('/v1/auth/refresh/', { refresh: refreshToken }),
    'auth.refresh',
    { resource: 'session', action: 'refresh' }
  );

  const { access } = response.data;
  
  // Update access token in localStorage
  if (access) {
    localStorage.setItem(import.meta.env.VITE_AUTH_TOKEN_KEY || 'parity_auth_token', access);
  }

  return response.data;
};

/**
 * Verify two-factor authentication code.
 * @param {string} code - 6-digit 2FA code from authenticator app.
 * @param {string|null} pendingToken - Pending MFA token.
 * @param {boolean} rememberDevice - Whether to issue a trusted-device token.
 * @returns {Promise<Object>} Verification result with tokens.
 */
export const verify2FA = async (code, pendingToken = null, rememberDevice = false) => {
  const response = await withErrorContext(
    () => apiClient.post('/v1/auth/verify-2fa/', pendingToken ? { code, pending_token: pendingToken, remember_device: rememberDevice } : { code, remember_device: rememberDevice }),
    'auth.verify2FA',
    { resource: 'session', action: 'verify2FA' }
  );
  
  const { access, refresh } = response.data;

  // Store tokens if 2FA verification successful
  if (access && refresh) {
    setAuthTokens(access, refresh);
  }

  return response.data;
};

/**
 * Enable two-factor authentication for current user.
 * @returns {Promise<Object>} 2FA setup data (QR code, secret).
 */
export const enable2FA = async () => {
  const response = await withErrorContext(
    () => apiClient.post('/v1/auth/enable-2fa/'),
    'auth.enable2FA',
    { resource: 'session', action: 'enable2FA' }
  );
  return response.data;
};

/**
 * Disable two-factor authentication for current user.
 * @param {string} code - Current 2FA code to confirm disable.
 * @returns {Promise<Object>} Confirmation message.
 */
export const disable2FA = async (code) => {
  const response = await withErrorContext(
    () => apiClient.post('/v1/auth/disable-2fa/', { code }),
    'auth.disable2FA',
    { resource: 'session', action: 'disable2FA' }
  );
  return response.data;
};

/**
 * Get current authenticated user profile.
 * @returns {Promise<Object>} User profile data.
 */
export const getUserProfile = async () => {
  const response = await withErrorContext(
    () => apiClient.get('/v1/auth/me/'),
    'auth.profile',
    { resource: 'user', action: 'getProfile' }
  );
  return response.data;
};

/**
 * Update current user profile.
 * @param {Object} profileData - Profile fields to update.
 * @returns {Promise<Object>} Updated user profile.
 */
export const updateUserProfile = async (profileData) => {
  const response = await withErrorContext(
    () => apiClient.patch('/v1/auth/me/', profileData),
    'auth.updateProfile',
    { resource: 'user', action: 'updateProfile' }
  );
  return response.data;
};

/**
 * Change user password.
 * @param {Object} passwordData
 * @param {string} passwordData.old_password
 * @param {string} passwordData.new_password
 * @param {string} passwordData.new_password2
 * @returns {Promise<Object>} Success message.
 */
export const changePassword = async (passwordData) => {
  const response = await withErrorContext(
    () => apiClient.post('/v1/auth/change-password/', passwordData),
    'auth.changePassword',
    { resource: 'user', action: 'changePassword' }
  );
  return response.data;
};

/**
 * Request password reset email.
 * @param {string} email - Email address for password reset.
 * @returns {Promise<Object>} Confirmation message.
 */
export const requestPasswordReset = async (email) => {
  const response = await withErrorContext(
    () => apiClient.post('/v1/auth/password-reset/', { email }),
    'auth.requestPasswordReset',
    { resource: 'user', action: 'requestPasswordReset' }
  );
  return response.data;
};

/**
 * Confirm password reset with token.
 * @param {Object} resetData
 * @param {string} resetData.token
 * @param {string} resetData.password
 * @param {string} resetData.password2
 * @returns {Promise<Object>} Success message.
 */
export const confirmPasswordReset = async (resetData) => {
  const response = await withErrorContext(
    () => apiClient.post('/v1/auth/password-reset-confirm/', resetData),
    'auth.confirmPasswordReset',
    { resource: 'user', action: 'confirmPasswordReset' }
  );
  return response.data;
};

// Export all auth functions as a grouped object for convenience
export default {
  register,
  login,
  logout,
  refreshToken,
  verify2FA,
  enable2FA,
  disable2FA,
  getUserProfile,
  updateUserProfile,
  changePassword,
  requestPasswordReset,
  confirmPasswordReset,
};
