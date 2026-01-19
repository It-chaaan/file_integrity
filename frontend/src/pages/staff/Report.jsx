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

      <div className="row justify-content-center">
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
        </div>
      </div>
    </div>
  );
}

export default Report;