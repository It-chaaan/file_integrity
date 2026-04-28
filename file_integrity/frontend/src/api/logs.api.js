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
import { createDownloadConfig, mergeQueryParams } from './utils/axiosConfig';
import { withErrorContext } from './utils/errorContext';

/**
 * Get paginated list of audit logs with optional filters (supports both page_size and pageSize keys).
 *
 * @param {Object} params
 * @param {number} [params.page=1] - Page number.
 * @param {number} [params.page_size] - Legacy page size key.
 * @param {number} [params.pageSize] - Page size (preferred key).
 * @param {string} [params.search] - Search query.
 * @param {string} [params.action] - Filter by action type.
 * @param {string} [params.user_id] - Filter by user ID.
 * @param {string} [params.resource_type] - Filter by resource type.
 * @param {string} [params.date_from] - From date (YYYY-MM-DD).
 * @param {string} [params.date_to] - To date (YYYY-MM-DD).
 * @param {string} [params.severity] - Severity filter (info|warning|error|critical).
 * @param {string} [params.ordering='-timestamp'] - Sort field.
 * @returns {Promise<Object>} Paginated audit logs.
 */
export const getAuditLogs = async (params = {}) => {
  const { page, page_size: pageSizeLegacy, pageSize, ordering, search, ...filters } = params;
  const pageSizeValue = pageSize || pageSizeLegacy;

  const queryParams = mergeQueryParams({
    pagination: { page, pageSize: pageSizeValue, ordering },
    filters,
    search,
  });

  const response = await withErrorContext(
    () => apiClient.get('/v1/audit-logs/', { params: queryParams }),
    'auditLogs.list',
    { resource: 'auditLogs', action: 'list' }
  );

  return response.data;
};

/**
 * Get single audit log entry by ID
 * 
 * @param {string|number} logId - Log entry ID
 * @returns {Promise<Object>} Audit log details
 * @throws {Error} If log not found or request fails
 */
export const getAuditLogById = async (logId) => {
  const response = await withErrorContext(
    () => apiClient.get(`/v1/audit-logs/${logId}/`),
    'auditLogs.detail',
    { resource: 'auditLog', action: 'fetch', resourceId: logId }
  );

  return response.data;
};

/**
 * Get audit logs for a specific user with pagination and filters.
 *
 * @param {string|number} userId - User ID.
 * @param {Object} params - Query params (page, page_size/pageSize, ordering, search, filters).
 * @returns {Promise<Object>} Paginated user activity logs.
 */
export const getUserAuditLogs = async (userId, params = {}) => {
  const { page, page_size: pageSizeLegacy, pageSize, ordering, search, ...filters } = params;
  const pageSizeValue = pageSize || pageSizeLegacy;

  const queryParams = mergeQueryParams({
    pagination: { page, pageSize: pageSizeValue, ordering },
    filters,
    search,
  });

  const response = await withErrorContext(
    () => apiClient.get(`/v1/audit-logs/user/${userId}/`, { params: queryParams }),
    'auditLogs.byUser',
    { resource: 'auditLogs', action: 'listByUser', resourceId: userId }
  );

  return response.data;
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
  const response = await withErrorContext(
    () => apiClient.get('/v1/audit-logs/by-action/', { params: { action: actionType, ...params } }),
    'auditLogs.byAction',
    { resource: 'auditLogs', action: 'listByAction', actionType }
  );

  return response.data;
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
  const response = await withErrorContext(
    () => apiClient.get(`/v1/audit-logs/resource/${resourceType}/${resourceId}/`, { params }),
    'auditLogs.byResource',
    { resource: resourceType, action: 'listByResource', resourceId }
  );

  return response.data;
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
  const response = await withErrorContext(
    () => apiClient.get('/v1/audit-logs/security/', { params }),
    'auditLogs.security',
    { resource: 'auditLogs', action: 'security' }
  );

  return response.data;
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
  const response = await withErrorContext(
    () => apiClient.get('/v1/audit-logs/failed-logins/', { params }),
    'auditLogs.failedLogins',
    { resource: 'auditLogs', action: 'failedLogins' }
  );

  return response.data;
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
  const response = await withErrorContext(
    () => apiClient.get('/v1/audit-logs/stats/', { params }),
    'auditLogs.stats',
    { resource: 'auditLogs', action: 'stats' }
  );

  return response.data;
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
  const response = await withErrorContext(
    () => apiClient.get('/v1/audit-logs/timeline/', { params }),
    'auditLogs.timeline',
    { resource: 'auditLogs', action: 'timeline' }
  );

  return response.data;
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
  const downloadConfig = createDownloadConfig();

  const response = await withErrorContext(
    () => apiClient.get('/v1/audit-logs/export/', {
      params: { format, ...filters },
      ...downloadConfig,
    }),
    'auditLogs.export',
    { resource: 'auditLogs', action: 'export', format }
  );

  return response.data;
};

