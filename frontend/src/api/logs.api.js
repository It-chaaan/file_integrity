/**
 * Audit Logs API Module
 * 
 * This module handles all audit logging and activity tracking API calls.
 * Provides visibility into system actions, user activities, and security events.
 * 
 * Endpoints managed:
 * - Get audit logs with filtering
 * - Get single log entry details
 * - Get logs by user
 * - Get logs by action type
 * - Get security events
 * - Export audit logs
 * - Get audit statistics
 */

import apiClient from './client';

/**
 * Get paginated list of audit logs with optional filters
 * Admin/staff only endpoint
 * 
 * @param {Object} params - Query parameters for filtering and pagination
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.page_size - Items per page (default: 20)
 * @param {string} params.search - Search query
 * @param {string} params.action - Filter by action type (login, logout, create, update, delete, etc.)
 * @param {string} params.user_id - Filter by user ID
 * @param {string} params.resource_type - Filter by resource type (document, ticket, user, etc.)
 * @param {string} params.date_from - Filter from date (YYYY-MM-DD)
 * @param {string} params.date_to - Filter to date (YYYY-MM-DD)
 * @param {string} params.severity - Filter by severity (info, warning, error, critical)
 * @param {string} params.ordering - Sort field (default: '-timestamp')
 * @returns {Promise<Object>} Paginated audit logs
 * @throws {Error} If request fails
 */
