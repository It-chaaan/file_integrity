export const mockLogs = [
  {
    timestamp: '2026-01-08 14:32:15',
    userId: 'USR-ADM-001',
    userName: 'Christian',
    ip: '192.168.1.100',
    action: 'DOCUMENT_UPLOAD',
    details: 'Uploaded Business_Permit_2026.pdf',
    status: 'Success'
  },
  {
    timestamp: '2026-01-08 14:28:43',
    userId: 'USR-STF-012',
    userName: 'James',
    ip: '192.168.1.145',
    action: 'DOCUMENT_VERIFY',
    details: 'Verified BIR_Certificate_2026.pdf',
    status: 'Success'
  },
  {
    timestamp: '2026-01-08 14:15:22',
    userId: 'USR-STF-008',
    userName: 'Shynalee',
    ip: '192.168.1.132',
    action: 'KEY_ROTATION',
    details: 'Rotated ECDSA key pair',
    status: 'Success'
  },
  {
    timestamp: '2026-01-08 13:58:11',
    userId: 'USR-ADM-001',
    userName: 'Martin',
    ip: '192.168.1.100',
    action: 'USER_CREATE',
    details: 'Created new staff user: Anna Cruz',
    status: 'Success'
  },
  {
    timestamp: '2026-01-08 13:42:05',
    userId: 'USR-STF-012',
    userName: 'Dominic',
    ip: '192.168.1.145',
    action: 'DOCUMENT_VERIFY',
    details: 'Verification failed hash mismatch',
    status: 'Failed'
  },
  {
    timestamp: '2026-01-08 13:20:33',
    userId: 'SYSTEM',
    userName: 'Joshua',
    ip: '127.0.0.1',
    action: 'AUTO_BACKUP',
    details: 'Automated database backup completed',
    status: 'Success'
  },
  {
    timestamp: '2026-01-08 12:55:47',
    userId: 'USR-ADM-001',
    userName: 'Nelson',
    ip: '192.168.1.100',
    action: 'SETTINGS_UPDATE',
    details: 'Changed verification timeout to 30s',
    status: 'Success'
  },
  {
    timestamp: '2026-01-08 12:30:18',
    userId: 'USR-STF-008',
    userName: 'Nathaniel',
    ip: '192.168.1.132',
    action: 'LOGIN_ATTEMPT',
    details: 'Failed login attempt invalid credentials',
    status: 'Failed'
  },
  {
    timestamp: '2026-01-08 12:15:55',
    userId: 'USR-ADM-002',
    userName: 'Rebecca',
    ip: '192.168.1.105',
    action: 'DOCUMENT_UPLOAD',
    details: 'Uploaded Mayor_Certification_2026.pdf',
    status: 'Success'
  },
  {
    timestamp: '2026-01-08 12:00:22',
    userId: 'USR-STF-003',
    userName: 'Maria',
    ip: '192.168.1.110',
    action: 'DOCUMENT_VERIFY',
    details: 'Verified Provincial_Permit.pdf',
    status: 'Success'
  },
  {
    timestamp: '2026-01-08 11:45:33',
    userId: 'USR-ADM-001',
    userName: 'Christian',
    ip: '192.168.1.100',
    action: 'KEY_ROTATION',
    details: 'Rotated backup ECDSA key',
    status: 'Success'
  },
  {
    timestamp: '2026-01-08 11:30:10',
    userId: 'USR-STF-012',
    userName: 'James',
    ip: '192.168.1.145',
    action: 'LOGIN_ATTEMPT',
    details: 'Successful login',
    status: 'Success'
  }
];

export const mockKeys = [
  {
    id: 'KEY-2026-ADM-001',
    keyId: 'KEY-2026-ADM-001',
    algorithm: 'ECDSA secp256k1',
    created: '2026-01-01',
    expires: '2027-01-01',
    status: 'active',
    lastUsed: '2 hours ago'
  },
  {
    id: 'KEY-2026-ADM-002',
    keyId: 'KEY-2026-ADM-002',
    algorithm: 'ECDSA secp256k1',
    created: '2025-06-15',
    expires: '2026-06-15',
    status: 'revoked',
    lastUsed: '8 months ago'
  },
  {
    id: 'KEY-2026-STF-001',
    keyId: 'KEY-2026-STF-001',
    algorithm: 'ECDSA secp256k1',
    created: '2025-12-01',
    expires: '2026-12-01',
    status: 'active',
    lastUsed: '1 day ago'
  },
  {
    id: 'KEY-2025-ADM-001',
    keyId: 'KEY-2025-ADM-001',
    algorithm: 'ECDSA secp256k1',
    created: '2025-01-01',
    expires: '2026-01-01',
    status: 'expired',
    lastUsed: '1 week ago'
  }
];

export const mockActivity = [
  {
    id: 1,
    type: 'success',
    title: 'Document verified successfully',
    time: '2 minutes ago',
    description: 'BIR_Certificate_2026.pdf - Authentic'
  },
  {
    id: 2,
    type: 'info',
    title: 'New document uploaded',
    time: '15 minutes ago',
    description: 'Business_Permit_QC_2026.pdf by Martin Luspo'
  },
  {
    id: 3,
    type: 'danger',
    title: 'Tampering attempt detected',
    time: '1 hour ago',
    description: 'Document hash mismatch - ID: DOC-2847'
  },
  {
    id: 4,
    type: 'warning',
    title: 'ECDSA key rotated',
    time: '3 hours ago',
    description: 'New key pair generated for admin user'
  },
  {
    id: 5,
    type: 'info',
    title: 'New User Registered',
    time: '3 hours ago',
    description: 'New key pair generated for admin user'
  }
];

export const getLogs = () => mockLogs;
export const getKeys = () => mockKeys;
export const getActivity = () => mockActivity;