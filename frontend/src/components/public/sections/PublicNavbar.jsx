import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import StaffLoginModal from '../../common/modals/StaffLoginModal';
import "../styles/PublicNavbar.css";

const PublicNavbar = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Update navbar background on scroll
      setScrolled(window.scrollY > 20);
      
      // Update active section
      const sections = ['hero', 'process', 'verifier', 'support'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 180 && rect.bottom >= 180;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <Navbar 
        expand="lg" 
        variant="dark" 
        sticky="top" 
        className={`public-navbar ${scrolled ? 'public-navbar--scrolled' : ''}`}
      >
        <Container className="py-2">
          <Navbar.Brand 
            href="#hero" 
            className="public-navbar__brand"
            onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}
          >
            <svg 
              className="public-navbar__logo" 
              width="28" 
              height="28" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00F2FF" />
                  <stop offset="100%" stopColor="#0D51A1" />
                </linearGradient>
              </defs>
              <path 
                d="M12 2l7 3v5c0 5-3.5 9.7-7 11-3.5-1.3-7-6-7-11V5l7-3z" 
                fill="url(#logoGradient)"
              />
              <circle cx="12" cy="12" r="3" fill="#fff" opacity="0.3" />
              <path 
                d="M10 12l2 2 4-4" 
                stroke="#fff" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                fill="none"
              />
            </svg>
            <span className="public-navbar__brand-text">PARITY</span>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="publicNav" className="border-0" />
          
          <Navbar.Collapse id="publicNav">
            <Nav className="mx-auto">
              <Nav.Link 
                href="#hero" 
                className={`public-navbar__link ${activeSection === 'hero' ? 'public-navbar__link--active' : ''}`}
                onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}
              >
                Home
              </Nav.Link>
              <Nav.Link 
                href="#process" 
                className={`public-navbar__link ${activeSection === 'process' ? 'public-navbar__link--active' : ''}`}
                onClick={(e) => { e.preventDefault(); scrollToSection('process'); }}
              >
                How It Works
              </Nav.Link>
              <Nav.Link 
                href="#verifier" 
                className={`public-navbar__link ${activeSection === 'verifier' ? 'public-navbar__link--active' : ''}`}
                onClick={(e) => { e.preventDefault(); scrollToSection('verifier'); }}
              >
                Verify Document
              </Nav.Link>
              <Nav.Link 
                href="#support" 
                className={`public-navbar__link ${activeSection === 'support' ? 'public-navbar__link--active' : ''}`}
                onClick={(e) => { e.preventDefault(); scrollToSection('support'); }}
              >
                Report Issue
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>

          <Button 
            className="public-navbar__cta"
            onClick={() => setShowLogin(true)}
          >
            <i className="bi bi-shield-lock me-2"></i>
            <span className="d-none d-lg-inline">Staff Portal</span>
            <span className="d-inline d-lg-none">Portal</span>
          </Button>
        </Container>
      </Navbar>

      <StaffLoginModal show={showLogin} onHide={() => setShowLogin(false)} />
    </>
  );
};

export default PublicNavbar;