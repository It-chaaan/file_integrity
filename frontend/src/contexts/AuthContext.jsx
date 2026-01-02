import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user was previously logged in
    const savedAuth = localStorage.getItem('parity_auth');
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        setIsAuthenticated(true);
        setUser(authData.user);
      } catch (err) {
        console.error('Failed to restore auth:', err);
        localStorage.removeItem('parity_auth');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    // Simulate authentication - replace with actual API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Demo: accept any credentials for now
        if (username && password) {
          const userData = {
            username,
            role: 'admin',
            signedBy: 'Admin_01'
          };
          setIsAuthenticated(true);
          setUser(userData);
          
          // Save to localStorage
          localStorage.setItem('parity_auth', JSON.stringify({ user: userData }));
          
          resolve({ success: true });
        } else {
          reject({ success: false, message: 'Invalid credentials' });
        }
      }, 700);
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('parity_auth');
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};