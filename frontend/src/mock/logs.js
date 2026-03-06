export const mockLogs = [
  {
    timestamp: '2026-01-08 14:32:15',
    userId: 'USR-ADM-001',
    userName: 'Christian Hale',
    ip: '192.168.1.100',
    action: 'DOCUMENT_UPLOAD',
    details: 'Uploaded MSA_Northstar_Solutions_2026.pdf',
    status: 'Success'
  },
  {
    timestamp: '2026-01-08 14:28:43',
    userId: 'USR-STF-012',
    userName: 'Daniel Reed',
    ip: '192.168.1.145',
    action: 'DOCUMENT_VERIFY',
    details: 'Verified NDA_AtlasCapital_Vendor_2026.pdf',
    status: 'Success'
  },
  {
    timestamp: '2026-01-08 14:15:22',
    userId: 'USR-STF-008',
    userName: 'Shynalee Ross',
    ip: '192.168.1.132',
    action: 'KEY_ROTATION',
    details: 'Rotated ECDSA key pair',
    status: 'Success'
  },
  {
    timestamp: '2026-01-08 13:58:11',
    userId: 'USR-ADM-001',
    userName: 'Martin Lowe',
    ip: '192.168.1.100',
    action: 'USER_CREATE',
    details: 'Created enterprise user: Ava Chen (Procurement)',
    status: 'Success'
  },
  {
    timestamp: '2026-01-08 13:42:05',
    userId: 'USR-STF-012',
    userName: 'Ava Chen',
    ip: '192.168.1.145',
    action: 'DOCUMENT_VERIFY',
    details: 'Verification failed hash mismatch for Financial_Audit_Report_Q4_2025.pdf',
    status: 'Failed'
  },
  {
    timestamp: '2026-01-08 13:20:33',
    userId: 'SYSTEM',
    userName: 'System Scheduler',
    ip: '127.0.0.1',
    action: 'AUTO_BACKUP',
    details: 'Automated database backup completed',
    status: 'Success'
  },
  {
    timestamp: '2026-01-08 12:55:47',
    userId: 'USR-ADM-001',
    userName: 'Nina Brooks',
    ip: '192.168.1.100',
    action: 'SETTINGS_UPDATE',
    details: 'Updated enterprise verification timeout policy to 30s',
    status: 'Success'
  },
  {
    timestamp: '2026-01-08 12:30:18',
    userId: 'USR-STF-008',
    userName: 'External Verifier',
    ip: '192.168.1.132',
    action: 'LOGIN_ATTEMPT',
    details: 'Failed login attempt invalid credentials',
    status: 'Failed'
  },
  {
    timestamp: '2026-01-08 12:15:55',
    userId: 'USR-ADM-002',
    userName: 'Sofia Martinez',
    ip: '192.168.1.105',
    action: 'DOCUMENT_UPLOAD',
    details: 'Uploaded Vendor_Contract_ApexLogistics.pdf',
    status: 'Success'
  },
  {
    timestamp: '2026-01-08 12:00:22',
    userId: 'USR-STF-016',
    userName: 'Liam Turner',
    ip: '192.168.1.110',
    action: 'DOCUMENT_VERIFY',
    details: 'Verified Board_Resolution_March2026.pdf',
    status: 'Success'
  },
  {
    timestamp: '2026-01-08 11:45:33',
    userId: 'USR-ADM-001',
    userName: 'Christian Hale',
    ip: '192.168.1.100',
    action: 'KEY_ROTATION',
    details: 'Rotated backup enterprise ECDSA key',
    status: 'Success'
  },
  {
    timestamp: '2026-01-08 11:30:10',
    userId: 'USR-STF-012',
    userName: 'Daniel Reed',
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
    title: 'Contract verified successfully',
    time: '2 minutes ago',
    description: 'MSA_Northstar_Solutions_2026.pdf - Authentic'
  },
  {
    id: 2,
    type: 'info',
    title: 'New enterprise document uploaded',
    time: '15 minutes ago',
    description: 'Vendor_Contract_ApexLogistics.pdf by Sofia Martinez'
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
    description: 'New signing key pair generated for the compliance office'
  },
  {
    id: 5,
    type: 'info',
    title: 'New enterprise user onboarded',
    time: '3 hours ago',
    description: 'Access granted to External Verifier role'
  }
];

export const getLogs = () => mockLogs;
export const getKeys = () => mockKeys;
export const getActivity = () => mockActivity;