/**
 * Create a new audit log entry
 * @param {Object} logEntry - { action, resource_type, resource_id, details, metadata }
 * @returns {Promise<Object>} Created log record
 */
export const createAuditLog = async (logEntry) => {
  const response = await withErrorContext(
    () => apiClient.post('/v1/audit-logs/', logEntry),
    'auditLogs.create',
    { resource: 'auditLog', action: 'create' }
  );

  return response.data;
};

/**
 * Get available action types
 * Returns list of all action types that can be logged
 * 
 * @returns {Promise<Array>} Array of action types
 * @throws {Error} If request fails
 */
export const getActionTypes = async () => {
  const response = await withErrorContext(
    () => apiClient.get('/v1/audit-logs/action-types/'),
    'auditLogs.actionTypes',
    { resource: 'auditLogs', action: 'actionTypes' }
  );

  return response.data;
};

/**
 * Get available resource types
 * Returns list of all resource types that are tracked
 * 
 * @returns {Promise<Array>} Array of resource types
 * @throws {Error} If request fails
 */
export const getResourceTypes = async () => {
  const response = await withErrorContext(
    () => apiClient.get('/v1/audit-logs/resource-types/'),
    'auditLogs.resourceTypes',
    { resource: 'auditLogs', action: 'resourceTypes' }
  );

  return response.data;
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
  const response = await withErrorContext(
    () => apiClient.get('/v1/audit-logs/search/', { params: { q: query, ...params } }),
    'auditLogs.search',
    { resource: 'auditLogs', action: 'search' }
  );

  return response.data;
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
  const response = await withErrorContext(
    () => apiClient.get('/v1/audit-logs/recent/', { params: { limit } }),
    'auditLogs.recent',
    { resource: 'auditLogs', action: 'recent', limit }
  );

  return response.data;
};

// ---------------------------------------------------------------------------
// Security keys (optional backend support)
// ---------------------------------------------------------------------------

/**
 * Get security keys (placeholder implementation until backend is available).
 * Returns empty results to keep UI stable when no endpoint exists.
 */
export const getKeys = async (params = {}) => {
  const { page, page_size: pageSizeLegacy, pageSize, ordering, search, ...filters } = params;
  const pageSizeValue = pageSize || pageSizeLegacy;

  const queryParams = mergeQueryParams({
    pagination: { page, pageSize: pageSizeValue, ordering },
    filters,
    search,
  });

  const response = await withErrorContext(
    () => apiClient.get('/v1/security-keys/', { params: queryParams }),
    'securityKeys.list',
    { resource: 'securityKeys', action: 'list' }
  );

  return response.data;
};

/**
 * Create security key (placeholder).
 */
export const createKey = async (keyData) => {
  const response = await withErrorContext(
    () => apiClient.post('/v1/security-keys/', keyData),
    'securityKeys.create',
    { resource: 'securityKey', action: 'create' }
  );

  return response.data;
};

/**
 * Update security key metadata/status.
 */
export const updateKey = async (keyId, updateData) => {
  const response = await withErrorContext(
    () => apiClient.patch(`/v1/security-keys/${keyId}/`, updateData),
    'securityKeys.update',
    { resource: 'securityKey', action: 'update', resourceId: keyId }
  );

  return response.data;
};

/**
 * Delete security key (placeholder).
 */
export const deleteKey = async (keyId) => {
  const response = await withErrorContext(
    () => apiClient.delete(`/v1/security-keys/${keyId}/`),
    'securityKeys.delete',
    { resource: 'securityKey', action: 'delete', resourceId: keyId }
  );

  return response.data;
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
  getKeys,
  createKey,
  updateKey,
  deleteKey,
};
