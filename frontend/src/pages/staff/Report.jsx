import React, { useState } from 'react';

function Report() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('System issue reported:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        message: ''
      });
    }, 3000);
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="text-center mb-5">
            <h1 className="display-5 fw-bold mb-3">Report System Issue</h1>
            <p className="lead text-muted">
              Report any technical issues or system problems to our admin team
            </p>
          </div>

          {submitted && (
            <div className="alert alert-success" role="alert">
              <i className="bi bi-check-circle-fill me-2"></i>
              Thank you! Your report has been received. Our system admin team will investigate and respond shortly.
            </div>
          )}

          <form onSubmit={handleSubmit} className="card shadow-sm border-0 p-4">
            <div className="mb-3">
              <label htmlFor="name" className="form-label fw-semibold">
                Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control form-control-lg"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Your name"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-semibold">
                Email <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                className="form-control form-control-lg"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="message" className="form-label fw-semibold">
                Issue Description <span className="text-danger">*</span>
              </label>
              <textarea
                className="form-control form-control-lg"
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                required
                placeholder="Describe the system issue, error messages, affected features, and what you were trying to do..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-100 py-3"
              style={{ fontSize: '1rem' }}
            >
              Submit Report
            </button>
          </form>

          <div className="alert alert-info mt-4">
            <small>
              <strong>Note:</strong> Your report will be reviewed by our system administration team. For urgent issues, please contact your department administrator directly.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Report;