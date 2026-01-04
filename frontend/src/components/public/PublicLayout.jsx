import React from 'react';
import PublicNavbar from './sections/PublicNavbar';
import PublicHero from './sections/PublicHero';
import PublicProcess from './sections/PublicProcess';
import PublicVerifier from './sections/PublicVerifier';
import PublicSupport from './sections/PublicSupport';
import './styles/PublicLayout.css';

const PublicLayout = () => {
  return (
    <div className="public-layout">
      <PublicNavbar />
      <main className="public-layout__content">
        <PublicHero />
        <PublicProcess />
        <PublicVerifier />
        <PublicSupport />
      </main>
      <footer className="public-layout__footer">
        <div className="container py-4 text-center">
          <p className="mb-0 text-muted">
            &copy; {new Date().getFullYear()} Parity - LGU Document Integrity Verification System 
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;