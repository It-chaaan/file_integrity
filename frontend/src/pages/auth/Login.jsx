import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../../assets/icons/Logo - Integrity Verification.png';
import { login, initAuth } from '../../services/auth';

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Rate limiting state
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(null);
  const [remainingLockoutSeconds, setRemainingLockoutSeconds] = useState(0);

  useEffect(() => {
    // Initialize auth system
    initAuth();
    
    // Restore failed attempts from localStorage
    const stored = localStorage.getItem('login_attempts');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.lockoutTime && Date.now() < data.lockoutTime) {
          setLockoutTime(data.lockoutTime);
          setFailedAttempts(data.attempts || 0);
        } else {
          // Clear expired lockout
          localStorage.removeItem('login_attempts');
        }
      } catch (e) {
        localStorage.removeItem('login_attempts');
      }
    }
  }, []);

  // Update remaining lockout time
  useEffect(() => {
    if (lockoutTime) {
      const interval = setInterval(() => {
        const remaining = Math.ceil((lockoutTime - Date.now()) / 1000);
        if (remaining <= 0) {
          setLockoutTime(null);
          setFailedAttempts(0);
          setRemainingLockoutSeconds(0);
          localStorage.removeItem('login_attempts');
        } else {
          setRemainingLockoutSeconds(remaining);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockoutTime]);

  // Validation functions
  const validateUsername = (username) => {
    if (!username || username.trim().length === 0) {
      return 'Username is required';
    }
    if (username.length < 3) {
      return 'Username must be at least 3 characters';
    }
    if (username.length > 50) {
      return 'Username must not exceed 50 characters';
    }
    // Allow alphanumeric, underscore, hyphen, dot, @
    if (!/^[a-zA-Z0-9._@-]+$/.test(username)) {
      return 'Username contains invalid characters';
    }
    return null;
  };

  const validatePassword = (password) => {
    if (!password || password.length === 0) {
      return 'Password is required';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (password.length > 128) {
      return 'Password must not exceed 128 characters';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Check lockout
    if (lockoutTime && Date.now() < lockoutTime) {
      setError(`Too many failed attempts. Please try again in ${remainingLockoutSeconds} seconds.`);
      return;
    }
    
    // Check if reCAPTCHA is verified
    if (!isVerified) {
      setError('Please verify that you are not a robot.');
      return;
    }
    
    // Validate username
    const usernameError = validateUsername(username);
    if (usernameError) {
      setError(usernameError);
      return;
    }
    
    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsLoading(true);
    
    try {
      // Using unified auth service (works with both mock and real API)
      const session = await login(username, password);
      
      // Success - clear failed attempts
      setFailedAttempts(0);
      localStorage.removeItem('login_attempts');
      
      // Navigate based on 2FA setting
      const REQUIRE_2FA = import.meta.env.VITE_ENABLE_2FA === 'true';
      if (REQUIRE_2FA) {
        navigate('/two-factor');
      } else {
        const userRole = session?.user?.role;
        if (userRole === 'admin') {
          navigate('/admin/dashboard');
        } else if (userRole === 'staff') {
          navigate('/staff/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      // Increment failed attempts
      const attempts = failedAttempts + 1;
      setFailedAttempts(attempts);
      
      // Apply rate limiting after 5 failed attempts
      if (attempts >= 5) {
        const lockout = Date.now() + 15 * 60 * 1000; // 15 minutes
        setLockoutTime(lockout);
        setRemainingLockoutSeconds(15 * 60);
        
        // Persist to localStorage
        localStorage.setItem('login_attempts', JSON.stringify({
          attempts,
          lockoutTime: lockout
        }));
        
        setError('Account temporarily locked due to too many failed attempts. Please try again in 15 minutes.');
      } else if (attempts >= 3) {
        // Persist attempts after 3 failures
        localStorage.setItem('login_attempts', JSON.stringify({
          attempts,
          lockoutTime: null
        }));
        
        setError(`Invalid credentials. ${5 - attempts} attempt${5 - attempts === 1 ? '' : 's'} remaining before temporary lockout.`);
      } else {
        setError(error.message || 'Invalid credentials. Please check your username and password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecaptchaClick = () => {
    if (!isVerified && !isVerifying) {
      setIsVerifying(true);
      // Simulate verification delay
      setTimeout(() => {
        setIsVerified(true);
        setIsVerifying(false);
      }, 1500);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#F3F4F6' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-10 col-lg-11">
            <div className="card shadow-lg border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <div className="row g-0">
                {/* Form side - White */}
                <div className="col-lg-7 p-5">
                  {/* Back Button */}
                  <button
                    onClick={() => navigate('/')}
                    className="btn d-flex align-items-center mb-4"
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#0D1526',
                      padding: '0',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#1a3a52';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#0D1526';
                    }}
                  >
                    <i className="bi bi-chevron-left me-2"></i>
                    Back to Home
                  </button>

                  {/* Warning Banner */}
                  <div className="alert mb-4" style={{ backgroundColor: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '8px' }}>
                    <i className="bi bi-exclamation-circle" style={{ color: '#D97706' }}></i>
                    <span className="ms-2" style={{ color: '#92400E', fontSize: '14px' }}>For authorized staff only. Do not share credentials.</span>
                  </div>

                  {error && (
                    <div className="alert alert-danger mb-3" style={{ borderRadius: '8px', fontSize: '14px' }}>
                      <i className="bi bi-x-circle me-2"></i>
                      {error}
                    </div>
                  )}

                  <h2 className="fw-bold mb-2" style={{ color: '#0D1526', fontSize: '28px' }}>Welcome Back</h2>
                  <p className="text-muted mb-4" style={{ fontSize: '14px' }}>Enter your username and password to sign in</p>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label" style={{ fontSize: '14px', fontWeight: '500' }}>Username</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Your username"
                        style={{ padding: '12px 16px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px' }}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label" style={{ fontSize: '14px', fontWeight: '500' }}>Password</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="form-control"
                          placeholder="Your password"
                          style={{ padding: '12px 16px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px', paddingRight: '40px' }}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#0D1526',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                            transition: 'color 0.2s'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#1a3a52'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = '#0D1526'; }}
                        >
                          <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </button>
                      </div>
                    </div>

                    <div className="mb-3 d-flex align-items-center justify-content-between">
                      <div className="form-check mb-0">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="rememberMe"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          style={{ borderRadius: '4px' }}
                        />
                        <label className="form-check-label" htmlFor="rememberMe" style={{ fontSize: '14px' }}>
                          Remember me
                        </label>
                      </div>
                    </div>

                    {/* reCAPTCHA Style Component */}
                    <div className="mb-4">
                      <div 
                        style={{ 
                          border: isVerified ? '1px solid #4CAF50' : '1px solid #D1D5DB', 
                          borderRadius: '4px',
                          padding: '12px 16px',
                          backgroundColor: '#FAFAFA',
                          display: 'inline-block',
                          minWidth: '300px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center">
                            {/* Custom Checkbox */}
                            <div 
                              onClick={handleRecaptchaClick}
                              style={{ 
                                width: '28px', 
                                height: '28px',
                                border: isVerified ? '2px solid #4CAF50' : '2px solid #C1C7CD',
                                borderRadius: '3px',
                                cursor: isVerifying ? 'default' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: isVerified ? '#4CAF50' : '#FFFFFF',
                                transition: 'all 0.3s ease',
                                marginRight: '12px',
                                position: 'relative'
                              }}
                            >
                              {isVerifying && (
                                <div 
                                  style={{
                                    width: '18px',
                                    height: '18px',
                                    border: '3px solid #F3F3F3',
                                    borderTop: '3px solid #3498db',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                  }}
                                />
                              )}
                              {isVerified && (
                                <i className="bi bi-check" style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: 'bold' }}></i>
                              )}
                            </div>
                            
                            {/* Label */}
                            <span style={{ 
                              fontSize: '14px', 
                              color: '#222222',
                              fontWeight: '500',
                              userSelect: 'none'
                            }}>
                              I'm not a robot
                            </span>
                          </div>

                          {/* Logo Section */}
                          <div className="d-flex flex-column align-items-end" style={{ marginLeft: '20px' }}>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              marginBottom: '2px'
                            }}>
                              <i className="bi bi-shield-check" style={{ 
                                fontSize: '18px', 
                                color: '#4285F4',
                                marginRight: '2px'
                              }}></i>
                              <span style={{ 
                                fontSize: '10px', 
                                color: '#555555',
                                fontWeight: '600',
                                letterSpacing: '0.5px'
                              }}>
                                reCAPTCHA
                              </span>
                            </div>
                            <div style={{ 
                              fontSize: '8px', 
                              color: '#999999',
                              textAlign: 'right',
                              lineHeight: '1.2'
                            }}>
                              <div>Privacy - Terms</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {!isVerified && (
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#6B7280',
                          marginTop: '8px',
                          fontStyle: 'italic'
                        }}>
                          * Please complete the verification to continue
                        </div>
                      )}
                    </div>

                    <style>{`
                      @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                      }
                    `}</style>

                    <button 
                      type="submit" 
                      className="btn w-100 text-white fw-bold" 
                      disabled={isLoading || !isVerified || lockoutTime}
                      style={{ 
                        backgroundColor: isLoading || !isVerified || lockoutTime ? '#6B7280' : '#0D1526', 
                        padding: '14px', 
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '14px',
                        letterSpacing: '0.5px',
                        cursor: isLoading || !isVerified || lockoutTime ? 'not-allowed' : 'pointer',
                        opacity: isLoading || !isVerified || lockoutTime ? 0.6 : 1
                      }}
                    >
                      {lockoutTime ? (
                        <>
                          <i className="bi bi-lock me-2"></i>
                          LOCKED ({remainingLockoutSeconds}s)
                        </>
                      ) : isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          SIGNING IN...
                        </>
                      ) : (
                        'SIGN IN'
                      )}
                    </button>
                  </form>

                </div>

                {/* Brand side - Dark Navy */}
                <div className="col-lg-5 d-none d-lg-flex flex-column align-items-center justify-content-center" style={{ backgroundColor: '#0D1526' }}>
                  <div className="text-center px-4">
                    <h1 className="fw-bold mb-3" style={{ fontSize: '48px', letterSpacing: '2px', color: '#FFFFFF' }}>PARITY</h1>
                    <div style={{ width: '60px', height: '2px', backgroundColor: '#FFFFFF', margin: '0 auto 20px' }}></div>
                    <p className="mb-0" style={{ fontSize: '14px', lineHeight: '1.6', color: '#FFFFFF', opacity: '0.9' }}>
                      LGU Legal Documents<br/>Verification System
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

export default Login;