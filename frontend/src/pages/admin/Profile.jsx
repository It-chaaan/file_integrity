import React, { useState } from 'react';

function Profile() {
  const [profile, setProfile] = useState({
    name: 'James Alba',
    email: 'james.alba@example.com',
    phone: '+63 917 555 1212',
    role: 'Administrator',
    department: 'IT Security'
  });

  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: ''
  });

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    alert('Profile saved (mock).');
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!passwords.newPass || passwords.newPass !== passwords.confirm) {
      alert('New password and confirmation must match.');
      return;
    }
    alert('Password updated (mock).');
    setPasswords({ current: '', newPass: '', confirm: '' });
  };

  return (
    <div className="container-fluid p-0">
      <div className="mb-4">
        <h2 className="mb-1">Profile Settings</h2>
        <p className="text-muted">Manage your account information and security</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <h5 className="mb-4">Account Information</h5>
              <form onSubmit={handleSaveProfile} className="row g-3">
                <div className="col-12">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    value={profile.phone}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Role</label>
                  <input
                    type="text"
                    className="form-control"
                    name="role"
                    value={profile.role}
                    onChange={handleProfileChange}
                    disabled
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    className="form-control"
                    name="department"
                    value={profile.department}
                    onChange={handleProfileChange}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">About</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Short bio or responsibilities"
                  ></textarea>
                </div>
                <div className="col-12 d-flex justify-content-end">
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <h5 className="mb-4">Security</h5>
              <form onSubmit={handleUpdatePassword} className="row g-3">
                <div className="col-12">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="current"
                    value={passwords.current}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="newPass"
                    value={passwords.newPass}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="confirm"
                    value={passwords.confirm}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div className="col-12 d-flex justify-content-end">
                  <button type="submit" className="btn btn-outline-primary">Update Password</button>
                </div>
              </form>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h6 className="text-muted mb-3">Session & Notifications</h6>
              <div className="form-check form-switch mb-3">
                <input className="form-check-input" type="checkbox" id="sessionAlert" defaultChecked />
                <label className="form-check-label" htmlFor="sessionAlert">Alert me on new device login</label>
              </div>
              <div className="form-check form-switch mb-3">
                <input className="form-check-input" type="checkbox" id="emailUpdates" defaultChecked />
                <label className="form-check-label" htmlFor="emailUpdates">Email updates for ticket changes</label>
              </div>
              <div className="form-check form-switch mb-3">
                <input className="form-check-input" type="checkbox" id="weeklyDigest" />
                <label className="form-check-label" htmlFor="weeklyDigest">Weekly security digest</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
