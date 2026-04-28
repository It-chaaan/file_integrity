/**
 * API Module Entry Point
 * 
 * This file serves as the main entry point for all API modules.
 * It exports all API functions and the configured API client for use throughout the application.
 * 
 * Usage:
 * - Import specific API modules: import { authAPI, documentsAPI } from '@/api';
 * - Import specific functions: import { login, uploadDocument } from '@/api';
 * - Import API client: import { apiClient } from '@/api';
 * 
 * Organization:
 * - All API modules are grouped by feature/resource
 * - Individual functions are also re-exported for convenience
 * - Helper utilities are exported from client.js
 */

// Import API client and utilities
import apiClient, {
  setAuthTokens,
  clearAuthTokens,
  getAccessToken,
  isAuthenticated,
} from './client';

// Import all API modules
import authAPI from './auth.api';
import documentsAPI from './documents.api';
import ticketsAPI from './tickets.api';
import usersAPI from './users.api';
import logsAPI from './logs.api';
import profileAPI from './profile.api';

// Export API client and utilities
export {
  apiClient,
  setAuthTokens,
  clearAuthTokens,
  getAccessToken,
  isAuthenticated,
};

// Export all API modules as grouped objects
export {
  authAPI,
  documentsAPI,
  ticketsAPI,
  usersAPI,
  logsAPI,
  profileAPI,
};

// Export individual authentication functions
export {
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
} from './auth.api';

// Export individual profile functions
export {
  uploadProfilePhoto,
  removeProfilePhoto,
  PROFILE_PHOTO_ENABLED,
} from './profile.api';

// Export individual document functions
export {
  getDocuments,
  getDocumentById,
  uploadDocument,
  verifyDocument,
  updateDocument,
  deleteDocument,
  downloadDocument,
  getDocumentVerifications,
  searchDocumentByHash,
  batchVerifyDocuments,
  getDocumentStats,
  getDocumentTypes,
} from './documents.api';

// Export individual ticket functions
export {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  updateTicketStatus,
  assignTicket,
  addTicketComment,
  getTicketComments,
  closeTicket,
  reopenTicket,
  getTicketStats,
  getTicketCategories,
  searchTickets,
} from './tickets.api';

// Export individual user functions
export {
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
} from './users.api';

// Export individual audit log functions
export {
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
} from './logs.api';

/**
 * Default export containing all API modules
 * Use this for importing everything at once if needed
 */
export default {
  client: apiClient,
  auth: authAPI,
  documents: documentsAPI,
  tickets: ticketsAPI,
  users: usersAPI,
  logs: logsAPI,
  profile: profileAPI,
  utils: {
    setAuthTokens,
    clearAuthTokens,
    getAccessToken,
    isAuthenticated,
  },
};
