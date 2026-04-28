/**
 * API Adapter - Real API Only
 *
 * This adapter keeps a stable import surface for the app while delegating
 * all operations to concrete API modules.
 */

import * as realAuthAPI from './auth.api';
import * as realDocsAPI from './documents.api';
import * as realTicketsAPI from './tickets.api';
import * as realUsersAPI from './users.api';
import * as realLogsAPI from './logs.api';
import * as realProfileAPI from './profile.api';
import { isAuthenticated as isRealAuthenticated } from './client';

export const PROFILE_PHOTO_ENABLED = realProfileAPI.PROFILE_PHOTO_ENABLED;

export const initializeApp = () => {
  // Intentionally empty: backend-only mode requires no local mock bootstrap.
};

// ============================================================================
// AUTHENTICATION ADAPTER
// ============================================================================

/**
 * Login user with credentials
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<Object>} User session data
 */
export const login = async (username, password) => {
  return await realAuthAPI.login(username, password);
};

/**
 * Verify 2FA code
 * @param {string} code - 6-digit code
 * @returns {Promise<Object>} Verification result
 */
export const verify2FA = async (code) => {
  return await realAuthAPI.verify2FA(code);
};

/**
 * Logout current user
 * @returns {Promise<void>}
 */
export const logout = async () => {
  return await realAuthAPI.logout();
};

/**
 * Get current user session/profile
 * @returns {Promise<Object>} User data
 */
export const getCurrentUser = async () => {
  return await realAuthAPI.getUserProfile();
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return isRealAuthenticated();
};

/**
 * Check if user has required role
 * @param {string} requiredRole 
 * @returns {boolean}
 */
export const hasRole = (requiredRole) => {
  const rawUser = localStorage.getItem(import.meta.env.VITE_USER_STORAGE_KEY || 'parity_current_user');
  if (!rawUser) return false;

  const roleOrder = { admin: 3, staff: 2, public: 1 };

  try {
    const user = JSON.parse(rawUser);
    const role = String(user?.role || '').toLowerCase();
    return (roleOrder[role] || 0) >= (roleOrder[String(requiredRole || '').toLowerCase()] || 0);
  } catch {
    return false;
  }
};

/**
 * Change user password
 * @param {Object} passwordData 
 * @returns {Promise<Object>}
 */
export const changePassword = async (passwordData) => {
  return await realAuthAPI.changePassword(passwordData);
};

/**
 * Update current user profile
 * @param {Object} profileData
 * @returns {Promise<Object>}
 */
export const updateProfile = async (profileData) => {
  return await realAuthAPI.updateUserProfile(profileData);
};

/**
 * Upload profile photo (if enabled)
 * @param {File} file
 * @returns {Promise<Object>}
 */
export const uploadProfilePhoto = async (file) => {
  if (!PROFILE_PHOTO_ENABLED) {
    throw new Error('Profile photo upload is disabled. Set VITE_PROFILE_PHOTO_ENABLED=true to enable.');
  }
  return await realProfileAPI.uploadProfilePhoto(file);
};

/**
 * Remove profile photo (if enabled)
 * @returns {Promise<Object>}
 */
export const removeProfilePhoto = async () => {
  if (!PROFILE_PHOTO_ENABLED) {
    throw new Error('Profile photo removal is disabled. Set VITE_PROFILE_PHOTO_ENABLED=true to enable.');
  }
  return await realProfileAPI.removeProfilePhoto();
};

// ============================================================================
// DOCUMENTS ADAPTER
// ============================================================================

/**
 * Get all documents with optional filters
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Documents data
 */
export const getDocuments = async (params = {}) => {
  return await realDocsAPI.getDocuments(params);
};

/**
 * Get single document by ID
 * @param {string} documentId 
 * @returns {Promise<Object>}
 */
export const getDocumentById = async (documentId) => {
  return await realDocsAPI.getDocumentById(documentId);
};

/**
 * Upload a document
 * @param {Object} uploadData - File and metadata
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>}
 */
export const uploadDocument = async (uploadData, onProgress = null) => {
  return await realDocsAPI.uploadDocument(uploadData, onProgress);
};

// Backward compatibility alias
export const createDocument = uploadDocument;

/**
 * Verify document integrity
 * @param {File} file 
 * @returns {Promise<Object>}
 */
export const verifyDocument = async (file) => {
  return await realDocsAPI.verifyDocument(file);
};

/**
 * Update document metadata
 * @param {string} documentId 
 * @param {Object} updateData 
 * @returns {Promise<Object>}
 */
export const updateDocument = async (documentId, updateData) => {
  return await realDocsAPI.updateDocument(documentId, updateData);
};

/**
 * Delete document
 * @param {string} documentId 
 * @returns {Promise<void>}
 */
export const deleteDocument = async (documentId) => {
  return await realDocsAPI.deleteDocument(documentId);
};

// ============================================================================
// AUDIT LOGS (WRITE)
// ============================================================================

/**
 * Create audit log entry
 * @param {Object} logEntry { action, resource_type, resource_id, details, metadata }
 * @returns {Promise<Object>}
 */
