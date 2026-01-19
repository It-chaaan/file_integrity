import React from 'react';
import { Link } from 'react-router-dom';

const HowItWorks = () => {
  return (
    <div className="container py-5">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold mb-3">How It Works</h1>
        <p className="lead text-muted">
          Our verification process uses industry-standard cryptographic techniques to ensure<br />
          your documents remain authentic and tamper-proof.
        </p>
      </div>

      {/* Steps */}
      <div className="row justify-content-center">
        <div className="col-lg-10">
          
          {/* Step 1: Upload Your Document */}
          <div className="mb-4">
            <div className="row">
              <div className="col-md-12">
                <div className="d-flex gap-4">
                  <div className="flex-shrink-0">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                      style={{ 
                        width: '64px', 
                        height: '64px', 
                        backgroundColor: '#0D1526',
                        fontSize: '28px'
                      }}
                    >
                      1
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <div className="card shadow-sm" style={{ border: '1px solid #000000' }}>
                      <div className="card-body p-4">
                        <h4 className="mb-3 fw-bold">Upload Your Document</h4>
                        <p className="text-muted mb-2">
                          Select and upload the legal document you want to verify.
                        </p>
                        <p className="mb-3" style={{ color: '#0D1526' }}>
                          We support <strong>PDF, DOC, DOCX</strong> formats for maximum compatibility.
                        </p>
                        <p className="text-muted small mb-3">
                          Your document is processed securely and is never stored on our servers.
                        </p>
                        
                        {/* Upload Icon */}
                        <div className="text-center mt-3">
                          <div 
                            className="d-inline-flex align-items-center justify-content-center rounded"
                            style={{ 
                              width: '80px', 
                              height: '80px', 
                              backgroundColor: '#F3F4F6'
                            }}
                          >
                            <i className="bi bi-cloud-upload" style={{ fontSize: '2.5rem', color: '#0D1526' }}></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Generate Cryptographic Hash */}
          <div className="mb-4">
            <div className="row">
              <div className="col-md-12">
                <div className="d-flex gap-4">
                  <div className="flex-shrink-0">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                      style={{ 
                        width: '64px', 
                        height: '64px', 
                        backgroundColor: '#0D1526',
                        fontSize: '28px'
                      }}
                    >
                      2
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <div className="card shadow-sm" style={{ border: '1px solid #000000' }}>
                      <div className="card-body p-4">
                        <h4 className="mb-3 fw-bold">Generate Cryptographic Hash (SHA-256)</h4>
                        <p className="text-muted mb-3">
                          The system generates a SHA-256 cryptographic hash — a unique digital fingerprint of your document.
                        </p>
                        <p className="text-muted small mb-3">
                          Why it matters: Even if a single character changes, the hash will be completely different, ensuring absolute hash integrity.
                        </p>
                        <div 
                          className="p-3 rounded font-monospace small"
                          style={{ backgroundColor: '#F3F4F6', color: '#0D1526' }}
                        >
                          <strong>Example:</strong> a3f5e2c…5c4d8f9f
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Verify Digital Signature */}
          <div className="mb-4">
            <div className="row">
              <div className="col-md-12">
                <div className="d-flex gap-4">
                  <div className="flex-shrink-0">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                      style={{ 
                        width: '64px', 
                        height: '64px', 
                        backgroundColor: '#0D1526',
                        fontSize: '28px'
                      }}
                    >
                      3
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <div className="card shadow-sm" style={{ border: '1px solid #000000' }}>
                      <div className="card-body p-4">
                        <h4 className="mb-3 fw-bold">Verify Digital Signature (ECDSA)</h4>
                        <p className="text-muted mb-3">
                          The generated hash is verified using ECDSA digital signatures issued by authorized LGU personnel.
                        </p>
                        
                        <div className="d-flex align-items-start mb-2">
                          <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                          <div>
                            <strong className="text-muted">Document Authenticity</strong>
                            <span className="text-muted"> — Confirms the document is genuine</span>
                          </div>
                        </div>
                        
                        <div className="d-flex align-items-start mb-2">
                          <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                          <div>
                            <strong className="text-muted">Authorized Signer</strong>
                            <span className="text-muted"> — Verifies the LGU official who signed</span>
                          </div>
                        </div>
                        
                        <div className="d-flex align-items-start mb-2">
                          <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                          <div>
                            <strong className="text-muted">Signing Timestamp</strong>
                            <span className="text-muted"> — Records when the signature was created</span>
                          </div>
                        </div>
                        
                        <div className="d-flex align-items-start">
                          <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                          <div>
                            <strong className="text-muted">Key Validity Status</strong>
                            <span className="text-muted"> — Ensures the signing key is active</span>
                          </div>
                        </div>
                        
                        {/* Shield Icon */}
                        <div className="text-center mt-4">
                          <div 
                            className="d-inline-flex align-items-center justify-content-center rounded"
                            style={{ 
                              width: '80px', 
                              height: '80px', 
                              backgroundColor: '#F3F4F6'
                            }}
                          >
                            <i className="bi bi-shield-check" style={{ fontSize: '2.5rem', color: '#0D1526' }}></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Display Verification Result */}
          <div className="mb-4">
            <div className="row">
              <div className="col-md-12">
                <div className="d-flex gap-4">
                  <div className="flex-shrink-0">
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                      style={{ 
                        width: '64px', 
                        height: '64px', 
                        backgroundColor: '#0D1526',
                        fontSize: '28px'
                      }}
                    >
                      4
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <div className="card shadow-sm" style={{ border: '1px solid #000000' }}>
                      <div className="card-body p-4">
                        <h4 className="mb-3 fw-bold">Display Verification Result</h4>
                        <p className="text-muted mb-4">
                          The system instantly displays the verification result, indicating whether your document is authentic and unaltered, or if issues were detected.
                        </p>
                        
                        {/* Verified State */}
                        <div 
                          className="d-flex align-items-center p-3 rounded mb-3"
                          style={{ backgroundColor: '#D1FAE5' }}
                        >
                          <i className="bi bi-check-circle-fill text-success me-2" style={{ fontSize: '1.2rem' }}></i>
                          <div>
                            <strong style={{ color: '#065F46' }}>Verified</strong>
                            <span className="text-muted"> — Document is authentic</span>
                          </div>
                        </div>
                        
                        {/* Invalid State */}
                        <div 
                          className="d-flex align-items-center p-3 rounded mb-3"
                          style={{ backgroundColor: '#FEE2E2' }}
                        >
                          <i className="bi bi-x-circle-fill text-danger me-2" style={{ fontSize: '1.2rem' }}></i>
                          <div>
                            <strong style={{ color: '#991B1B' }}>Invalid</strong>
                            <span className="text-muted"> — Signature was rejected</span>
                          </div>
                        </div>
                        
                        {/* Expired Key State */}
                        <div 
                          className="d-flex align-items-center p-3 rounded"
                          style={{ backgroundColor: '#FEF3C7' }}
                        >
                          <i className="bi bi-exclamation-circle-fill text-warning me-2" style={{ fontSize: '1.2rem' }}></i>
                          <div>
                            <strong style={{ color: '#92400E' }}>Expired Key</strong>
                            <span className="text-muted"> — Signing key expired</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-5 pt-4">
        <h3 className="mb-4">Ready to Verify Your Document?</h3>
        <p className="text-muted mb-4">
          Start protecting your legal documents with secure cryptographic verification today.
        </p>
        <Link 
          to="/verify"
          className="btn btn-primary btn-lg px-5 py-3 fw-semibold"
        >
          Verify Document
        </Link>
        <p className="text-muted small mt-3">
          No registration required • Instant results • Free for all citizens
        </p>
      </div>
    </div>
  );
};

export default HowItWorks;
