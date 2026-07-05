import React, { useEffect, useState } from 'react';
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

const normalizeText = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

const DOCUMENT_TYPE_KEYWORDS = [
  { type: 'Purchase Orders (PO)', keywords: ['purchase order', 'purchase orders', 'po ', 'p o '] },
  { type: 'Vendor Contracts', keywords: ['vendor contract', 'vendor contracts', 'supplier contract'] },
  { type: 'Invoices', keywords: ['invoice', 'invoices', 'billing statement'] },
  { type: 'Shipping Manifests', keywords: ['shipping manifest', 'shipping manifests', 'manifest'] },
  { type: 'Financial Audit Reports', keywords: ['financial audit', 'audit report', 'audit reports'] },
  { type: 'Tax Filings', keywords: ['tax filing', 'tax filings', 'tax return'] },
  { type: 'Budget Approvals', keywords: ['budget approval', 'budget approvals', 'budget request', 'budget approval memo'] },
  { type: 'Loan Agreements', keywords: ['loan agreement', 'loan agreements', 'loan docs'] },
  { type: 'Employment Contracts', keywords: ['employment contract', 'employment contracts', 'offer letter'] },
  { type: 'Non-Disclosure Agreements (NDA)', keywords: ['nda', 'non disclosure agreement', 'non-disclosure agreement', 'nondisclosure'] },
  { type: 'Performance Reviews', keywords: ['performance review', 'performance reviews', 'annual review'] },
  { type: 'Intellectual Property Agreements', keywords: ['intellectual property', 'ip agreement', 'ip agreements'] },
  { type: 'Compliance Certificates', keywords: ['compliance certificate', 'compliance certificates', 'certificate of compliance'] },
  { type: 'Board Resolutions', keywords: ['board resolution', 'board resolutions'] },
  { type: 'Shareholder Agreements', keywords: ['shareholder agreement', 'shareholder agreements'] },
  { type: 'Data Processing Agreements (DPA)', keywords: ['data processing agreement', 'data processing agreements', 'dpa'] },
  { type: 'Inventory Audit Sheets', keywords: ['inventory audit', 'inventory audit sheet', 'inventory sheets'] },
  { type: 'Insurance Policies', keywords: ['insurance policy', 'insurance policies'] },
  { type: 'System Audit Logs', keywords: ['system audit log', 'system audit logs', 'audit log'] },
  { type: 'Security Policies', keywords: ['security policy', 'security policies'] },
  { type: 'Risk Assessment Reports', keywords: ['risk assessment', 'risk assessment report', 'risk reports'] },
];

const normalizeDepartment = (department) => {
  const value = String(department || '').trim();
  if (!value) return '';

  const lowerValue = normalizeText(value);
  const match = DOCUMENT_CATEGORY_MAP.find((group) => {
    const lowerGroup = normalizeText(group.department);
    return lowerValue === lowerGroup || lowerValue.includes(lowerGroup) || lowerGroup.includes(lowerValue);
  });

  return match?.department || value;
};

const inferDocumentType = (searchText, department) => {
  const normalizedText = normalizeText(searchText);
  if (!normalizedText) return '';

  const departmentGroup = normalizeDepartment(department);
  const departmentTypes = departmentGroup
    ? DOCUMENT_CATEGORY_MAP.find((item) => item.department === departmentGroup)?.types || []
    : null;

  const candidates = DOCUMENT_TYPE_KEYWORDS.filter((entry) => !departmentTypes || departmentTypes.includes(entry.type));

  for (const candidate of candidates) {
    for (const keyword of candidate.keywords) {
      if (normalizedText.includes(normalizeText(keyword))) {
        return candidate.type;
      }
    }
  }

  return '';
};

function Upload() {
  const { createDocument } = useDocuments();
  const currentUser = getCurrentUser();
  const uploaderDisplayName = [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(' ') || currentUser?.full_name || currentUser?.username || 'Unknown';
  
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
  const [isTypeManuallySelected, setIsTypeManuallySelected] = useState(false);

  const stepLabels = ['Select File', 'Enter Metadata', 'Hash & Sign', 'Complete'];
  const userDepartment = normalizeDepartment(currentUser?.department);
  const visibleCategoryGroups = userDepartment
    ? DOCUMENT_CATEGORY_MAP.filter((group) => group.department === userDepartment)
    : DOCUMENT_CATEGORY_MAP;

  useEffect(() => {
    setFormData((prev) => {
      const searchText = [prev.title, file?.name].filter(Boolean).join(' ');
      const inferredType = isTypeManuallySelected ? prev.type : inferDocumentType(searchText, userDepartment || prev.department);
      const nextDepartment = inferredType
        ? (DOCUMENT_TYPE_TO_DEPARTMENT[inferredType] || userDepartment || prev.department || '')
        : (userDepartment || prev.department || '');

      if (prev.department === nextDepartment && prev.type === inferredType) {
        return prev;
      }

      return {
        ...prev,
        type: inferredType || prev.type,
        department: nextDepartment,
      };
    });
  }, [currentUser?.department, file?.name, formData.title, isTypeManuallySelected]);

  const handleDocumentTypeChange = (e) => {
    const type = e.target.value;
    const department = DOCUMENT_TYPE_TO_DEPARTMENT[type] || '';

    setIsTypeManuallySelected(Boolean(type));

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

    // Validate file size (5MB max)
    if (!validateFileSize(selectedFile, 5)) {
      setError('File size exceeds 5MB limit.');
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
          uploaded_by: uploaderDisplayName,
          uploaded_by_role: currentUser?.role || '',
          uploaded_by_department: currentUser?.department || formData.department || '',
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
    setIsTypeManuallySelected(false);
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
              maxSizeMB={5}
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
                  {visibleCategoryGroups.map((group) => (
                    <optgroup key={group.department} label={group.department}>
                      {group.types.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {userDepartment && visibleCategoryGroups.length === 0 && (
                  <div className="form-text text-warning mt-1">
                    No document types are configured for your department.
                  </div>
                )}
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Department</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.department || 'Automatically assigned from document type'}
                  disabled
                  readOnly
                />
              </div>
            </div>

            {uploading && (
              <div className="mt-4">
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
                  <div>
                    <h6 className="mb-1">Document Uploaded Successfully</h6>
                    <p className="text-muted mb-2 small">Integrity signature and hash stored for verification.</p>
                    <div className="d-flex flex-wrap gap-3 small text-muted">
                      <div><span className="text-dark fw-semibold">Reference Number:</span> {uploadedDoc.reference_number || '—'}</div>
                      <div><span className="text-dark fw-semibold">Hash:</span> {uploadedDoc.short_hash || (uploadedDoc.document_hash && shortHash(uploadedDoc.document_hash)) || '—'}</div>
                      <div><span className="text-dark fw-semibold">Size:</span> {file ? formatFileSize(file.size) : 'N/A'}</div>
                    </div>
                    {verificationResult && (
                      <div className="mt-2">
                        <span className="badge text-bg-success-subtle text-success border px-3 py-2">Verification {verificationResult.error ? 'Skipped' : 'Completed'}</span>
                        {!verificationResult.error && (
                          <p className="small text-muted mb-0 mt-1">Status: {verificationResult.status || (verificationResult.found ? 'VERIFIED' : 'NOT_FOUND')}</p>
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
