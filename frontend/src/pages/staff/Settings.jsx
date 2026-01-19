import React, { useState } from 'react';

function Settings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    desktopNotifications: false,
    ticketUpdates: true,
    weeklyReports: false,
    theme: 'light',
    language: 'en'
  });

  const handleChange = (field, value) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleSave = () => {
    alert('Settings saved successfully');
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="mb-1">Settings</h2>
        <p className="text-muted">Manage your account preferences</p>
      </div>

      <div className="row g-4">
        {/* Profile Settings */}
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="mb-4">Profile Information</h5>
              
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-control" defaultValue="Martin Luspo" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" defaultValue="martin@parity.gov" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Department</label>
                  <input type="text" className="form-control" defaultValue="Business Affairs" readOnly />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Role</label>
                  <input type="text" className="form-control" defaultValue="Staff" readOnly />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="mb-4">Notification Preferences</h5>
              
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="emailNotifications">
                  Email notifications
                </label>
              </div>

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="desktopNotifications"
                  checked={settings.desktopNotifications}
                  onChange={(e) => handleChange('desktopNotifications', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="desktopNotifications">
                  Desktop notifications
                </label>
              </div>

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="ticketUpdates"
                  checked={settings.ticketUpdates}
                  onChange={(e) => handleChange('ticketUpdates', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="ticketUpdates">
                  Ticket assignment and updates
                </label>
              </div>

              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="weeklyReports"
                  checked={settings.weeklyReports}
                  onChange={(e) => handleChange('weeklyReports', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="weeklyReports">
                  Weekly activity reports
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="mb-4">Display Settings</h5>
              
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Theme</label>
                  <select
                    className="form-select"
                    value={settings.theme}
                    onChange={(e) => handleChange('theme', e.target.value)}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Language</label>
                  <select
                    className="form-select"
                    value={settings.language}
                    onChange={(e) => handleChange('language', e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="fil">Filipino</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="mb-4">Security</h5>
              
              <div className="mb-3">
                <button className="btn btn-outline-primary">
                  Change Password
                </button>
              </div>

              <div>
                <button className="btn btn-outline-primary">
                  Enable Two-Factor Authentication
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="col-12">
          <button onClick={handleSave} className="btn btn-primary">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;