// Mock Authentication Service
const MOCK_USERS = {
  admin: { username: 'admin', password: 'admin123', role: 'admin', name: 'Christian', email: 'christian@parity.gov', id: 'USR-ADM-001' },
  staff: { username: 'staff', password: 'staff123', role: 'staff', name: 'Martin', email: 'martin@parity.gov', id: 'USR-STF-012' },
};

const SESSION_KEY = 'parity_session';
const USERS_KEY = 'parity_users';

// Initialize default users in localStorage
export const initializeMockUsers = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(MOCK_USERS));
  }
};

// Simulate network delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Login
export const mockLogin = async (username, password) => {
  await delay(800);
  
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
  const user = users[username];
  
  if (!user || user.password !== password) {
    throw new Error('Invalid credentials');
  }
  
  const session = {
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token: `mock_token_${Date.now()}`,
    loginTime: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
};

// Verify 2FA (mock)
export const mockVerify2FA = async (code) => {
  await delay(600);
  
  // Accept any 6-digit code
  if (code.length !== 6) {
    throw new Error('Invalid 2FA code');
  }
  
  const session = JSON.parse(localStorage.getItem(SESSION_KEY));
  if (!session) {
    throw new Error('No active session');
  }
  
  session.verified = true;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
};

// Get current session
export const getCurrentSession = () => {
  const session = localStorage.getItem(SESSION_KEY);
  if (!session) return null;
  
  try {
    const parsed = JSON.parse(session);
    
    // Check if expired
    if (new Date(parsed.expiresAt) < new Date()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    
    return parsed;
  } catch (error) {
    return null;
  }
};

// Check if authenticated
export const isAuthenticated = () => {
  const session = getCurrentSession();
  return session !== null && session.verified === true;
};

// Check role
export const hasRole = (requiredRole) => {
  const session = getCurrentSession();
  if (!session) return false;
  
  const roleHierarchy = { admin: 3, staff: 2, public: 1 };
  return roleHierarchy[session.user.role] >= roleHierarchy[requiredRole];
};

// Logout
export const mockLogout = () => {
  localStorage.removeItem(SESSION_KEY);
  // Clear other session data if needed
  sessionStorage.clear();
};

// Get current user
export const getCurrentUser = () => {
  const session = getCurrentSession();
  return session?.user || null;
};
