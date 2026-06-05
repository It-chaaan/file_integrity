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
import { mergeQueryParams } from './utils/axiosConfig';
import { withErrorContext } from './utils/errorContext';
import {
  createFormDataConfig,
  createFormDataFromFile,
  createFormDataFromFiles,
  validateFile,
  validateFiles,
} from './utils/formData';

/**
 * Get paginated list of documents with optional filters (supports page_size and pageSize).
 *
 * @param {Object} params
 * @param {number} [params.page=1] - Page number.
 * @param {number} [params.page_size] - Legacy page size key.
 * @param {number} [params.pageSize] - Page size (preferred key).
 * @param {string} [params.search] - Search query.
 * @param {string} [params.status] - Status filter (verified|pending|failed).
 * @param {string} [params.document_type] - Document type filter.
 * @param {string} [params.date_from] - From date (YYYY-MM-DD).
 * @param {string} [params.date_to] - To date (YYYY-MM-DD).
 * @param {string} [params.ordering='-created_at'] - Sort field.
 * @returns {Promise<Object>} Paginated documents list.
 */
export const getDocuments = async (params = {}) => {
  const { page, page_size: pageSizeLegacy, pageSize, ordering, search, ...filters } = params;
  const pageSizeValue = pageSize || pageSizeLegacy;

  const queryParams = mergeQueryParams({
    pagination: { page, pageSize: pageSizeValue, ordering },
    filters,
    search,
  });

  const response = await withErrorContext(
    () => apiClient.get('/v1/documents/', { params: queryParams }),
    'documents.list',
    { resource: 'documents', action: 'list' }
  );

  return response.data;
};

/**
 * Get single document by ID
 * 
 * @param {string|number} documentId - Document ID
 * @returns {Promise<Object>} Document details
 * @throws {Error} If document not found or request fails
 */
export const getDocumentById = async (documentId) => {
  const response = await withErrorContext(
    () => apiClient.get(`/v1/documents/${documentId}/`),
    'documents.detail',
    { resource: 'document', action: 'fetch', resourceId: documentId }
  );

  return response.data;
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
 * @param {Object} constraints - Optional validation constraints (maxSize, minSize, allowedTypes)
 * @returns {Promise<Object>} Created document with hash and ID.
 */
export const uploadDocument = async (uploadData, onUploadProgress = null, constraints = {}) => {
  const validation = validateFile(uploadData?.file, constraints);
  if (!validation.valid) {
    throw new Error(validation.errors.join('; '));
  }

  const formData = createFormDataFromFile(uploadData.file, {
    title: uploadData.title,
    document_type: uploadData.document_type,
    description: uploadData.description,
    metadata: uploadData.metadata,
  });

  const config = createFormDataConfig({ onUploadProgress });

  const response = await withErrorContext(
    () => apiClient.post('/v1/documents/', formData, config),
    'documents.upload',
    {
      resource: 'document',
      action: 'upload',
      fileName: uploadData?.file?.name,
    }
  );

  return response.data;
};

/**
 * Verify a document's integrity by reference number
 * Uploads a file to compare with the stored registry proof for the reference number
 * 
 * @param {File} file - File object to verify
 * @param {string} referenceNumber - Document reference number
 * @param {Object} constraints - Optional validation constraints (maxSize, minSize, allowedTypes)
 * @returns {Promise<Object>} Verification result with public-safe or authenticated detail fields.
 */
export const verifyDocument = async (file, referenceNumber, constraints = {}) => {
  const validation = validateFile(file, constraints);
  if (!validation.valid) {
    throw new Error(validation.errors.join('; '));
  }

  const formData = createFormDataFromFile(file, {
    reference_number: referenceNumber,
  });
  const config = createFormDataConfig();

  const response = await withErrorContext(
    () => apiClient.post('/v1/documents/verify/', formData, config),
    'documents.verify',
    { resource: 'document', action: 'verify', fileName: file?.name, referenceNumber }
  );

  return response.data;
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
  const response = await withErrorContext(
    () => apiClient.patch(`/v1/documents/${documentId}/`, updateData),
    'documents.update',
    { resource: 'document', action: 'update', resourceId: documentId }
  );

  return response.data;
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
  const response = await withErrorContext(
    () => apiClient.delete(`/v1/documents/${documentId}/`),
    'documents.delete',
    { resource: 'document', action: 'delete', resourceId: documentId }
  );

  return response.data;
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
  const response = await withErrorContext(
    () => apiClient.get(`/v1/documents/${documentId}/download/`),
    'documents.download',
    { resource: 'document', action: 'download', resourceId: documentId }
  );

  return response.data;
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
  const response = await withErrorContext(
    () => apiClient.get(`/v1/documents/${documentId}/verifications/`),
    'documents.verifications',
    { resource: 'document', action: 'verifications', resourceId: documentId }
  );

  return response.data;
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
  const response = await withErrorContext(
    () => apiClient.get('/v1/documents/search-by-hash/', { params: { hash } }),
    'documents.searchByHash',
    { resource: 'document', action: 'searchByHash' }
  );

  return response.data;
};

/**
 * Batch verify multiple documents
 * Upload multiple files to verify at once
 * 
 * @param {Array<File>} files - Array of file objects
 * @param {Object} constraints - Optional validation constraints (maxSize, minSize, allowedTypes)
 * @returns {Promise<Array>} Array of verification results.
 */
export const batchVerifyDocuments = async (files, constraints = {}) => {
  const validation = validateFiles(files, constraints);
  if (!validation.valid) {
    const errorMessages = [];
    validation.errors.forEach((errs, fileName) => {
      errorMessages.push(`${fileName}: ${errs.join('; ')}`);
    });
    throw new Error(errorMessages.join(' | '));
  }

  const formData = createFormDataFromFiles(files);
  const config = createFormDataConfig();

  const response = await withErrorContext(
    () => apiClient.post('/v1/documents/batch-verify/', formData, config),
    'documents.batchVerify',
    { resource: 'documents', action: 'batchVerify', fileCount: files?.length }
  );

  return response.data;
};

/**
 * Get document statistics
 * Returns summary statistics about documents in the system
 * 
 * @returns {Promise<Object>} Statistics (total, verified, pending, failed, etc.)
 * @throws {Error} If request fails
 */
export const getDocumentStats = async () => {
  const response = await withErrorContext(
    () => apiClient.get('/v1/documents/stats/'),
    'documents.stats',
    { resource: 'documents', action: 'stats' }
  );

  return response.data;
};

/**
 * Get document types
 * Returns available document type options
 * 
 * @returns {Promise<Array>} Array of document types
 * @throws {Error} If request fails
 */
export const getDocumentTypes = async () => {
  const response = await withErrorContext(
    () => apiClient.get('/v1/documents/types/'),
    'documents.types',
    { resource: 'documents', action: 'types' }
  );

  return response.data;
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
