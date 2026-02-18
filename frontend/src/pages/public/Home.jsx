import React from 'react';
import { Link } from 'react-router-dom';
import HeroImage from '../../assets/images/IMAGE - HERO.png';

function Home() {
  return (
    <div>
      <section className="hero-section py-5">
        <div className="container position-relative" style={{ zIndex: 1 }}>
          <div className="row align-items-center" style={{ minHeight: '700px' }}>
            <div className="col-lg-6 text-start">
              <h1 className="display-3 fw-bold mb-4">
                Verify Legal Documents with Integrity
              </h1>
              <p className="lead mb-4 fs-5">
                PARITY ensures the authenticity and integrity of LGU-issued documents through
                cryptographic verification using SHA-256 and ECDSA digital signatures.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link
                  to="/how-it-works"
                  className="btn btn-primary btn-lg px-5 py-3"
                  style={{ fontSize: '1.05rem' }}
                >
                  Learn More
                </Link>
                <Link
                  to="/report"
                  className="btn btn-outline-primary btn-lg px-5 py-3"
                  style={{ fontSize: '1.05rem' }}
                >
                  Contact LGU
                </Link>
              </div>
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

    </div>
  );
}

export default Home;