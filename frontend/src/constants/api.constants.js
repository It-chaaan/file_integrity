/**
 * API Constants and Configuration
 * Centralized constants for API endpoints, status codes, roles, and configuration values
 * 
 * @version 1.0.0
 * @author Frontend Team
 * @lastUpdated 2026-01-22
 */

// ============================================
// BASE URLS
// ============================================

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api/v1';
export const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10);

export const buildApiPath = (path = '/') => {
  if (!path.startsWith('/')) {
    return `${API_PREFIX}/${path}`;
  }

  return `${API_PREFIX}${path}`;
};

// ============================================
// API ENDPOINTS
// ============================================

export const ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login/',
    LOGOUT: '/auth/logout/',
    VERIFY_TOKEN: '/auth/verify/',
    TWO_FACTOR_VERIFY: '/auth/verify-2fa/',
    REFRESH_TOKEN: '/auth/refresh/',
    REGISTER: '/auth/register/',
    ME: '/auth/me/',
    CHANGE_PASSWORD: '/auth/change-password/',
  },

  // User Management
  USERS: {
    BASE: '/users/',
    BY_ID: (id) => `/users/${id}/`,
    CREATE: '/users/',
    UPDATE: (id) => `/users/${id}/`,
    DELETE: (id) => `/users/${id}/`,
  },

  // Document Registry
  DOCUMENTS: {
    BASE: '/documents/',
    BY_ID: (id) => `/documents/${id}/`,
    UPLOAD: '/documents/',
    VERIFY: '/documents/verify/',
    DELETE: (id) => `/documents/${id}/`,
    DOWNLOAD: (id) => `/documents/${id}/download/`,
  },

  // Ticket System
  TICKETS: {
    BASE: '/tickets/',
    BY_ID: (id) => `/tickets/${id}/`,
    CREATE: '/tickets/',
    UPDATE: (id) => `/tickets/${id}/`,
    DELETE: (id) => `/tickets/${id}/`,
  },

  // Security/Keys Management
  SECURITY: {
    KEYS: '/security-keys/',
    KEY_BY_ID: (id) => `/security-keys/${id}/`,
    GENERATE_KEY: '/security-keys/',
    ROTATE_KEY: (id) => `/security-keys/${id}/rotate/`,
    REVOKE_KEY: (id) => `/security-keys/${id}/revoke/`,
  },

  // Audit Logs
  LOGS: {
    BASE: '/audit-logs/',
    BY_ID: (id) => `/audit-logs/${id}/`,
    EXPORT: '/audit-logs/export/',
  },

  // Dashboard Statistics
  DASHBOARD: {
    STATS: '/dashboard/stats',
    RECENT_ACTIVITY: '/dashboard/recent',
  },
};

// ============================================
// HTTP STATUS CODES
// ============================================

export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,

  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
};

// ============================================
// ERROR CODES
// ============================================

export const ERROR_CODES = {
  // Authentication Errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',

  // Validation Errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',

  // Resource Errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  OPERATION_FAILED: 'OPERATION_FAILED',

  // Server Errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
};

// ============================================
// USER ROLES
// ============================================

export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  STAFF: 'staff',
  VERIFIER: 'verifier',
  CLIENT: 'client',
};

export const ROLE_LABELS = {
  [USER_ROLES.SUPER_ADMIN]: 'Super Admin',
  [USER_ROLES.ADMIN]: 'Administrator',
  [USER_ROLES.STAFF]: 'Staff Member',
  [USER_ROLES.VERIFIER]: 'Verifier',
  [USER_ROLES.CLIENT]: 'Client',
};

// ============================================
// USER STATUS
// ============================================

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
};

export const STATUS_LABELS = {
  [USER_STATUS.ACTIVE]: 'Active',
  [USER_STATUS.INACTIVE]: 'Inactive',
  [USER_STATUS.SUSPENDED]: 'Suspended',
};

// ============================================
// DOCUMENT STATUS
// ============================================

export const DOCUMENT_STATUS = {
  VERIFIED: 'verified',
  PENDING: 'pending',
  FAILED: 'failed',
  EXPIRED: 'expired',
};

export const DOCUMENT_STATUS_LABELS = {
  [DOCUMENT_STATUS.VERIFIED]: 'Verified',
  [DOCUMENT_STATUS.PENDING]: 'Pending',
  [DOCUMENT_STATUS.FAILED]: 'Failed',
  [DOCUMENT_STATUS.EXPIRED]: 'Expired',
};

export const DOCUMENT_STATUS_COLORS = {
  [DOCUMENT_STATUS.VERIFIED]: 'success',
  [DOCUMENT_STATUS.PENDING]: 'warning',
  [DOCUMENT_STATUS.FAILED]: 'danger',
  [DOCUMENT_STATUS.EXPIRED]: 'secondary',
};

// ============================================
// TICKET PRIORITY
// ============================================

export const TICKET_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

