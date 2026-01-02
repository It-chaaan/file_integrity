import React, { useState, useRef } from 'react';
import { Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { useRegistry } from '../../../contexts/RegistryContext';
import { verifyFile } from '../../../utils/crypto';
import '../styles/AdminVerifier.css';

const AdminVerifier = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedHash, setSelectedHash] = useState('');
  const [manualHash, setManualHash] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef(null);
  const { registry } = useRegistry();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
    }
  };

  const handleVerify = async () => {
    if (!selectedFile) {
      setResult({
        type: 'warning',
        message: 'Please select a file to verify.'
      });
      return;
    }

    const expectedHash = selectedHash || manualHash.trim();
    if (!expectedHash) {
      setResult({
        type: 'warning',
        message: 'Please select a registry entry or paste an expected hash.'
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const verification = await verifyFile(selectedFile, expectedHash);
      
      setTimeout(() => {
        if (verification.success && verification.match) {
          setResult({
            type: 'success',
            message: '✓ MATCH — File fingerprint matches registry.',
            hash: verification.hash
          });
        } else if (verification.success && !verification.match) {
          setResult({
            type: 'warning',
            message: '⚠ MISMATCH — File does not match expected fingerprint.',
            hash: verification.hash
          });
        } else {
          setResult({
            type: 'danger',
            message: 'Verification failed. Please try again.'
          });
        }
        setLoading(false);
      }, 800);
    } catch (err) {
      setResult({
        type: 'danger',
        message: 'Error during verification.'
      });
      setLoading(false);
      console.error(err);
    }
  };

  return (
    <div className="admin-verifier">
      <div className="admin-verifier__panel">
        <h5 className="admin-verifier__title">Document Verifier</h5>
        
        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label className="admin-verifier__label">Select file to verify</Form.Label>
              <Form.Control
                type="file"
                ref={fileInputRef}
                className="admin-verifier__input"
                onChange={handleFileChange}
              />
              {selectedFile && (
                <small className="admin-verifier__hint">Selected: {selectedFile.name}</small>
              )}
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label className="admin-verifier__label">Compare against</Form.Label>
              <Form.Select
                className="admin-verifier__select"
                value={selectedHash}
                onChange={(e) => {
                  setSelectedHash(e.target.value);
                  if (e.target.value) setManualHash('');
                }}
              >
                <option value="">-- Choose registry entry --</option>
                {registry.map((entry, idx) => (
                  <option key={idx} value={entry.hash}>
                    {entry.reference || entry.name} — {entry.hash.slice(0, 10)}...
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Control
                type="text"
                className="admin-verifier__input"
                placeholder="Or paste expected SHA-256 hash here"
                value={manualHash}
                onChange={(e) => {
                  setManualHash(e.target.value);
                  if (e.target.value) setSelectedHash('');
                }}
              />
            </Form.Group>
          </Col>
        </Row>
        
        <div className="admin-verifier__actions">
          <Button 
            className="admin-verifier__verify-btn"
            onClick={handleVerify}
            disabled={loading}
          >
            {loading ? 'VERIFYING...' : 'VERIFY'}
          </Button>
          {result && (
            <Alert variant={result.type} className="admin-verifier__result">
              <strong>{result.message}</strong>
              {result.hash && (
                <div className="admin-verifier__hash">
                  <strong>Computed Hash:</strong>
                  <br />
                  <code>{result.hash}</code>
                </div>
              )}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminVerifier;