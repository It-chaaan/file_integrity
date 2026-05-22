import React, { useMemo, useState } from 'react';
import { useDocuments } from '../../hooks/useData';
import { getCurrentUser } from '../../services/auth';
import { shortHash, formatFileSize, validateFileType, validateFileSize } from '../../services/utils';
import UploadArea from '../../components/UploadArea';
import SimpleStepper from '../../components/SimpleStepper';
import { verifyDocument } from '../../api/documents.api';

const DOCUMENT_CATEGORY_MAP = [
  {
    department: 'Sales & Procurement',
    types: [
      'Purchase Orders (PO)',
      'Vendor Contracts',
      'Invoices',
      'Shipping Manifests',
    ],
  },
  {
    department: 'Finance',
    types: [
      'Financial Audit Reports',
      'Tax Filings',
      'Budget Approvals',
      'Loan Agreements',
    ],
  },
  {
    department: 'Human Resources',
    types: [
      'Employment Contracts',
      'Non-Disclosure Agreements (NDA)',
      'Performance Reviews',
    ],
  },
  {
    department: 'Legal & Compliance',
    types: [
      'Intellectual Property Agreements',
      'Compliance Certificates',
      'Board Resolutions',
      'Shareholder Agreements',
    ],
  },
  {
    department: 'Operations',
    types: [
      'Data Processing Agreements (DPA)',
      'Inventory Audit Sheets',
      'Insurance Policies',
    ],
  },
  {
    department: 'IT & Risk Management',
    types: [
      'System Audit Logs',
      'Security Policies',
      'Risk Assessment Reports',
    ],
  },
];

const DOCUMENT_TYPE_TO_DEPARTMENT = DOCUMENT_CATEGORY_MAP.reduce((accumulator, group) => {
  group.types.forEach((type) => {
    accumulator[type] = group.department;
  });
  return accumulator;
}, {});

function Upload() {
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
  const [verificationResult, setVerificationResult] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | ready | uploading | verifying | complete | error
  const [error, setError] = useState('');

  const stepLabels = ['Select File', 'Enter Metadata', 'Hash & Sign', 'Complete'];

  const departmentNames = useMemo(
    () => DOCUMENT_CATEGORY_MAP.map((group) => group.department),
    []
  );

  const handleDepartmentChange = (e) => {
    const department = e.target.value;
    const typeBelongsToDepartment = DOCUMENT_TYPE_TO_DEPARTMENT[formData.type] === department;

    setFormData((prev) => ({
      ...prev,
      department,
      type: typeBelongsToDepartment ? prev.type : '',
    }));
  };

  const handleDocumentTypeChange = (e) => {
    const type = e.target.value;
    const department = DOCUMENT_TYPE_TO_DEPARTMENT[type] || '';

    setFormData((prev) => ({
      ...prev,
      type,
      department,
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError('');
    setVerificationResult(null);
    setUploadedDoc(null);
    setStatus(selectedFile ? 'ready' : 'idle');
    setUploadProgress(0);
    
    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Validate file type (PDF, DOC, DOCX, TXT only)
    if (!validateFileType(selectedFile, ['pdf', 'doc', 'docx', 'txt'])) {
      setError('Invalid file type. Allowed: PDF, DOC, DOCX, TXT.');
      setFile(null);
      return;
    }

    // Validate file size (110MB max)
    if (!validateFileSize(selectedFile, 110)) {
      setError('File size exceeds 110MB limit.');
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
    setVerificationResult(null);
    setUploadProgress(0);

    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    const docType = formData.type;

    if (!docType) {
      setError('Please specify a document type.');
      setStatus('error');
      return;
    }

    setUploading(true);
    setStatus('uploading');

    try {
      const uploadPayload = {
        file,
        title: formData.title,
        document_type: docType,
        metadata: {
          department: formData.department,
          uploaded_by: currentUser?.name || currentUser?.username || 'Unknown',
          original_name: file.name,
          original_size: file.size,
        },
      };

      const result = await createDocument(uploadPayload, {
        onProgress: (percent) => setUploadProgress(Number.isFinite(percent) ? percent : 0),
      });

      setUploadProgress((prev) => (prev < 100 ? 100 : prev));
      setUploadedDoc(result);

      setStatus('verifying');
      try {
        const referenceNumber = result?.reference_number;
        const verifyRes = await verifyDocument(file, referenceNumber);
        setVerificationResult(verifyRes);
      } catch (verificationError) {
        setVerificationResult({ error: verificationError?.message || 'Verification failed' });
      }

      setStatus('complete');

      setTimeout(() => {
        setFile(null);
        setFormData({ title: '', type: '', department: '' });
        setUploadProgress(0);
        setStatus('idle');
      }, 10000);

    } catch (error) {
      setError('Upload failed: ' + error.message);
      setUploadProgress(0);
      setStatus('error');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setFormData({ title: '', type: '', department: '' });
    setUploadProgress(0);
    setUploadedDoc(null);
    setVerificationResult(null);
    setStatus('idle');
    setError('');
  };

  return (
    <div className="upload-page">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4">
        <div>
          <h2 className="mb-1">Upload Document</h2>
          <p className="text-muted mb-0">Upload enterprise documents with compliance-ready metadata.</p>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="mb-4">
            <SimpleStepper status={status} labels={stepLabels} />
          </div>

          <div className="mb-4">
            <UploadArea
              file={file}
              onFileChange={handleFileChange}
              acceptedTypes={['pdf', 'doc', 'docx', 'txt']}
              maxSizeMB={110}
              disabled={uploading}
              error={error && !file ? error : ''}
            />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12">
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

              <div className="col-md-6">
                <label className="form-label fw-semibold">Document Type *</label>
                <select
                  className="form-select"
                  value={formData.type}
                  onChange={handleDocumentTypeChange}
                  required
                  disabled={uploading}
                >
                  <option value="">Select document type</option>
                  {DOCUMENT_CATEGORY_MAP.map((group) => (
                    <optgroup key={group.department} label={group.department}>
                      {group.types.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Department *</label>
                <select
                  className="form-select"
                  value={formData.department}
                  onChange={handleDepartmentChange}
                  required
                  disabled={uploading}
                >
                  <option value="">Select department</option>
                  {departmentNames.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            {uploading && (
              <div className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div>
                    <span className="small fw-semibold">
                      {uploadProgress < 100 ? 'Uploading & Processing...' : 'Processing...'}
                    </span>
                    {file && (
                      <span className="small text-muted ms-2">
                        {formatFileSize(file.size)}
                      </span>
                    )}
                  </div>
                  <span className="small fw-bold text-primary">{uploadProgress}%</span>
                </div>
                <div className="progress" style={{ height: '10px' }}>
                  <div
                    className="progress-bar progress-bar-striped progress-bar-animated"
                    role="progressbar"
                    style={{ width: `${uploadProgress}%` }}
                    aria-valuenow={uploadProgress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
                <div className="mt-2">
                  <p className="small text-muted mb-1">
                    <i className="bi bi-info-circle me-1"></i>
                    {uploadProgress < 30 && "Reading file and preparing upload..."}
                    {uploadProgress >= 30 && uploadProgress < 70 && "Uploading to server..."}
                    {uploadProgress >= 70 && uploadProgress < 95 && "Computing hash and generating signature..."}
                    {uploadProgress >= 95 && uploadProgress < 100 && "Finalizing upload..."}
                    {uploadProgress === 100 && "Upload complete! Verifying integrity..."}
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="alert alert-danger mt-3">
                <i className="bi bi-exclamation-circle me-2"></i>
                {error}
              </div>
            )}

            {uploadedDoc && uploadProgress === 100 && (
              <div className="alert alert-success mt-3">
                <div className="d-flex align-items-start gap-3">
                  <div className="status-icon success">
                    <i className="bi bi-check2-circle"></i>
                  </div>
                  <div className="w-100">
                    <h6 className="mb-1">Document Uploaded Successfully</h6>
                    <p className="text-muted mb-2 small">Integrity signature and hash stored for verification.</p>
                    <div className="d-flex flex-wrap gap-3 small text-muted mb-2">
                      <div><span className="text-dark fw-semibold">Reference Number:</span> {uploadedDoc.reference_number || '—'}</div>
                      <div><span className="text-dark fw-semibold">Hash:</span> {uploadedDoc.short_hash || (uploadedDoc.document_hash && shortHash(uploadedDoc.document_hash)) || '—'}</div>
                      <div><span className="text-dark fw-semibold">Size:</span> {file ? formatFileSize(file.size) : 'N/A'}</div>
                    </div>
                    
                    {/* Upload Timing Information */}
                    {uploadedDoc.timing && (
                      <div className="card bg-light border-0 mb-2">
                        <div className="card-body p-3">
                          <h6 className="small fw-semibold mb-2">
                            <i className="bi bi-clock-history me-1"></i>
                            Processing Time (Upload)
                          </h6>
                          <div className="row g-2 small">
                            <div className="col-6 col-md-3">
                              <span className="text-muted">Hashing:</span>
                              <span className="fw-semibold ms-1">{uploadedDoc.timing.hashing_ms} ms</span>
                            </div>
                            <div className="col-6 col-md-3">
                              <span className="text-muted">Key Loading:</span>
                              <span className="fw-semibold ms-1">{uploadedDoc.timing.key_loading_ms} ms</span>
                            </div>
                            <div className="col-6 col-md-3">
                              <span className="text-muted">Signature Generation:</span>
                              <span className="fw-semibold ms-1">{uploadedDoc.timing.signing_ms} ms</span>
                            </div>
                            <div className="col-6 col-md-3">
                              <span className="text-muted">Serialization:</span>
                              <span className="fw-semibold ms-1">{uploadedDoc.timing.serialization_ms} ms</span>
                            </div>
                            <div className="col-12 mt-2 pt-2 border-top">
                              <span className="text-muted">Total:</span>
                              <span className="fw-semibold text-primary ms-1">{uploadedDoc.timing.total_ms} ms</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Upload Performance Metrics (CPU & RAM) */}
                    {uploadedDoc.performance && (
                      <div className="card bg-light border-0 mb-2">
                        <div className="card-body p-3">
                          <h6 className="small fw-semibold mb-2">
                            <i className="bi bi-speedometer2 me-1"></i>
                            Performance Metrics (Upload)
                          </h6>
                          
                          {/* Hashing Performance */}
                          {uploadedDoc.performance.hashing && (
                            <div className="mb-3 pb-3 border-bottom">
                              <p className="small fw-semibold mb-2 text-muted">Hashing</p>
                              <div className="row g-2 small">
                                <div className="col-6 col-md-3">
                                  <span className="text-muted">RAM Before:</span>
                                  <span className="fw-semibold ms-1">{uploadedDoc.performance.hashing.memory_before_mb} MB</span>
                                </div>
                                <div className="col-6 col-md-3">
                                  <span className="text-muted">RAM After:</span>
                                  <span className="fw-semibold ms-1">{uploadedDoc.performance.hashing.memory_after_mb} MB</span>
                                </div>
                                <div className="col-6 col-md-3">
                                  <span className="text-muted">RAM Delta:</span>
                                  <span className={`fw-semibold ms-1 ${uploadedDoc.performance.hashing.memory_delta_mb > 0 ? 'text-warning' : 'text-success'}`}>
                                    {uploadedDoc.performance.hashing.memory_delta_mb > 0 ? '+' : ''}{uploadedDoc.performance.hashing.memory_delta_mb} MB
                                  </span>
                                </div>
                                <div className="col-6 col-md-3">
                                  <span className="text-muted">CPU:</span>
                                  <span className="fw-semibold ms-1">{uploadedDoc.performance.hashing.cpu_percent}%</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Key Loading Performance */}
                          {uploadedDoc.performance.key_loading && (
                            <div className="mb-3 pb-3 border-bottom">
                              <p className="small fw-semibold mb-2 text-muted">Key Loading</p>
                              <div className="row g-2 small">
                                <div className="col-6 col-md-3">
                                  <span className="text-muted">RAM Before:</span>
                                  <span className="fw-semibold ms-1">{uploadedDoc.performance.key_loading.memory_before_mb} MB</span>
                                </div>
                                <div className="col-6 col-md-3">
                                  <span className="text-muted">RAM After:</span>
                                  <span className="fw-semibold ms-1">{uploadedDoc.performance.key_loading.memory_after_mb} MB</span>
                                </div>
                                <div className="col-6 col-md-3">
                                  <span className="text-muted">RAM Delta:</span>
                                  <span className={`fw-semibold ms-1 ${uploadedDoc.performance.key_loading.memory_delta_mb > 0 ? 'text-warning' : 'text-success'}`}>
                                    {uploadedDoc.performance.key_loading.memory_delta_mb > 0 ? '+' : ''}{uploadedDoc.performance.key_loading.memory_delta_mb} MB
                                  </span>
                                </div>
                                <div className="col-6 col-md-3">
                                  <span className="text-muted">CPU:</span>
                                  <span className="fw-semibold ms-1">{uploadedDoc.performance.key_loading.cpu_percent}%</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Signing Performance */}
                          {uploadedDoc.performance.signing && (
                            <div className="mb-3 pb-3 border-bottom">
                              <p className="small fw-semibold mb-2 text-muted">Signature Generation</p>
                              <div className="row g-2 small">
                                <div className="col-6 col-md-3">
                                  <span className="text-muted">RAM Before:</span>
                                  <span className="fw-semibold ms-1">{uploadedDoc.performance.signing.memory_before_mb} MB</span>
                                </div>
                                <div className="col-6 col-md-3">
                                  <span className="text-muted">RAM After:</span>
                                  <span className="fw-semibold ms-1">{uploadedDoc.performance.signing.memory_after_mb} MB</span>
                                </div>
                                <div className="col-6 col-md-3">
                                  <span className="text-muted">RAM Delta:</span>
                                  <span className={`fw-semibold ms-1 ${uploadedDoc.performance.signing.memory_delta_mb > 0 ? 'text-warning' : 'text-success'}`}>
                                    {uploadedDoc.performance.signing.memory_delta_mb > 0 ? '+' : ''}{uploadedDoc.performance.signing.memory_delta_mb} MB
                                  </span>
                                </div>
                                <div className="col-6 col-md-3">
                                  <span className="text-muted">CPU:</span>
                                  <span className="fw-semibold ms-1">{uploadedDoc.performance.signing.cpu_percent}%</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Serialization Performance */}
                          {uploadedDoc.performance.serialization && (
                            <div className="mb-3 pb-3 border-bottom">
                              <p className="small fw-semibold mb-2 text-muted">Serialization</p>
                              <div className="row g-2 small">
                                <div className="col-6 col-md-3">
                                  <span className="text-muted">RAM Before:</span>
                                  <span className="fw-semibold ms-1">{uploadedDoc.performance.serialization.memory_before_mb} MB</span>
                                </div>
                                <div className="col-6 col-md-3">
                                  <span className="text-muted">RAM After:</span>
                                  <span className="fw-semibold ms-1">{uploadedDoc.performance.serialization.memory_after_mb} MB</span>
                                </div>
                                <div className="col-6 col-md-3">
                                  <span className="text-muted">RAM Delta:</span>
                                  <span className={`fw-semibold ms-1 ${uploadedDoc.performance.serialization.memory_delta_mb > 0 ? 'text-warning' : 'text-success'}`}>
                                    {uploadedDoc.performance.serialization.memory_delta_mb > 0 ? '+' : ''}{uploadedDoc.performance.serialization.memory_delta_mb} MB
                                  </span>
                                </div>
                                <div className="col-6 col-md-3">
                                  <span className="text-muted">CPU:</span>
                                  <span className="fw-semibold ms-1">{uploadedDoc.performance.serialization.cpu_percent}%</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Total Performance */}
                          {uploadedDoc.performance.total && (
                            <div className="pt-2 mt-2 border-top">
                              <p className="small fw-semibold mb-2 text-muted">Overall</p>
                              <div className="row g-2 small">
                                <div className="col-6 col-md-3">
                                  <span className="text-muted">RAM Before:</span>
                                  <span className="fw-semibold ms-1">{uploadedDoc.performance.total.memory_before_mb} MB</span>
                                </div>
                                <div className="col-6 col-md-3">
                                  <span className="text-muted">RAM After:</span>
                                  <span className="fw-semibold ms-1">{uploadedDoc.performance.total.memory_after_mb} MB</span>
                                </div>
                                <div className="col-6 col-md-3">
                                  <span className="text-muted">Peak RAM Delta:</span>
                                  <span className={`fw-bold ms-1 ${uploadedDoc.performance.total.memory_delta_mb > 0 ? 'text-warning' : 'text-success'}`}>
                                    {uploadedDoc.performance.total.memory_delta_mb > 0 ? '+' : ''}{uploadedDoc.performance.total.memory_delta_mb} MB
                                  </span>
                                </div>
                                <div className="col-6 col-md-3">
                                  <span className="text-muted">Peak CPU:</span>
                                  <span className="fw-semibold text-danger ms-1">{uploadedDoc.performance.total.cpu_percent}%</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {verificationResult && (
                      <div className="mt-2">
                        <span className="badge text-bg-success-subtle text-success border px-3 py-2">Verification {verificationResult.error ? 'Skipped' : 'Completed'}</span>
                        {!verificationResult.error && (
                          <div>
                            <p className="small text-muted mb-1 mt-1">Status: {verificationResult.status || (verificationResult.found ? 'VERIFIED' : 'NOT_FOUND')}</p>
                            {/* Verification Timing Information */}
                            {verificationResult.timing && (
                              <div className="card bg-light border-0 mt-2">
                                <div className="card-body p-3">
                                  <h6 className="small fw-semibold mb-2">
                                    <i className="bi bi-shield-check me-1"></i>
                                    Processing Time (Verification)
                                  </h6>
                                  <div className="row g-2 small">
                                    <div className="col-6 col-md-3">
                                      <span className="text-muted">Hashing:</span>
                                      <span className="fw-semibold ms-1">{verificationResult.timing.hashing_ms} ms</span>
                                    </div>
                                    <div className="col-6 col-md-3">
                                      <span className="text-muted">Lookup:</span>
                                      <span className="fw-semibold ms-1">{verificationResult.timing.document_lookup_ms} ms</span>
                                    </div>
                                    <div className="col-6 col-md-3">
                                      <span className="text-muted">Verification:</span>
                                      <span className="fw-semibold ms-1">{verificationResult.timing.verification_ms} ms</span>
                                    </div>
                                    <div className="col-6 col-md-3">
                                      <span className="text-muted">Total:</span>
                                      <span className="fw-semibold text-primary ms-1">{verificationResult.timing.total_ms} ms</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Verification Performance Metrics (CPU & RAM) */}
                            {verificationResult.performance && (
                              <div className="card bg-light border-0 mt-2">
                                <div className="card-body p-3">
                                  <h6 className="small fw-semibold mb-2">
                                    <i className="bi bi-speedometer2 me-1"></i>
                                    Performance Metrics (Verification)
                                  </h6>
                                  
                                  {/* Hashing Performance */}
                                  {verificationResult.performance.hashing && (
                                    <div className="mb-3 pb-3 border-bottom">
                                      <p className="small fw-semibold mb-2 text-muted">Hashing</p>
                                      <div className="row g-2 small">
                                        <div className="col-6 col-md-3">
                                          <span className="text-muted">RAM Before:</span>
                                          <span className="fw-semibold ms-1">{verificationResult.performance.hashing.memory_before_mb} MB</span>
                                        </div>
                                        <div className="col-6 col-md-3">
                                          <span className="text-muted">RAM After:</span>
                                          <span className="fw-semibold ms-1">{verificationResult.performance.hashing.memory_after_mb} MB</span>
                                        </div>
                                        <div className="col-6 col-md-3">
                                          <span className="text-muted">RAM Delta:</span>
                                          <span className={`fw-semibold ms-1 ${verificationResult.performance.hashing.memory_delta_mb > 0 ? 'text-warning' : 'text-success'}`}>
                                            {verificationResult.performance.hashing.memory_delta_mb > 0 ? '+' : ''}{verificationResult.performance.hashing.memory_delta_mb} MB
                                          </span>
                                        </div>
                                        <div className="col-6 col-md-3">
                                          <span className="text-muted">CPU:</span>
                                          <span className="fw-semibold ms-1">{verificationResult.performance.hashing.cpu_percent}%</span>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Lookup Performance */}
                                  {verificationResult.performance.lookup && (
                                    <div className="mb-3 pb-3 border-bottom">
                                      <p className="small fw-semibold mb-2 text-muted">Database Lookup</p>
                                      <div className="row g-2 small">
                                        <div className="col-6 col-md-3">
                                          <span className="text-muted">RAM Before:</span>
                                          <span className="fw-semibold ms-1">{verificationResult.performance.lookup.memory_before_mb} MB</span>
                                        </div>
                                        <div className="col-6 col-md-3">
                                          <span className="text-muted">RAM After:</span>
                                          <span className="fw-semibold ms-1">{verificationResult.performance.lookup.memory_after_mb} MB</span>
                                        </div>
                                        <div className="col-6 col-md-3">
                                          <span className="text-muted">RAM Delta:</span>
                                          <span className={`fw-semibold ms-1 ${verificationResult.performance.lookup.memory_delta_mb > 0 ? 'text-warning' : 'text-success'}`}>
                                            {verificationResult.performance.lookup.memory_delta_mb > 0 ? '+' : ''}{verificationResult.performance.lookup.memory_delta_mb} MB
                                          </span>
                                        </div>
                                        <div className="col-6 col-md-3">
                                          <span className="text-muted">CPU:</span>
                                          <span className="fw-semibold ms-1">{verificationResult.performance.lookup.cpu_percent}%</span>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Verification Performance */}
                                  {verificationResult.performance.verification && (
                                    <div className="mb-3 pb-3 border-bottom">
                                      <p className="small fw-semibold mb-2 text-muted">Signature Verification</p>
                                      <div className="row g-2 small">
                                        <div className="col-6 col-md-3">
                                          <span className="text-muted">RAM Before:</span>
                                          <span className="fw-semibold ms-1">{verificationResult.performance.verification.memory_before_mb} MB</span>
                                        </div>
                                        <div className="col-6 col-md-3">
                                          <span className="text-muted">RAM After:</span>
                                          <span className="fw-semibold ms-1">{verificationResult.performance.verification.memory_after_mb} MB</span>
                                        </div>
                                        <div className="col-6 col-md-3">
                                          <span className="text-muted">RAM Delta:</span>
                                          <span className={`fw-semibold ms-1 ${verificationResult.performance.verification.memory_delta_mb > 0 ? 'text-warning' : 'text-success'}`}>
                                            {verificationResult.performance.verification.memory_delta_mb > 0 ? '+' : ''}{verificationResult.performance.verification.memory_delta_mb} MB
                                          </span>
                                        </div>
                                        <div className="col-6 col-md-3">
                                          <span className="text-muted">CPU:</span>
                                          <span className="fw-semibold ms-1">{verificationResult.performance.verification.cpu_percent}%</span>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Total Performance */}
                                  {verificationResult.performance.total && (
                                    <div className="pt-2 mt-2 border-top">
                                      <p className="small fw-semibold mb-2 text-muted">Overall</p>
                                      <div className="row g-2 small">
                                        <div className="col-6 col-md-3">
                                          <span className="text-muted">RAM Before:</span>
                                          <span className="fw-semibold ms-1">{verificationResult.performance.total.memory_before_mb} MB</span>
                                        </div>
                                        <div className="col-6 col-md-3">
                                          <span className="text-muted">RAM After:</span>
                                          <span className="fw-semibold ms-1">{verificationResult.performance.total.memory_after_mb} MB</span>
                                        </div>
                                        <div className="col-6 col-md-3">
                                          <span className="text-muted">Peak RAM Delta:</span>
                                          <span className={`fw-bold ms-1 ${verificationResult.performance.total.memory_delta_mb > 0 ? 'text-warning' : 'text-success'}`}>
                                            {verificationResult.performance.total.memory_delta_mb > 0 ? '+' : ''}{verificationResult.performance.total.memory_delta_mb} MB
                                          </span>
                                        </div>
                                        <div className="col-6 col-md-3">
                                          <span className="text-muted">Peak CPU:</span>
                                          <span className="fw-semibold text-danger ms-1">{verificationResult.performance.total.cpu_percent}%</span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        {verificationResult.error && (
                          <p className="small text-danger mb-0 mt-1">{verificationResult.error}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="d-flex flex-wrap gap-2 mt-4">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={uploading || status === 'verifying' || !file}
              >
                {uploading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <i className="bi bi-cloud-upload me-2"></i>
                    Start Upload
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
              <div className="ms-auto d-flex align-items-center gap-2 text-muted small">
                <i className="bi bi-lock-fill text-success"></i>
                Data hashed and signed on upload
              </div>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}

export default Upload;