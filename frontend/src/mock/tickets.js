export const mockTicketsAdmin = [
  {
    id: 'TKT-SYS-001',
    ticketId: 'TKT-SYS-001',
    title: 'Key rotation compliance overdue for executive signing key',
    priority: 'critical',
    category: 'key',
    status: 'open',
    createdBy: 'System',
    createdAt: '2026-01-08T12:00:00Z',
    description: 'Scheduled enterprise key rotation was not completed before policy deadline.',
    errorCode: 'ERR_KEY_001'
  },
  {
    id: 'TKT-SYS-002',
    ticketId: 'TKT-SYS-002',
    title: 'Contract signature verification failed',
    priority: 'critical',
    category: 'hash',
    status: 'in-progress',
    createdBy: 'Multiple Users',
    createdAt: '2026-01-08T08:15:00Z',
    description: "Signature verification module is failing on newly submitted contract files. Error: 'ERR_NET_002'",
    errorCode: 'ERR_NET_002'
  },
  {
    id: 'TKT-SYS-003',
    ticketId: 'TKT-SYS-003',
    title: 'Audit log discrepancy detected in replication cluster',
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
    title: 'Large contract upload timeout during SHA-256 hash generation',
    priority: 'high',
    category: 'hash',
    status: 'open',
    createdBy: 'Enterprise User',
    createdAt: '2026-01-08T11:45:00Z',
    description: 'Files larger than 10MB are experiencing timeout errors during hash computation.'
  },
  {
    id: 'TKT-SYS-005',
    ticketId: 'TKT-SYS-005',
    title: 'Audit trail missing recent key usage events',
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
    title: 'Expiring agreement and certificate alert requires review',
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
    title: 'Security event archive storage nearing threshold',
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
    title: 'Expired vendor agreement detected during verification',
    priority: 'high',
    category: 'general',
    status: 'in-progress',
    createdBy: 'User',
    createdAt: '2026-01-08T10:30:00Z',
    description: 'Vendor contract DOC-2026-001847 is marked active in metadata but appears expired in the signed record.'
  },
  {
    id: 'TKT-DOC-002',
    ticketId: 'TKT-DOC-002',
    title: 'DPA agreement signature invalid',
    priority: 'high',
    category: 'authentication',
    status: 'open',
    createdBy: 'User',
    createdAt: '2026-01-07T18:25:00Z',
    description: 'Digital signature validation failed for submitted Data Processing Agreement.'
  },
  {
    id: 'TKT-DOC-003',
    ticketId: 'TKT-DOC-003',
    title: 'Financial document hash mismatch detected',
    priority: 'medium',
    category: 'upload',
    status: 'open',
    createdBy: 'User',
    createdAt: '2026-01-07T16:20:00Z',
    description: 'Uploaded financial statement hash does not match stored enterprise registry value.'
  },
  {
    id: 'TKT-DOC-004',
    ticketId: 'TKT-DOC-004',
    title: 'Duplicate contract hash registered under multiple records',
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
    title: 'Unauthorized access attempt blocked by role policy',
    priority: 'medium',
    category: 'general',
    status: 'open',
    createdBy: 'User',
    createdAt: '2026-01-08T12:10:00Z',
    description: 'Access to board resolution file was blocked by role policy; review event for potential misuse.'
  },
  {
    id: 'TKT-DOC-006',
    ticketId: 'TKT-DOC-006',
    title: 'Contract integrity verification failed',
    priority: 'high',
    category: 'verification',
    status: 'in-progress',
    createdBy: 'User',
    createdAt: '2026-01-08T13:40:00Z',
    description: 'Document DOC-2026-001820 failed hash verification. Potential tampering or corrupted transfer detected.'
  },
  {
    id: 'TKT-DOC-007',
    ticketId: 'TKT-DOC-007',
    title: 'Loan agreement upload rejected by validation policy',
    priority: 'medium',
    category: 'upload',
    status: 'resolved',
    createdBy: 'User',
    createdAt: '2026-01-08T11:15:00Z',
    description: 'System rejected a compliant DOCX loan agreement due to strict MIME validation.'
  },
  {
    id: 'TKT-DOC-008',
    ticketId: 'TKT-DOC-008',
    title: 'Slow verification for multi-party shareholder agreements',
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