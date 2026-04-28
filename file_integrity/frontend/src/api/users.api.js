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
import { createDownloadConfig, mergeQueryParams } from './utils/axiosConfig';
import { withErrorContext } from './utils/errorContext';

/**
 * Get paginated list of users with optional filters (supports page_size and pageSize).
 * Admin/staff only endpoint.
 *
 * @param {Object} params
 * @param {number} [params.page=1] - Page number.
 * @param {number} [params.page_size] - Legacy page size key.
 * @param {number} [params.pageSize] - Page size (preferred key).
 * @param {string} [params.search] - Search by username/email/name.
 * @param {string} [params.role] - Role filter (admin|staff|user).
 * @param {boolean} [params.is_active] - Active status filter.
 * @param {boolean} [params.is_verified] - Verification status filter.
 * @param {string} [params.ordering='-date_joined'] - Sort field.
 * @returns {Promise<Object>} Paginated users list.
 */
export const getUsers = async (params = {}) => {
  const { page, page_size: pageSizeLegacy, pageSize, ordering, search, ...filters } = params;
  const pageSizeValue = pageSize || pageSizeLegacy;

  const queryParams = mergeQueryParams({
    pagination: { page, pageSize: pageSizeValue, ordering },
    filters,
    search,
  });

  const response = await withErrorContext(
    () => apiClient.get('/v1/users/', { params: queryParams }),
    'users.list',
    { resource: 'users', action: 'list' }
  );

  return response.data;
};

/**
 * Get single user by ID
 * 
 * @param {string|number} userId - User ID
 * @returns {Promise<Object>} User details
 * @throws {Error} If user not found or request fails
 */
export const getUserById = async (userId) => {
  const response = await withErrorContext(
    () => apiClient.get(`/v1/users/${userId}/`),
    'users.detail',
    { resource: 'user', action: 'fetch', resourceId: userId }
  );

  return response.data;
};

/**
 * Create a new user account (admin only).
 * @param {Object} userData
 * @param {string} userData.username
 * @param {string} userData.email
 * @param {string} userData.password
 * @param {string} userData.first_name
 * @param {string} userData.last_name
 * @param {string} userData.role - admin|staff|user
 * @param {boolean} [userData.is_active]
 * @returns {Promise<Object>} Created user data.
 */
export const createUser = async (userData) => {
  const response = await withErrorContext(
    () => apiClient.post('/v1/users/', userData),
    'users.create',
    { resource: 'user', action: 'create' }
  );

  return response.data;
};

/**
 * Update user information (profile, role, status).
 * @param {string|number} userId - User ID.
 * @param {Object} updateData - Fields to update.
 * @returns {Promise<Object>} Updated user data.
 */
export const updateUser = async (userId, updateData) => {
  const response = await withErrorContext(
    () => apiClient.patch(`/v1/users/${userId}/`, updateData),
    'users.update',
    { resource: 'user', action: 'update', resourceId: userId }
  );

  return response.data;
};

/**
 * Delete a user account (admin only).
 * @param {string|number} userId - User ID to delete.
 * @returns {Promise<void>} No content on success.
 */
export const deleteUser = async (userId) => {
  const response = await withErrorContext(
    () => apiClient.delete(`/v1/users/${userId}/`),
    'users.delete',
    { resource: 'user', action: 'delete', resourceId: userId }
  );

  return response.data;
};

/**
 * Deactivate a user account (sets is_active=false without deleting).
 * @param {string|number} userId - User ID.
 * @returns {Promise<Object>} Updated user data.
 */
export const deactivateUser = async (userId) => {
  const response = await withErrorContext(
    () => apiClient.post(`/v1/users/${userId}/deactivate/`),
    'users.deactivate',
    { resource: 'user', action: 'deactivate', resourceId: userId }
  );

  return response.data;
};

/**
 * Activate a previously deactivated user account.
 * @param {string|number} userId - User ID.
 * @returns {Promise<Object>} Updated user data.
 */
export const activateUser = async (userId) => {
  const response = await withErrorContext(
    () => apiClient.post(`/v1/users/${userId}/activate/`),
    'users.activate',
    { resource: 'user', action: 'activate', resourceId: userId }
  );

  return response.data;
};

