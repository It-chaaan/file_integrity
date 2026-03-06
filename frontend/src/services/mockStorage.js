// Mock Data Storage Service - Simulates backend database
import { mockDocuments, mockUsers, mockTicketsAdmin, mockTicketsStaff, mockLogs, mockKeys } from '../mock';
// UPDATED: Import from unified auth service instead of mockAuth
// This maintains backward compatibility while using the new system
import { getCurrentUser } from './auth';

const STORAGE_KEYS = {
  DOCUMENTS: 'parity_documents',
  USERS: 'parity_all_users',
  TICKETS: 'parity_tickets',
  LOGS: 'parity_logs',
  KEYS: 'parity_keys',
  REPORTS: 'parity_reports',
  SETTINGS: 'parity_settings'
};

// Initialize mock data in localStorage
export const initializeMockData = () => {
  // Always reinitialize with fresh data
  localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(mockDocuments));
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockUsers));
  localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify([...mockTicketsAdmin, ...mockTicketsStaff]));
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(mockLogs));
  localStorage.setItem(STORAGE_KEYS.KEYS, JSON.stringify(mockKeys));
  console.log('✅ Mock data initialized:', {
    documents: mockDocuments.length,
    users: mockUsers.length,
    logs: mockLogs.length,
    tickets: mockTicketsAdmin.length + mockTicketsStaff.length
  });
};

// Generic CRUD operations
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Heuristic mapper to infer logical document type from file name when missing
const deriveTypeFromFileName = (fileName = '') => {
  const name = fileName.toLowerCase();
  const map = [
    { match: ['msa'], type: 'Master Service Agreement (MSA)' },
    { match: ['nda'], type: 'Non-Disclosure Agreement (NDA)' },
    { match: ['purchase', 'order'], type: 'Purchase Order (PO)' },
    { match: ['vendor', 'contract'], type: 'Vendor Contract' },
    { match: ['employment', 'contract'], type: 'Employment Contract' },
    { match: ['board', 'resolution'], type: 'Board Resolution' },
    { match: ['audit', 'report'], type: 'Financial Audit Report' },
    { match: ['compliance', 'certificate'], type: 'Compliance Certificate' },
    { match: ['insurance', 'policy'], type: 'Insurance Policy' },
    { match: ['data', 'processing'], type: 'Data Processing Agreement (DPA)' },
  ];
  for (const rule of map) {
    if (rule.match.every(token => name.includes(token))) return rule.type;
  }
  return undefined;
};

// GET operations
export const getAll = async (storageKey) => {
  await delay();
  const data = localStorage.getItem(storageKey);
  return data ? JSON.parse(data) : [];
};

export const getById = async (storageKey, id) => {
  await delay();
  const data = await getAll(storageKey);
  return data.find(item => item.id === id);
};

// CREATE operations
export const create = async (storageKey, newItem) => {
  await delay(500);
  const data = await getAll(storageKey);
  data.push(newItem);
  localStorage.setItem(storageKey, JSON.stringify(data));
  return newItem;
};

// UPDATE operations
export const update = async (storageKey, id, updates) => {
  await delay(400);
  const data = await getAll(storageKey);
  const index = data.findIndex(item => item.id === id);
  
  if (index === -1) {
    throw new Error('Item not found');
  }
  
  data[index] = { ...data[index], ...updates };
  localStorage.setItem(storageKey, JSON.stringify(data));
  return data[index];
};

// DELETE operations
export const remove = async (storageKey, id) => {
  await delay(400);
  const data = await getAll(storageKey);
  const filtered = data.filter(item => item.id !== id);
  localStorage.setItem(storageKey, JSON.stringify(filtered));
  return true;
};

// SEARCH operations
export const search = async (storageKey, searchTerm, fields = []) => {
  await delay(200);
  const data = await getAll(storageKey);
  
  if (!searchTerm) return data;
  
  const lowerSearch = searchTerm.toLowerCase();
  return data.filter(item => {
    return fields.some(field => {
      const value = item[field];
      return value && value.toString().toLowerCase().includes(lowerSearch);
    });
  });
};

// FILTER operations
export const filter = async (storageKey, filterFn) => {
  await delay(200);
  const data = await getAll(storageKey);
  return data.filter(filterFn);
};

// Export storage keys
export { STORAGE_KEYS };

