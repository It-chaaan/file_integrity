import React, { useState } from 'react';

const reportOptions = [
  { id: 'fraud', label: 'Suspected Fraudulent Document' },
  { id: 'tampering', label: 'Document Tampering or Alteration' },
  { id: 'system', label: 'System Issue or Unauthorized Access' },
  { id: 'vulnerability', label: 'Security Vulnerability' },
  { id: 'other', label: 'Other Security Concern' }
];

const Report = () => {
  const [reportType, setReportType] = useState(reportOptions[0].id);
  const [formData, setFormData] = useState({
    email: '',
    subject: '',
    description: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ email: '', subject: '', description: '' });
    }, 3000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="public-page">
      <div className="container py-5">
        <div className="text-center mb-5">
          <h1 className="section-title">Report a Security Concern</h1>
          <p className="section-subtitle">
            Help us maintain document integrity by reporting suspected fraud, tampering, or
            security issues.
          </p>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-7">
            <div className="report-card">
              {submitted ? (
                <div className="alert alert-success text-center py-4 mb-0">
                  <h5 className="alert-heading">Report Submitted Successfully</h5>
                  <p className="mb-0">
                    Thank you for your report. Our team will review it and contact you if needed.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label">Report Type *</label>
                    <div className="report-options">
                      {reportOptions.map((option) => (
                        <label
                          key={option.id}
                          className={`report-option ${reportType === option.id ? 'active' : ''}`}
                        >
                          <input
                            type="radio"
                            name="reportType"
                            value={option.id}
                            checked={reportType === option.id}
                            onChange={() => setReportType(option.id)}
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Your Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@email.com"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Subject *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Brief description of the security concern"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Detailed Description *</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="6"
                      placeholder="Please provide as much detail as possible, including document IDs, dates, or any suspicious activity."
                      required
                    ></textarea>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Attach Evidence (Optional)</label>
                    <label className="report-upload">
                      <input type="file" className="d-none" />
                      <div>
                        <i className="bi bi-cloud-arrow-up"></i>
                        <p className="mb-1">Drag files here or click to browse</p>
                        <span>Supported: PDF, JPG, PNG (max 10MB)</span>
                      </div>
                    </label>
                  </div>

                  <button type="submit" className="btn btn-dark w-100 py-3">
                    Submit Report
                  </button>
                </form>
              )}
            </div>

            <div className="report-followup">
              <h6>What Happens Next</h6>
              <ul>
                <li><i className="bi bi-check-circle"></i>Your report is logged immediately with a unique tracking number</li>
                <li><i className="bi bi-check-circle"></i>Security team reviews within 24 hours of submission</li>
                <li><i className="bi bi-check-circle"></i>You'll receive updates via email on the status of your report</li>
                <li><i className="bi bi-check-circle"></i>Critical issues are escalated immediately to relevant authorities</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;