/**
 * Update user role.
 * @param {string|number} userId - User ID.
 * @param {string} role - New role (admin|staff|user).
 * @returns {Promise<Object>} Updated user data.
 */
export const updateUserRole = async (userId, role) => {
  const response = await withErrorContext(
    () => apiClient.patch(`/v1/users/${userId}/role/`, { role }),
    'users.updateRole',
    { resource: 'user', action: 'updateRole', resourceId: userId, role }
  );

  return response.data;
};

/**
 * Reset user password (admin action).
 * @param {string|number} userId - User ID.
 * @returns {Promise<Object>} Success message.
 */
export const resetUserPassword = async (userId) => {
  const response = await withErrorContext(
    () => apiClient.post(`/v1/users/${userId}/reset-password/`),
    'users.resetPassword',
    { resource: 'user', action: 'resetPassword', resourceId: userId }
  );

  return response.data;
};

/**
 * Get user activity logs (supports pagination and filters).
 * @param {string|number} userId - User ID.
 * @param {Object} params - Query parameters (page, pageSize/page_size, ordering, search, filters).
 * @returns {Promise<Object>} Paginated activity logs.
 */
export const getUserActivityLogs = async (userId, params = {}) => {
  const { page, page_size: pageSizeLegacy, pageSize, ordering, search, ...filters } = params;
  const pageSizeValue = pageSize || pageSizeLegacy;

  const queryParams = mergeQueryParams({
    pagination: { page, pageSize: pageSizeValue, ordering },
    filters,
    search,
  });

  const response = await withErrorContext(
    () => apiClient.get(`/v1/users/${userId}/activity/`, { params: queryParams }),
    'users.activity',
    { resource: 'user', action: 'activity', resourceId: userId }
  );

  return response.data;
};

/**
 * Get user statistics.
 * @returns {Promise<Object>} User statistics (total, active, by role, etc.).
 */
export const getUserStats = async () => {
  const response = await withErrorContext(
    () => apiClient.get('/v1/users/stats/'),
    'users.stats',
    { resource: 'users', action: 'stats' }
  );

  return response.data;
};

/**
 * Search users by query (username/email/first/last name).
 * @param {string} query - Search query.
 * @returns {Promise<Array>} Matching users.
 */
export const searchUsers = async (query) => {
  const response = await withErrorContext(
    () => apiClient.get('/v1/users/search/', { params: { q: query } }),
    'users.search',
    { resource: 'users', action: 'search' }
  );

  return response.data;
};

/**
 * Get available user roles.
 * @returns {Promise<Array>} Array of role objects.
 */
export const getUserRoles = async () => {
  const response = await withErrorContext(
    () => apiClient.get('/v1/users/roles/'),
    'users.roles',
    { resource: 'users', action: 'roles' }
  );

  return response.data;
};

/**
 * Bulk update users (e.g., activate/deactivate, change role).
 * @param {Array<number>} userIds - Array of user IDs.
 * @param {Object} updateData - Data to update for all users.
 * @returns {Promise<Object>} Bulk update result.
 */
export const bulkUpdateUsers = async (userIds, updateData) => {
  const response = await withErrorContext(
    () => apiClient.post('/v1/users/bulk-update/', {
      user_ids: userIds,
      update_data: updateData,
    }),
    'users.bulkUpdate',
    { resource: 'users', action: 'bulkUpdate', count: userIds?.length }
  );

  return response.data;
};

/**
 * Export users data (CSV/Excel).
 * @param {string} format - Export format ('csv' or 'excel').
 * @param {Object} filters - Optional filters to apply.
 * @returns {Promise<Blob>} File blob.
 */
export const exportUsers = async (format = 'csv', filters = {}) => {
  const downloadConfig = createDownloadConfig();

  const response = await withErrorContext(
    () => apiClient.get('/v1/users/export/', {
      params: { format, ...filters },
      ...downloadConfig,
    }),
    'users.export',
    { resource: 'users', action: 'export', format }
  );

  return response.data;
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
