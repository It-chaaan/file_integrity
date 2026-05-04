/**
 * Example React Component - Document Upload
 * 
 * This component demonstrates how to use the API layer in a React component.
 * It shows proper patterns for:
 * - Importing API functions
 * - Managing loading and error states
 * - Handling async operations
 * - Displaying feedback to users
 * - File upload with progress tracking
 * 
 * This example can be adapted for any API function in the system.
 */

import React, { useState, useEffect } from 'react';
import {
  uploadDocument,
  getDocuments,
  verifyDocument,
  getDocumentTypes,
} from '../api';

const DocumentUploadExample = () => {
  // State management
  const [documents, setDocuments] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [verificationResult, setVerificationResult] = useState(null);
  const [verificationReference, setVerificationReference] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    file: null,
    title: '',
    document_type: '',
    description: '',
  });

  /**
   * Fetch document types on component mount
   * Demonstrates GET request with useEffect
   */
  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        const types = await getDocumentTypes();
        setDocumentTypes(types);
      } catch (error) {
        console.error('Failed to fetch document types:', error);
      }
    };

    fetchDocumentTypes();
  }, []);

  /**
   * Fetch documents list with pagination
   * Demonstrates GET request with query parameters
   */
  const fetchDocuments = async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getDocuments({
        page,
        page_size: 10,
        ordering: '-created_at', // Sort by newest first
      });

      setDocuments(response.results);
    } catch (error) {
      setError(error.message || 'Failed to fetch documents');
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle file input change
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, file });
    }
  };

  /**
   * Handle form input changes
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  /**
   * Handle document upload
   * Demonstrates POST request with file upload and progress tracking
   */
  const handleUpload = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.file) {
      setError('Please select a file');
      return;
    }

    if (!formData.title || !formData.document_type) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Upload with progress tracking
      const result = await uploadDocument(
        formData,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      // Success!
      alert(`Document uploaded successfully! ID: ${result.id}`);
      
      // Reset form
      setFormData({
        file: null,
        title: '',
        document_type: '',
        description: '',
      });
      
      // Refresh documents list
      fetchDocuments();
    } catch (error) {
      setError(error.message || 'Failed to upload document');
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  /**
   * Handle document verification
   * Demonstrates POST request with file upload
   */
  const handleVerify = async (e) => {
    e.preventDefault();

    if (!formData.file || !verificationReference) {
      setError('Please select a file and reference number to verify');
      return;
    }

    setLoading(true);
    setError(null);
    setVerificationResult(null);

    try {
      const result = await verifyDocument(formData.file, verificationReference.trim());
      setVerificationResult(result);

      if (result.isAuthentic) {
        alert('✓ Document verified! This file exists in the registry.');
      } else {
        alert('✗ Document not found in registry.');
      }
    } catch (error) {
      setError(error.message || 'Verification failed');
      console.error('Verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Render the component
   */
  return (
    <div className="document-upload-example">
      <h2>Document Upload Example</h2>

      {/* Error Display */}
      {error && (
        <div className="alert alert-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Upload Form */}
      <div className="card">
        <h3>Upload Document</h3>
        <form onSubmit={handleUpload}>
          <div className="form-group">
            <label htmlFor="file">File *</label>
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              disabled={loading}
              accept=".pdf,.doc,.docx"
            />
          </div>

          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Document title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="document_type">Document Type *</label>
            <select
              id="document_type"
              name="document_type"
              value={formData.document_type}
              onChange={handleInputChange}
              disabled={loading}
              required
            >
              <option value="">Select type</option>
              {documentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Optional description"
              rows={3}
            />
          </div>

          {/* Upload Progress */}
          {uploadProgress > 0 && (
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${uploadProgress}%` }}
              >
                {uploadProgress}%
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload Document'}
            </button>
            <input
              type="text"
              className="reference-input"
              placeholder="Reference number"
              value={verificationReference}
              onChange={(event) => setVerificationReference(event.target.value)}
              disabled={loading}
            />
            <button
              type="button"
              onClick={handleVerify}
              disabled={loading || !formData.file || !verificationReference}
            >
              {loading ? 'Verifying...' : 'Verify Document'}
            </button>
          </div>
        </form>
      </div>

      {/* Verification Result */}
      {verificationResult && (
        <div className="card">
          <h3>Verification Result</h3>
          <div className={`result ${verificationResult.isAuthentic ? 'success' : 'warning'}`}>
            <p>
              <strong>Status:</strong>{' '}
              {verificationResult.isAuthentic ? '✓ Verified' : '✗ Not Found'}
            </p>
            <p>
              <strong>Hash:</strong> <code>{verificationResult.hash}</code>
            </p>
            {verificationResult.referenceNumber && (
              <div>
                <p>
                  <strong>Reference:</strong> {verificationResult.referenceNumber}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Documents List */}
      <div className="card">
        <h3>Recent Documents</h3>
        <button onClick={() => fetchDocuments()} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh List'}
        </button>

        {loading ? (
          <p>Loading documents...</p>
        ) : documents.length === 0 ? (
          <p>No documents found.</p>
        ) : (
          <table className="documents-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Status</th>
                <th>Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td>{doc.title}</td>
                  <td>{doc.document_type}</td>
                  <td>
                    <span className={`badge badge-${doc.status}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td>{new Date(doc.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DocumentUploadExample;

/**
 * Additional Usage Examples
 * 
 * 1. Using Authentication API:
 * 
 * import { login, logout, getUserProfile } from '@/api';
 * 
 * const handleLogin = async (username, password) => {
 *   try {
 *     const response = await login(username, password);
 *     console.log('Logged in:', response.user);
 *     // Tokens are automatically stored
 *   } catch (error) {
 *     console.error('Login failed:', error.message);
 *   }
 * };
 * 
 * 
 * 2. Using Tickets API:
 * 
 * import { createTicket, getTickets, addTicketComment } from '@/api';
 * 
 * const handleCreateTicket = async () => {
 *   try {
 *     const ticket = await createTicket({
 *       subject: 'Need help with document verification',
 *       description: 'I am unable to verify my document...',
 *       category: 'technical',
 *       priority: 'high',
 *     });
 *     console.log('Ticket created:', ticket.id);
 *   } catch (error) {
 *     console.error('Failed to create ticket:', error);
 *   }
 * };
 * 
 * 
 * 3. Using Users API (Admin):
 * 
 * import { getUsers, updateUserRole } from '@/api';
 * 
 * const handleChangeUserRole = async (userId, newRole) => {
 *   try {
 *     await updateUserRole(userId, newRole);
 *     alert('User role updated successfully');
 *   } catch (error) {
 *     alert('Failed to update role: ' + error.message);
 *   }
 * };
 * 
 * 
 * 4. Error Handling Pattern:
 * 
 * const safeApiCall = async (apiFunction, ...args) => {
 *   setLoading(true);
 *   setError(null);
 *   try {
 *     const result = await apiFunction(...args);
 *     return result;
 *   } catch (error) {
 *     setError(error.message);
 *     return null;
 *   } finally {
 *     setLoading(false);
 *   }
 * };
 * 
 * // Usage
 * const data = await safeApiCall(getDocuments, { page: 1 });
 * 
 * 
 * 5. Custom Hook Example:
 * 
 * import { useState, useEffect } from 'react';
 * import { getDocuments } from '@/api';
 * 
 * const useDocuments = (filters = {}) => {
 *   const [documents, setDocuments] = useState([]);
 *   const [loading, setLoading] = useState(true);
 *   const [error, setError] = useState(null);
 * 
 *   useEffect(() => {
 *     const fetchData = async () => {
 *       setLoading(true);
 *       try {
 *         const data = await getDocuments(filters);
 *         setDocuments(data.results);
 *       } catch (error) {
 *         setError(error.message);
 *       } finally {
 *         setLoading(false);
 *       }
 *     };
 * 
 *     fetchData();
 *   }, [JSON.stringify(filters)]);
 * 
 *   return { documents, loading, error };
 * };
 * 
 * // Usage in component
 * const MyComponent = () => {
 *   const { documents, loading, error } = useDocuments({ status: 'verified' });
 *   // ... render logic
 * };
 */
