import React, { useState } from 'react';
import { createTicket } from '../../api/adapter';
import { getCurrentUser } from '../../services/auth';

function Report() {
  const currentUser = getCurrentUser();
  const [formData, setFormData] = useState({
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [ticketNumber, setTicketNumber] = useState('');



  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const response = await createTicket({
        title: 'System issue report',
        description: formData.message.trim(),
        category: 'technical',
        priority: 'medium'
      });

      const createdTicket = response?.data || response;
      setTicketNumber(createdTicket?.ticket_number || '');
      setSubmitted(true);
      setFormData({ message: '' });
    } catch (error) {
      setSubmitError(error?.message || 'We could not submit the report right now.');
    } finally {
      setIsSubmitting(false);
    }
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
              {ticketNumber && <div className="fw-semibold mt-2">Reference: {ticketNumber}</div>}
            </div>
          )}

          {submitError && !submitted && (
            <div className="alert alert-danger" role="alert">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="card shadow-sm border-0 p-4">
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
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
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