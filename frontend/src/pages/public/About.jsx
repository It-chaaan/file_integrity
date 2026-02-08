import React from 'react';
import { Shield, Lock, Server, FileCheck } from 'lucide-react';

const About = () => {
  const technologies = [
    {
      icon: Shield,
      title: 'SHA-256 Hashing',
      description: 'A cryptographic hash function that produces a unique 256-bit fingerprint for each document. Even a single character change produces a completely different hash.'
    },
    {
      icon: Lock,
      title: 'Digital Signatures (ECDSA)',
      description: 'Elliptic Curve Digital Signature Algorithm ensures that only authorized government offices can register documents in the system.'
    },
    {
      icon: Server,
      title: 'Secure Infrastructure',
      description: 'Government-managed servers with military-grade encryption and redundant backups ensure system availability and data integrity.'
    },
    {
      icon: FileCheck,
      title: 'Audit Trails',
      description: 'All system actions are logged with immutable timestamps for complete transparency and accountability.'
    }
  ];

  const privacyPrinciples = [
    'Only cryptographic hashes are stored in the system — never the actual document content',
    'No personal information is required to verify a document',
    'Access to verification records is strictly restricted to authorized personnel only',
    'Citizens have the right to request and audit logs of all access to their document records'
  ];

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold mb-3">About Parity</h1>
        <p className="lead text-muted col-lg-10 mx-auto">
          The Automated Cryptographic Hashing System for Legal Document Integrity 
          Verification is a secure digital solution designed to protect, verify, and preserve 
          the authenticity of legal documents used within a Local Government Unit (LGU). 
          The system leverages modern cryptographic hashing techniques to ensure that official 
          documents remain tamper-proof, traceable, and verifiable throughout their lifecycle.
        </p>
        <p className="text-muted">
          Built with military-grade security and designed for ease of use, Parity serves citizens, 
          businesses, and government agencies in the fight against document tampering and forgery.
        </p>
      </div>

      {/* Technology Section */}
      <div className="mb-5">
        <h2 className="text-center mb-4">Technology Used</h2>
        <div className="row g-4">
          {technologies.map((tech, index) => {
            const Icon = tech.icon;
            return (
              <div key={index} className="col-md-6">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-start">
                      <div className="bg-primary bg-opacity-10 rounded p-3 me-3">
                        <Icon size={32} className="text-primary" />
                      </div>
                      <div>
                        <h5 className="fw-bold mb-2">{tech.title}</h5>
                        <p className="text-muted mb-0">{tech.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Privacy Section */}
      <div className="bg-light rounded p-5">
        <h2 className="text-center mb-4">Data Privacy and Compliance</h2>
        <p className="text-center text-muted mb-4">
          Parity is fully compliant with the <strong>Data Privacy Act of 2012 (Republic Act No. 10173)</strong>.<br />
          The system is designed with privacy-first principles:
        </p>

        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow-sm" style={{ border: '2px solid #000000' }}>
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Our Privacy Principles</h5>
              </div>
              <div className="card-body">
                <ul className="list-unstyled mb-0">
                  {privacyPrinciples.map((principle, index) => (
                    <li key={index} className="mb-3 d-flex align-items-start">
                      <Shield size={20} className="text-primary me-3 mt-1 flex-shrink-0" />
                      <span>{principle}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;