/**
 * API Adapter - Dual Mode Support
 * 
 * This adapter provides seamless switching between:
 * - Mock services (for development/testing without backend)
 * - Real API (for production or backend integration)
 * 
 * Mode Selection:
 * Set VITE_USE_MOCK_API=true in .env to use mock services
 * Set VITE_USE_MOCK_API=false to use real backend API
 * 
 * Benefits:
 * - Develop frontend independently of backend
 * - Test UI with predictable mock data
 * - Easy switching for demos or testing
 * - Gradual migration path
 */

import { 
  mockLogin, 
  mockVerify2FA, 
  getCurrentSession as getMockSession,
  isAuthenticated as isMockAuthenticated,
  hasRole as hasMockRole,
  initializeMockUsers 
} from '../services/mockAuth';

import {
  mockDocumentService,
  mockUserService,
  mockTicketService,
  mockLogService,
  initializeMockData
} from '../services/mockStorage';

// Import real API functions
import * as realAuthAPI from './auth.api';
import * as realDocsAPI from './documents.api';
import * as realTicketsAPI from './tickets.api';
import * as realUsersAPI from './users.api';
import * as realLogsAPI from './logs.api';
import * as realProfileAPI from './profile.api';
import { isAuthenticated as isRealAuthenticated } from './client';

// Determine which mode to use from environment (default to mock unless explicitly disabled)
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false';
const PROFILE_PHOTO_ENABLED = import.meta.env.VITE_PROFILE_PHOTO_ENABLED === 'true';

// Export for consumers that branch on mode
export { USE_MOCK_API, PROFILE_PHOTO_ENABLED };
// Log current mode in development
if (import.meta.env.DEV) {
  console.log(`API Mode: ${USE_MOCK_API ? 'MOCK' : 'REAL'}`);
}

/**
 * Initialize data based on mode
 * Call this on app startup
 */
export const initializeApp = () => {
  if (USE_MOCK_API) {
    // Always reinitialize mock data to ensure fresh state
    initializeMockUsers();
    initializeMockData();
  }
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
  if (USE_MOCK_API) {
    return await mockLogin(username, password);
  }
  return await realAuthAPI.login(username, password);
};

/**
 * Verify 2FA code
 * @param {string} code - 6-digit code
 * @returns {Promise<Object>} Verification result
 */
export const verify2FA = async (code) => {
  if (USE_MOCK_API) {
    return await mockVerify2FA(code);
  }
  return await realAuthAPI.verify2FA(code);
};

/**
 * Logout current user
 * @returns {Promise<void>}
 */
export const logout = async () => {
  if (USE_MOCK_API) {
    localStorage.removeItem('parity_session');
    return;
  }
  return await realAuthAPI.logout();
};

/**
 * Get current user session/profile
 * @returns {Promise<Object>} User data
 */
export const getCurrentUser = async () => {
  if (USE_MOCK_API) {
    return getMockSession();
  }
  return await realAuthAPI.getUserProfile();
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  if (USE_MOCK_API) {
    return isMockAuthenticated();
  }
  return isRealAuthenticated();
};

/**
 * Check if user has required role
 * @param {string} requiredRole 
 * @returns {boolean}
 */
export const hasRole = (requiredRole) => {
  if (USE_MOCK_API) {
    return hasMockRole(requiredRole);
  }
  // Real API: Get user from profile and check role
  // This would need to be implemented based on your auth structure
  return true; // Placeholder
};

/**
 * Change user password
 * @param {Object} passwordData 
 * @returns {Promise<Object>}
 */
export const changePassword = async (passwordData) => {
  if (USE_MOCK_API) {
    // Mock implementation
    return { success: true, message: 'Password changed successfully' };
  }
  return await realAuthAPI.changePassword(passwordData);
};

/**
 * Update current user profile
 * @param {Object} profileData
 * @returns {Promise<Object>}
 */
