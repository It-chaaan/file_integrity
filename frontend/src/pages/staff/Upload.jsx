import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocuments } from '../../hooks/useData';
import { getCurrentUser } from '../../services/mockAuth';
import { generateHash, shortHash, generateDocumentId, formatFileSize, validateFileType, validateFileSize } from '../../services/utils';
import { mockLogService } from '../../services/mockStorage';

function Upload() {
  const navigate = useNavigate();
  const { createDocument } = useDocuments();
  const currentUser = getCurrentUser();
  
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    department: ''
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const [error, setError] = useState('');

  const documentTypes = [
    'Business Permit',
    'BIR Certificate',
    'Tax Certificate',
    'License',
    'Clearance',
    'Contract',
    'Resolution',
    'Ordinance',
    'Other'
  ];

  const departments = [
    'Business Affairs',
    'Treasury',
    'Legal',
    'IT Department',
    'Human Resources',
    'Finance',
    'Health Services',
    'Engineering'
  ];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError('');
    
    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Validate file type
    if (!validateFileType(selectedFile, ['pdf', 'image'])) {
      setError('Invalid file type. Please upload PDF or image files only.');
      setFile(null);
      return;
    }

    // Validate file size (10MB max)
    if (!validateFileSize(selectedFile, 10)) {
      setError('File size exceeds 10MB limit.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    
    // Auto-fill title if empty
    if (!formData.title) {
      const fileName = selectedFile.name.replace(/\.[^/.]+$/, '');
      setFormData(prev => ({ ...prev, title: fileName }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUploadProgress(0);

    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);

    try {
      // Simulate file upload with progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Generate hash for the file
      const hash = generateHash(file);
      const docId = generateDocumentId();

      // Create document record
      const newDocument = {
        id: docId,
        title: formData.title,
        type: formData.type,
        department: formData.department,
        uploadedBy: currentUser?.name || 'Unknown',
        date: new Date().toISOString().split('T')[0],
        hash: hash,
        shortHash: shortHash(hash),
        status: 'Active',
        size: formatFileSize(file.size),
        uploadDate: new Date().toISOString().replace('T', ' ').split('.')[0],
        signature: '3045022100' + hash.substring(0, 56),
        fileName: file.name,
        fileType: file.type
      };

      // Wait for "upload" to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Save to mock storage
      await createDocument(newDocument);

      // Log the upload
      await mockLogService.create({
        userId: currentUser?.id || 'UNKNOWN',
        userName: currentUser?.name || 'Unknown',
        ip: '192.168.1.' + Math.floor(Math.random() * 255),
        action: 'DOCUMENT_UPLOAD',
        details: `Uploaded ${file.name}`,
        status: 'Success'
      });

      setUploadedDoc(newDocument);

      // Reset form after a delay
      setTimeout(() => {
        setFile(null);
        setFormData({ title: '', type: '', department: '' });
        setUploadProgress(0);
      }, 3000);

    } catch (err) {
      setError('Upload failed: ' + err.message);
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setFormData({ title: '', type: '', department: '' });
    setUploadProgress(0);
    setUploadedDoc(null);
    setError('');
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="mb-1">Upload Document</h2>
        <p className="text-muted">Upload and register new documents for verification</p>
      </div>

      <div className="row">
        {/* Upload Form */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {/* File Upload */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Document File *</label>
                  <div className="border-2 border-dashed rounded p-4 text-center" style={{ borderColor: '#e0e0e0', backgroundColor: '#fafafa' }}>
                    <input
                      type="file"
                      id="fileInput"
                      className="d-none"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      disabled={uploading}
                    />
                    <label htmlFor="fileInput" className="w-100" style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}>
                      {file ? (
                        <div>
                          <i className="bi bi-file-earmark-check text-success" style={{ fontSize: '3rem' }}></i>
                          <p className="mt-2 mb-1 fw-semibold">{file.name}</p>
                          <p className="text-muted small mb-0">{formatFileSize(file.size)}</p>
                        </div>
                      ) : (
                        <div>
                          <i className="bi bi-cloud-upload text-muted" style={{ fontSize: '3rem' }}></i>
                          <p className="mt-2 mb-1">Click to select file or drag and drop</p>
                          <p className="text-muted small mb-0">PDF, JPG, PNG up to 10MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Title */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Document Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter document title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    disabled={uploading}
                  />
                </div>

                {/* Type */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Document Type *</label>
                  <select
                    className="form-select"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                    disabled={uploading}
                  >
                    <option value="">Select document type</option>
                    {documentTypes.map((type, idx) => (
                      <option key={idx} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Department */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Department *</label>
                  <select
                    className="form-select"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                    disabled={uploading}
                  >
                    <option value="">Select department</option>
                    {departments.map((dept, idx) => (
                      <option key={idx} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="alert alert-danger">
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {error}
                  </div>
                )}

                {/* Upload Progress */}
                {uploading && (
                  <div className="mb-4">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="small">Uploading...</span>
                      <span className="small fw-semibold">{uploadProgress}%</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div
                        className="progress-bar progress-bar-striped progress-bar-animated"
                        role="progressbar"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {uploadedDoc && uploadProgress === 100 && (
                  <div className="alert alert-success">
                    <i className="bi bi-check-circle me-2"></i>
                    Document uploaded successfully!
                    <div className="mt-2 small">
                      <strong>Document ID:</strong> {uploadedDoc.id}<br />
                      <strong>Hash:</strong> <code>{uploadedDoc.shortHash}</code>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={uploading || !file}
                  >
                    {uploading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-cloud-upload me-2"></i>
                        Upload Document
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleReset}
                    disabled={uploading}
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body">
              <h6 className="card-title">
                <i className="bi bi-info-circle me-2"></i>
                Upload Guidelines
              </h6>
              <ul className="small mb-0">
                <li>Maximum file size: 10MB</li>
                <li>Supported formats: PDF, JPG, PNG</li>
                <li>Each document gets a unique hash</li>
                <li>Hash is used for verification</li>
                <li>All uploads are logged</li>
              </ul>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h6 className="card-title">
                <i className="bi bi-shield-check me-2"></i>
                Security Features
              </h6>
              <ul className="small mb-0">
                <li>SHA-256 hash generation</li>
                <li>ECDSA digital signatures</li>
                <li>Tamper detection</li>
                <li>Audit trail logging</li>
                <li>Role-based access</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Upload;