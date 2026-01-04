import React, { useState } from 'react';
import { Modal, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import './styles/StaffLoginModal.css';

const StaffLoginModal = ({ show, onHide }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(username, password);
      onHide();
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUsername('');
    setPassword('');
    setError('');
    setRemember(false);
    onHide();
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      size="lg" 
      centered
      className="staff-login-modal"
    >
      <Modal.Body className="staff-login-modal__body">
        <Row className="g-0">
          {/* Left Side - Branding */}
          <Col md={5} className="staff-login-modal__brand">
            <div className="staff-login-modal__brand-content">
              <svg 
                className="staff-login-modal__logo" 
                width="96" 
                height="96" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="modalLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00F2FF" />
                    <stop offset="100%" stopColor="#0D51A1" />
                  </linearGradient>
                </defs>
                <path 
                  d="M12 2l7 3v5c0 5-3.5 9.7-7 11-3.5-1.3-7-6-7-11V5l7-3z" 
                  fill="url(#modalLogoGradient)"
                  opacity="0.9"
                />
                <circle cx="12" cy="12" r="3" fill="#fff" opacity="0.3" />
                <path 
                  d="M10 12l2 2 4-4" 
                  stroke="#fff" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  fill="none"
                />
              </svg>
              <h5 className="staff-login-modal__brand-title">PARITY</h5>
              <small className="staff-login-modal__brand-subtitle">Automated Document Integrity Verification System</small>
            </div>
          </Col>

          {/* Right Side - Form */}
          <Col md={7}>
            <div className="staff-login-modal__form-container">
              <div className="staff-login-modal__header">
                <div className="staff-login-modal__icon">
                  <i className="bi bi-shield-lock"></i>
                </div>
                <div>
                  <h5 className="staff-login-modal__title">Admin Portal</h5>
                  <p className="staff-login-modal__subtitle">Authorized access only</p>
                </div>
              </div>

              <Form onSubmit={handleSubmit} className="staff-login-modal__form">
                <Form.Group className="mb-3">
                  <Form.Label className="staff-login-modal__label">
                    Username
                  </Form.Label>
                  <Form.Control
                    type="text"
                    className="staff-login-modal__input"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="staff-login-modal__label">
                    Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    className="staff-login-modal__input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="rememberMe"
                    className="staff-login-modal__checkbox"
                    label="Remember me on this device"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                </Form.Group>

                <p className="staff-login-modal__notice">
                  <i className="bi bi-info-circle me-2"></i>
                  For authorized staff only. Do not share credentials.
                </p>

                {error && (
                  <div className="staff-login-modal__error">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                <div className="staff-login-modal__actions">
                  <Button 
                    type="submit" 
                    className="staff-login-modal__submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Sign In
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    className="staff-login-modal__cancel"
                    onClick={handleClose}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default StaffLoginModal;