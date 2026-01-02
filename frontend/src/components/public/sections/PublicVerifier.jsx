import React, { useState, useRef, useEffect } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import { useRegistry } from '../../../contexts/RegistryContext';
import { generateHash } from '../../../utils/crypto';
import '../styles/PublicVerifier.css';

const PublicVerifier = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const fileInputRef = useRef(null);
  const cardRef = useRef(null);
  const { findByHash } = useRegistry();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    // Fallback: ensure visibility after a delay if observer doesn't fire
    const fallbackTimer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);
    setResult(null);

    try {
      const hash = await generateHash(file);
      const entry = findByHash(hash);

      setTimeout(() => {
        if (entry) {
          setResult({
            success: true,
            message: 'Document Verified Successfully',
            details: 'This document matches our official registry and has not been tampered with.',
            hash: hash.slice(0, 16) + '...' + hash.slice(-16),
            entry
          });
        } else {
          setResult({
            success: false,
            message: 'Verification Failed',
            details: 'This document could not be found in our registry or may have been modified.',
            hash: hash.slice(0, 16) + '...' + hash.slice(-16)
          });
        }
        setLoading(false);
      }, 1500);
    } catch (err) {
      setResult({
        success: false,
        message: 'Verification Error',
        details: 'An error occurred while processing your document. Please try again.'
      });
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <section id="verifier" className="public-verifier">
      <Container className="py-5">
        <div className="public-section__header">
          <span className="public-section__tag">Public Verification</span>
          <h2 className="public-section__title">Citizen Document Verifier</h2>
          <p className="public-section__subtitle">
            Upload your digital document to verify its authenticity against the LGU Registry.
            Our system will generate a cryptographic fingerprint and compare it with our records.
          </p>
        </div>

        <div 
          className={`public-verifier__card ${isVisible ? 'public-verifier--visible' : ''}`}
          ref={cardRef}
        >
          <div 
            className="public-verifier__upload-zone" 
            onClick={() => !loading && fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              disabled={loading}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            
            <div className="public-verifier__upload-icon">
              <i className="bi bi-cloud-upload"></i>
            </div>
            
            {fileName ? (
              <div>
                <h5 className="public-verifier__upload-title">
                  <i className="bi bi-file-earmark-check me-2 text-success"></i>
                  File Selected
                </h5>
                <p className="public-verifier__upload-filename">{fileName}</p>
                <small className="public-verifier__upload-hint">Click to select a different file</small>
              </div>
            ) : (
              <div>
                <h5 className="public-verifier__upload-title">Click to Browse Official File</h5>
                <p className="public-verifier__upload-text">or drag and drop your document here</p>
                <small className="public-verifier__upload-hint">Supported: PDF, DOC, DOCX, JPG, PNG</small>
              </div>
            )}
          </div>

          {loading && (
            <div className="public-verifier__loading">
              <Spinner animation="border" className="public-verifier__spinner" />
              <div>
                <p className="public-verifier__loading-title">Processing Document</p>
                <small className="public-verifier__loading-text">
                  Generating SHA-256 fingerprint and comparing with registry...
                </small>
              </div>
            </div>
          )}

          {result && !loading && (
            <div className={`public-verifier__result ${result.success ? 'public-verifier__result--success' : 'public-verifier__result--error'}`}>
              <div className="public-verifier__result-icon">
                {result.success ? (
                  <i className="bi bi-check-circle-fill"></i>
                ) : (
                  <i className="bi bi-exclamation-triangle-fill"></i>
                )}
              </div>
              <div className="public-verifier__result-content">
                <h5 className="public-verifier__result-title">
                  {result.success ? '✓ ' : '⚠ '}{result.message}
                </h5>
                <p className="public-verifier__result-details">{result.details}</p>
                
                {result.hash && (
                  <div className="public-verifier__result-hash">
                    <small>Document Fingerprint:</small>
                    <code>{result.hash}</code>
                  </div>
                )}

                {result.entry && (
                  <div className="public-verifier__result-info">
                    <small>Registry Information:</small>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <strong>Document Type:</strong>
                        <span>{result.entry.type}</span>
                      </div>
                      <div className="col-md-6">
                        <strong>Reference ID:</strong>
                        <span>{result.entry.reference}</span>
                      </div>
                    </div>
                  </div>
                )}

                <button className="public-verifier__reset-btn" onClick={handleReset}>
                  <i className="bi bi-arrow-counterclockwise me-2"></i>
                  Verify Another Document
                </button>
              </div>
            </div>
          )}

          {!result && !loading && (
            <div className="public-verifier__features">
              <div className="row g-3 text-center">
                <div className="col-md-4">
                  <i className="bi bi-shield-check public-verifier__feature-icon"></i>
                  <strong className="public-verifier__feature-title">Secure</strong>
                  <small className="public-verifier__feature-text">SHA-256 encryption</small>
                </div>
                <div className="col-md-4">
                  <i className="bi bi-lightning-charge public-verifier__feature-icon"></i>
                  <strong className="public-verifier__feature-title">Instant</strong>
                  <small className="public-verifier__feature-text">Real-time verification</small>
                </div>
                <div className="col-md-4">
                  <i className="bi bi-eye-slash public-verifier__feature-icon"></i>
                  <strong className="public-verifier__feature-title">Private</strong>
                  <small className="public-verifier__feature-text">Files not stored</small>
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};

export default PublicVerifier;