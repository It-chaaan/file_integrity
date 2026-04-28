import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentSession, refreshCurrentUser } from '../../services/auth';
import { createAuditLog } from '../../api/logs.api';

function UserAgreement() {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Get user from session on mount
  useEffect(() => {
    const resolveUser = async () => {
      const session = getCurrentSession();

      if (!session) {
        navigate('/login', { replace: true });
        return;
      }

      if (session.user) {
        setCurrentUser(session.user);
        setLoadingUser(false);
        return;
      }

      const fetchedUser = await refreshCurrentUser();
      if (!fetchedUser) {
        navigate('/login', { replace: true });
        return;
      }

      setCurrentUser(fetchedUser);
      setLoadingUser(false);
    };

    resolveUser();
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

      // Log to audit trail endpoint
      await createAuditLog({
        userId: currentUser?.id,
        userName: currentUser?.name,
        action: 'AGREEMENT_ACCEPTED',
        details: 'User accepted Enterprise System Usage Agreement',
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
              <h1 className="fw-bold text-white mb-2" style={{ fontSize: 'clamp(28px, 6vw, 36px)' }}>Enterprise System Usage Agreement</h1>
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
                        Please read and accept the Enterprise System Usage Agreement to continue using PARITY.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Agreement Content */}
                <div className="mb-4">
                  <h3 className="fw-bold mb-3" style={{ color: '#0D1526', fontSize: 'clamp(20px, 4vw, 24px)' }}>
                    PARITY Enterprise Document Integrity Platform<br/>
                    <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: 'normal' }}>Enterprise System Usage Agreement</span>
                  </h3>

                  <div style={{ 
                    maxHeight: '400px', 
                    overflowY: 'auto',
                    paddingRight: '10px'
                  }}>
                    <div className="mb-4">
                      <p style={{ fontSize: '15px', lineHeight: '1.8', color: '#1F2937' }}>
                        I acknowledge that I am about to access the <strong>PARITY Enterprise Document Integrity Platform</strong>, 
                        a security-critical corporate system designed to protect, verify, and audit enterprise documents including 
                        contracts, financial records, compliance files, and HR agreements. This platform is for authorized corporate use only.
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
                              I will use PARITY only for approved corporate activities and will not share credentials, sessions, or system access with unauthorized parties.
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
                            <strong style={{ color: '#0D1526', fontSize: '15px' }}>Confidential Business Data Handling:</strong>
                            <p style={{ fontSize: '14px', color: '#6B7280', margin: '5px 0 0 0' }}>
                              I will handle business and regulated data in accordance with company policy, confidentiality controls, and data minimization requirements.
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
                            <strong style={{ color: '#0D1526', fontSize: '15px' }}>Corporate Compliance Obligations:</strong>
                            <p style={{ fontSize: '14px', color: '#6B7280', margin: '5px 0 0 0' }}>
                              I will comply with internal control frameworks and external requirements (e.g., ISO 27001, SOC 2, GDPR-aligned controls) when using this system.
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
                            <strong style={{ color: '#0D1526', fontSize: '15px' }}>Intellectual Property and Non-Disclosure:</strong>
                            <p style={{ fontSize: '14px', color: '#6B7280', margin: '5px 0 0 0' }}>
                              I acknowledge that enterprise documents and related materials are protected assets. I will follow non-disclosure obligations and IP protection requirements.
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
                            <strong style={{ color: '#0D1526', fontSize: '15px' }}>Audit Traceability and Legal Accountability:</strong>
                            <p style={{ fontSize: '14px', color: '#6B7280', margin: '5px 0 0 0' }}>
                              I understand that all activities are logged for internal audit and forensics. Misuse may result in revoked access, disciplinary action, contractual penalties, and legal consequences.
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
                    I have read and understand the Enterprise System Usage Agreement and agree to comply with all terms and conditions
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