export const PRIORITY_LABELS = {
  [TICKET_PRIORITY.LOW]: 'Low',
  [TICKET_PRIORITY.MEDIUM]: 'Medium',
  [TICKET_PRIORITY.HIGH]: 'High',
  [TICKET_PRIORITY.URGENT]: 'Urgent',
};

export const PRIORITY_COLORS = {
  [TICKET_PRIORITY.LOW]: 'secondary',
  [TICKET_PRIORITY.MEDIUM]: 'info',
  [TICKET_PRIORITY.HIGH]: 'warning',
  [TICKET_PRIORITY.URGENT]: 'danger',
};

// ============================================
// TICKET STATUS
// ============================================

export const TICKET_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  WAITING_RESPONSE: 'waiting_response',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

export const TICKET_STATUS_LABELS = {
  [TICKET_STATUS.OPEN]: 'Open',
  [TICKET_STATUS.IN_PROGRESS]: 'In Progress',
  [TICKET_STATUS.WAITING_RESPONSE]: 'Waiting Response',
  [TICKET_STATUS.RESOLVED]: 'Resolved',
  [TICKET_STATUS.CLOSED]: 'Closed',
};

export const TICKET_STATUS_COLORS = {
  [TICKET_STATUS.OPEN]: 'warning',
  [TICKET_STATUS.IN_PROGRESS]: 'info',
  [TICKET_STATUS.WAITING_RESPONSE]: 'secondary',
  [TICKET_STATUS.RESOLVED]: 'success',
  [TICKET_STATUS.CLOSED]: 'secondary',
};

// ============================================
// KEY STATUS
// ============================================

export const KEY_STATUS = {
  ACTIVE: 'active',
  ROTATED: 'rotated',
  REVOKED: 'revoked',
  EXPIRED: 'expired',
};

export const KEY_STATUS_LABELS = {
  [KEY_STATUS.ACTIVE]: 'Active',
  [KEY_STATUS.ROTATED]: 'Rotated',
  [KEY_STATUS.REVOKED]: 'Revoked',
  [KEY_STATUS.EXPIRED]: 'Expired',
};

export const KEY_STATUS_COLORS = {
  [KEY_STATUS.ACTIVE]: 'success',
  [KEY_STATUS.ROTATED]: 'info',
  [KEY_STATUS.REVOKED]: 'danger',
  [KEY_STATUS.EXPIRED]: 'warning',
};

// ============================================
// AUDIT LOG ACTIONS
// ============================================

export const LOG_ACTIONS = {
  LOGIN: 'login',
  LOGOUT: 'logout',
  DOCUMENT_UPLOAD: 'document_upload',
  DOCUMENT_VERIFY: 'document_verify',
  DOCUMENT_DELETE: 'document_delete',
  USER_CREATE: 'user_create',
  USER_UPDATE: 'user_update',
  USER_DELETE: 'user_delete',
  KEY_GENERATE: 'key_generate',
  KEY_ROTATE: 'key_rotate',
  KEY_REVOKE: 'key_revoke',
  TICKET_CREATE: 'ticket_create',
  TICKET_UPDATE: 'ticket_update',
  SETTINGS_CHANGE: 'settings_change',
};

export const LOG_ACTION_LABELS = {
  [LOG_ACTIONS.LOGIN]: 'User Login',
  [LOG_ACTIONS.LOGOUT]: 'User Logout',
  [LOG_ACTIONS.DOCUMENT_UPLOAD]: 'Document Upload',
  [LOG_ACTIONS.DOCUMENT_VERIFY]: 'Document Verification',
  [LOG_ACTIONS.DOCUMENT_DELETE]: 'Document Delete',
  [LOG_ACTIONS.USER_CREATE]: 'User Created',
  [LOG_ACTIONS.USER_UPDATE]: 'User Updated',
  [LOG_ACTIONS.USER_DELETE]: 'User Deleted',
  [LOG_ACTIONS.KEY_GENERATE]: 'Key Generated',
  [LOG_ACTIONS.KEY_ROTATE]: 'Key Rotated',
  [LOG_ACTIONS.KEY_REVOKE]: 'Key Revoked',
  [LOG_ACTIONS.TICKET_CREATE]: 'Ticket Created',
  [LOG_ACTIONS.TICKET_UPDATE]: 'Ticket Updated',
  [LOG_ACTIONS.SETTINGS_CHANGE]: 'Settings Changed',
};

// ============================================
// FILE CONFIGURATION
// ============================================

export const FILE_CONFIG = {
  MAX_SIZE: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '104857600', 10), // 100MB default
  ALLOWED_TYPES: (import.meta.env.VITE_ALLOWED_FILE_TYPES || '.pdf,.doc,.docx,.txt,.jpg,.png').split(','),
  UPLOAD_CHUNK_SIZE: 1024 * 1024, // 1MB chunks for large file uploads
};

