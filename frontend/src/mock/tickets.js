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
    status: 'in-progress',
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
  },
  {
    id: 'TKT-SYS-005',
    ticketId: 'TKT-SYS-005',
    title: 'ECDSA key audit trail missing recent entries',
    priority: 'medium',
    category: 'key',
    status: 'resolved',
    createdBy: 'Compliance Bot',
    createdAt: '2026-01-08T13:05:00Z',
    description: 'Audit logs are not recording key usage for the last 30 minutes. Investigate logging pipeline.'
  },
  {
    id: 'TKT-SYS-006',
    ticketId: 'TKT-SYS-006',
    title: 'API rate limiting exceeded on verification endpoint',
    priority: 'high',
    category: 'general',
    status: 'open',
    createdBy: 'Monitoring System',
    createdAt: '2026-01-08T14:30:00Z',
    description: 'Verification endpoint hit rate limit threshold. Requests being throttled.'
  },
  {
    id: 'TKT-SYS-007',
    ticketId: 'TKT-SYS-007',
    title: 'SSL certificate expiring in 30 days',
    priority: 'medium',
    category: 'security',
    status: 'open',
    createdBy: 'System',
    createdAt: '2026-01-08T09:00:00Z',
    description: 'SSL certificate for API server will expire on 2026-02-19. Renewal required.'
  },
  {
    id: 'TKT-SYS-008',
    ticketId: 'TKT-SYS-008',
    title: 'Backup storage running low on space',
    priority: 'low',
    category: 'database',
    status: 'closed',
    createdBy: 'System',
    createdAt: '2026-01-06T11:20:00Z',
    description: 'Backup storage utilization at 92%. Archive old backups.'
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
    status: 'closed',
    createdBy: 'System',
    createdAt: '2026-01-06T14:13:00Z',
    description: 'Duplicate hash detected across multiple document IDs.'
  },
  {
    id: 'TKT-DOC-005',
    ticketId: 'TKT-DOC-005',
    title: 'Staff cannot download verified copy',
    priority: 'medium',
    category: 'general',
    status: 'open',
    createdBy: 'User',
    createdAt: '2026-01-08T12:10:00Z',
    description: 'Download link for verified document returns 403 for staff role.'
  },
  {
    id: 'TKT-DOC-006',
    ticketId: 'TKT-DOC-006',
    title: 'Barangay clearance hash verification failed',
    priority: 'high',
    category: 'verification',
    status: 'in-progress',
    createdBy: 'User',
    createdAt: '2026-01-08T13:40:00Z',
    description: 'Document DOC-2026-001820 fails hash verification. Possible file corruption or tampering detected.'
  },
  {
    id: 'TKT-DOC-007',
    ticketId: 'TKT-DOC-007',
    title: 'Unable to upload document - file type error',
    priority: 'medium',
    category: 'upload',
    status: 'resolved',
    createdBy: 'User',
    createdAt: '2026-01-08T11:15:00Z',
    description: 'System incorrectly rejected DOCX file as unsupported format.'
  },
  {
    id: 'TKT-DOC-008',
    ticketId: 'TKT-DOC-008',
    title: 'Slow verification processing time',
    priority: 'low',
    category: 'performance',
    status: 'open',
    createdBy: 'User',
    createdAt: '2026-01-08T14:50:00Z',
    description: 'Document verification taking 30+ seconds for PDFs over 3MB.'
  }
];

export const getAdminTickets = () => mockTicketsAdmin;
export const getStaffTickets = () => mockTicketsStaff;
export const getTicketById = (id) => {
  return [...mockTicketsAdmin, ...mockTicketsStaff].find(t => t.id === id);
};