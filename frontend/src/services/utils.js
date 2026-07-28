// Utility functions for file handling and data formatting

// Generate short hash
export const shortHash = (hash) => {
  if (!hash || hash.length < 14) return hash;
  return `${hash.substring(0, 8)}...${hash.substring(hash.length - 6)}`;
};

const auditDetailLabelMap = {
  reference_number: 'Reference Number',
  referenceNumber: 'Reference Number',
  found: 'Found',
  is_authentic: 'Authentic',
  isAuthentic: 'Authentic',
  document_type: 'Document Type',
  documentType: 'Document Type',
  file_name: 'File Name',
  fileName: 'File Name',
  status: 'Status',
  action: 'Action',
  resource_type: 'Resource Type',
  resourceType: 'Resource Type',
  resource_id: 'Resource ID',
  resourceId: 'Resource ID',
  message: 'Message',
  error: 'Error',
  count: 'Count',
  username: 'Username',
  email: 'Email',
  reason: 'Reason',
  trusted_device: 'Trusted Device',
  device_label: 'Device',
  client_ip: 'IP Address',
  old_key_id: 'Previous Key',
  new_key_id: 'New Key',
  rotation_reason: 'Rotation Reason',
  revocation_reason: 'Revocation Reason',
};

const formatAuditDetailValue = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const formatDocumentAuditSummary = (details, action) => {
  if (!details || typeof details !== 'object' || Array.isArray(details)) return null;

  const referenceNumber = details.reference_number || details.referenceNumber;
  const found = details.found;
  const isAuthentic = details.is_authentic ?? details.isAuthentic;
  const count = details.count;

  switch ((action || '').toUpperCase()) {
    case 'DOCUMENT_CREATED':
      return referenceNumber ? `Document created: ${referenceNumber}` : 'Document created';
    case 'DOCUMENT_VERIFY':
      if (!referenceNumber) return null;
      return `Verification for ${referenceNumber}: Found ${formatAuditDetailValue(found)}, Authentic ${formatAuditDetailValue(isAuthentic)}`;
    case 'DOCUMENT_BATCH_VERIFY':
      return Number.isFinite(Number(count)) ? `Batch verification completed: ${count} file${Number(count) === 1 ? '' : 's'} processed` : 'Batch verification completed';
    default:
      return null;
  }
};

const auditActionLabelMap = {
  AUTH_LOGIN_SUCCESS: 'Successful Sign In',
  AUTH_LOGIN_FAILED: 'Failed Sign In',
  AUTH_LOGIN_CHALLENGE_ISSUED: 'Two-Factor Challenge Sent',
  AUTH_LOGOUT: 'Signed Out',
  AUTH_REFRESH: 'Session Refreshed',
  AUTH_UNAUTHORIZED: 'Unauthorized Access Attempt',
  AUTH_FORBIDDEN: 'Blocked Access Attempt',
  DOCUMENT_CREATED: 'Document Registered',
  DOCUMENT_UPDATED: 'Document Updated',
  DOCUMENT_ARCHIVED: 'Document Archived',
  DOCUMENT_VERIFY: 'Document Verification',
  DOCUMENT_BATCH_VERIFY: 'Batch Verification',
  DOCUMENT_DUPLICATE_UPLOAD: 'Duplicate Document Detected',
  SECURITY_KEY_CREATED: 'Signing Key Created',
  SECURITY_KEY_UPDATED: 'Signing Key Updated',
  SECURITY_KEY_ROTATED: 'Signing Key Rotated',
  SECURITY_KEY_REVOKED: 'Signing Key Revoked',
  USER_CREATED: 'User Account Created',
  USER_UPDATED: 'User Account Updated',
  USER_DELETED: 'User Account Deleted',
  USER_DEACTIVATED: 'User Account Deactivated',
  USER_ACTIVATED: 'User Account Activated',
  USER_ROLE_UPDATED: 'User Role Changed',
  USER_PASSWORD_RESET: 'User Password Reset',
  PROFILE_UPDATED: 'Profile Updated',
  PASSWORD_CHANGED: 'Password Changed',
  PASSWORD_RESET_REQUESTED: 'Password Reset Requested',
  PASSWORD_RESET_CONFIRMED: 'Password Reset Completed',
};

export const formatAuditActionLabel = (action) => {
  if (!action) return 'System Event';
  return auditActionLabelMap[action] || action
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
};

export const formatAuditSeverityLabel = (severity) => {
  const normalized = String(severity || '').toLowerCase();
  if (normalized === 'critical') return 'Critical';
  if (normalized === 'warning') return 'Needs Attention';
  if (normalized === 'info') return 'Informational';
  return severity || 'Informational';
};

export const formatAuditStatusLabel = (status) => {
  const normalized = String(status || '').toUpperCase();
  if (normalized === 'SUCCESS') return 'Completed';
  if (normalized === 'FAILED') return 'Blocked';
  return status || 'Completed';
};

/**
 * Convert audit log details into a readable sentence.
 * @param {unknown} details
 * @param {Object} [context]
 * @param {string} [context.action]
 * @returns {string}
 */
export const formatAuditLogDetails = (details, context = {}) => {
  if (!details) return '—';

  const actionSummary = formatDocumentAuditSummary(details, context.action);
  if (actionSummary) return actionSummary;

  if (typeof details === 'string') {
    try {
      const parsed = JSON.parse(details);
      return formatAuditLogDetails(parsed, context);
    } catch {
      return details;
    }
  }

  if (Array.isArray(details)) {
    return details.map((item) => formatAuditDetailValue(item)).filter(Boolean).join(' • ') || '—';
  }

  if (typeof details !== 'object') {
    return formatAuditDetailValue(details);
  }

  const entries = Object.entries(details)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => {
      const label = auditDetailLabelMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase());
      return `${label}: ${formatAuditDetailValue(value)}`;
    });

  return entries.length > 0 ? entries.join(' • ') : '—';
};


/**
 * Format a file size in human-readable units.
 * @param {number} bytes - Size in bytes.
 * @returns {string} e.g., "123 B", "1.2 KB", "3.4 MB".
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return 'Unknown';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

// Format date
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Format datetime
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatRelativeDateTime = (dateString) => {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'N/A';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (Math.abs(diffMinutes) < 1) return 'Just now';
  if (Math.abs(diffMinutes) < 60) return `${Math.abs(diffMinutes)} minute${Math.abs(diffMinutes) === 1 ? '' : 's'} ${diffMinutes >= 0 ? 'ago' : 'from now'}`;
  if (Math.abs(diffHours) < 24) return `${Math.abs(diffHours)} hour${Math.abs(diffHours) === 1 ? '' : 's'} ${diffHours >= 0 ? 'ago' : 'from now'}`;
  if (Math.abs(diffDays) < 7) return `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} ${diffDays >= 0 ? 'ago' : 'from now'}`;

  return formatDateTime(dateString);
};

/**
 * Validate a file type against a whitelist of extensions/MIME types.
 * @param {File} file - File to validate.
 * @param {string[]} [allowedTypes=[]] - Allowed extensions or MIME substrings.
 * @returns {boolean} true if file matches allowed types.
 */
export const validateFileType = (file, allowedTypes = []) => {
  if (!file) return false;
  if (allowedTypes.length === 0) return true;

  const normalized = allowedTypes.map(type => type.replace(/^\./, '').toLowerCase());
  const fileExtension = (file.name?.split('.').pop() || '').toLowerCase();
  const fileMime = (file.type || '').toLowerCase();

  // Quick extension check
  if (normalized.includes(fileExtension)) return true;

  // Fallback MIME match for common office types
  const mimeMap = {
    pdf: ['application/pdf'],
    doc: ['application/msword'],
    docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    txt: ['text/plain'],
  };

  return normalized.some(type => {
    const mimes = mimeMap[type];
    if (!mimes) return fileMime.includes(type);
    return mimes.some(mime => fileMime === mime);
  });
};

/**
 * Validate a file size against a maximum.
 * @param {File} file - File to validate.
 * @param {number} [maxSizeMB=10] - Max size in megabytes.
 * @returns {boolean} true if file size is within limit.
 */
export const validateFileSize = (file, maxSizeMB = 10) => {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
};

// Parse search query
export const parseSearchQuery = (query) => {
  if (!query) return null;
  return query.trim().toLowerCase();
};

// Filter data by multiple criteria
export const filterData = (data, filters) => {
  if (!filters || Object.keys(filters).length === 0) return data;
  
  return data.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === '' || value === null || value === undefined) return true;
      if (Array.isArray(value)) return value.includes(item[key]);
      return item[key] === value;
    });
  });
};

// Sort data
export const sortData = (data, sortBy, sortOrder = 'asc') => {
  if (!sortBy) return data;
  
  return [...data].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    
    if (typeof aVal === 'string') {
      return sortOrder === 'asc' 
        ? aVal.localeCompare(bVal) 
        : bVal.localeCompare(aVal);
    }
    
    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });
};

// Paginate data
export const paginateData = (data, page = 1, pageSize = 10) => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    data: data.slice(startIndex, endIndex),
    total: data.length,
    page,
    pageSize,
    totalPages: Math.ceil(data.length / pageSize)
  };
};

// Date range filter
export const filterByDateRange = (data, dateField, startDate, endDate) => {
  if (!startDate && !endDate) return data;
  
  return data.filter(item => {
    const itemDate = new Date(item[dateField]);
    if (startDate && itemDate < new Date(startDate)) return false;
    if (endDate && itemDate > new Date(endDate)) return false;
    return true;
  });
};

// Export to CSV (simulated)
export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

// Export to JSON (simulated)
export const exportToJSON = (data, filename = 'export.json') => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};

// Get status badge color
export const getStatusColor = (status) => {
  const colors = {
    'Active': 'success',
    'Inactive': 'secondary',
    'Verified': 'success',
    'Pending': 'warning',
    'Failed': 'danger',
    'Open': 'info',
    'Closed': 'secondary',
    'Under Review': 'warning',
    'Urgent': 'danger',
    'High': 'warning',
    'Medium': 'info',
    'Low': 'secondary',
    'Rotated': 'warning',
    'Expired': 'danger',
    'Revoked': 'dark'
  };
  
  return colors[status] || 'primary';
};

// Calculate dashboard statistics
export const calculateStats = (documents, users, tickets, logs) => {
  const today = new Date().toISOString().split('T')[0];
  return {
    totalDocuments: documents.length,
    activeDocuments: documents.filter(d => d.status === 'verified').length,
    totalUsers: users.length,
    activeUsers: users.filter(u => u.is_active).length,
    totalTickets: tickets.length,
    openTickets: tickets.filter(t => t.status === 'open').length,
    criticalTickets: tickets.filter(t => t.priority === 'urgent').length,
    recentLogs: logs.slice(0, 10),
    todayUploads: documents.filter(d => {
      return d.created_at && d.created_at.startsWith(today);
    }).length,
    todayVerifications: logs.filter(l => {
      const action = String(l.action || '');
      return action.includes('VERIFY') && l.created_at && l.created_at.startsWith(today);
    }).length
  };
};

// Debounce function for search
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};
