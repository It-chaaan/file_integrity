import React from 'react';
import { Link } from 'react-router-dom';
import HeroImage from '../../assets/images/IMAGE - HERO.png';

function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section py-5">
        <div className="container position-relative" style={{ zIndex: 1 }}>
          <div className="row align-items-center" style={{ minHeight: '420px' }}>
            <div className="col-lg-6 text-start">
              <h1 className="display-3 fw-bold mb-4">
                Verify Legal Documents with Cryptographic Integrity
              </h1>
              <p className="lead mb-4 fs-5">
                Ensure authenticity using SHA-256 hashing and digital signatures.<br />
                Protect yourself from document fraud and tampering.
              </p>
              <Link 
                to="/verify" 
                className="btn btn-primary btn-lg px-5 py-3" 
                style={{ fontSize: '1.05rem' }}
              >
                <i className="bi bi-shield-check me-2"></i>
                Verify Document
              </Link>
            </div>
            <div className="col-lg-6 text-center">
              <img 
                src={HeroImage} 
                alt="Document Verification"
                className="img-fluid"
                style={{ maxWidth: '500px', width: '100%' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '14px', transition: 'transform 0.2s' }}>
                <div className="card-body text-center p-4">
                  <div 
                    className="bg-navy-soft rounded-4 d-inline-flex align-items-center justify-content-center mb-3" 
                    style={{ width: '80px', height: '80px' }}
                  >
                    <i className="bi bi-shield-check text-navy" style={{ fontSize: '2.3rem' }}></i>
                  </div>
                  <h5 className="card-title mb-3">Secure Verification</h5>
                  <p className="card-text text-muted">
                    Military-grade cryptographic verification ensures your documents are authentic and untampered.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '14px', transition: 'transform 0.2s' }}>
                <div className="card-body text-center p-4">
                  <div 
                    className="bg-navy-soft rounded-4 d-inline-flex align-items-center justify-content-center mb-3" 
                    style={{ width: '80px', height: '80px' }}
                  >
                    <i className="bi bi-lightning-charge text-navy" style={{ fontSize: '2.3rem' }}></i>
                  </div>
                  <h5 className="card-title mb-3">Instant Results</h5>
                  <p className="card-text text-muted">
                    Get verification results in seconds. No waiting, no complicated processes.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '14px', transition: 'transform 0.2s' }}>
                <div className="card-body text-center p-4">
                  <div 
                    className="bg-navy-soft rounded-4 d-inline-flex align-items-center justify-content-center mb-3" 
                    style={{ width: '80px', height: '80px' }}
                  >
                    <i className="bi bi-lock text-navy" style={{ fontSize: '2.3rem' }}></i>
                  </div>
                  <h5 className="card-title mb-3">Privacy First</h5>
                  <p className="card-text text-muted">
                    Your documents are never stored. We only verify cryptographic hashes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;