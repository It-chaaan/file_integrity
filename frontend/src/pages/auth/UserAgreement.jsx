import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentSession } from '../../services/auth';
import { createAuditLog } from '../../api/adapter';

function UserAgreement() {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Get user from session on mount
  useEffect(() => {
    const session = getCurrentSession();
    if (!session || !session.user) {
      navigate('/login', { replace: true });
      return;
    }
    setCurrentUser(session.user);
    setLoadingUser(false);
  }, [navigate]);

  const handleAgree = async () => {
    if (!agreed) return;
    
    setIsLoading(true);
    
    try {
      // Store agreement acceptance in localStorage
      localStorage.setItem('userAgreementAccepted', JSON.stringify({
        userId: currentUser?.id,
        userName: currentUser?.name,
        acceptedAt: new Date().toISOString()
      }));

      // Log to audit logs (works in both mock and API mode)
      await createAuditLog({
        userId: currentUser?.id,
        userName: currentUser?.name,
        action: 'AGREEMENT_ACCEPTED',
        details: 'User accepted User Responsibility Agreement',
        status: 'Success'
      });

      // Redirect to appropriate dashboard based on user role
      setTimeout(() => {
        const userRole = currentUser?.role?.toLowerCase();
        
        if (userRole === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (userRole === 'staff') {
          navigate('/staff/dashboard', { replace: true });
        } else {
          // Fallback to login if role is not recognized
          navigate('/login', { replace: true });
        }
      }, 800);
    } catch (error) {
      console.error('Error accepting agreement:', error);
      // Still navigate even if audit log fails
      setTimeout(() => {
        const userRole = currentUser?.role?.toLowerCase();
        
        if (userRole === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else if (userRole === 'staff') {
          navigate('/staff/dashboard', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      }, 800);
    }
  };

  const handleCancel = () => {
    localStorage.removeItem('sessionData');
    navigate('/login', { replace: true });
  };

  // Show loading state while fetching user
  if (loadingUser) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#0D1526' }}>
        <div className="text-center">
          <div className="spinner-border text-white mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-white-50">Loading agreement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#0D1526', padding: '20px' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-md-10 col-12">
            {/* Header */}
            <div className="text-center mb-5">
              <div className="d-inline-flex align-items-center justify-content-center mb-4" style={{
                width: '80px',
                height: '80px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%'
              }}>
                <i className="bi bi-shield-check" style={{ fontSize: '40px', color: '#FFFFFF' }}></i>
              </div>
              <h1 className="fw-bold text-white mb-2" style={{ fontSize: 'clamp(28px, 6vw, 36px)' }}>User Responsibility Agreement</h1>
              <p className="text-white-50" style={{ fontSize: '15px' }}>Please review and accept to continue</p>
            </div>

            {/* Main Card */}
            <div className="card border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <div className="card-body p-4 p-md-5">
                {/* Welcome Banner */}
                <div className="alert mb-4" style={{ 
                  backgroundColor: '#EFF6FF', 
                  border: '1px solid #BFDBFE',
                  borderRadius: '12px',
                  padding: '16px',
                  borderLeft: '4px solid #1E40AF'
                }}>
                  <div className="d-flex gap-3">
                    <i className="bi bi-info-circle-fill flex-shrink-0" style={{ color: '#1E40AF', fontSize: '20px' }}></i>
                    <div>
                      <h6 className="mb-1 fw-semibold" style={{ color: '#1E40AF' }}>Welcome, {currentUser?.name || 'User'}!</h6>
                      <p className="mb-0" style={{ fontSize: '14px', color: '#1E40AF' }}>
                        Please read and accept the User Responsibility Agreement to continue using PARITY.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Agreement Content */}
                <div className="mb-4">
                  <h3 className="fw-bold mb-3" style={{ color: '#0D1526', fontSize: 'clamp(20px, 4vw, 24px)' }}>
                    PARITY Legal Documents Verification System<br/>
                    <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: 'normal' }}>User Responsibility and System Usage Agreement</span>
                  </h3>

                  <div style={{ 
                    maxHeight: '400px', 
                    overflowY: 'auto',
                    paddingRight: '10px'
                  }}>
                    <div className="mb-4">
                      <p style={{ fontSize: '15px', lineHeight: '1.8', color: '#1F2937' }}>
                        I acknowledge that I am about to access the <strong>PARITY Legal Documents Verification System</strong>, 
                        a secure platform designed to facilitate the verification, validation, and management of legal documents 
                        within the Local Government Unit (LGU). This system is intended for authorized users only to ensure the 
                        integrity and authenticity of official documents.
                      </p>
                    </div>

                    <div className="mb-4">
                      <p className="fw-semibold mb-3" style={{ fontSize: '15px', color: '#0D1526' }}>
                        By accepting this agreement, I understand and commit to the following:
                      </p>

                      <div className="mb-3">
                        <div className="d-flex gap-3 mb-2">
                          <div style={{ 
                            minWidth: '28px', 
                            width: '28px', 
                            height: '28px', 
                            backgroundColor: '#0D1526', 
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}>1</div>
                          <div>
                            <strong style={{ color: '#0D1526', fontSize: '15px' }}>Authorized Access Only:</strong>
                            <p style={{ fontSize: '14px', color: '#6B7280', margin: '5px 0 0 0' }}>
                              I will use PARITY solely for authorized legal document verification and management purposes as defined by the LGU. 
                              I will not share my login credentials or grant access to unauthorized personnel.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="d-flex gap-3 mb-2">
                          <div style={{ 
                            minWidth: '28px', 
                            width: '28px', 
                            height: '28px', 
                            backgroundColor: '#0D1526', 
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}>2</div>
                          <div>
                            <strong style={{ color: '#0D1526', fontSize: '15px' }}>Document Integrity:</strong>
                            <p style={{ fontSize: '14px', color: '#6B7280', margin: '5px 0 0 0' }}>
                              I will ensure that all documents uploaded to PARITY are authentic, properly authorized, 
                              and compliant with LGU regulations. I will not upload falsified, tampered, or unauthorized documents.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="d-flex gap-3 mb-2">
                          <div style={{ 
                            minWidth: '28px', 
                            width: '28px', 
                            height: '28px', 
                            backgroundColor: '#0D1526', 
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}>3</div>
                          <div>
                            <strong style={{ color: '#0D1526', fontSize: '15px' }}>Data Confidentiality:</strong>
                            <p style={{ fontSize: '14px', color: '#6B7280', margin: '5px 0 0 0' }}>
                              I understand that sensitive information accessed through PARITY is confidential. 
                              I will not disclose, distribute, or share document information with unauthorized parties.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="d-flex gap-3 mb-2">
                          <div style={{ 
                            minWidth: '28px', 
                            width: '28px', 
                            height: '28px', 
                            backgroundColor: '#0D1526', 
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}>4</div>
                          <div>
                            <strong style={{ color: '#0D1526', fontSize: '15px' }}>Compliance and Audit:</strong>
                            <p style={{ fontSize: '14px', color: '#6B7280', margin: '5px 0 0 0' }}>
                              I acknowledge that all my activities within PARITY are monitored and logged for security, 
                              compliance, and audit purposes. These logs may be reviewed by authorized personnel.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="d-flex gap-3">
                          <div style={{ 
                            minWidth: '28px', 
                            width: '28px', 
                            height: '28px', 
                            backgroundColor: '#0D1526', 
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}>5</div>
                          <div>
                            <strong style={{ color: '#0D1526', fontSize: '15px' }}>Liability and Accountability:</strong>
                            <p style={{ fontSize: '14px', color: '#6B7280', margin: '5px 0 0 0' }}>
                              I accept full responsibility for any actions taken under my account. 
                              Any violations of this agreement may result in suspension of access and potential disciplinary actions.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Checkbox Agreement */}
                <div className="form-check mb-4 p-3" style={{ backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="agreeCheckbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    style={{ 
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer',
                      accentColor: '#0D1526'
                    }}
                  />
                  <label className="form-check-label ms-2" htmlFor="agreeCheckbox" style={{ cursor: 'pointer', fontSize: '14px' }}>
                    I have read and understand the User Responsibility Agreement and agree to comply with all terms and conditions
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="d-flex gap-3 justify-content-center flex-wrap">
                  <button 
                    className="btn fw-semibold"
                    onClick={handleAgree}
                    disabled={!agreed || isLoading}
                    style={{ 
                      backgroundColor: agreed ? '#0D1526' : '#D1D5DB',
                      color: '#FFFFFF',
                      padding: '12px 40px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '15px',
                      cursor: agreed ? 'pointer' : 'not-allowed',
                      minWidth: '150px'
                    }}
                  >
                    <i className="bi bi-check-circle me-2"></i>
                    {isLoading ? 'Processing...' : 'I Agree'}
                  </button>
                  <button 
                    className="btn btn-outline-secondary fw-semibold"
                    onClick={handleCancel}
                    style={{ 
                      padding: '12px 40px',
                      borderRadius: '8px',
                      fontSize: '15px',
                      minWidth: '150px'
                    }}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Cancel
                  </button>
                </div>

                {/* Security Notice */}
                <div className="alert mt-4 mb-0" style={{ 
                  backgroundColor: '#FEF3C7', 
                  border: '1px solid #FCD34D',
                  borderRadius: '8px',
                  padding: '14px'
                }}>
                  <p className="mb-0" style={{ fontSize: '13px', color: '#92400E', lineHeight: '1.6' }}>
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    <strong>Security Notice:</strong> Your acceptance of this agreement is legally binding. 
                    By clicking "I Agree", you acknowledge understanding all terms. Unauthorized access or misuse of PARITY may result in legal consequences.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserAgreement;
