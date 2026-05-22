import React, { useState } from 'react';
import { validateFileType, validateFileSize } from '../../services/utils';
import SimpleStepper from '../../components/SimpleStepper';
import { verifyDocument } from '../../api/documents.api';

function Verify() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState('');

  const allowedTypes = ['pdf', 'doc', 'docx', 'txt'];
  const maxSizeMB = 110;

  const steps = ['Select File', 'Hash', 'Complete'];

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    setError('');

    if (!file) return;

    if (!validateFileType(file, allowedTypes)) {
      setError('Only PDF, DOC, DOCX, or TXT files are allowed.');
      setSelectedFile(null);
      return;
    }

    if (!validateFileSize(file, maxSizeMB)) {
      setError(`File size exceeds ${maxSizeMB}MB limit.`);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setCurrentStep(2);
    setIsVerifying(true);

    try {
      // For large files (> 50MB), show a message that it may take longer
      if (file.size > 50 * 1024 * 1024) {
        console.log('Verifying large file:', file.name, 'Size:', (file.size / (1024 * 1024)).toFixed(2), 'MB');
      }
      
      const response = await verifyDocument(file, referenceNumber.trim());
      setVerificationResult({
        filename: response?.fileName || file.name,
        referenceNumber: response?.referenceNumber || referenceNumber,
        documentType: response?.documentType || '—',
        fileSize: response?.fileSize || '—',
        uploadDate: response?.uploadDate || response?.verified_at || '—',
        uploadedBy: response?.uploadedBy || '—',
        hash: response?.hash,
        signature: response?.signature,
        isAuthentic: Boolean(response?.isAuthentic),
        status: response?.status,
        timing: response?.timing || null,
        performance: response?.performance || null,
      });
    } catch (verifyError) {
      console.error('Verification error:', verifyError);
      setError(verifyError?.message || 'Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
      setCurrentStep(3);
    }
  };

  const resetVerification = () => {
    setCurrentStep(1);
    setSelectedFile(null);
    setReferenceNumber('');
    setVerificationResult(null);
    setError('');
  };
  return (
    <div>
      <div className="mb-4">
        <h2 className="mb-1">Verify Document</h2>
        <p className="text-muted">Upload an enterprise document to verify integrity and signature authenticity</p>
      </div>

      {/* Stepper + Main Content in one container */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-5">
          <div className="mb-4">
            <SimpleStepper labels={steps} currentStep={currentStep} />
          </div>

          {/* Step 1: Upload */}
          {currentStep === 1 && (
            <div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Reference Number</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter document reference number"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                />
              </div>
              <div
                className="border-2 border-dashed rounded p-5 text-center"
                style={{ borderColor: '#dee2e6', borderStyle: 'dashed' }}
              >
                <i className="bi bi-cloud-upload fs-1 text-primary mb-3 d-block"></i>
                <p className="mb-3">Drop your file here or click to browse</p>
                <input
                  type="file"
                  id="fileUpload"
                  className="d-none"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                  disabled={!referenceNumber}
                />
                <label htmlFor="fileUpload" className="btn btn-primary">
                  Select File
                </label>
                <p className="text-muted small mt-3 mb-0">
                  Supported formats: PDF, DOC, DOCX, TXT • Max size: 110MB
                </p>
                {selectedFile && (
                  <p className="text-muted small mt-2 mb-0">
                    Selected file: {selectedFile.name}
                  </p>
                )}
                {error && (
                  <p className="text-danger small mt-2 mb-0">{error}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Computing */}
          {currentStep === 2 && isVerifying && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <h5>Computing Hash...</h5>
              <p className="text-muted">Please wait while we validate enterprise cryptographic proof</p>
              {selectedFile && selectedFile.size > 50 * 1024 * 1024 && (
                <p className="text-warning small mt-2">
                  <i className="bi bi-info-circle me-1"></i>
                  Large file detected ({(selectedFile.size / (1024 * 1024)).toFixed(1)}MB). This may take a few moments...
                </p>
              )}
            </div>
          )}

          {/* Step 3: Results */}
          {currentStep === 3 && verificationResult && (
            <div className="row g-4">
              <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <h6 className="text-muted mb-3">Document Preview</h6>
                    <div className="mb-3">
                      <label className="text-muted small">Filename</label>
                      <p className="mb-0">{verificationResult.filename}</p>
                    </div>
                    <div className="mb-3">
                      <label className="text-muted small">Reference Number</label>
                      <p className="mb-0">{verificationResult.referenceNumber}</p>
                    </div>
                    <div className="mb-3">
                      <label className="text-muted small">Document Type</label>
                      <p className="mb-0">{verificationResult.documentType}</p>
                    </div>
                    <div className="mb-3">
                      <label className="text-muted small">File Size</label>
                      <p className="mb-0">{verificationResult.fileSize}</p>
                    </div>
                    <div className="mb-3">
                      <label className="text-muted small">Upload Date</label>
                      <p className="mb-0">{verificationResult.uploadDate}</p>
                    </div>
                    <div>
                      <label className="text-muted small">Uploaded By</label>
                      <p className="mb-0">{verificationResult.uploadedBy}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-8">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    <div className={`alert ${verificationResult.isAuthentic ? 'alert-success' : 'alert-danger'} d-flex align-items-center mb-4`}>
                      <i className={`bi ${verificationResult.isAuthentic ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} fs-4 me-3`}></i>
                      <div>
                        <h5 className="mb-1">{verificationResult.isAuthentic ? 'Document Integrity Verified' : 'Verification Failed'}</h5>
                        <p className="mb-0">{verificationResult.isAuthentic ? 'SHA-256 and ECDSA checks confirm enterprise authenticity.' : 'Document appears altered, unsigned, or non-compliant.'}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="text-muted small mb-2">SHA-256 Hash</label>
                      <div className="p-3 bg-light rounded font-monospace small">
                        {verificationResult.hash}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="text-muted small mb-2">Digital Signature</label>
                      <div className="p-3 bg-light rounded font-monospace small text-break">
                        {verificationResult.signature}
                      </div>
                    </div>

                    {/* Verification Timing Information */}
                    {verificationResult.timing && (
                      <div className="card bg-light border-0 mb-4">
                        <div className="card-body p-3">
                          <h6 className="small fw-semibold mb-2">
                            <i className="bi bi-stopwatch me-1"></i>
                            Processing Time (Verification)
                          </h6>
                          <div className="row g-2 small">
                            <div className="col-6 col-md-3">
                              <span className="text-muted">Hashing:</span>
                              <span className="fw-semibold ms-1">{verificationResult.timing.hashing_ms} ms</span>
                            </div>
                            <div className="col-6 col-md-3">
                              <span className="text-muted">Document Lookup:</span>
                              <span className="fw-semibold ms-1">{verificationResult.timing.document_lookup_ms} ms</span>
                            </div>
                            <div className="col-6 col-md-3">
                              <span className="text-muted">Signature Verification:</span>
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

                    {/* Performance Metrics (CPU & RAM) */}
                    {verificationResult.performance && (
                      <div className="card bg-light border-0 mb-4">
                        <div className="card-body p-3">
                          <h6 className="small fw-semibold mb-2">
                            <i className="bi bi-speedometer2 me-1"></i>
                            Performance Metrics
                          </h6>
                          
                          {/* Hashing Performance */}
                          {verificationResult.performance.hashing && (
                            <div className="mb-3 pb-3 border-bottom">
                              <p className="small fw-semibold mb-2 text-muted">Hashing</p>
                              <div className="row g-2 small">
                                <div className="col-6 col-md-4">
                                  <span className="text-muted">RAM: </span>
                                  <span className="fw-semibold">{verificationResult.performance.hashing.memory_before_mb}</span>
                                  <span className="text-muted"> → </span>
                                  <span className="fw-semibold">{verificationResult.performance.hashing.memory_after_mb} MB</span>
                                </div>
                                <div className="col-6 col-md-4">
                                  <span className="text-muted">Delta: </span>
                                  <span className={`fw-semibold ${verificationResult.performance.hashing.memory_delta_mb > 0 ? 'text-warning' : 'text-success'}`}>
                                    {verificationResult.performance.hashing.memory_delta_mb > 0 ? '+' : ''}{verificationResult.performance.hashing.memory_delta_mb} MB
                                  </span>
                                </div>
                                <div className="col-6 col-md-4">
                                  <span className="text-muted">CPU: </span>
                                  <span className="fw-semibold">{verificationResult.performance.hashing.cpu_percent}%</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Lookup Performance */}
                          {verificationResult.performance.lookup && (
                            <div className="mb-3 pb-3 border-bottom">
                              <p className="small fw-semibold mb-2 text-muted">Database Lookup</p>
                              <div className="row g-2 small">
                                <div className="col-6 col-md-4">
                                  <span className="text-muted">RAM: </span>
                                  <span className="fw-semibold">{verificationResult.performance.lookup.memory_before_mb}</span>
                                  <span className="text-muted"> → </span>
                                  <span className="fw-semibold">{verificationResult.performance.lookup.memory_after_mb} MB</span>
                                </div>
                                <div className="col-6 col-md-4">
                                  <span className="text-muted">Delta: </span>
                                  <span className={`fw-semibold ${verificationResult.performance.lookup.memory_delta_mb > 0 ? 'text-warning' : 'text-success'}`}>
                                    {verificationResult.performance.lookup.memory_delta_mb > 0 ? '+' : ''}{verificationResult.performance.lookup.memory_delta_mb} MB
                                  </span>
                                </div>
                                <div className="col-6 col-md-4">
                                  <span className="text-muted">CPU: </span>
                                  <span className="fw-semibold">{verificationResult.performance.lookup.cpu_percent}%</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Verification Performance */}
                          {verificationResult.performance.verification && (
                            <div className="mb-3 pb-3 border-bottom">
                              <p className="small fw-semibold mb-2 text-muted">Signature Verification</p>
                              <div className="row g-2 small">
                                <div className="col-6 col-md-4">
                                  <span className="text-muted">RAM: </span>
                                  <span className="fw-semibold">{verificationResult.performance.verification.memory_before_mb}</span>
                                  <span className="text-muted"> → </span>
                                  <span className="fw-semibold">{verificationResult.performance.verification.memory_after_mb} MB</span>
                                </div>
                                <div className="col-6 col-md-4">
                                  <span className="text-muted">Delta: </span>
                                  <span className={`fw-semibold ${verificationResult.performance.verification.memory_delta_mb > 0 ? 'text-warning' : 'text-success'}`}>
                                    {verificationResult.performance.verification.memory_delta_mb > 0 ? '+' : ''}{verificationResult.performance.verification.memory_delta_mb} MB
                                  </span>
                                </div>
                                <div className="col-6 col-md-4">
                                  <span className="text-muted">CPU: </span>
                                  <span className="fw-semibold">{verificationResult.performance.verification.cpu_percent}%</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Total Performance */}
                          {verificationResult.performance.total && (
                            <div className="pt-2 mt-2 border-top">
                              <p className="small fw-semibold mb-2 text-muted">Overall</p>
                              <div className="row g-2 small">
                                <div className="col-6 col-md-4">
                                  <span className="text-muted">Peak RAM: </span>
                                  <span className="fw-semibold">{verificationResult.performance.total.memory_before_mb}</span>
                                  <span className="text-muted"> → </span>
                                  <span className="fw-semibold">{verificationResult.performance.total.memory_after_mb} MB</span>
                                </div>
                                <div className="col-6 col-md-4">
                                  <span className="text-muted">Peak Delta: </span>
                                  <span className={`fw-bold ${verificationResult.performance.total.memory_delta_mb > 0 ? 'text-warning' : 'text-success'}`}>
                                    {verificationResult.performance.total.memory_delta_mb > 0 ? '+' : ''}{verificationResult.performance.total.memory_delta_mb} MB
                                  </span>
                                </div>
                                <div className="col-6 col-md-4">
                                  <span className="text-muted">Peak CPU: </span>
                                  <span className="fw-semibold text-danger">{verificationResult.performance.total.cpu_percent}%</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <button onClick={resetVerification} className="btn btn-primary">
                      Verify Another Document
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
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
              The system computes a SHA-256 cryptographic hash and compares it with the enterprise registry fingerprint.
              A valid hash and ECDSA signature confirm non-repudiation, authenticity, and tamper detection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Verify;