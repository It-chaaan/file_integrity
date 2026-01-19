export const mockUsers = [
  {
    id: 'USR-ADM-001',
    name: 'Christian',
    email: 'christian@parity.gov',
    role: 'Admin',
    department: 'IT Department',
    status: 'Active',
    lastLogin: '2026-01-08 14:32'
  },
  {
    id: 'USR-STF-012',
    name: 'Martin',
    email: 'martin@parity.gov',
    role: 'Staff',
    department: 'Business Affairs',
    status: 'Active',
    lastLogin: '2026-01-08 14:28'
  },
  {
    id: 'USR-STF-008',
    name: 'Shynalee',
    email: 'shynalee@parity.gov',
    role: 'Staff',
    department: 'Treasury',
    status: 'Active',
    lastLogin: '2026-01-08 13:15'
  },
  {
    id: 'USR-STF-015',
    name: 'Joshua',
    email: 'joshua@parity.gov',
    role: 'Staff',
    department: 'Legal',
    status: 'Inactive',
    lastLogin: '2026-01-05 09:22'
  }
];

export const getUsers = () => mockUsers;
export const getUserById = (id) => mockUsers.find(u => u.id === id);