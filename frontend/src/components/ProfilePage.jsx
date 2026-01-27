import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  changePassword,
  updateProfile,
  uploadProfilePhoto,
  removeProfilePhoto,
  getCurrentUser as fetchCurrentUser,
  PROFILE_PHOTO_ENABLED,
} from '../api/adapter';
import { getCurrentUser as getStoredUser } from '../services/auth';

const defaultProfile = {
  name: '',
  email: '',
  department: '',
  role: '',
};

function ProfilePage({ initialProfile }) {

  const [profile, setProfile] = useState({ ...defaultProfile, ...initialProfile });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [photoPreview, setPhotoPreview] = useState('');
  const [errors, setErrors] = useState({ email: '', general: '' });
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const storedUser = useMemo(() => getStoredUser(), []);

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
        const userData = await fetchCurrentUser();
        if (userData) {
          setProfile((prev) => ({
            ...prev,
            name: userData.name || userData.full_name || prev.name,
            email: userData.email || prev.email,
            department: userData.department || prev.department,
            role: userData.role || prev.role,
          }));
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
        name: profile.name,
        email: profile.email,
        department: profile.department,
        role: profile.role,
      };

      await updateProfile(payload);
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

  const initials = (profile.name || storedUser?.name || 'User')
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
                <div style={{ fontWeight: 700, fontSize: '1.15rem', color: '#0b275a' }}>{profile.name || 'Your name'}</div>
                <div className="text-muted" style={{ fontSize: '0.95rem' }}>{profile.role || 'Role'}</div>
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
              <label className="form-label" htmlFor="profile-name">Full Name</label>
              <input
                type="text"
                className="form-control"
                id="profile-name"
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
                disabled={isBusy}
                required
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
              <label className="form-label" htmlFor="profile-department">Department</label>
              <input
                type="text"
                className="form-control"
                id="profile-department"
                name="department"
                value={profile.department}
                onChange={handleProfileChange}
                disabled={isBusy}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label" htmlFor="profile-role">Role</label>
              <input
                type="text"
                className="form-control"
                id="profile-role"
                name="role"
                value={profile.role}
                onChange={handleProfileChange}
                disabled={isBusy}
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
    name: PropTypes.string,
    email: PropTypes.string,
    department: PropTypes.string,
    role: PropTypes.string,
  }),
};
