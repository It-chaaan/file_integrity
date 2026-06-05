import React, { useState } from 'react';
import { validateFileType, validateFileSize } from '../../services/utils';
import UploadArea from '../../components/UploadArea';
import { verifyDocument } from '../../api/documents.api';

function Verify() {
  const [file, setFile] = useState(null);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const allowedTypes = ['pdf', 'doc', 'docx', 'txt'];
  const maxSizeMB = 5;

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    setError('');

    if (!selected) {
      setFile(null);
      return;
    }

    if (!validateFileType(selected, allowedTypes)) {
      setError('Only PDF, DOC, DOCX, or TXT files are allowed.');
      setFile(null);
      return;
    }

    if (!validateFileSize(selected, maxSizeMB)) {
      setError(`File size exceeds ${maxSizeMB}MB limit.`);
      setFile(null);
      return;
    }

    setFile(selected);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!file || !referenceNumber) return;

    setIsVerifying(true);

    try {
      const response = await verifyDocument(file, referenceNumber.trim());
      setResult({
        isValid: Boolean(response?.isAuthentic),
        found: Boolean(response?.found),
        referenceNumber: response?.referenceNumber || referenceNumber,
        fileName: response?.fileName || file?.name,
        hash: response?.hash,
        verifiedDate: response?.verificationDate || response?.uploadDate || response?.verified_at || new Date().toLocaleString(),
        documentType: response?.documentType || '—',
        status: response?.status,
      });
    } catch (verifyError) {
      setError(verifyError?.message || 'Verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setReferenceNumber('');
    setResult(null);
  };

  if (isVerifying) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary mb-4" style={{ width: '4rem', height: '4rem' }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h4 className="mb-3">Verifying Document...</h4>
                <p className="text-muted mb-4">Computing SHA-256 hash and validating ECDSA signature</p>
                <div className="progress" style={{ height: '8px' }}>
                  <div className="progress-bar progress-bar-striped progress-bar-animated" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-5">
                <div className={`alert ${result.isValid ? 'alert-success' : 'alert-danger'} d-flex align-items-center mb-4`}>
                  <i className={`bi ${result.isValid ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} fs-1 me-3`}></i>
                  <div>
                    <h4 className="mb-1">
                      {result.isValid ? 'Enterprise Document Verified' : 'Verification Failed'}
                    </h4>
                    <p className="mb-0">
                      {result.isValid 
                        ? 'Document integrity is valid and cryptographic signature checks passed' 
                        : result.found
                          ? 'A registry record was found, but the uploaded file did not pass integrity verification'
                          : 'No matching registry record was found for the supplied reference number'}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <h6 className="text-muted mb-3">Document Details</h6>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="small text-muted">File Name</label>
                      <p className="mb-0">{result.fileName}</p>
                    </div>
                    <div className="col-md-6">
                      <label className="small text-muted">Reference Number</label>
                      <p className="mb-0">{result.referenceNumber}</p>
                    </div>
                    <div className="col-md-6">
                      <label className="small text-muted">Document Type</label>
                      <p className="mb-0">{result.documentType}</p>
                    </div>
                    <div className="col-12">
                      <label className="small text-muted">Verification Date</label>
                      <p className="mb-0">{result.verifiedDate}</p>
                    </div>
                  </div>
                </div>

                {result.hash && (
                  <div className="mb-4">
                    <h6 className="text-muted mb-2">Computed SHA-256 Hash</h6>
                    <div className="p-3 bg-light rounded">
                      <code className="small text-break">{result.hash}</code>
                    </div>
                  </div>
                )}

                <button onClick={resetForm} className="btn btn-primary">
                  Verify Another Document
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div className="text-center mb-5">
            <h1 className="fw-bold mb-3">Verify Enterprise Document Integrity</h1>
            <p className="text-muted lead">Upload a business document and validate authenticity with cryptographic proof</p>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body p-5">
              <form onSubmit={handleVerify}>
                <div className="mb-4">
                  <label className="form-label fw-semibold mb-2">Reference Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter document reference number"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                  />
                </div>

                {/* File Upload */}
                <div className="mb-4">
                  <label className="form-label fw-semibold mb-3">Document Upload</label>
                  <UploadArea
                    file={file}
                    onFileChange={handleFileChange}
                    acceptedTypes={allowedTypes}
                    maxSizeMB={maxSizeMB}
                    error={error}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg w-100"
                  disabled={!file || !referenceNumber}
                >
                  Start Verification
                </button>
              </form>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-4 text-center">
            <p className="text-muted small">
              <i className="bi bi-shield-check me-2"></i>
              Your document is processed securely and is never persisted as content in the verification service
            </p>
          </div>

          <div className="card border-0 shadow-sm mt-4">
            <div className="card-body d-flex">
              <div className="me-3 d-flex align-items-start">
                <span className="bg-primary bg-opacity-10 text-primary rounded-circle p-3 d-inline-flex">
                  <i className="bi bi-shield-lock fs-4"></i>
                </span>
              </div>
              <div>
                <h5 className="mb-2">How Verification Works</h5>
                <p className="mb-0 text-muted">
                  PARITY computes a SHA-256 cryptographic hash of your uploaded file and compares it with the value stored in the enterprise registry.
                  Matching hashes and valid ECDSA signatures confirm integrity, authenticity, and tamper detection.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Verify;
