import * as adapter from '../api/adapter';

const USER_STORAGE_KEY = import.meta.env.VITE_USER_STORAGE_KEY || 'parity_current_user';

const saveUser = (user) => {
  if (!user) return;
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

const clearUser = () => {
  localStorage.removeItem(USER_STORAGE_KEY);
};

const readUser = () => {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    clearUser();
    return null;
  }
};

/**
 * Initialize authentication system
 * Call this on app startup
 */
export const initAuth = () => {
  adapter.initializeApp();

  if (!adapter.isAuthenticated()) {
    clearUser();
  }
};

/**
 * Login with username and password
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<Object>} Session data with user info
 */
export const login = async (username, password) => {
  const loginResponse = await adapter.login(username, password);

  const responseUser = loginResponse?.user || null;
  if (responseUser) {
    saveUser(responseUser);
    return { ...loginResponse, user: responseUser };
  }

  try {
    const profile = await adapter.getCurrentUser();
    if (profile) {
      saveUser(profile);
      return { ...loginResponse, user: profile };
    }
  } catch {
    // If profile endpoint is unavailable right after login, return login response as-is.
  }

  return loginResponse;
};

/**
 * Verify 2FA code
 * @param {string} code - 6-digit verification code
 * @returns {Promise<Object>} Verification result
 */
export const verify2FA = async (code) => {
  const verification = await adapter.verify2FA(code);
  const responseUser = verification?.user || null;

  if (responseUser) {
    saveUser(responseUser);
    return verification;
  }

  try {
    const profile = await adapter.getCurrentUser();
    if (profile) {
      saveUser(profile);
    }
  } catch {
    // Keep flow resilient if profile fetch fails; guarded routes still rely on token.
  }

  return verification;
};

/**
 * Logout current user
 * Clears session data and tokens
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    return await adapter.logout();
  } finally {
    clearUser();
  }
};

/**
 * Get current authenticated user
 * Returns user profile/session data
 * @returns {Object|null} User data cached from backend profile
 */
export const getCurrentUser = () => readUser();

/**
 * Refreshes user profile from backend and updates cached auth user.
 * @returns {Promise<Object|null>}
 */
export const refreshCurrentUser = async () => {
  try {
    const user = await adapter.getCurrentUser();
    if (user) {
      saveUser(user);
      return user;
    }
    return null;
  } catch {
    return readUser();
  }
};

/**
 * Get current session from token and cached user data.
 * @returns {Object|null} Session object or null if not authenticated
 */
export const getCurrentSession = () => {
  if (!adapter.isAuthenticated()) {
    return null;
  }

  return {
    verified: true,
    user: readUser(),
  };
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return adapter.isAuthenticated();
};

/**
 * Check if user has required role
 * @param {string} requiredRole - 'admin', 'staff', or 'public'
 * @returns {boolean}
 */
export const hasRole = (requiredRole) => {
  const user = readUser();
  if (!user) return false;

  const roleHierarchy = { admin: 3, staff: 2, public: 1 };
  const userRole = String(user.role || '').toLowerCase();
  const expectedRole = String(requiredRole || '').toLowerCase();

  return (roleHierarchy[userRole] || 0) >= (roleHierarchy[expectedRole] || 0);
};

/**
 * Change user password
 * @param {Object} passwordData 
 * @param {string} passwordData.old_password - Current password
 * @param {string} passwordData.new_password - New password
 * @param {string} passwordData.new_password2 - Password confirmation
 * @returns {Promise<Object>}
 */
export const changePassword = async (passwordData) => {
  return await adapter.changePassword(passwordData);
};

// Export everything for backward compatibility
export default {
  initAuth,
  login,
  verify2FA,
  logout,
  getCurrentUser,
  refreshCurrentUser,
  getCurrentSession,
  isAuthenticated,
  hasRole,
  changePassword,
};
