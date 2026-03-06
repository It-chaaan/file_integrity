export const mockUsers = [
  {
    id: 'USR-ADM-001',
    name: 'Christian Hale',
    email: 'christian.hale@parityenterprise.com',
    role: 'System Administrator',
    department: 'IT Security',
    status: 'Active',
    lastLogin: '2026-01-08 14:32'
  },
  {
    id: 'USR-STF-012',
    name: 'Martin Lowe',
    email: 'martin.lowe@parityenterprise.com',
    role: 'Compliance Officer',
    department: 'Compliance Office',
    status: 'Active',
    lastLogin: '2026-01-08 14:28'
  },
  {
    id: 'USR-STF-008',
    name: 'Shynalee Ross',
    email: 'shynalee.ross@parityenterprise.com',
    role: 'Finance Manager',
    department: 'Finance Department',
    status: 'Active',
    lastLogin: '2026-01-08 13:15'
  },
  {
    id: 'USR-STF-015',
    name: 'Joshua Trent',
    email: 'joshua.trent@parityenterprise.com',
    role: 'Legal Officer',
    department: 'Legal Department',
    status: 'Inactive',
    lastLogin: '2026-01-05 09:22'
  }
];

export const getUsers = () => mockUsers;
export const getUserById = (id) => mockUsers.find(u => u.id === id);