import React, { useState } from 'react';

function ContactSales() {
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
    console.log('Contact form submitted:', formData);
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
            <h1 className="display-5 fw-bold mb-3">Contact Us</h1>
            <p className="lead text-muted">
              Get in touch with our team
            </p>
          </div>

          {submitted && (
            <div className="alert alert-success" role="alert">
              <i className="bi bi-check-circle-fill me-2"></i>
              Thank you! We'll be in touch soon.
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
                Message <span className="text-danger">*</span>
              </label>
              <textarea
                className="form-control form-control-lg"
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                required
                placeholder="Tell us how we can help..."
              ></textarea>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-100 py-3"
              style={{ fontSize: '1rem' }}
            >
              Send Message
            </button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-muted">Or reach us directly:</p>
            <div className="d-flex flex-column gap-2">
              <a href="mailto:sales@parityenterprise.com" className="text-decoration-none">
                sales@parityenterprise.com
              </a>
              <a href="tel:+18005552748" className="text-decoration-none">
                +1 (800) 555-2748
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactSales;