// Document-specific operations
export const mockDocumentService = {
  getAll: async () => {
    const docs = await getAll(STORAGE_KEYS.DOCUMENTS);
    // Normalize types for display: prefer type/documentType; avoid MIME strings
    return docs.map((doc) => {
      const isMime = (doc.fileType || '').includes('/');
      const inferredType = deriveTypeFromFileName(doc.fileName);
      const normalizedType = doc.type || doc.documentType || (!isMime ? doc.fileType : undefined) || inferredType;
      return {
        ...doc,
        type: normalizedType,
        documentType: doc.documentType || normalizedType,
      };
    });
  },
  getById: (id) => getById(STORAGE_KEYS.DOCUMENTS, id),
  create: (doc) => create(STORAGE_KEYS.DOCUMENTS, doc),
  update: (id, updates) => update(STORAGE_KEYS.DOCUMENTS, id, updates),
  delete: (id) => remove(STORAGE_KEYS.DOCUMENTS, id),
  search: (term) => search(STORAGE_KEYS.DOCUMENTS, term, ['title', 'type', 'department', 'uploadedBy', 'hash']),
  verifyHash: async (hash) => {
    await delay(800);
    const docs = await getAll(STORAGE_KEYS.DOCUMENTS);
    const match = docs.find(d => d.hash === hash);
    return {
      found: !!match,
      document: match || null,
      status: match ? 'VERIFIED' : 'NOT_FOUND',
      timestamp: new Date().toISOString()
    };
  }
};

// User-specific operations
export const mockUserService = {
  getAll: () => getAll(STORAGE_KEYS.USERS),
  getById: (id) => getById(STORAGE_KEYS.USERS, id),
  create: (user) => create(STORAGE_KEYS.USERS, user),
  update: (id, updates) => update(STORAGE_KEYS.USERS, id, updates),
  delete: (id) => remove(STORAGE_KEYS.USERS, id),
  search: (term) => search(STORAGE_KEYS.USERS, term, ['name', 'email', 'role', 'department'])
};

// Ticket-specific operations
export const mockTicketService = {
  getAll: async () => {
    // Always return all tickets - filtering will be handled by components
    await delay();
    return [...mockTicketsAdmin, ...mockTicketsStaff];
  },
  getById: async (id) => {
    await delay();
    const allTickets = [...mockTicketsAdmin, ...mockTicketsStaff];
    return allTickets.find(ticket => ticket.id === id);
  },
  create: async (ticket) => {
    await delay(500);
    const user = getCurrentUser();
    
    const newTicket = {
      ...ticket,
      id: `TKT-${Date.now()}`,
      ticketId: `TKT-${Date.now()}`,
      createdBy: user?.name || 'User',
      createdAt: new Date().toISOString()
    };
    
    return newTicket;
  },
  update: (id, updates) => update(STORAGE_KEYS.TICKETS, id, updates),
  delete: (id) => remove(STORAGE_KEYS.TICKETS, id),
  search: async (term) => {
    const user = getCurrentUser();
    const userRole = user?.role || 'public';
    
    const tickets = userRole === 'admin' ? mockTicketsAdmin : (userRole === 'staff' ? mockTicketsStaff : []);
    
    if (!term) return tickets;
    
    const lowerSearch = term.toLowerCase();
    return tickets.filter(ticket => {
      return ['title', 'ticketId', 'status', 'priority'].some(field => {
        const value = ticket[field];
        return value && value.toString().toLowerCase().includes(lowerSearch);
      });
    });
  }
};

// Log-specific operations
export const mockLogService = {
  getAll: async () => {
    const logs = await getAll(STORAGE_KEYS.LOGS);
    console.log('📜 Mock logs fetched from storage:', logs);
    return logs;
  },
  create: async (log) => {
    const logEntry = {
      ...log,
      timestamp: new Date().toISOString(),
      id: `LOG-${Date.now()}`
    };
    return create(STORAGE_KEYS.LOGS, logEntry);
  },
  // Key operations
  getKeys: () => getAll(STORAGE_KEYS.KEYS),
  createKey: (key) => create(STORAGE_KEYS.KEYS, key),
  deleteKey: (id) => remove(STORAGE_KEYS.KEYS, id)
};

// Key-specific operations
export const mockKeyService = {
  getAll: () => getAll(STORAGE_KEYS.KEYS),
  getById: (id) => getById(STORAGE_KEYS.KEYS, id),
  create: (key) => create(STORAGE_KEYS.KEYS, key),
  update: (id, updates) => update(STORAGE_KEYS.KEYS, id, updates),
  rotate: async (keyId) => {
    await delay(1000);
    // Mark old key as rotated
    await update(STORAGE_KEYS.KEYS, keyId, { status: 'Rotated' });
    
    // Create new key
    const newKey = {
      id: `KEY-${new Date().getFullYear()}-${Date.now()}`,
      user: 'Current User',
      algorithm: 'ECDSA secp256k1',
      created: new Date().toISOString().split('T')[0],
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Active',
      lastUsed: 'Just now'
    };
    
    return create(STORAGE_KEYS.KEYS, newKey);
  }
};
