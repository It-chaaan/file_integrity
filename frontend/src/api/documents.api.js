/**
 * Documents API Module
 * 
 * This module handles all document-related API calls to the Django REST Framework backend.
 * Manages document verification, upload, retrieval, and integrity checking operations.
 * 
 * Endpoints managed:
 * - Upload documents with metadata
 * - Verify document integrity (hash verification)
 * - Retrieve document list with filtering
 * - Get single document details
 * - Update document metadata
 * - Delete documents
 * - Download documents
 * - Search documents by various criteria
 * 
 * Note: File uploads use FormData to support multipart/form-data encoding
 */

import apiClient from './client';

/**
 * Get paginated list of documents with optional filters
 * 
 * @param {Object} params - Query parameters for filtering and pagination
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.page_size - Items per page (default: 10)
 * @param {string} params.search - Search query
 * @param {string} params.status - Filter by status (verified, pending, failed)
 * @param {string} params.document_type - Filter by document type
 * @param {string} params.date_from - Filter from date (YYYY-MM-DD)
 * @param {string} params.date_to - Filter to date (YYYY-MM-DD)
 * @param {string} params.ordering - Sort field (e.g., '-created_at' for descending)
 * @returns {Promise<Object>} Paginated documents list
 * @throws {Error} If request fails
 */
export const getDocuments = async (params = {}) => {
  try {
    const response = await apiClient.get('/v1/documents/', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get single document by ID
 * 
 * @param {string|number} documentId - Document ID
 * @returns {Promise<Object>} Document details
 * @throws {Error} If document not found or request fails
 */
export const getDocumentById = async (documentId) => {
  try {
    const response = await apiClient.get(`/v1/documents/${documentId}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Upload a new document with metadata
 * Handles file upload with multipart/form-data
 * 
 * @param {Object} uploadData - Document upload data
 * @param {File} uploadData.file - File object from input
 * @param {string} uploadData.title - Document title
 * @param {string} uploadData.document_type - Type of document
 * @param {string} uploadData.description - Document description (optional)
 * @param {Object} uploadData.metadata - Additional metadata (optional)
 * @param {Function} onUploadProgress - Progress callback (optional)
 * @returns {Promise<Object>} Created document with hash and ID
 * @throws {Error} If upload fails
 */
export const uploadDocument = async (uploadData, onUploadProgress = null) => {
  try {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', uploadData.file);
    formData.append('title', uploadData.title);
    formData.append('document_type', uploadData.document_type);
    
    if (uploadData.description) {
      formData.append('description', uploadData.description);
    }
    
    if (uploadData.metadata) {
      formData.append('metadata', JSON.stringify(uploadData.metadata));
    }

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    // Add progress callback if provided
    if (onUploadProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percentCompleted);
      };
    }

    const response = await apiClient.post('/v1/documents/', formData, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Verify a document's integrity by comparing its hash
 * Uploads a file to check if it matches any existing document in the registry
 * 
 * @param {File} file - File object to verify
 * @returns {Promise<Object>} Verification result with match status, hash, and original document
 * @throws {Error} If verification fails
 */
export const verifyDocument = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/v1/documents/verify/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update document metadata
 * Note: Cannot update the actual file, only metadata
 * 
 * @param {string|number} documentId - Document ID
 * @param {Object} updateData - Fields to update
 * @param {string} updateData.title - Document title
 * @param {string} updateData.description - Document description
 * @param {string} updateData.document_type - Document type
 * @param {Object} updateData.metadata - Additional metadata
 * @returns {Promise<Object>} Updated document data
 * @throws {Error} If update fails
 */
export const updateDocument = async (documentId, updateData) => {
  try {
    const response = await apiClient.patch(`/v1/documents/${documentId}/`, updateData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a document
 * Permanently removes document and associated file from system
 * 
 * @param {string|number} documentId - Document ID to delete
 * @returns {Promise<void>} No content on success
 * @throws {Error} If deletion fails
 */
export const deleteDocument = async (documentId) => {
  try {
    const response = await apiClient.delete(`/v1/documents/${documentId}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Download a document file
 * Returns the file blob for download
 * 
 * @param {string|number} documentId - Document ID
 * @returns {Promise<Blob>} File blob
 * @throws {Error} If download fails
 */
export const downloadDocument = async (documentId) => {
  try {
    const response = await apiClient.get(`/v1/documents/${documentId}/download/`, {
      responseType: 'blob', // Important for file downloads
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get document verification history
 * Returns all verification attempts for a specific document
 * 
 * @param {string|number} documentId - Document ID
 * @returns {Promise<Array>} Array of verification records
 * @throws {Error} If request fails
 */
export const getDocumentVerifications = async (documentId) => {
  try {
    const response = await apiClient.get(`/v1/documents/${documentId}/verifications/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Search documents by hash
 * Useful for checking if a specific file hash exists in the registry
 * 
 * @param {string} hash - SHA-256 hash of the document
 * @returns {Promise<Object>} Document matching the hash
 * @throws {Error} If not found or request fails
 */
export const searchDocumentByHash = async (hash) => {
  try {
    const response = await apiClient.get('/v1/documents/search-by-hash/', {
      params: { hash },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Batch verify multiple documents
 * Upload multiple files to verify at once
 * 
 * @param {Array<File>} files - Array of file objects
 * @returns {Promise<Array>} Array of verification results
 * @throws {Error} If verification fails
 */
export const batchVerifyDocuments = async (files) => {
  try {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append(`files`, file);
    });

    const response = await apiClient.post('/v1/documents/batch-verify/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get document statistics
 * Returns summary statistics about documents in the system
 * 
 * @returns {Promise<Object>} Statistics (total, verified, pending, failed, etc.)
 * @throws {Error} If request fails
 */
export const getDocumentStats = async () => {
  try {
    const response = await apiClient.get('/v1/documents/stats/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get document types
 * Returns available document type options
 * 
 * @returns {Promise<Array>} Array of document types
 * @throws {Error} If request fails
 */
export const getDocumentTypes = async () => {
  try {
    const response = await apiClient.get('/v1/documents/types/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Export all document functions as a grouped object for convenience
export default {
  getDocuments,
  getDocumentById,
  uploadDocument,
  verifyDocument,
  updateDocument,
  deleteDocument,
  downloadDocument,
  getDocumentVerifications,
  searchDocumentByHash,
  batchVerifyDocuments,
  getDocumentStats,
  getDocumentTypes,
};
