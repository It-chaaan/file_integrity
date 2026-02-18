import React from 'react';

const HowItWorks = () => {
  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold mb-3">How PARITY Works</h1>
        <p className="lead text-muted">
          A secure cryptographic process managed by authorized LGU personnel to protect the integrity of
          government documents.
        </p>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="mb-4">
            <div className="d-flex gap-4">
              <div className="flex-shrink-0">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                  style={{ width: '64px', height: '64px', backgroundColor: '#0D1526', fontSize: '28px' }}
                >
                  1
                </div>
              </div>
              <div className="flex-grow-1">
                <div className="card shadow-sm">
                  <div className="card-body p-4">
                    <h4 className="mb-3 fw-bold">LGU Staff Upload Document</h4>
                    <p className="text-muted mb-3">
                      Authorized LGU personnel securely upload official documents to the PARITY system. Access is
                      restricted to verified government employees with proper credentials.
                    </p>
                    <div className="d-flex align-items-start text-muted small">
                      <i className="bi bi-shield-lock me-2 mt-1"></i>
                      <span>All uploads are authenticated using multi-factor authentication (2FA) and logged for audit purposes.</span>
                    </div>
                    <div className="text-center mt-4">
                      <div className="d-inline-flex align-items-center justify-content-center rounded"
                        style={{ width: '72px', height: '72px', backgroundColor: '#F3F4F6' }}
                      >
                        <i className="bi bi-cloud-arrow-up" style={{ fontSize: '2.25rem', color: '#0D1526' }}></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="d-flex gap-4">
              <div className="flex-shrink-0">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                  style={{ width: '64px', height: '64px', backgroundColor: '#0D1526', fontSize: '28px' }}
                >
                  2
                </div>
              </div>
              <div className="flex-grow-1">
                <div className="card shadow-sm">
                  <div className="card-body p-4">
                    <h4 className="mb-3 fw-bold">Generate Cryptographic Hash (SHA-256)</h4>
                    <p className="text-muted mb-3">
                      The system generates a SHA-256 cryptographic hash — a unique 256-bit digital fingerprint of
                      the document.
                    </p>
                    <p className="text-muted small mb-3">
                      Even a single character change in the document will make the hash completely different, ensuring
                      absolute integrity detection.
                    </p>
                    <div className="p-3 rounded font-monospace small" style={{ backgroundColor: '#F3F4F6', color: '#0D1526' }}>
                      <strong>Example:</strong> a9f3c4b1f8...9f2d7c4e0a
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="d-flex gap-4">
              <div className="flex-shrink-0">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                  style={{ width: '64px', height: '64px', backgroundColor: '#0D1526', fontSize: '28px' }}
                >
                  3
                </div>
              </div>
              <div className="flex-grow-1">
                <div className="card shadow-sm">
                  <div className="card-body p-4">
                    <h4 className="mb-3 fw-bold">Apply Digital Signature (ECDSA)</h4>
                    <p className="text-muted mb-3">
                      The chosen hash is digitally signed using ECDSA by authorized cryptographic keys managed by the LGU.
                    </p>
                    <div className="d-flex align-items-start mb-2">
                      <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                      <div>
                        <strong className="text-muted">Document Authenticity</strong>
                        <span className="text-muted"> — Cryptographically proves the document is genuine</span>
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
                        <span className="text-muted"> — Records the exact time of signing</span>
                      </div>
                    </div>
                    <div className="d-flex align-items-start mb-3">
                      <i className="bi bi-check-circle-fill text-success me-2 mt-1"></i>
                      <div>
                        <strong className="text-muted">Non-Repudiation</strong>
                        <span className="text-muted"> — Signer cannot deny having signed the document</span>
                      </div>
                    </div>
                    <div className="p-3 rounded" style={{ backgroundColor: '#D1FAE5' }}>
                      <div className="d-flex align-items-start">
                        <i className="bi bi-key text-success me-2 mt-1"></i>
                        <span className="text-muted">
                          Key Management: Cryptographic keys are securely stored in hardware security modules (HSM)
                          and rotated according to government security standards.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="d-flex gap-4">
              <div className="flex-shrink-0">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                  style={{ width: '64px', height: '64px', backgroundColor: '#0D1526', fontSize: '28px' }}
                >
                  4
                </div>
              </div>
              <div className="flex-grow-1">
                <div className="card shadow-sm">
                  <div className="card-body p-4">
                    <h4 className="mb-3 fw-bold">Store in Secure Registry</h4>
                    <p className="text-muted mb-3">
                      The signed document hash is stored in a tamper-proof registry with complete audit trails. The
                      actual document content is never stored — only the cryptographic hash and signature metadata.
                    </p>
                    <div className="row g-3 mb-3">
                      <div className="col-md-6">
                        <div className="p-3 rounded" style={{ backgroundColor: '#F9FAFB' }}>
                          <h6 className="fw-bold mb-2">Stored Information</h6>
                          <ul className="mb-0 small text-muted">
                            <li>Document hash (SHA-256)</li>
                            <li>Digital signature (ECDSA)</li>
                            <li>Signing timestamp</li>
                            <li>Document reference ID</li>
                          </ul>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 rounded" style={{ backgroundColor: '#F9FAFB' }}>
                          <h6 className="fw-bold mb-2">Not Stored</h6>
                          <ul className="mb-0 small text-muted">
                            <li>Actual document content</li>
                            <li>Personal information</li>
                            <li>Private keys</li>
                            <li>Physical signatures</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 rounded" style={{ backgroundColor: '#FEF3C7' }}>
                      <div className="d-flex align-items-start">
                        <i className="bi bi-exclamation-circle text-warning me-2 mt-1"></i>
                        <span className="text-muted">
                          Privacy by Design: PARITY complies with the Data Privacy Act of 2012 (R.A. 10173) by storing
                          only cryptographic hashes, not personal data.
                        </span>
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
  );
};

export default HowItWorks;
