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
      description: 'Elliptic Curve Digital Signature Algorithm ensures only authorized enterprise signers can register and approve documents in the platform.'
    },
    {
      icon: Server,
      title: 'Enterprise Security Infrastructure',
      description: 'Enterprise-managed infrastructure with strong encryption, resilient architecture, and controlled access protects high-value business records.'
    },
    {
      icon: FileCheck,
      title: 'Audit Trails',
      description: 'All system actions are logged with immutable timestamps for complete transparency and accountability.'
    }
  ];

  const privacyPrinciples = [
    'Only cryptographic hashes are stored in the system — never the actual document content',
    'Verification can be completed with minimal metadata exposure',
    'Access to verification records is restricted by enterprise role-based access controls',
    'All activities are traceable through immutable audit logs for internal and external review'
  ];

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="display-5 fw-bold mb-3">About Parity</h1>
        <p className="lead text-muted col-lg-10 mx-auto">
          PARITY is a commercial enterprise platform built to secure and verify business-critical 
          documents across corporations, financial institutions, legal firms, and multinational organizations. 
          It protects contracts, financial disclosures, compliance records, and HR agreements with cryptographic 
          integrity controls designed for industry-regulated environments.
        </p>
        <p className="text-muted">
          Our mission is to provide businesses with cryptographic-grade document integrity and 
          compliance assurance, helping prevent contract fraud, financial manipulation, and internal tampering.
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
          PARITY aligns with modern enterprise compliance programs, including <strong>ISO 27001, SOC 2, and GDPR-aligned controls</strong>.<br />
          The platform is designed with compliance-first principles for enterprise IT and risk teams:
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