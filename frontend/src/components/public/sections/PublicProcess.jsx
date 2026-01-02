import React, { useEffect, useRef } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import '../styles/PublicProcess.css';

const PublicProcess = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('public-process-card--visible');
            }, index * 150);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    if (sectionRef.current) {
      const cards = sectionRef.current.querySelectorAll('.public-process-card');
      cards.forEach(card => observer.observe(card));
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="process" className="public-process" ref={sectionRef}>
      <Container className="py-5">
        <div className="public-section__header">
          <span className="public-section__tag">Technical Process</span>
          <h2 className="public-section__title">How Parity Secures Records</h2>
          <div className="public-section__divider"></div>
        </div>

        <Row className="g-4">
          <Col lg={4}>
            <div className="public-process-card">
              <div className="public-process-card__number">01</div>
              <h4 className="public-process-card__title">SHA-256 Hashing</h4>
              <p className="public-process-card__text">
                The document is processed through a secure algorithm to create a unique
                digital fingerprint. Even the smallest modification to the file will result in a
                completely different fingerprint, ensuring that any tampering is immediately detected.
              </p>
            </div>
          </Col>
          <Col lg={4}>
            <div className="public-process-card">
              <div className="public-process-card__number">02</div>
              <h4 className="public-process-card__title">ECDSA Signing</h4>
              <p className="public-process-card__text">
                Authorized LGU personnel apply a digital signature using Elliptic
                Curve Cryptography. This signature acts as a tamper-proof seal that proves the document was
                officially registered by a specific government office.
              </p>
            </div>
          </Col>
          <Col lg={4}>
            <div className="public-process-card">
              <div className="public-process-card__number">03</div>
              <h4 className="public-process-card__title">Public Audit</h4>
              <p className="public-process-card__text">
                The fingerprint is stored in our official registry. Citizens can upload
                their digital copies to cross-reference them against this registry. If the data matches, the
                document is confirmed as authentic.
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default PublicProcess;