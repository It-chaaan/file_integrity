export const mockProfiles = {
  admin: {
    name: 'James Alba',
    email: 'james.alba@parity.gov',
    role: 'Administrator',
    department: 'IT Security',
    phone: '+63 917 555 1212'
  },
  staff: {
    name: 'Martin Luspo',
    email: 'martin.luspo@parity.gov',
    role: 'Staff',
    department: 'Records',
    phone: '+63 917 444 2323'
  }
};

export const getMockProfile = (role = 'staff') => mockProfiles[role] || mockProfiles.staff;