export const createAuditLog = async (logEntry) => {
  return await realLogsAPI.createAuditLog(logEntry);
};

// ============================================================================
// TICKETS ADAPTER
// ============================================================================

/**
 * Get all tickets with optional filters
 * @param {Object} params 
 * @returns {Promise<Object>}
 */
export const getTickets = async (params = {}) => {
  return await realTicketsAPI.getTickets(params);
};

/**
 * Get single ticket by ID
 * @param {string} ticketId 
 * @returns {Promise<Object>}
 */
export const getTicketById = async (ticketId) => {
  return await realTicketsAPI.getTicketById(ticketId);
};

/**
 * Create a new ticket
 * @param {Object} ticketData 
 * @returns {Promise<Object>}
 */
export const createTicket = async (ticketData) => {
  return await realTicketsAPI.createTicket(ticketData);
};

/**
 * Update ticket
 * @param {string} ticketId 
 * @param {Object} updateData 
 * @returns {Promise<Object>}
 */
export const updateTicket = async (ticketId, updateData) => {
  return await realTicketsAPI.updateTicket(ticketId, updateData);
};

/**
 * Delete ticket
 * @param {string} ticketId
 * @returns {Promise<void>}
 */
export const deleteTicket = async (ticketId) => {
  return await realTicketsAPI.deleteTicket(ticketId);
};

/**
 * Add comment to ticket
 * @param {string} ticketId 
 * @param {string} comment 
 * @returns {Promise<Object>}
 */
export const addTicketComment = async (ticketId, comment) => {
  return await realTicketsAPI.addTicketComment(ticketId, comment);
};

// ============================================================================
// USERS ADAPTER
// ============================================================================

/**
 * Get all users with optional filters
 * @param {Object} params 
 * @returns {Promise<Object>}
 */
export const getUsers = async (params = {}) => {
  return await realUsersAPI.getUsers(params);
};

/**
 * Get user by ID
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
export const getUserById = async (userId) => {
  return await realUsersAPI.getUserById(userId);
};

/**
 * Create new user
 * @param {Object} userData 
 * @returns {Promise<Object>}
 */
export const createUser = async (userData) => {
  return await realUsersAPI.createUser(userData);
};

/**
 * Update user
 * @param {string} userId 
 * @param {Object} updateData 
 * @returns {Promise<Object>}
 */
export const updateUser = async (userId, updateData) => {
  return await realUsersAPI.updateUser(userId, updateData);
};

/**
 * Delete user
 * @param {string} userId
 * @returns {Promise<void>}
 */
export const deleteUser = async (userId) => {
  return await realUsersAPI.deleteUser(userId);
};

// ============================================================================
// AUDIT LOGS ADAPTER
// ============================================================================

/**
 * Get audit logs with optional filters
 * @param {Object} params 
 * @returns {Promise<Object>}
 */
export const getAuditLogs = async (params = {}) => {
  return await realLogsAPI.getAuditLogs(params);
};

/**
 * Get user activity logs
 * @param {string} userId 
 * @param {Object} params 
 * @returns {Promise<Object>}
 */
export const getUserActivityLogs = async (userId, params = {}) => {
  return await realLogsAPI.getUserAuditLogs(userId, params);
};

/**
 * Get logs (alias for getAuditLogs for compatibility)
 * @param {Object} params 
 * @returns {Promise<Object>}
 */
export const getLogs = async (params = {}) => {
  return await getAuditLogs(params);
};

// ============================================================================
// SECURITY KEYS ADAPTER
// ============================================================================

/**
 * Get all security keys.
 * @param {Object} params
 * @returns {Promise<Object|Array>} Keys list.
 */
export const getKeys = async (params = {}) => {
  return await realLogsAPI.getKeys(params);
};

/**
 * Create a new security key.
 * @param {Object} keyData
 * @returns {Promise<Object>} Created key.
 */
export const createKey = async (keyData) => {
  return await realLogsAPI.createKey(keyData);
};

/**
 * Update an existing security key.
 * @param {string|number} keyId
 * @param {Object} updateData
 * @returns {Promise<Object>}
 */
export const updateKey = async (keyId, updateData) => {
  return await realLogsAPI.updateKey(keyId, updateData);
};

/**
 * Delete a security key by id.
 * @param {string} keyId
 * @returns {Promise<Object|void>} Result of deletion.
 */
export const deleteKey = async (keyId) => {
  return await realLogsAPI.deleteKey(keyId);
};

// ============================================================================
// EXPORT ALL ADAPTERS
// ============================================================================

export default {
  initializeApp,
  
  // Auth
  login,
  verify2FA,
  logout,
  getCurrentUser,
  isAuthenticated,
  hasRole,
  changePassword,
  updateProfile,
  uploadProfilePhoto,
  removeProfilePhoto,
  
  // Documents
  getDocuments,
  getDocumentById,
  uploadDocument,
  verifyDocument,
  updateDocument,
  deleteDocument,
  
  // Tickets
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  addTicketComment,
  
  // Users
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  
  // Logs
  getAuditLogs,
  getUserActivityLogs,
  getLogs,
  getKeys,
  createKey,
  updateKey,
  deleteKey,
};
