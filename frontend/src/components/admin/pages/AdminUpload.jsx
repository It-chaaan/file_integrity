import React, { useState, useRef } from 'react';
import { Row, Col, Button, Form, Alert } from 'react-bootstrap';
import { useRegistry } from '../../../contexts/RegistryContext';
import { useAuth } from '../../../contexts/AuthContext';
import { generateHash } from '../../../utils/crypto';
import '../styles/AdminUpload.css';

const AdminUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState('Barangay Clearance');
  const [reference, setReference] = useState('');
  const [currentHash, setCurrentHash] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState(null);
  
  const fileInputRef = useRef(null);
  const { addEntry } = useRegistry();
  const { user } = useAuth();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setCurrentHash('');
      setNotification(null);
    }
  };

  const handleGenerateAndRegister = async () => {
    if (!selectedFile) {
      setNotification({
        type: 'danger',
        message: 'Please select a file first.'
      });
      return;
    }

    setIsProcessing(true);
    try {
      const hash = await generateHash(selectedFile);
      setCurrentHash(hash);

      const entry = {
        name: selectedFile.name,
        hash,
        type: documentType,
        reference: reference || `BGY-${Date.now()}`,
        signedBy: user?.username || 'Admin',
        timestamp: Date.now(),
        file: selectedFile,
      };

      addEntry(entry);

      setNotification({
        type: 'success',
        message: 'Document registered successfully!'
      });

      setTimeout(() => {
        setSelectedFile(null);
        setDocumentType('Barangay Clearance');
        setReference('');
        setCurrentHash('');
        setNotification(null);
      }, 2000);
    } catch (err) {
      setNotification({
        type: 'danger',
        message: 'Failed to process document.'
      });
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="admin-upload">
      <Row className="g-3 justify-content-center">
        <Col xl={8} lg={10}>
          <div className="admin-upload__panel">
            <div className="admin-upload__panel-header">
              <h5>Register New Document</h5>
              <small>Upload and register official barangay documents</small>
            </div>

            <div className="admin-upload__container">
              {/* Upload Zone */}
              <div 
                className={`admin-upload__zone ${selectedFile ? 'admin-upload__zone--has-file' : ''}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                
                <div className="admin-upload__zone-icon">
                  {selectedFile ? (
                    <i className="bi bi-file-earmark-check"></i>
                  ) : (
                    <i className="bi bi-cloud-upload"></i>
                  )}
                </div>
                
                <div className="admin-upload__zone-text">
                  {selectedFile ? (
                    <>
                      <h6 className="text-success mb-2">
                        <i className="bi bi-check-circle me-2"></i>
                        File Selected
                      </h6>
                      <p className="mb-1">{selectedFile.name}</p>
                      <small>
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </small>
                      <div className="mt-2">
                        <small>Click to select a different file</small>
                      </div>
                    </>
                  ) : (
                    <>
                      <h6 className="mb-2">Click to Upload Document</h6>
                      <p className="mb-2">or drag and drop file here</p>
                      <small>Supported: PDF, DOC, DOCX, JPG, PNG (Max 10MB)</small>
                    </>
                  )}
                </div>
              </div>

              {/* Document Details Form */}
              <Row className="g-3 mt-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Document Type</Form.Label>
                    <Form.Select 
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value)}
                      className="admin-upload__select"
                    >
                      <option>Barangay Clearance</option>
                      <option>Certificate of Indigency</option>
                      <option>Business Permit (Local)</option>
                      <option>Barangay Ordinance</option>
                      <option>Community Tax Certificate</option>
                      <option>Barangay ID</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Reference ID (Optional)</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="BGY-2025-XXXX"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      className="admin-upload__input"
                    />
                    <Form.Text>Leave empty for auto-generation</Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              {/* Fingerprint Display */}
              {currentHash && (
                <div className="admin-upload__hash-box">
                  <div className="admin-upload__hash-header">
                    <span>
                      <i className="bi bi-shield-lock me-2"></i>
                      Document Fingerprint
                    </span>
                    <Button 
                      size="sm" 
                      variant="link"
                      className="admin-upload__copy-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(currentHash);
                        alert('Fingerprint copied to clipboard!');
                      }}
                    >
                      <i className="bi bi-clipboard me-1"></i>
                      Copy
                    </Button>
                  </div>
                  <code className="admin-upload__hash-code">{currentHash}</code>
                </div>
              )}

              {/* Action Buttons */}
              <div className="admin-upload__actions">
                <Button 
                  className="admin-upload__submit-btn"
                  onClick={handleGenerateAndRegister}
                  disabled={!selectedFile || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-fingerprint me-2"></i>
                      Register Document
                    </>
                  )}
                </Button>
                <Button 
                  className="admin-upload__clear-btn"
                  onClick={() => {
                    setSelectedFile(null);
                    setCurrentHash('');
                    setReference('');
                    setNotification(null);
                  }}
                  disabled={!selectedFile || isProcessing}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Clear
                </Button>
              </div>

              {/* Notification */}
              {notification && (
                <Alert 
                  variant={notification.type} 
                  className="admin-upload__notification"
                  dismissible
                  onClose={() => setNotification(null)}
                >
                  <i className={`bi ${notification.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'} me-2`}></i>
                  {notification.message}
                </Alert>
              )}
            </div>
          </div>

          {/* Help Section */}
          <div className="admin-upload__help-panel">
            <div className="admin-upload__help-header">
              <h6>
                <i className="bi bi-info-circle me-2"></i>
                How It Works
              </h6>
            </div>
            <div className="admin-upload__help-content">
              <Row className="g-3">
                <Col md={4}>
                  <div className="admin-upload__help-step">
                    <div className="admin-upload__help-number">1</div>
                    <h6>Upload Document</h6>
                    <p>Select the official barangay document you want to register</p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="admin-upload__help-step">
                    <div className="admin-upload__help-number">2</div>
                    <h6>Generate Fingerprint</h6>
                    <p>System creates a unique SHA-256 hash for the document</p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="admin-upload__help-step">
                    <div className="admin-upload__help-number">3</div>
                    <h6>Register & Verify</h6>
                    <p>Document is registered and can be verified anytime</p>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default AdminUpload;