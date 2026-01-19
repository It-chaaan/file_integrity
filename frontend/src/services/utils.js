// Utility functions for hash generation, file handling, and data formatting

// Generate SHA-256 hash (simulated)
export const generateHash = (file) => {
  const characters = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 64; i++) {
    hash += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return hash;
};

// Generate short hash
export const shortHash = (hash) => {
  if (!hash || hash.length < 14) return hash;
  return `${hash.substring(0, 8)}...${hash.substring(hash.length - 6)}`;
};

// Generate document ID
export const generateDocumentId = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
  return `DOC-${year}-${random}`;
};

// Generate user ID
export const generateUserId = (role) => {
  const prefix = role === 'Admin' ? 'ADM' : 'STF';
  const random = Math.floor(Math.random() * 999).toString().padStart(3, '0');
  return `USR-${prefix}-${random}`;
};

// Generate ticket ID
export const generateTicketId = (type = 'SYS') => {
  const random = Math.floor(Math.random() * 999).toString().padStart(3, '0');
  return `TKT-${type}-${random}`;
};

// Format file size
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

// Validate file type
export const validateFileType = (file, allowedTypes = []) => {
  if (allowedTypes.length === 0) return true;
  return allowedTypes.some(type => file.type.includes(type));
};

// Validate file size
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
    'Critical': 'danger',
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
  return {
    totalDocuments: documents.length,
    activeDocuments: documents.filter(d => d.status === 'Active').length,
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'Active').length,
    totalTickets: tickets.length,
    openTickets: tickets.filter(t => t.status === 'Open').length,
    criticalTickets: tickets.filter(t => t.priority === 'Critical').length,
    recentLogs: logs.slice(0, 10),
    todayUploads: documents.filter(d => {
      const today = new Date().toISOString().split('T')[0];
      return d.date === today;
    }).length,
    todayVerifications: logs.filter(l => {
      const today = new Date().toISOString().split('T')[0];
      return l.action === 'DOCUMENT_VERIFY' && l.timestamp.includes(today);
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