export const getAuditLogs = async (params = {}) => {
  try {
    const response = await apiClient.get('/v1/audit-logs/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get single audit log entry by ID
 * 
 * @param {string|number} logId - Log entry ID
 * @returns {Promise<Object>} Audit log details
 * @throws {Error} If log not found or request fails
 */
export const getAuditLogById = async (logId) => {
  try {
    const response = await apiClient.get(`/v1/audit-logs/${logId}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get audit logs for a specific user
 * Returns all actions performed by the user
 * 
 * @param {string|number} userId - User ID
 * @param {Object} params - Additional query parameters
 * @param {number} params.page - Page number
 * @param {number} params.page_size - Items per page
 * @param {string} params.date_from - Filter from date
 * @param {string} params.date_to - Filter to date
 * @returns {Promise<Object>} Paginated user activity logs
 * @throws {Error} If request fails
 */
export const getUserAuditLogs = async (userId, params = {}) => {
  try {
    const response = await apiClient.get(`/v1/audit-logs/user/${userId}/`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get audit logs by action type
 * Filter logs by specific actions (login, create, update, delete, etc.)
 * 
 * @param {string} actionType - Action type to filter
 * @param {Object} params - Additional query parameters
 * @returns {Promise<Object>} Filtered audit logs
 * @throws {Error} If request fails
 */
export const getLogsByAction = async (actionType, params = {}) => {
  try {
    const response = await apiClient.get('/v1/audit-logs/by-action/', {
      params: { action: actionType, ...params },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get audit logs for a specific resource
 * Track all actions performed on a specific document, ticket, user, etc.
 * 
 * @param {string} resourceType - Type of resource (document, ticket, user, etc.)
 * @param {string|number} resourceId - Resource ID
 * @param {Object} params - Additional query parameters
 * @returns {Promise<Object>} Resource activity logs
 * @throws {Error} If request fails
 */
export const getResourceAuditLogs = async (resourceType, resourceId, params = {}) => {
  try {
    const response = await apiClient.get(
      `/v1/audit-logs/resource/${resourceType}/${resourceId}/`,
      { params }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get security-related audit logs
 * Returns logs for security events (failed logins, unauthorized access, etc.)
 * 
 * @param {Object} params - Query parameters
 * @param {string} params.severity - Filter by severity (warning, error, critical)
 * @param {string} params.date_from - Filter from date
 * @param {string} params.date_to - Filter to date
 * @returns {Promise<Object>} Security event logs
 * @throws {Error} If request fails
 */
export const getSecurityLogs = async (params = {}) => {
  try {
    const response = await apiClient.get('/v1/audit-logs/security/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get failed login attempts
 * Returns logs of failed authentication attempts
 * 
 * @param {Object} params - Query parameters
 * @param {number} params.hours - Look back hours (default: 24)
 * @param {string} params.username - Filter by username (optional)
 * @returns {Promise<Array>} Failed login attempts
 * @throws {Error} If request fails
 */
export const getFailedLogins = async (params = {}) => {
  try {
    const response = await apiClient.get('/v1/audit-logs/failed-logins/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get audit log statistics
 * Returns summary statistics about system activity
 * 
 * @param {Object} params - Query parameters
 * @param {string} params.date_from - Start date for statistics
 * @param {string} params.date_to - End date for statistics
 * @returns {Promise<Object>} Audit statistics
 * @throws {Error} If request fails
 */
export const getAuditStats = async (params = {}) => {
  try {
    const response = await apiClient.get('/v1/audit-logs/stats/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get activity timeline
 * Returns chronological activity for visualization
 * 
 * @param {Object} params - Query parameters
 * @param {string} params.date_from - Start date
 * @param {string} params.date_to - End date
 * @param {string} params.granularity - Time granularity (hour, day, week, month)
 * @returns {Promise<Array>} Timeline data
 * @throws {Error} If request fails
 */
export const getActivityTimeline = async (params = {}) => {
  try {
    const response = await apiClient.get('/v1/audit-logs/timeline/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Export audit logs to file
 * Returns CSV/Excel file with filtered audit logs
 * 
 * @param {string} format - Export format ('csv' or 'excel')
 * @param {Object} filters - Filters to apply to export
 * @param {string} filters.date_from - Start date
 * @param {string} filters.date_to - End date
 * @param {string} filters.action - Filter by action type
 * @param {string} filters.user_id - Filter by user
 * @returns {Promise<Blob>} File blob
 * @throws {Error} If export fails
 */
export const exportAuditLogs = async (format = 'csv', filters = {}) => {
  try {
    const response = await apiClient.get('/v1/audit-logs/export/', {
      params: { format, ...filters },
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get available action types
 * Returns list of all action types that can be logged
 * 
 * @returns {Promise<Array>} Array of action types
 * @throws {Error} If request fails
 */
export const getActionTypes = async () => {
  try {
    const response = await apiClient.get('/v1/audit-logs/action-types/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get available resource types
 * Returns list of all resource types that are tracked
 * 
 * @returns {Promise<Array>} Array of resource types
 * @throws {Error} If request fails
 */
export const getResourceTypes = async () => {
  try {
    const response = await apiClient.get('/v1/audit-logs/resource-types/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Search audit logs
 * Full-text search across audit log entries
 * 
 * @param {string} query - Search query
 * @param {Object} params - Additional filters
 * @returns {Promise<Array>} Matching audit logs
 * @throws {Error} If search fails
 */
export const searchAuditLogs = async (query, params = {}) => {
  try {
    const response = await apiClient.get('/v1/audit-logs/search/', {
      params: { q: query, ...params },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get recent activity
 * Returns most recent system activity (last N entries)
 * 
 * @param {number} limit - Number of recent entries (default: 10)
 * @returns {Promise<Array>} Recent audit logs
 * @throws {Error} If request fails
 */
export const getRecentActivity = async (limit = 10) => {
  try {
    const response = await apiClient.get('/v1/audit-logs/recent/', {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Export all audit log functions as a grouped object for convenience
export default {
  getAuditLogs,
  getAuditLogById,
  getUserAuditLogs,
  getLogsByAction,
  getResourceAuditLogs,
  getSecurityLogs,
  getFailedLogins,
  getAuditStats,
  getActivityTimeline,
  exportAuditLogs,
  getActionTypes,
  getResourceTypes,
  searchAuditLogs,
  getRecentActivity,
};
