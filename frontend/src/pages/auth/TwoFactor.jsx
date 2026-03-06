import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../../assets/icons/Logo - Integrity Verification.png';
import { verify2FA, getCurrentSession } from '../../services/auth';

function TwoFactor() {
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Check if user has a session
    const currentSession = getCurrentSession();
    if (!currentSession) {
      navigate('/login');
    }
    setSession(currentSession);
  }, [navigate]);

  const handleCodeChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Auto-focus next input
      if (value && index < 5) {
        document.getElementById(`code-${index + 1}`).focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const codeString = code.join('');
    if (codeString.length !== 6) {
      setError('Please enter a complete 6-digit code');
      return;
    }

    setIsLoading(true);
    
    try {
      await verify2FA(codeString);
      // Short delay to ensure UI shows success, then navigate to user agreement
      setTimeout(() => {
        navigate('/user-agreement', { replace: true });
      }, 1500);
    } catch (error) {
      setError(error.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    setError('');
    alert('Verification code resent to your email');
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#F3F4F6', padding: '20px' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-10 col-lg-11 col-12">
            <div className="card shadow-lg border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <div className="row g-0">
                {/* Form side - White */}
                <div className="col-lg-6 col-12 p-4 p-md-5">
                  {/* Back link */}
                  <Link 
                    to="/login" 
                    className="text-decoration-none d-inline-flex align-items-center mb-5"
                    style={{ fontSize: '14px', color: '#6B7280' }}
                  >
                    <i className="bi bi-arrow-left me-2"></i>Back to Login
                  </Link>

                  <h2 className="fw-bold mb-3" style={{ color: '#0D1526', fontSize: 'clamp(24px, 5vw, 32px)' }}>Two-Factor Authentication</h2>
                  <p className="text-muted mb-4" style={{ fontSize: '14px' }}>Enter the 6-digit code sent to your email</p>

                  {error && (
                    <div className="alert alert-danger mb-3" style={{ borderRadius: '8px', fontSize: '14px' }}>
                      <i className="bi bi-x-circle me-2"></i>
                      {error}
                    </div>
                  )}

                  {/* Code inputs */}
                  <form onSubmit={handleSubmit}>
                    <div className="d-flex gap-2 gap-md-3 mb-4 justify-content-center justify-content-lg-start flex-wrap">
                      {code.map((digit, index) => (
                        <input
                          key={index}
                          id={`code-${index}`}
                          type="text"
                          className="form-control text-center fw-bold"
                          style={{ 
                            width: 'clamp(30px, 12vw, 58px)', 
                            height: 'clamp(30px, 12vw, 58px)', 
                            borderRadius: '12px', 
                            border: '2px solid #E5E7EB',
                            fontSize: 'clamp(18px, 4vw, 24px)',
                            backgroundColor: '#FFFFFF'
                          }}
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleCodeChange(index, e.target.value)}
                          required
                        />
                      ))}
                    </div>

                    <button 
                      type="submit" 
                      className="btn w-100 text-white fw-semibold mb-4" 
                      disabled={isLoading}
                      style={{ 
                        backgroundColor: isLoading ? '#6B7280' : '#0D1526', 
                        padding: '16px', 
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '15px',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        opacity: isLoading ? 0.6 : 1
                      }}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          VERIFYING...
                        </>
                      ) : (
                        'Verify & Sign In'
                      )}
                    </button>

                    <div className="text-center mb-5">
                      <p className="text-muted mb-1" style={{ fontSize: '14px' }}>Didn't receive a code?</p>
                      <button 
                        type="button" 
                        onClick={handleResend}
                        className="btn btn-link text-decoration-none p-0 fw-semibold"
                        style={{ fontSize: '14px', color: '#0D1526' }}
                      >
                        Resend
                      </button>
                    </div>

                    {/* Security Notice */}
                    <div className="alert mb-0" style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '16px' }}>
                      <p className="mb-1 fw-semibold" style={{ fontSize: '13px', color: '#1E40AF' }}>Security Notice:</p>
                      <p className="mb-0" style={{ fontSize: '13px', color: '#1E40AF', lineHeight: '1.6' }}>
                        For your protection, this session will expire in 10 minutes. The verification code is valid for a single use only.
                      </p>
                    </div>
                  </form>
                </div>

                {/* Right side - Navy Background */}
                <div className="col-lg-6 col-12 d-flex align-items-center justify-content-center p-4 p-md-5" style={{ backgroundColor: '#0D1526' }}>
                  <div className="text-center text-white">
                    <h1 className="fw-bold mb-3" style={{ fontSize: 'clamp(36px, 8vw, 48px)', letterSpacing: '2px', color: '#FFFFFF' }}>PARITY</h1>
                    <div style={{ width: '60px', height: '2px', backgroundColor: '#FFFFFF', margin: '0 auto 20px' }}></div>
                    <p className="mb-0" style={{ fontSize: '14px', lineHeight: '1.6', color: '#FFFFFF', opacity: '0.9' }}>
                      Enterprise Document Integrity<br/>and Compliance Platform
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TwoFactor;