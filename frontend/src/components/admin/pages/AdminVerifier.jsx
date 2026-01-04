import React, { useState, useRef } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import { useRegistry } from '../../../contexts/RegistryContext';
import { verifyFile } from '../../../utils/crypto';
import '../styles/AdminVerifier.css';

const AdminVerifier = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef(null);
  const { registry, findByHash } = useRegistry();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      setResult(null);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setFileName('');
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleVerify = async () => {
    if (!selectedFile) {
      setResult({
        success: false,
        message: 'Verification Error',
        details: 'Please select a file to verify.'
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { generateHash } = await import('../../../utils/crypto');
      const hash = await generateHash(selectedFile);
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
      console.error(err);
    }
  };

  return (
    <div className="admin-verifier">
      <div className="admin-verifier__card">
        <div 
          className="admin-verifier__upload-zone" 
          onClick={() => !loading && fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            disabled={loading}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
          
          <div className="admin-verifier__upload-icon">
            <i className="bi bi-cloud-upload"></i>
          </div>
          
          {fileName ? (
            <div>
              <h5 className="admin-verifier__upload-title">
                <i className="bi bi-file-earmark-check me-2 text-success"></i>
                File Selected
              </h5>
              <p className="admin-verifier__upload-filename">{fileName}</p>
              <small className="admin-verifier__upload-hint">Click to select a different file</small>
            </div>
          ) : (
            <div>
              <h5 className="admin-verifier__upload-title">Click to Browse Document</h5>
              <p className="admin-verifier__upload-text">or drag and drop your file here</p>
              <small className="admin-verifier__upload-hint">Supported: PDF, DOC, DOCX, JPG, PNG</small>
            </div>
          )}
        </div>

        {loading && (
          <div className="admin-verifier__loading">
            <Spinner animation="border" className="admin-verifier__spinner" />
            <div>
              <p className="admin-verifier__loading-title">Verifying Document</p>
              <small className="admin-verifier__loading-text">
                Generating SHA-256 fingerprint and comparing with registry...
              </small>
            </div>
          </div>
        )}

        {result && !loading && (
          <div className={`admin-verifier__result ${result.success ? 'admin-verifier__result--success' : 'admin-verifier__result--error'}`}>
            <div className="admin-verifier__result-icon">
              {result.success ? (
                <i className="bi bi-check-circle-fill"></i>
              ) : (
                <i className="bi bi-exclamation-triangle-fill"></i>
              )}
            </div>
            <div className="admin-verifier__result-content">
              <h5 className="admin-verifier__result-title">
                {result.success ? '✓ ' : '⚠ '}{result.message}
              </h5>
              <p className="admin-verifier__result-details">{result.details}</p>
              
              {result.hash && (
                <div className="admin-verifier__result-hash">
                  <small>Document Fingerprint:</small>
                  <code>{result.hash}</code>
                </div>
              )}

              {result.entry && (
                <div className="admin-verifier__result-info">
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

              <button className="admin-verifier__reset-btn" onClick={handleReset}>
                <i className="bi bi-arrow-counterclockwise me-2"></i>
                Verify Another Document
              </button>
            </div>
          </div>
        )}

        {!result && !loading && selectedFile && (
          <div className="admin-verifier__action-container">
            <button 
              className="admin-verifier__verify-btn"
              onClick={handleVerify}
            >
              <i className="bi bi-shield-check me-2"></i>
              Verify Document
            </button>
          </div>
        )}

        {!result && !loading && !selectedFile && (
          <div className="admin-verifier__features">
            <div className="row g-3 text-center">
              <div className="col-md-4">
                <i className="bi bi-shield-check admin-verifier__feature-icon"></i>
                <strong className="admin-verifier__feature-title">Secure</strong>
                <small className="admin-verifier__feature-text">SHA-256 encryption</small>
              </div>
              <div className="col-md-4">
                <i className="bi bi-lightning-charge admin-verifier__feature-icon"></i>
                <strong className="admin-verifier__feature-title">Instant</strong>
                <small className="admin-verifier__feature-text">Real-time verification</small>
              </div>
              <div className="col-md-4">
                <i className="bi bi-database-check admin-verifier__feature-icon"></i>
                <strong className="admin-verifier__feature-title">Registry Check</strong>
                <small className="admin-verifier__feature-text">Against {registry.length} documents</small>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVerifier;