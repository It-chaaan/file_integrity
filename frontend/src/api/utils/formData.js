/**
 * FormData Utility
 * 
 * Provides helper functions for creating and managing FormData objects
 * Reduces code duplication across file upload operations
 */

/**
 * Create a FormData object from a file and metadata
 * Handles file appending and JSON serialization of nested objects
 * 
 * @param {File} file - The file to upload
 * @param {Object} metadata - Metadata fields to include
 * @param {string} fileFieldName - Name of the file field (default: 'file')
 * @returns {FormData} - Formatted FormData object
 * 
 * @example
 * const formData = createFormDataFromFile(file, {
 *   title: 'My Document',
 *   document_type: 'PDF',
 *   description: 'A test document'
 * });
 */
export const createFormDataFromFile = (file, metadata = {}, fileFieldName = 'file') => {
  const formData = new FormData();
  
  // Append the file
  formData.append(fileFieldName, file);
  
  // Append metadata
  Object.entries(metadata).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return; // Skip null/undefined values
    }
    
    // Serialize objects to JSON
    if (typeof value === 'object' && !(value instanceof File)) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value);
    }
  });
  
  return formData;
};

/**
 * Create FormData from multiple files
 * Useful for batch operations
 * 
 * @param {Array<File>} files - Array of files to upload
 * @param {Object} sharedMetadata - Metadata fields applied to all files
 * @param {string} fileFieldName - Name of the files field (default: 'files')
 * @returns {FormData} - Formatted FormData object
 * 
 * @example
 * const formData = createFormDataFromFiles(
 *   [file1, file2, file3],
 *   { document_type: 'PDF' }
 * );
 */
export const createFormDataFromFiles = (files, sharedMetadata = {}, fileFieldName = 'files') => {
  const formData = new FormData();
  
  // Append all files
  files.forEach((file) => {
    formData.append(fileFieldName, file);
  });
  
  // Append shared metadata
  Object.entries(sharedMetadata).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      return;
    }
    
    if (typeof value === 'object' && !(value instanceof File)) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value);
    }
  });
  
  return formData;
};

/**
 * Create multipart FormData config for axios
 * Configures proper headers and encoding for file uploads
 * 
 * @param {Object} options - Configuration options
 * @param {Function} options.onUploadProgress - Progress callback (optional)
 * @param {Object} options.headers - Additional headers (optional)
 * @returns {Object} - Axios config object
 * 
 * @example
 * const config = createFormDataConfig({
 *   onUploadProgress: (progress) => updateProgress(progress)
 * });
 */
export const createFormDataConfig = (options = {}) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...options.headers,
    },
  };
  
  // Add progress callback if provided
  if (options.onUploadProgress) {
    config.onUploadProgress = (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      options.onUploadProgress(percentCompleted);
    };
  }
  
  return config;
};

/**
 * Validate file before upload
 * Checks file size, type, and other constraints
 * 
 * @param {File} file - File to validate
 * @param {Object} constraints - Validation constraints
 * @param {number} constraints.maxSize - Maximum file size in bytes
 * @param {Array<string>} constraints.allowedTypes - Allowed MIME types
 * @param {string} constraints.minSize - Minimum file size in bytes (optional)
 * @returns {Object} - { valid: boolean, errors: Array<string> }
 * 
 * @example
 * const validation = validateFile(file, {
 *   maxSize: 10 * 1024 * 1024, // 10MB
 *   allowedTypes: ['application/pdf', 'image/jpeg']
 * });
 */
export const validateFile = (file, constraints = {}) => {
  const errors = [];
  
  if (!file) {
    errors.push('No file provided');
    return { valid: false, errors };
  }
  
  // Check file size
  if (constraints.maxSize && file.size > constraints.maxSize) {
    const maxMB = (constraints.maxSize / (1024 * 1024)).toFixed(2);
    errors.push(`File size exceeds maximum limit of ${maxMB}MB`);
  }
  
  if (constraints.minSize && file.size < constraints.minSize) {
    const minKB = (constraints.minSize / 1024).toFixed(2);
    errors.push(`File size must be at least ${minKB}KB`);
  }
  
  // Check file type
  if (constraints.allowedTypes && !constraints.allowedTypes.includes(file.type)) {
    errors.push(
      `File type not allowed. Accepted types: ${constraints.allowedTypes.join(', ')}`
    );
  }
  
  return { valid: errors.length === 0, errors };
};

/**
 * Validate multiple files
 * Applies same validation to multiple files
 * 
 * @param {Array<File>} files - Files to validate
 * @param {Object} constraints - Validation constraints
 * @returns {Object} - { valid: boolean, errors: Map<string, Array<string>> }
 * 
 * @example
 * const validation = validateFiles([file1, file2], {
 *   maxSize: 5 * 1024 * 1024
 * });
 */
export const validateFiles = (files, constraints = {}) => {
  const errors = new Map();
  let valid = true;
  
  files.forEach((file) => {
    const result = validateFile(file, constraints);
    if (!result.valid) {
      errors.set(file.name, result.errors);
      valid = false;
    }
  });
  
  return { valid, errors };
};

/**
 * Get file info summary
 * Returns human-readable file information
 * 
 * @param {File} file - File to get info for
 * @returns {Object} - File info object
 */
export const getFileInfo = (file) => {
  if (!file) return null;
  
  const sizeInKB = (file.size / 1024).toFixed(2);
  const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
  
  return {
    name: file.name,
    type: file.type,
    size: file.size,
    sizeKB: sizeInKB,
    sizeMB: sizeInMB,
    lastModified: new Date(file.lastModified).toLocaleString(),
    extension: file.name.split('.').pop(),
  };
};

export default {
  createFormDataFromFile,
  createFormDataFromFiles,
  createFormDataConfig,
  validateFile,
  validateFiles,
  getFileInfo,
};
