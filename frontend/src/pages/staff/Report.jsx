import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Report() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    subject: '',
    report: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Report submitted successfully');
    setFormData({ email: '', subject: '', report: '' });
  };

  const handleCancel = () => {
    navigate('/staff/dashboard');
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="mb-1">Submit Staff Report</h2>
        <p className="text-muted">Report system-related problems.</p>
      </div>

      <div className="row justify-content-start-flex">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Brief description of the issue"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label">Detailed Report</label>
                  <textarea
                    className="form-control"
                    rows="8"
                    placeholder="Describe findings, observations, or actions already taken..."
                    value={formData.report}
                    onChange={(e) => setFormData({ ...formData, report: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary">
                    Submit Report
                  </button>
                  <button type="button" onClick={handleCancel} className="btn btn-outline-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Information Box */}
          <div className="alert alert-info mt-4">
            <h6 className="alert-heading">Before Submitting</h6>
            <ul className="mb-0 small">
              <li>Make sure you have all relevant information (System issue, error messages, etc.)</li>
              <li>For urgent security issues, please contact our 24/7 hotline: 1-800-PARITY Security Team</li>
              <li>All reports are treated confidentially and reviewed by our security team</li>
            </ul>
          </div>
        </div>  
      </div>
    </div>
  );
}

export default Report;