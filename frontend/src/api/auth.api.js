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

import apiClient, { setAuthTokens, clearAuthTokens } from './client';

/**
 * Register a new user account
 * 
 * @param {Object} userData - User registration data
 * @param {string} userData.username - Username for the account
 * @param {string} userData.email - Email address
 * @param {string} userData.password - Password
 * @param {string} userData.password2 - Password confirmation
 * @param {string} userData.first_name - First name (optional)
 * @param {string} userData.last_name - Last name (optional)
 * @returns {Promise<Object>} Created user data
 * @throws {Error} If registration fails
 */
export const register = async (userData) => {
  try {
    const response = await apiClient.post('/v1/auth/register/', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Login user and retrieve JWT tokens
 * Automatically stores tokens in localStorage
 * 
 * @param {string} username - Username or email
 * @param {string} password - User password
 * @returns {Promise<Object>} User data and tokens
 * @throws {Error} If login fails
 */
export const login = async (username, password) => {
  try {
    const response = await apiClient.post('/v1/auth/login/', {
      username,
      password,
    });

    const { access, refresh, user } = response.data;

    // Store tokens automatically
    if (access && refresh) {
      setAuthTokens(access, refresh);
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Logout current user
 * Clears tokens from localStorage and notifies backend
 * 
 * @returns {Promise<Object>} Logout confirmation
 * @throws {Error} If logout fails
 */
export const logout = async () => {
  try {
    const response = await apiClient.post('/v1/auth/logout/');
    
    // Clear tokens from localStorage
    clearAuthTokens();
    
    return response.data;
  } catch (error) {
    // Clear tokens even if backend call fails
    clearAuthTokens();
    throw error;
  }
};

/**
 * Refresh JWT access token using refresh token
 * Automatically updates stored access token
 * 
 * @param {string} refreshToken - JWT refresh token
 * @returns {Promise<Object>} New access token
 * @throws {Error} If token refresh fails
 */
export const refreshToken = async (refreshToken) => {
  try {
    const response = await apiClient.post('/v1/auth/refresh/', {
      refresh: refreshToken,
    });

    const { access } = response.data;
    
    // Update access token in localStorage
    if (access) {
      localStorage.setItem(import.meta.env.VITE_TOKEN_KEY || 'parity_auth_token', access);
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Verify two-factor authentication code
 * 
 * @param {string} code - 6-digit 2FA code from authenticator app
 * @returns {Promise<Object>} Verification result with tokens
 * @throws {Error} If verification fails
 */
export const verify2FA = async (code) => {
  try {
    const response = await apiClient.post('/v1/auth/verify-2fa/', { code });
    
    const { access, refresh } = response.data;

    // Store tokens if 2FA verification successful
    if (access && refresh) {
      setAuthTokens(access, refresh);
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Enable two-factor authentication for current user
 * Returns QR code and secret key for setting up authenticator app
 * 
 * @returns {Promise<Object>} 2FA setup data (QR code, secret)
 * @throws {Error} If setup fails
 */
export const enable2FA = async () => {
  try {
    const response = await apiClient.post('/v1/auth/enable-2fa/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Disable two-factor authentication for current user
 * 
 * @param {string} code - Current 2FA code to confirm disable
 * @returns {Promise<Object>} Confirmation message
 * @throws {Error} If disable fails
 */
export const disable2FA = async (code) => {
  try {
    const response = await apiClient.post('/v1/auth/disable-2fa/', { code });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get current authenticated user profile
 * 
 * @returns {Promise<Object>} User profile data
 * @throws {Error} If request fails
 */
export const getUserProfile = async () => {
  try {
    const response = await apiClient.get('/v1/auth/me/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update current user profile
 * 
 * @param {Object} profileData - Profile fields to update
 * @param {string} profileData.first_name - First name
 * @param {string} profileData.last_name - Last name
 * @param {string} profileData.email - Email address
 * @returns {Promise<Object>} Updated user profile
 * @throws {Error} If update fails
 */
export const updateUserProfile = async (profileData) => {
  try {
    const response = await apiClient.patch('/v1/auth/me/', profileData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Change user password
 * 
 * @param {Object} passwordData - Password change data
 * @param {string} passwordData.old_password - Current password
 * @param {string} passwordData.new_password - New password
 * @param {string} passwordData.new_password2 - New password confirmation
 * @returns {Promise<Object>} Success message
 * @throws {Error} If password change fails
 */
export const changePassword = async (passwordData) => {
  try {
    const response = await apiClient.post('/v1/auth/change-password/', passwordData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Request password reset email
 * 
 * @param {string} email - Email address for password reset
 * @returns {Promise<Object>} Confirmation message
 * @throws {Error} If request fails
 */
export const requestPasswordReset = async (email) => {
  try {
    const response = await apiClient.post('/v1/auth/password-reset/', { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Confirm password reset with token
 * 
 * @param {Object} resetData - Reset confirmation data
 * @param {string} resetData.token - Reset token from email
 * @param {string} resetData.password - New password
 * @param {string} resetData.password2 - Password confirmation
 * @returns {Promise<Object>} Success message
 * @throws {Error} If reset fails
 */
export const confirmPasswordReset = async (resetData) => {
  try {
    const response = await apiClient.post('/v1/auth/password-reset-confirm/', resetData);
    return response.data;
  } catch (error) {
    throw error;
  }
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
