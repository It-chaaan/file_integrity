import React, { useState } from 'react';
import { validateFileType, validateFileSize } from '../../services/utils';

function Verify() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState('');

  const allowedTypes = ['pdf', 'doc', 'docx', 'txt'];
  const maxSizeMB = 5;

  const steps = ['Select File', 'Hash', 'Complete'];
  const brandColor = '#0D1526';

  const handleFileSelect = (e) => {
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
    
    // Simulate hash computation
    setTimeout(() => {
      setIsVerifying(false);
      setCurrentStep(3);
      setVerificationResult({
        filename: file.name,
        documentId: 'DOC-2026-001847',
        documentType: 'BIR Certificate',
        fileSize: '2.4 MB',
        uploadDate: '2026-01-08 14:32:15',
        uploadedBy: 'Martin Luspo',
        hash: 'd4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35',
        signature: '3045022100f1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0',
        isAuthentic: true
      });
    }, 2000);
  };

  const resetVerification = () => {
    setCurrentStep(1);
    setSelectedFile(null);
    setVerificationResult(null);
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="mb-1">Verify Document</h2>
        <p className="text-muted">Upload a document to verify its authenticity and integrity</p>
      </div>

      {/* Stepper + Main Content in one container */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-5">
          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', gap: '0' }}>
            {/* Connecting lines - absolute positioned */}
            {steps.map((_, idx) => {
              if (idx === steps.length - 1) return null;
              const isCompleted = currentStep - 1 > idx;
              return (
                <div
                  key={`line-${idx}`}
                  style={{
                    position: 'absolute',
                    top: '19px',
                    left: `calc(${(idx + 0.5) * (100 / steps.length)}% + 19px)`,
                    right: `calc(${(steps.length - idx - 1.5) * (100 / steps.length)}% + 19px)`,
                    height: '2px',
                    backgroundColor: isCompleted ? brandColor : '#dde1e5',
                    zIndex: 5
                  }}
                />
              );
            })}

            {/* Step circles and labels */}
            {steps.map((label, idx) => {
              const isCompleted = currentStep - 1 > idx;
              const isActive = currentStep - 1 === idx;

              const circleStyle = {
                width: '38px',
                height: '38px',
                fontSize: '15px',
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: isCompleted || isActive ? brandColor : '#dde1e5',
                backgroundColor: isCompleted || isActive ? brandColor : '#ffffff',
                color: isCompleted || isActive ? '#ffffff' : '#6c757d',
                flexShrink: 0,
                zIndex: 10,
                position: 'relative'
              };

              return (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div className="rounded-circle d-flex align-items-center justify-content-center fw-semibold" style={circleStyle}>
                    {idx + 1}
                  </div>
                  <div className="small mt-2 text-center">{label}</div>
                </div>
              );
            })}
          </div>

          {/* Step 1: Upload */}
          {currentStep === 1 && (
            <div>
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
                />
                <label htmlFor="fileUpload" className="btn btn-primary">
                  Select File
                </label>
                <p className="text-muted small mt-3 mb-0">
                  Supported formats: PDF, DOC, DOCX, TXT • Max size: 5MB
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
              <p className="text-muted">Please wait while we verify your document</p>
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
                      <label className="text-muted small">Document ID</label>
                      <p className="mb-0">{verificationResult.documentId}</p>
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
                        <h5 className="mb-1">{verificationResult.isAuthentic ? 'Document Authentic' : 'Verification Failed'}</h5>
                        <p className="mb-0">{verificationResult.isAuthentic ? 'The document integrity has been verified.' : 'Document appears to be modified or invalid.'}</p>
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
              The system computes a SHA-256 cryptographic hash of your uploaded document and compares it with the hash stored in our registry.
              If the hashes match, the document is authentic. Any modification to the document, even a single character, will result in a completely different hash.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Verify;