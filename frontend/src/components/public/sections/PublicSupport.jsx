import React, { useState, useRef, useEffect } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import "../styles/PublicSupport.css";

const PublicSupport = () => {
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    // Fallback: ensure visibility after a delay if observer doesn't fire
    const fallbackTimer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    
    setTimeout(() => {
      setSubject('');
      setDetails('');
      setSubmitted(false);
    }, 4000);
  };

  return (
    <section id="support" className="public-support">
      <Container className="py-5">
        <div className="public-section__header">
          <span className="public-section__tag">Report an Issue</span>
          <h2 className="public-section__title">Integrity Support Ticket</h2>
          <p className="public-section__subtitle">
            Report discrepancies or file tampering detected during verification.
            Our team will investigate and respond to your report promptly.
          </p>
        </div>

        <div 
          className={`public-support__card ${isVisible ? 'public-support--visible' : ''}`}
          ref={cardRef}
        >
          {submitted ? (
            <div className="public-support__success">
              <div className="public-support__success-icon">
                <i className="bi bi-check-circle-fill"></i>
              </div>
              <h4 className="public-support__success-title">Report Submitted Successfully</h4>
              <p className="public-support__success-text">
                Your report has been received and logged. Our integrity team will investigate this matter
                and contact you if additional information is needed.
              </p>
              <div className="public-support__ticket-id">
                <i className="bi bi-info-circle me-2"></i>
                Ticket ID: TKT-{Date.now().toString().slice(-8)}
              </div>
            </div>
          ) : (
            <Form onSubmit={handleSubmit} className="public-support__form">
              <Form.Group className="mb-4">
                <Form.Label className="public-support__label">
                  <i className="bi bi-pencil-square me-2"></i>
                  Issue Subject
                </Form.Label>
                <Form.Control
                  type="text"
                  className="public-support__input"
                  placeholder="Brief description (e.g., 'Tampered PDF - Barangay Clearance')"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
                <Form.Text className="public-support__hint">
                  Provide a clear and concise subject line for your report
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="public-support__label">
                  <i className="bi bi-card-text me-2"></i>
                  Detailed Report
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={6}
                  className="public-support__textarea"
                  placeholder="Describe the issue in detail..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  required
                />
                <Form.Text className="public-support__hint">
                  The more details you provide, the faster we can investigate
                </Form.Text>
              </Form.Group>

              <div className="public-support__actions">
                <Button type="submit" className="public-support__submit-btn">
                  <i className="bi bi-send me-2"></i>
                  Submit Official Report
                </Button>
                <Button 
                  type="button"
                  className="public-support__clear-btn"
                  onClick={() => {
                    setSubject('');
                    setDetails('');
                  }}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Clear
                </Button>
              </div>

              <div className="public-support__notice">
                <i className="bi bi-info-circle me-2"></i>
                <span>
                  Your report will be reviewed by our integrity team. All submissions are logged and tracked.
                  For urgent matters, please contact your local barangay office directly.
                </span>
              </div>
            </Form>
          )}
        </div>
      </Container>
    </section>
  );
};

export default PublicSupport;