// ============================================
// PAGINATION CONFIGURATION
// ============================================

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: parseInt(import.meta.env.VITE_DEFAULT_PAGE_SIZE || '10', 10),
  MAX_PAGE_SIZE: parseInt(import.meta.env.VITE_MAX_PAGE_SIZE || '100', 10),
  ITEMS_PER_PAGE: 10, // Fixed items per page (as per user requirement)
};

// ============================================
// LOCAL STORAGE KEYS
// ============================================

export const STORAGE_KEYS = {
  AUTH_TOKEN: import.meta.env.VITE_AUTH_TOKEN_KEY || 'parity_auth_token',
  REFRESH_TOKEN: import.meta.env.VITE_REFRESH_TOKEN_KEY || 'parity_refresh_token',
  CURRENT_USER: import.meta.env.VITE_USER_STORAGE_KEY || 'parity_current_user',
  USER_ROLE: 'userRole',
  USER_NAME: 'userName',
  USER_EMAIL: 'userEmail',
  THEME: 'theme',
  SIDEBAR_STATE: 'sidebarOpen',
};

// ============================================
// ROUTES
// ============================================

export const ROUTES = {
  // Public Routes
  HOME: '/',
  LOGIN: '/login',
  TWO_FACTOR: '/2fa',

  // Admin Routes
  ADMIN_DASHBOARD: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_REGISTRY: '/admin/registry',
  ADMIN_SECURITY: '/admin/security',
  ADMIN_TICKETS: '/admin/tickets',
  ADMIN_LOGS: '/admin/logs',
  ADMIN_UPLOAD: '/admin/upload',
  ADMIN_VERIFY: '/admin/verify',
  ADMIN_SETTINGS: '/admin/settings',

  // Staff Routes
  STAFF_DASHBOARD: '/staff',
  STAFF_REGISTRY: '/staff/registry',
  STAFF_TICKETS: '/staff/tickets',
  STAFF_UPLOAD: '/staff/upload',
  STAFF_VERIFY: '/staff/verify',
  STAFF_REPORT: '/staff/report',
};

// ============================================
// DATE/TIME FORMATS
// ============================================

export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_WITH_TIME: 'MMM DD, YYYY HH:mm',
  API: 'YYYY-MM-DD',
  API_WITH_TIME: 'YYYY-MM-DD HH:mm:ss',
  ISO_8601: 'YYYY-MM-DDTHH:mm:ssZ',
};

// ============================================
// VALIDATION RULES
// ============================================

export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
};

// ============================================
// TOAST NOTIFICATION TYPES
// ============================================

export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get status color class for Bootstrap badges
 * @param {string} status - Status value
 * @param {string} type - Type of status (document, ticket, key, user)
 * @returns {string} Bootstrap color class
 */
export const getStatusColor = (status, type = 'document') => {
  const colorMaps = {
    document: DOCUMENT_STATUS_COLORS,
    ticket: TICKET_STATUS_COLORS,
    key: KEY_STATUS_COLORS,
    priority: PRIORITY_COLORS,
  };

  return colorMaps[type]?.[status] || 'secondary';
};

/**
 * Get label for status value
 * @param {string} status - Status value
 * @param {string} type - Type of status
 * @returns {string} Human-readable label
 */
export const getStatusLabel = (status, type = 'document') => {
  const labelMaps = {
    document: DOCUMENT_STATUS_LABELS,
    ticket: TICKET_STATUS_LABELS,
    key: KEY_STATUS_LABELS,
    priority: PRIORITY_LABELS,
    user: STATUS_LABELS,
  };

  return labelMaps[type]?.[status] || status;
};

/**
 * Get full API URL for an endpoint
 * @param {string} endpoint - Endpoint path
 * @returns {string} Full URL
 */
export const getApiUrl = (endpoint) => `${API_BASE_URL}${buildApiPath(endpoint)}`;

// ============================================
// EXPORT DEFAULT
// ============================================

export default {
  API_BASE_URL,
  API_PREFIX,
  API_TIMEOUT,
  buildApiPath,
  ENDPOINTS,
  HTTP_STATUS,
  ERROR_CODES,
  USER_ROLES,
  ROLE_LABELS,
  USER_STATUS,
  STATUS_LABELS,
  DOCUMENT_STATUS,
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_STATUS_COLORS,
  TICKET_PRIORITY,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  TICKET_STATUS,
  TICKET_STATUS_LABELS,
  TICKET_STATUS_COLORS,
  KEY_STATUS,
  KEY_STATUS_LABELS,
  KEY_STATUS_COLORS,
  LOG_ACTIONS,
  LOG_ACTION_LABELS,
  FILE_CONFIG,
  PAGINATION,
  STORAGE_KEYS,
  ROUTES,
  DATE_FORMATS,
  VALIDATION,
  TOAST_TYPES,
  getStatusColor,
  getStatusLabel,
  getApiUrl,
};
