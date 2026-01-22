import React, { useState } from 'react';
import { validateFileType, validateFileSize } from '../../services/utils';

function Verify() {
  const [file, setFile] = useState(null);
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

  const handleVerify = (e) => {
    e.preventDefault();
    if (!file) return;

    setIsVerifying(true);
    
    // Simulate verification process
    setTimeout(() => {
      setIsVerifying(false);
      setResult({
        isValid: Math.random() > 0.3, // 70% success rate
        documentId: 'DOC-2026-001847',
        fileName: file.name,
        hash: 'd4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35',
        signature: '3045022100f1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0',
        verifiedDate: new Date().toLocaleString()
      });
    }, 2000);
  };

  const resetForm = () => {
    setFile(null);
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
                <p className="text-muted mb-4">Computing cryptographic hash and validating signature</p>
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
                      {result.isValid ? 'Document Verified' : 'Verification Failed'}
                    </h4>
                    <p className="mb-0">
                      {result.isValid 
                        ? 'Document is authentic and has not been tampered with' 
                        : 'Document appears to be modified or invalid'}
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
                      <label className="small text-muted">Document ID</label>
                      <p className="mb-0">{result.documentId}</p>
                    </div>
                    <div className="col-12">
                      <label className="small text-muted">Verification Date</label>
                      <p className="mb-0">{result.verifiedDate}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h6 className="text-muted mb-2">SHA-256 Hash</h6>
                  <div className="p-3 bg-light rounded">
                    <code className="small text-break">{result.hash}</code>
                  </div>
                </div>

                <div className="mb-4">
                  <h6 className="text-muted mb-2">Digital Signature</h6>
                  <div className="p-3 bg-light rounded">
                    <code className="small text-break">{result.signature}</code>
                  </div>
                </div>

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
            <h1 className="fw-bold mb-3">Verify Your Document</h1>
            <p className="text-muted lead">Upload your document and verify its authenticity using cryptographic validation</p>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body p-5">
              <form onSubmit={handleVerify}>
                {/* File Upload */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Document Upload</label>
                  <div 
                    className="border-2 border-dashed rounded p-5 text-center"
                    style={{ borderColor: '#dee2e6', borderStyle: 'dashed' }}
                  >
                    <i className="bi bi-cloud-upload text-primary mb-3" style={{ fontSize: '3rem' }}></i>
                    <p className="mb-3">
                      {file ? (
                        <><i className="bi bi-file-earmark-text me-2"></i>{file.name}</>
                      ) : (
                        <>Drop your document here<br />or click to browse from your computer</>
                      )}
                    </p>
                    <input
                      type="file"
                      id="fileInput"
                      className="d-none"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="fileInput" className="btn btn-primary">
                      {file ? 'Change File' : 'Select File'}
                    </label>
                    <p className="text-muted small mt-3 mb-0">Supports PDF, DOC, DOCX, TXT (max 5MB)</p>
                    {error && (
                      <p className="text-danger small mt-2 mb-0">{error}</p>
                    )}
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg w-100"
                  disabled={!file}
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
              Your document is processed securely and is never stored on our servers
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
                  The system computes a SHA-256 cryptographic hash of your uploaded document and compares it with the hash stored in our registry.
                  If the hashes match, the document is authentic. Any modification to the document, even a single character, will result in a completely different hash.
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