export const updateProfile = async (profileData) => {
  if (USE_MOCK_API) {
    return { success: true, data: profileData };
  }
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

  if (USE_MOCK_API) {
    return { success: true, url: URL.createObjectURL(file) };
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

  if (USE_MOCK_API) {
    return { success: true };
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
  if (USE_MOCK_API) {
    const docs = await mockDocumentService.getAll();
    // Mock doesn't support pagination, return in expected format
    return {
      results: docs,
      count: docs.length,
      next: null,
      previous: null
    };
  }
  return await realDocsAPI.getDocuments(params);
};

/**
 * Get single document by ID
 * @param {string} documentId 
 * @returns {Promise<Object>}
 */
export const getDocumentById = async (documentId) => {
  if (USE_MOCK_API) {
    return await mockDocumentService.getById(documentId);
  }
  return await realDocsAPI.getDocumentById(documentId);
};

/**
 * Upload a document
 * @param {Object} uploadData - File and metadata
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>}
 */
export const uploadDocument = async (uploadData, onProgress = null) => {
  if (USE_MOCK_API) {
    // Simulate progress
    if (onProgress) {
      for (let i = 0; i <= 100; i += 10) {
        setTimeout(() => onProgress(i), i * 50);
      }
    }
    const syntheticHash = Math.random().toString(36).substring(2, 18);
    const syntheticDocument = {
      ...uploadData,
      id: uploadData.documentId || `DOC-${Date.now()}`,
      documentId: uploadData.documentId || `DOC-${Date.now()}`,
      uploadedBy: uploadData?.metadata?.uploaded_by || 'Mock User',
      uploadDate: new Date().toISOString().replace('T', ' ').split('.')[0],
      hash: uploadData.hash || syntheticHash,
      shortHash: syntheticHash.substring(0, 8),
      status: 'pending',
    };
    return await mockDocumentService.create(syntheticDocument);
  }
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
  if (USE_MOCK_API) {
    // Mock verification - generate hash and check
    const hash = Math.random().toString(36).substring(2);
    return await mockDocumentService.verifyHash(hash);
  }
  return await realDocsAPI.verifyDocument(file);
};

/**
 * Update document metadata
 * @param {string} documentId 
 * @param {Object} updateData 
 * @returns {Promise<Object>}
 */
export const updateDocument = async (documentId, updateData) => {
  if (USE_MOCK_API) {
    return await mockDocumentService.update(documentId, updateData);
  }
  return await realDocsAPI.updateDocument(documentId, updateData);
};

/**
 * Delete document
 * @param {string} documentId 
 * @returns {Promise<void>}
 */
export const deleteDocument = async (documentId) => {
  if (USE_MOCK_API) {
    return await mockDocumentService.delete(documentId);
  }
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
  if (USE_MOCK_API) {
    return await mockLogService.create(logEntry);
  }
  if (realLogsAPI.createAuditLog) {
    return await realLogsAPI.createAuditLog(logEntry);
  }
  // Fallback: no-op if backend not available
  return { success: false, skipped: true };
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
  if (USE_MOCK_API) {
    const tickets = await mockTicketService.getAll();
    return {
      results: tickets,
      count: tickets.length,
      next: null,
      previous: null
    };
  }
  return await realTicketsAPI.getTickets(params);
};

/**
 * Get single ticket by ID
 * @param {string} ticketId 
 * @returns {Promise<Object>}
 */
export const getTicketById = async (ticketId) => {
  if (USE_MOCK_API) {
    return await mockTicketService.getById(ticketId);
  }
  return await realTicketsAPI.getTicketById(ticketId);
};

/**
 * Create a new ticket
 * @param {Object} ticketData 
 * @returns {Promise<Object>}
 */
export const createTicket = async (ticketData) => {
  if (USE_MOCK_API) {
    return await mockTicketService.create(ticketData);
  }
  return await realTicketsAPI.createTicket(ticketData);
};

/**
 * Update ticket
 * @param {string} ticketId 
 * @param {Object} updateData 
 * @returns {Promise<Object>}
 */
export const updateTicket = async (ticketId, updateData) => {
  if (USE_MOCK_API) {
    return await mockTicketService.update(ticketId, updateData);
  }
  return await realTicketsAPI.updateTicket(ticketId, updateData);
};

/**
 * Delete ticket
 * @param {string} ticketId
 * @returns {Promise<void>}
 */
export const deleteTicket = async (ticketId) => {
  if (USE_MOCK_API) {
    return await mockTicketService.delete(ticketId);
  }
  return await realTicketsAPI.deleteTicket(ticketId);
};

/**
 * Add comment to ticket
 * @param {string} ticketId 
 * @param {string} comment 
 * @returns {Promise<Object>}
 */
export const addTicketComment = async (ticketId, comment) => {
  if (USE_MOCK_API) {
    // Mock doesn't have comment support, return success
    return { success: true };
  }
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
  if (USE_MOCK_API) {
    const users = await mockUserService.getAll();
    return {
      results: users,
      count: users.length,
      next: null,
      previous: null
    };
  }
  return await realUsersAPI.getUsers(params);
};

/**
 * Get user by ID
 * @param {string} userId 
 * @returns {Promise<Object>}
 */
export const getUserById = async (userId) => {
  if (USE_MOCK_API) {
    return await mockUserService.getById(userId);
  }
  return await realUsersAPI.getUserById(userId);
};

/**
 * Create new user
 * @param {Object} userData 
 * @returns {Promise<Object>}
 */
export const createUser = async (userData) => {
  if (USE_MOCK_API) {
    return await mockUserService.create(userData);
  }
  return await realUsersAPI.createUser(userData);
};

/**
 * Update user
 * @param {string} userId 
 * @param {Object} updateData 
 * @returns {Promise<Object>}
 */
export const updateUser = async (userId, updateData) => {
  if (USE_MOCK_API) {
    return await mockUserService.update(userId, updateData);
  }
  return await realUsersAPI.updateUser(userId, updateData);
};

/**
 * Delete user
 * @param {string} userId
 * @returns {Promise<void>}
 */
export const deleteUser = async (userId) => {
  if (USE_MOCK_API) {
    return await mockUserService.delete(userId);
  }
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
  if (USE_MOCK_API) {
    const logs = await mockLogService.getAll();
    return {
      results: logs,
      count: logs.length,
      next: null,
      previous: null
    };
  }
  return await realLogsAPI.getAuditLogs(params);
};

/**
 * Get user activity logs
 * @param {string} userId 
 * @param {Object} params 
 * @returns {Promise<Object>}
 */
export const getUserActivityLogs = async (userId, params = {}) => {
  if (USE_MOCK_API) {
    const logs = await mockLogService.getAll();
    const userLogs = logs.filter(log => log.userId === userId);
    return {
      results: userLogs,
      count: userLogs.length
    };
  }
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
// SECURITY KEYS ADAPTER (Mock-first; real API optional)
// ============================================================================

/**
 * Get all security keys (mock returns paginated shape; real API optional).
 * @param {Object} params
 * @returns {Promise<Object|Array>} Keys list.
 */
export const getKeys = async (params = {}) => {
  if (USE_MOCK_API) {
    const keys = await mockLogService.getKeys();
    return {
      results: keys,
      count: keys.length,
      next: null,
      previous: null,
    };
  }

  if (typeof realLogsAPI.getKeys === 'function') {
    return await realLogsAPI.getKeys(params);
  }

  return { results: [], count: 0, next: null, previous: null };
};

/**
 * Create a new security key.
 * @param {Object} keyData
 * @returns {Promise<Object>} Created key.
 */
export const createKey = async (keyData) => {
  if (USE_MOCK_API) {
    return await mockLogService.createKey(keyData);
  }

  if (typeof realLogsAPI.createKey === 'function') {
    return await realLogsAPI.createKey(keyData);
  }

  return { success: false, skipped: true };
};

/**
 * Delete a security key by id.
 * @param {string} keyId
 * @returns {Promise<Object|void>} Result of deletion.
 */
export const deleteKey = async (keyId) => {
  if (USE_MOCK_API) {
    return await mockLogService.deleteKey(keyId);
  }

  if (typeof realLogsAPI.deleteKey === 'function') {
    return await realLogsAPI.deleteKey(keyId);
  }

  return { success: false, skipped: true };
};

// ============================================================================
// EXPORT ALL ADAPTERS
// ============================================================================

export default {
  // Mode info
  USE_MOCK_API,
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
  deleteKey,
};
