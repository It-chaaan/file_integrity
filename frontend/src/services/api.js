// API Service Stub
// Backend will be integrated later
/* eslint-disable no-unused-vars */

const API_BASE_URL = 'https://api.parity.gov';

export const api = {
  // Authentication
  login: async (username, password) => {
    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, token: 'mock-token' });
      }, 500);
    });
  },

  verify2FA: async (code) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 500);
    });
  },

  // Documents
  getDocuments: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, data: [] });
      }, 500);
    });
  },

  uploadDocument: async (_file, _metadata) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, documentId: 'DOC-2026-XXXXX' });
      }, 1500);
    });
  },

  verifyDocument: async (_file) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          hash: 'd4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35',
          signature: '3045022100f1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0'
        });
      }, 2000);
    });
  },

  // Profile Management
  getProfile: async (userId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: {
            id: userId,
            name: '',
            email: '',
            department: '',
            role: '',
            photo: null
          }
        });
      }, 500);
    });
  },

  updateProfile: async (userId, profileData) => {
    // profileData: { name, email, department, role, photo }
    return new Promise((resolve) => {
      setTimeout(() => {
        // Validate .gov email
        if (!profileData.email.toLowerCase().endsWith('.gov')) {
          resolve({
            success: false,
            error: 'Email must use a .gov domain'
          });
          return;
        }
        resolve({
          success: true,
          message: 'Profile updated successfully',
          data: profileData
        });
      }, 800);
    });
  },

  changePassword: async (userId, passwordData) => {
    // passwordData: { currentPassword, newPassword, confirmPassword }
    return new Promise((resolve) => {
      setTimeout(() => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          resolve({
            success: false,
            error: 'New password and confirmation do not match'
          });
          return;
        }
        if (passwordData.newPassword.length < 8) {
          resolve({
            success: false,
            error: 'Password must be at least 8 characters'
          });
          return;
        }
        resolve({
          success: true,
          message: 'Password changed successfully'
        });
      }, 800);
    });
  },

  uploadProfilePhoto: async (userId, file) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
          resolve({
            success: false,
            error: 'Invalid image format. Allowed: JPEG, PNG, GIF, WebP'
          });
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          resolve({
            success: false,
            error: 'Image must be less than 5MB'
          });
          return;
        }
        resolve({
          success: true,
          message: 'Photo uploaded successfully',
          photoUrl: `/api/users/${userId || 'user'}/photo`
        });
      }, 1200);
    });
  },

  removeProfilePhoto: async (userId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Photo removed successfully'
        });
      }, 500);
    });
  },

  // Users
  getUsers: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, data: [] });
      }, 500);
    });
  },

  // Tickets
  getTickets: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, data: [] });
      }, 500);
    });
  },

  // Logs
  getLogs: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, data: [] });
      }, 500);
    });
  }
};

export default api;