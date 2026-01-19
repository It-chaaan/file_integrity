import React, { useState } from 'react';
import { AlertCircle, FileText } from 'lucide-react';

const Report = () => {
  const [reportType, setReportType] = useState('technical');
  const [formData, setFormData] = useState({
    email: '',
    subject: '',
    description: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate submission
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
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                     style={{ width: '80px', height: '80px' }}>
                  <AlertCircle size={40} className="text-primary" />
                </div>
                <h2 className="mb-3">Submit a Report</h2>
                <p className="text-muted">
                  Report security concerns, document fraud, or verification issues
                </p>
              </div>

              {submitted ? (
                <div className="alert alert-success text-center py-4">
                  <h5 className="alert-heading">Report Submitted Successfully!</h5>
                  <p className="mb-0">
                    Thank you for your report. Our team will review it and contact you if needed.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* Report Type */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Report Type</label>
                    <div className="btn-group w-100" role="group">
                      <button
                        type="button"
                        className={`btn ${reportType === 'technical' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setReportType('technical')}
                      >
                        <AlertCircle size={18} className="me-2" />
                        Technical Issue
                      </button>
                      <button
                        type="button"
                        className={`btn ${reportType === 'document' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setReportType('document')}
                      >
                        <FileText size={18} className="me-2" />
                        Document Issue
                      </button>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      required
                    />
                    <small className="text-muted">We'll use this to contact you about your report</small>
                  </div>

                  {/* Subject */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Subject</label>
                    <input
                      type="text"
                      className="form-control"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Brief description of the issue"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Detailed Report</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="8"
                      placeholder="Provide a comprehensive description of the security concern or issue..."
                      required
                    ></textarea>
                    <small className="text-muted">
                      Please include as much detail as possible to help us investigate the issue
                    </small>
                  </div>

                  {/* Buttons */}
                  <div className="d-flex gap-3">
                    <button type="submit" className="btn btn-primary flex-grow-1 py-3 fw-semibold">
                      Submit Report
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-primary px-4"
                      style={{
                        backgroundColor: 'transparent',
                        borderColor: '#1E1E2C',
                        color: '#1E1E2C'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(30, 30, 44, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      onClick={() => setFormData({ email: '', subject: '', description: '' })}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Information Box */}
          <div className="alert alert-info mt-4">
            <h6 className="alert-heading">Before Submitting</h6>
            <ul className="mb-0 small">
              <li>Make sure you have all relevant information (document IDs, error messages, etc.)</li>
              <li>For urgent security issues, please contact our 24/7 hotline: 1-800-PARITY</li>
              <li>All reports are treated confidentially and reviewed by our security team</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;