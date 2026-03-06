import React from 'react';
import { Link } from 'react-router-dom';
import HeroImage from '../../assets/images/IMAGE - HERO.png';

function Home() {
  return (
    <div>
      {/* Hero Section - Simple & Clean */}
      <section 
        className="hero-section"
        style={{
          paddingTop: '4rem',
          paddingBottom: '4rem',
          background: '#ffffff'
        }}
      >
        <div className="container">
          <div className="row align-items-center" style={{ minHeight: '600px' }}>
            {/* Left Column - Content */}
            <div className="col-lg-6 text-start">
              <h1 
                className="fw-bold mb-4"
                style={{
                  fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
                  lineHeight: '1.2',
                  color: '#212529'
                }}
              >
                Verify Enterprise Documents<br/>
                with Cryptographic Trust
              </h1>
              
              <p 
                className="mb-4"
                style={{
                  fontSize: '1.2rem',
                  lineHeight: '1.7',
                  color: '#495057',
                  maxWidth: '540px'
                }}
              >
                Sign, validate, and audit business-critical documents using military-grade encryption. Tamper-proof. Compliance-ready.
              </p>

              {/* Simple Button Group */}
              <div className="d-flex flex-wrap gap-3">
                <Link
                  to="/how-it-works"
                  className="btn btn-primary btn-lg px-5 py-3"
                  style={{ fontSize: '1.05rem' }}
                >
                  How It Works
                </Link>
                
                <Link
                  to="/contact-sales"
                  className="btn btn-outline-primary btn-lg px-5 py-3"
                  style={{ fontSize: '1.05rem' }}
                >
                  Contact
                </Link>
              </div>
            </div>

            {/* Right Column - Hero Image */}
            <div className="col-lg-6 text-center">
              <img
                src={HeroImage}
                alt="Enterprise Document Verification"
                className="img-fluid"
                style={{ 
                  maxWidth: '500px',
                  width: '100%',
                  height: 'auto'
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;