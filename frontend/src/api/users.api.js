/**
 * Users API Module
 * 
 * This module handles all user management API calls to the Django REST Framework backend.
 * Manages user CRUD operations, role assignments, permissions, and user statistics.
 * Typically used by admin users for managing system users.
 * 
 * Endpoints managed:
 * - Get users list with filtering
 * - Get single user details
 * - Create new users (admin only)
 * - Update user information
 * - Delete/deactivate users
 * - Manage user roles and permissions
 * - Get user activity logs
 * - User statistics
 */

import apiClient from './client';

/**
 * Get paginated list of users with optional filters
 * Admin/staff only endpoint
 * 
 * @param {Object} params - Query parameters for filtering and pagination
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.page_size - Items per page (default: 10)
 * @param {string} params.search - Search by username, email, or name
 * @param {string} params.role - Filter by role (admin, staff, user)
 * @param {boolean} params.is_active - Filter by active status
 * @param {boolean} params.is_verified - Filter by verification status
 * @param {string} params.ordering - Sort field (e.g., '-date_joined')
 * @returns {Promise<Object>} Paginated users list
 * @throws {Error} If request fails
 */
export const getUsers = async (params = {}) => {
  try {
    const response = await apiClient.get('/v1/users/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get single user by ID
 * 
 * @param {string|number} userId - User ID
 * @returns {Promise<Object>} User details
 * @throws {Error} If user not found or request fails
 */
export const getUserById = async (userId) => {
  try {
    const response = await apiClient.get(`/v1/users/${userId}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new user account
 * Admin only action
 * 
 * @param {Object} userData - User creation data
 * @param {string} userData.username - Username (unique)
 * @param {string} userData.email - Email address (unique)
 * @param {string} userData.password - Password
 * @param {string} userData.first_name - First name
 * @param {string} userData.last_name - Last name
 * @param {string} userData.role - User role (admin, staff, user)
 * @param {boolean} userData.is_active - Active status (default: true)
 * @returns {Promise<Object>} Created user data
 * @throws {Error} If creation fails
 */
export const createUser = async (userData) => {
  try {
    const response = await apiClient.post('/v1/users/', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update user information
 * Can update profile, role, and status
 * 
 * @param {string|number} userId - User ID
 * @param {Object} updateData - Fields to update
 * @param {string} updateData.first_name - First name
 * @param {string} updateData.last_name - Last name
 * @param {string} updateData.email - Email address
 * @param {string} updateData.role - User role
 * @param {boolean} updateData.is_active - Active status
 * @returns {Promise<Object>} Updated user data
 * @throws {Error} If update fails
 */
export const updateUser = async (userId, updateData) => {
  try {
    const response = await apiClient.patch(`/v1/users/${userId}/`, updateData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a user account
 * Permanently removes user from system
 * Admin only action
 * 
 * @param {string|number} userId - User ID to delete
 * @returns {Promise<void>} No content on success
 * @throws {Error} If deletion fails
 */
export const deleteUser = async (userId) => {
  try {
    const response = await apiClient.delete(`/v1/users/${userId}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Deactivate a user account
 * Sets is_active to false without deleting
 * 
 * @param {string|number} userId - User ID
 * @returns {Promise<Object>} Updated user data
 * @throws {Error} If deactivation fails
 */
export const deactivateUser = async (userId) => {
  try {
    const response = await apiClient.post(`/v1/users/${userId}/deactivate/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Activate a previously deactivated user account
 * 
 * @param {string|number} userId - User ID
 * @returns {Promise<Object>} Updated user data
 * @throws {Error} If activation fails
 */
export const activateUser = async (userId) => {
  try {
    const response = await apiClient.post(`/v1/users/${userId}/activate/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update user role
 * Changes user's role (admin, staff, user)
 * 
 * @param {string|number} userId - User ID
 * @param {string} role - New role (admin, staff, user)
 * @returns {Promise<Object>} Updated user data
 * @throws {Error} If role update fails
 */
export const updateUserRole = async (userId, role) => {
  try {
    const response = await apiClient.patch(`/v1/users/${userId}/role/`, { role });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Reset user password (admin action)
 * Generates and sends new password to user's email
 * 
 * @param {string|number} userId - User ID
 * @returns {Promise<Object>} Success message
 * @throws {Error} If reset fails
 */
export const resetUserPassword = async (userId) => {
  try {
    const response = await apiClient.post(`/v1/users/${userId}/reset-password/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get user activity logs
 * Returns recent activity for a specific user
 * 
 * @param {string|number} userId - User ID
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Number of logs per page
 * @returns {Promise<Object>} Paginated activity logs
 * @throws {Error} If request fails
 */
export const getUserActivityLogs = async (userId, params = {}) => {
  try {
    const response = await apiClient.get(`/v1/users/${userId}/activity/`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get user statistics
 * Returns summary statistics about users in the system
 * 
 * @returns {Promise<Object>} User statistics (total, active, by role, etc.)
 * @throws {Error} If request fails
 */
export const getUserStats = async () => {
  try {
    const response = await apiClient.get('/v1/users/stats/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Search users by query
 * Searches across username, email, first name, and last name
 * 
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of matching users
 * @throws {Error} If search fails
 */
export const searchUsers = async (query) => {
  try {
    const response = await apiClient.get('/v1/users/search/', {
      params: { q: query },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get available user roles
 * Returns list of role options
 * 
 * @returns {Promise<Array>} Array of role objects
 * @throws {Error} If request fails
 */
export const getUserRoles = async () => {
  try {
    const response = await apiClient.get('/v1/users/roles/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Bulk update users
 * Update multiple users at once (e.g., activate/deactivate, change role)
 * 
 * @param {Array<number>} userIds - Array of user IDs
 * @param {Object} updateData - Data to update for all users
 * @returns {Promise<Object>} Bulk update result
 * @throws {Error} If bulk update fails
 */
export const bulkUpdateUsers = async (userIds, updateData) => {
  try {
    const response = await apiClient.post('/v1/users/bulk-update/', {
      user_ids: userIds,
      update_data: updateData,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Export users data
 * Returns CSV/Excel file with user data
 * 
 * @param {string} format - Export format ('csv' or 'excel')
 * @param {Object} filters - Optional filters to apply
 * @returns {Promise<Blob>} File blob
 * @throws {Error} If export fails
 */
export const exportUsers = async (format = 'csv', filters = {}) => {
  try {
    const response = await apiClient.get('/v1/users/export/', {
      params: { format, ...filters },
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Export all user functions as a grouped object for convenience
export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  deactivateUser,
  activateUser,
  updateUserRole,
  resetUserPassword,
  getUserActivityLogs,
  getUserStats,
  searchUsers,
  getUserRoles,
  bulkUpdateUsers,
  exportUsers,
};
