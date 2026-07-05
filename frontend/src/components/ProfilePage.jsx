import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  changePassword,
  disable2FA,
  enable2FA,
  updateUserProfile,
  getUserProfile,
  verify2FA,
} from '../api/auth.api';
import {
  uploadProfilePhoto,
  removeProfilePhoto,
  PROFILE_PHOTO_ENABLED,
} from '../api/profile.api';
import { getCurrentUser as getStoredUser, refreshCurrentUser, logout, hasTrustedDeviceToken, clearTrustedDeviceToken } from '../services/auth';

const defaultProfile = {
  first_name: '',
  last_name: '',
  email: '',
  department: '',
  role: '',
  phone: '',
  two_factor_enabled: false,
};

function ProfilePage({ initialProfile }) {

  const [profile, setProfile] = useState({ ...defaultProfile, ...initialProfile });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [photoPreview, setPhotoPreview] = useState('');
  const [errors, setErrors] = useState({ email: '', general: '' });
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [mfaSetup, setMfaSetup] = useState(null);
  const [mfaSetupCode, setMfaSetupCode] = useState('');
  const [mfaDisableCode, setMfaDisableCode] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);
  const [trustCurrentBrowser, setTrustCurrentBrowser] = useState(false);

  const storedUser = useMemo(() => getStoredUser(), []);
  const roleLabels = {
    super_admin: 'System Administrator',
    admin: 'Administrator',
    staff: 'Staff',
    verifier: 'Verifier',
    client: 'Enterprise User',
  };

  const isValidEmail = (value) => {
    if (!value) return false;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(value);
  };

  useEffect(() => {
    setProfile((prev) => ({ ...prev, ...defaultProfile, ...initialProfile }));
  }, [initialProfile]);

  useEffect(() => {
    const loadProfile = async () => {
      setFetchingProfile(true);
      try {
        const userData = await getUserProfile();
        if (userData) {
          setProfile((prev) => ({
            ...prev,
            first_name: userData.first_name || prev.first_name,
            last_name: userData.last_name || prev.last_name,
            email: userData.email || prev.email,
            department: userData.department || prev.department,
            role: userData.role || prev.role,
            phone: userData.phone || prev.phone,
            two_factor_enabled: Boolean(userData.two_factor_enabled),
          }));

          refreshCurrentUser();
        }
      } catch (error) {
        // Keep initial profile; surface a soft error
        setErrors((prev) => ({ ...prev, general: 'Unable to load profile from server.' }));
      } finally {
        setFetchingProfile(false);
      }
    };

    loadProfile();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({ email: '', general: '' });
    setSuccessMessage('');

    if (!isValidEmail(profile.email)) {
      setErrors((prev) => ({ ...prev, email: 'Please enter a valid email address.' }));
      setLoading(false);
      return;
    }

    try {
      const payload = {
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        phone: profile.phone,
      };

      await updateUserProfile(payload);
      refreshCurrentUser();
      setSuccessMessage('Profile saved successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      const message = error?.response?.data?.detail || error.message || 'Failed to save profile';
      setErrors((prev) => ({ ...prev, general: message }));
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = async (e) => {
    if (!PROFILE_PHOTO_ENABLED) return;

    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setErrors((prev) => ({ ...prev, general: '' }));
    setSuccessMessage('');

    try {
      await uploadProfilePhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
      setSuccessMessage('Photo uploaded successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      const message = error?.response?.data?.detail || error.message || 'Failed to upload photo';
      setErrors((prev) => ({ ...prev, general: message }));
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!PROFILE_PHOTO_ENABLED) return;

    setLoading(true);
    setErrors((prev) => ({ ...prev, general: '' }));
    setSuccessMessage('');

    try {
      await removeProfilePhoto();
      setPhotoPreview('');
      setSuccessMessage('Photo removed successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      const message = error?.response?.data?.detail || error.message || 'Failed to remove photo';
      setErrors((prev) => ({ ...prev, general: message }));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({ email: '', general: '' });
    setSuccessMessage('');

    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      setErrors((prev) => ({ ...prev, general: 'All password fields are required.' }));
      setLoading(false);
      return;
    }

    if (passwords.newPass !== passwords.confirm) {
      setErrors((prev) => ({ ...prev, general: 'New passwords do not match.' }));
      setLoading(false);
      return;
    }

    if (passwords.newPass.length < 8) {
      setErrors((prev) => ({ ...prev, general: 'New password must be at least 8 characters.' }));
      setLoading(false);
      return;
    }

    if (passwords.newPass === passwords.current) {
      setErrors((prev) => ({ ...prev, general: 'New password must be different from current password.' }));
      setLoading(false);
      return;
    }

    try {
      await changePassword({
        old_password: passwords.current,
        new_password: passwords.newPass,
        new_password2: passwords.confirm,
      });

      setPasswords({ current: '', newPass: '', confirm: '' });
      setSuccessMessage('Password changed successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      const message = error?.response?.data?.detail || error.message || 'Failed to change password';
      setErrors((prev) => ({ ...prev, general: message }));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMfaSetup = async () => {
    setMfaLoading(true);
    setErrors((prev) => ({ ...prev, general: '' }));
    setSuccessMessage('');

    try {
      const setup = await enable2FA();
      setMfaSetup(setup);
      setMfaSetupCode('');
      setTrustCurrentBrowser(false);
      setSuccessMessage('Authenticator setup generated. Scan the secret in your app, then verify with a code.');
    } catch (error) {
      const message = error?.response?.data?.detail || error.message || 'Failed to generate MFA setup';
      setErrors((prev) => ({ ...prev, general: message }));
    } finally {
      setMfaLoading(false);
    }
  };

  const handleVerifyMfaSetup = async (e) => {
    e.preventDefault();
    if (mfaSetupCode.trim().length !== 6) {
      setErrors((prev) => ({ ...prev, general: 'Enter a valid 6-digit authenticator code.' }));
      return;
    }

    setMfaLoading(true);
    setErrors((prev) => ({ ...prev, general: '' }));
    setSuccessMessage('');

    try {
      await verify2FA(mfaSetupCode.trim(), trustCurrentBrowser);
      const userData = await getUserProfile();
      setProfile((prev) => ({ ...prev, two_factor_enabled: Boolean(userData?.two_factor_enabled) }));
      refreshCurrentUser();
      setMfaSetup(null);
      setMfaSetupCode('');
      setSuccessMessage('Multi-factor authentication is now enabled.');
    } catch (error) {
      const message = error?.response?.data?.detail || error.message || 'Failed to verify authenticator code';
      setErrors((prev) => ({ ...prev, general: message }));
    } finally {
      setMfaLoading(false);
    }
  };

  const handleDisableMfa = async (e) => {
    e.preventDefault();
    if (mfaDisableCode.trim().length !== 6) {
      setErrors((prev) => ({ ...prev, general: 'Enter your current 6-digit authenticator code to disable MFA.' }));
      return;
    }

    setMfaLoading(true);
    setErrors((prev) => ({ ...prev, general: '' }));
    setSuccessMessage('');

    try {
      await disable2FA(mfaDisableCode.trim());
      const userData = await getUserProfile();
      setProfile((prev) => ({ ...prev, two_factor_enabled: Boolean(userData?.two_factor_enabled) }));
      refreshCurrentUser();
      setMfaDisableCode('');
      setMfaSetup(null);
      setSuccessMessage('Multi-factor authentication has been disabled.');
    } catch (error) {
      const message = error?.response?.data?.detail || error.message || 'Failed to disable MFA';
      setErrors((prev) => ({ ...prev, general: message }));
    } finally {
      setMfaLoading(false);
    }
  };

  const handleSignOutCurrentBrowser = async () => {
    await logout();
    window.location.href = '/login';
  };

  const handleForgetTrustedBrowser = () => {
    clearTrustedDeviceToken();
    refreshCurrentUser();
    setSuccessMessage('Trusted browser cleared for this device.');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const displayName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || storedUser?.full_name || storedUser?.username || 'User';
  const displayRole = roleLabels[profile.role] || profile.role || 'Role';

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isBusy = loading || fetchingProfile;

  return (
    <div className="container-fluid p-0" style={{ background: '#f5f7fb' }}>
      {successMessage && (
        <div
          className="alert alert-success alert-dismissible fade show mb-3"
          role="alert"
          style={{ margin: '0 auto 1.5rem' }}
        >
          <i className="bi bi-check-circle me-2"></i>
          {successMessage}
          <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
        </div>
      )}

      {errors.general && (
        <div
          className="alert alert-danger alert-dismissible fade show mb-3"
          role="alert"
          style={{ margin: '0 auto 1.5rem' }}
        >
          <i className="bi bi-exclamation-circle me-2"></i>
          {errors.general}
          <button type="button" className="btn-close" onClick={() => setErrors({ ...errors, general: '' })}></button>
        </div>
      )}

      <div className="card border-0 shadow-sm" style={{ overflow: 'hidden', margin: '0 auto' }}>
        <div
          style={{
            height: '120px',
            background: 'linear-gradient(90deg, #d8e7ff 0%, #f1f5ff 100%)',
          }}
        />

        <div className="card-body p-4 p-lg-5" style={{ marginTop: '-30px' }}>
          <div className="d-flex align-items-center gap-3 mb-4 flex-wrap" style={{ rowGap: '0.75rem' }}>
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: '96px',
                height: '96px',
                fontSize: '1.5rem',
                overflow: 'hidden',
                border: '4px solid #fff',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                background: '#0d6efd',
                color: '#fff',
              }}
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                initials
              )}
            </div>
            <div className="d-flex flex-column gap-2" style={{ minWidth: '220px' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.15rem', color: '#0b275a' }}>{displayName}</div>
                <div className="text-muted" style={{ fontSize: '0.95rem' }}>{displayRole}</div>
              </div>

              {PROFILE_PHOTO_ENABLED ? (
                <div className="d-flex gap-2 flex-wrap align-items-center">
                  <label className="btn btn-sm btn-outline-primary mb-0" style={{ cursor: isBusy ? 'not-allowed' : 'pointer' }}>
                    Change Photo
                    <input type="file" accept="image/*" className="d-none" onChange={handlePhotoChange} disabled={isBusy} />
                  </label>
                  <button type="button" className="btn btn-sm btn-outline-danger" onClick={handleRemovePhoto} disabled={!photoPreview || isBusy}>
                    Remove
                  </button>
                </div>
              ) : (
                <small className="text-muted">Profile photos are disabled for this environment.</small>
              )}
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="row g-4 mb-2">
            <div className="col-md-6">
              <label className="form-label" htmlFor="profile-first-name">First Name</label>
              <input
                type="text"
                className="form-control"
                id="profile-first-name"
                name="first_name"
                value={profile.first_name}
                onChange={handleProfileChange}
                disabled={isBusy}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="profile-last-name">Last Name</label>
              <input
                type="text"
                className="form-control"
                id="profile-last-name"
                name="last_name"
                value={profile.last_name}
                onChange={handleProfileChange}
                disabled={isBusy}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="profile-email">Email Address</label>
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                id="profile-email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                disabled={isBusy}
                required
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="profile-phone">Phone</label>
              <input
                type="text"
                className="form-control"
                id="profile-phone"
                name="phone"
                value={profile.phone}
                onChange={handleProfileChange}
                disabled={isBusy}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Department</label>
              <input
                type="text"
                className="form-control"
                value={profile.department || 'Assigned by system administrator'}
                disabled
                readOnly
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Role</label>
              <input
                type="text"
                className="form-control"
                value={displayRole || 'Assigned by system administrator'}
                disabled
                readOnly
              />
            </div>

            <div className="col-12 d-flex justify-content-end">
              <button type="submit" className="btn btn-primary px-4" disabled={isBusy}>
                {isBusy ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card border-0 shadow-sm mt-4" style={{ margin: '1.5rem auto 0' }}>
        <div className="card-body p-4">
          <h5 className="mb-3" style={{ color: '#0b275a' }}>Multi-Factor Authentication</h5>
          <p className="text-muted mb-3" style={{ fontSize: '0.95rem' }}>
            Protect your account with a time-based authenticator app.
          </p>

          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
            <div>
              <div className="fw-semibold" style={{ color: '#0b275a' }}>
                Status: {profile.two_factor_enabled ? 'Enabled' : 'Disabled'}
              </div>
              <div className="text-muted" style={{ fontSize: '0.9rem' }}>
                {profile.two_factor_enabled
                  ? 'A 6-digit authenticator code is required when you sign in.'
                  : 'Enable MFA to require an authenticator code after your password.'}
              </div>
            </div>

            {!profile.two_factor_enabled && (
              <button type="button" className="btn btn-outline-primary" onClick={handleGenerateMfaSetup} disabled={mfaLoading}>
                {mfaLoading ? 'Preparing...' : 'Set Up MFA'}
              </button>
            )}
          </div>

          {!profile.two_factor_enabled && mfaSetup && (
            <form onSubmit={handleVerifyMfaSetup} className="border rounded-3 p-3 mb-3" style={{ background: '#f8fbff' }}>
              <div className="mb-2 fw-semibold" style={{ color: '#0b275a' }}>Authenticator Setup</div>
              <div className="mb-2" style={{ fontSize: '0.95rem' }}>
                <div><strong>Secret:</strong> <code>{mfaSetup.secret}</code></div>
              </div>
              <label className="form-label" htmlFor="mfa-setup-code">Enter the 6-digit code from your authenticator app</label>
              <div className="d-flex gap-2 flex-wrap">
                <input
                  type="text"
                  className="form-control"
                  id="mfa-setup-code"
                  value={mfaSetupCode}
                  onChange={(e) => setMfaSetupCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={mfaLoading}
                  placeholder="123456"
                  style={{ maxWidth: '200px' }}
                />
                <button type="submit" className="btn btn-primary" disabled={mfaLoading}>
                  {mfaLoading ? 'Verifying...' : 'Enable MFA'}
                </button>
              </div>
              <div className="form-check mt-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="trust-current-browser"
                  checked={trustCurrentBrowser}
                  onChange={(e) => setTrustCurrentBrowser(e.target.checked)}
                  disabled={mfaLoading}
                />
                <label className="form-check-label" htmlFor="trust-current-browser" style={{ fontSize: '0.95rem' }}>
                  Trust this browser for 30 days
                </label>
              </div>
            </form>
          )}

          {profile.two_factor_enabled && (
            <form onSubmit={handleDisableMfa} className="border rounded-3 p-3" style={{ background: '#fffaf8' }}>
              <label className="form-label" htmlFor="mfa-disable-code">Enter your current 6-digit code to disable MFA</label>
              <div className="d-flex gap-2 flex-wrap">
                <input
                  type="text"
                  className="form-control"
                  id="mfa-disable-code"
                  value={mfaDisableCode}
                  onChange={(e) => setMfaDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  disabled={mfaLoading}
                  placeholder="123456"
                  style={{ maxWidth: '200px' }}
                />
                <button type="submit" className="btn btn-outline-danger" disabled={mfaLoading}>
                  {mfaLoading ? 'Disabling...' : 'Disable MFA'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="card border-0 shadow-sm mt-4" style={{ margin: '1.5rem auto 0' }}>
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-3">
            <div>
              <h5 className="mb-1" style={{ color: '#0b275a' }}>Current Sign-in Session</h5>
              <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
                This shows the browser and IP address used for the session you are currently in.
              </p>
            </div>
            <button type="button" className="btn btn-outline-danger" onClick={handleSignOutCurrentBrowser} disabled={isBusy}>
              Sign Out This Browser
            </button>
          </div>

          <div className="row g-3 align-items-center">
            <div className="col-md-6">
              <div className="p-3 rounded-3 border" style={{ background: '#f8fbff' }}>
                <div className="text-muted small mb-1">Device</div>
                <div className="fw-semibold">{profile.current_device_label || 'Unknown device'}</div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="p-3 rounded-3 border" style={{ background: '#f8fbff' }}>
                <div className="text-muted small mb-1">IP Address</div>
                <div className="fw-semibold">{profile.current_ip || 'Unknown IP'}</div>
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap mt-3">
            <div className="text-muted" style={{ fontSize: '0.95rem' }}>
              Trusted browser: {hasTrustedDeviceToken() ? 'Yes' : 'No'}
            </div>
            {hasTrustedDeviceToken() && (
              <button type="button" className="btn btn-outline-secondary" onClick={handleForgetTrustedBrowser} disabled={isBusy}>
                Forget Trusted Browser
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mt-4" style={{ margin: '1.5rem auto 0' }}>
        <div className="card-body p-4">
          <h5 className="mb-4" style={{ color: '#0b275a' }}>Change Password</h5>
          <form onSubmit={handleUpdatePassword} className="row g-3">
            <div className="col-12">
              <label className="form-label" htmlFor="password-current">Current Password</label>
              <input
                type="password"
                className="form-control"
                id="password-current"
                name="current"
                value={passwords.current}
                onChange={handlePasswordChange}
                disabled={isBusy}
                required
              />
            </div>
            <div className="col-12">
              <label className="form-label" htmlFor="password-new">New Password</label>
              <input
                type="password"
                className="form-control"
                id="password-new"
                name="newPass"
                value={passwords.newPass}
                onChange={handlePasswordChange}
                disabled={isBusy}
                required
              />
            </div>
            <div className="col-12">
              <label className="form-label" htmlFor="password-confirm">Confirm New Password</label>
              <input
                type="password"
                className="form-control"
                id="password-confirm"
                name="confirm"
                value={passwords.confirm}
                onChange={handlePasswordChange}
                disabled={isBusy}
                required
              />
            </div>
            <div className="col-12 d-flex justify-content-end">
              <button type="submit" className="btn btn-outline-primary px-4" disabled={isBusy}>
                {isBusy ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;

ProfilePage.propTypes = {
  initialProfile: PropTypes.shape({
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    email: PropTypes.string,
    department: PropTypes.string,
    role: PropTypes.string,
    phone: PropTypes.string,
    two_factor_enabled: PropTypes.bool,
  }),
};
