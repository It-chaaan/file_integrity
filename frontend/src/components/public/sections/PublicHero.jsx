import React, { useEffect, useRef } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import '../styles/PublicHero.css';

const PublicHero = () => {
  const heroRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('public-hero--visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="hero" className="public-hero" ref={heroRef}>
      <Container>
        <Row className="align-items-center">
          <Col lg={7} className="public-hero__content">
            <h1 className="public-hero__title">
              Automated Document<br />
              <span className="public-hero__title-accent">Integrity Verification</span>
            </h1>
            <p className="public-hero__subtitle">
              Securing government records with high-precision cryptographic fingerprints. 
              Authenticate official documents instantly through our immutable registry.
            </p>
            <div className="public-hero__actions">
              <Button 
                className="public-hero__cta public-hero__cta--primary"
                onClick={() => scrollToSection('verifier')}
              >
                <i className="bi bi-shield-check me-2"></i>
                Verify Now
              </Button>
              <Button 
                className="public-hero__cta public-hero__cta--secondary"
                onClick={() => scrollToSection('process')}
              >
                <i className="bi bi-info-circle me-2"></i>
                Learn the Process
              </Button>
            </div>
          </Col>
          <Col lg={5} className="d-none d-lg-flex justify-content-center">
            <svg 
              className="public-hero__visual" 
              width="300" 
              height="300" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="heroGradient" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0" stopColor="#00f2ff"/>
                  <stop offset="1" stopColor="#7b61ff"/>
                </linearGradient>
              </defs>
              <path 
                d="M12 2l7 3v5c0 5-3.5 9.7-7 11-3.5-1.3-7-6-7-11V5l7-3z" 
                fill="url(#heroGradient)"
              />
              <rect x="9" y="10" width="6" height="4" rx="1" fill="#000" opacity="0.12"/>
              <rect x="10.5" y="11.2" width="3" height="2.2" rx="0.6" fill="#fff"/>
            </svg>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default PublicHero;