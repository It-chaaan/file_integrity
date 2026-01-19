// API Service Stub
// Backend will be integrated later

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

  uploadDocument: async (file, metadata) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, documentId: 'DOC-2026-XXXXX' });
      }, 1500);
    });
  },

  verifyDocument: async (file) => {
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