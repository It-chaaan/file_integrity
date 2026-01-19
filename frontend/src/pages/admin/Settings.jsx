import React, { useState } from 'react';

function Settings() {
  const [settings, setSettings] = useState({
    systemName: 'Parity - Document Integrity Platform',
    verificationTimeout: '30',
    maxFileSize: '50',
    allowedFileTypes: '.pdf, .doc, .docx',
    keyRotationPeriod: '365',
    sessionTimeout: '30',
    twoFactorAuth: true,
    logVerificationAttempts: true,
    autoKeyRotation: false,
    emailTampering: true,
    emailKeyExpiration: true,
    dailyActivitySummary: false
  });

  const handleChange = (field, value) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleSave = () => {
    alert('Settings saved successfully');
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset to defaults?')) {
      alert('Settings reset to defaults');
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="mb-1">System Settings</h2>
        <p className="text-muted">Configure system preferences and parameters</p>
      </div>

      <div className="row g-4">
        {/* General Settings */}
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="mb-4">General Settings</h5>
              
              <div className="mb-3">
                <label className="form-label">System Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.systemName}
                  onChange={(e) => handleChange('systemName', e.target.value)}
                />
              </div>

              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Verification Timeout (seconds)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={settings.verificationTimeout}
                    onChange={(e) => handleChange('verificationTimeout', e.target.value)}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Max File Size (MB)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={settings.maxFileSize}
                    onChange={(e) => handleChange('maxFileSize', e.target.value)}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Allowed File Types</label>
                  <input
                    type="text"
                    className="form-control"
                    value={settings.allowedFileTypes}
                    onChange={(e) => handleChange('allowedFileTypes', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="mb-4">Security Settings</h5>
              
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label">Key Rotation Period (days)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={settings.keyRotationPeriod}
                    onChange={(e) => handleChange('keyRotationPeriod', e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleChange('sessionTimeout', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="twoFactorAuth"
                  checked={settings.twoFactorAuth}
                  onChange={(e) => handleChange('twoFactorAuth', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="twoFactorAuth">
                  Enable two-factor authentication
                </label>
              </div>

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="logVerification"
                  checked={settings.logVerificationAttempts}
                  onChange={(e) => handleChange('logVerificationAttempts', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="logVerification">
                  Log all verification attempts
                </label>
              </div>

              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="autoKeyRotation"
                  checked={settings.autoKeyRotation}
                  onChange={(e) => handleChange('autoKeyRotation', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="autoKeyRotation">
                  Enable automatic key rotation
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="mb-4">Notification Settings</h5>
              
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="emailTampering"
                  checked={settings.emailTampering}
                  onChange={(e) => handleChange('emailTampering', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="emailTampering">
                  Email notifications for tampering detection
                </label>
              </div>

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="emailKeyExpiration"
                  checked={settings.emailKeyExpiration}
                  onChange={(e) => handleChange('emailKeyExpiration', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="emailKeyExpiration">
                  Email notifications for key expiration
                </label>
              </div>

              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="dailySummary"
                  checked={settings.dailyActivitySummary}
                  onChange={(e) => handleChange('dailyActivitySummary', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="dailySummary">
                  Daily activity summary
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="col-12">
          <div className="d-flex gap-2">
            <button onClick={handleSave} className="btn btn-primary">
              Save Changes
            </button>
            <button onClick={handleReset} className="btn btn-outline-secondary">
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;