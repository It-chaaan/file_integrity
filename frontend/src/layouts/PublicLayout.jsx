import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Logo from '../assets/icons/Logo - Integrity Verification.png';

const PublicLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Header/Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top">
        <div className="container">
          <Link to="/" className="navbar-brand d-flex align-items-center">
            <img 
              src={Logo} 
              alt="Parity Logo" 
              style={{ width: '32px', height: '32px', objectFit: 'contain' }}
              className="me-2"
            />
            <span className="fw-bold">Parity</span>
          </Link>
          
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav mx-auto gap-1">
              <li className="nav-item">
                <Link to="/" className="nav-link px-3">Home</Link>
              </li>
              <li className="nav-item">
                <Link to="/verify" className="nav-link px-3">Verify</Link>
              </li>
              <li className="nav-item">
                <Link to="/how-it-works" className="nav-link px-3">How It Works</Link>
              </li>
              <li className="nav-item">
                <Link to="/about" className="nav-link px-3">About</Link>
              </li>
              <li className="nav-item">
                <Link to="/report" className="nav-link px-3">Report</Link>
              </li>
            </ul>
            <Link to="/login" className="btn btn-primary btn-sm">Admin</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow-1">
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;