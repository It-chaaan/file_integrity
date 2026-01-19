export const mockTicketsAdmin = [
  {
    id: 'TKT-SYS-001',
    ticketId: 'TKT-SYS-001',
    title: 'ECDSA key rotation failed for admin user',
    priority: 'critical',
    category: 'key',
    status: 'open',
    createdBy: 'System',
    createdAt: '2026-01-08T12:00:00Z',
    description: 'Automated key rotation process failed during scheduled maintenance.',
    errorCode: 'ERR_KEY_001'
  },
  {
    id: 'TKT-SYS-002',
    ticketId: 'TKT-SYS-002',
    title: 'Unable to verify a file',
    priority: 'critical',
    category: 'hash',
    status: 'open',
    createdBy: 'Multiple Users',
    createdAt: '2026-01-08T08:15:00Z',
    description: "Hash verification module returning errors for all PDF documents uploaded after 2026-01-07 18:15. Error: 'ERR_NET_002'",
    errorCode: 'ERR_NET_002'
  },
  {
    id: 'TKT-SYS-003',
    ticketId: 'TKT-SYS-003',
    title: 'Database replication lag detected on secondary server',
    priority: 'medium',
    category: 'database',
    status: 'open',
    createdBy: 'System Monitor',
    createdAt: '2026-01-07T16:25:00Z',
    description: 'Secondary database server showing replication lag of 45 seconds.'
  },
  {
    id: 'TKT-SYS-004',
    ticketId: 'TKT-SYS-004',
    title: 'SHA-256 hash computation timing out for large files',
    priority: 'high',
    category: 'hash',
    status: 'open',
    createdBy: 'Staff User',
    createdAt: '2026-01-08T11:45:00Z',
    description: 'Files larger than 10MB are experiencing timeout errors during hash computation.'
  }
];

export const mockTicketsStaff = [
  {
    id: 'TKT-DOC-001',
    ticketId: 'TKT-DOC-001',
    title: 'Business permit metadata shows incorrect expiry date',
    priority: 'high',
    category: 'general',
    status: 'in-progress',
    createdBy: 'User',
    createdAt: '2026-01-08T10:30:00Z',
    description: 'The business permit document DOC-2026-001847 displays an expiry date of 2025-12-31 in the data information, but the actual permit visible content shows 2026-12-31. This discrepancy needs investigation.'
  },
  {
    id: 'TKT-DOC-002',
    ticketId: 'TKT-DOC-002',
    title: 'Digital signature does not match stored certificate',
    priority: 'high',
    category: 'authentication',
    status: 'open',
    createdBy: 'User',
    createdAt: '2026-01-07T18:25:00Z',
    description: 'Signature verification failed for uploaded certificate.'
  },
  {
    id: 'TKT-DOC-003',
    ticketId: 'TKT-DOC-003',
    title: 'Certificate uploaded without required ECDSA signature',
    priority: 'medium',
    category: 'upload',
    status: 'open',
    createdBy: 'User',
    createdAt: '2026-01-07T16:20:00Z',
    description: 'Document was uploaded but missing digital signature.'
  },
  {
    id: 'TKT-DOC-004',
    ticketId: 'TKT-DOC-004',
    title: 'Same document hash exists with different document ID',
    priority: 'low',
    category: 'hash',
    status: 'open',
    createdBy: 'System',
    createdAt: '2026-01-06T14:13:00Z',
    description: 'Duplicate hash detected across multiple document IDs.'
  }
];

export const getAdminTickets = () => mockTicketsAdmin;
export const getStaffTickets = () => mockTicketsStaff;
export const getTicketById = (id) => {
  return [...mockTicketsAdmin, ...mockTicketsStaff].find(t => t.id === id);
};