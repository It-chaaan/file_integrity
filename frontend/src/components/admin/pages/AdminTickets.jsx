import React from 'react';
import { Button, Badge } from 'react-bootstrap';
import '../styles/AdminTickets.css';

const AdminTickets = () => {
  const tickets = [
    {
      id: 'T-2025-09',
      status: 'UNDER INVESTIGATION',
      statusVariant: 'warning',
      title: 'Hash Mismatch: Clearance #12',
      description: 'Reported by Citizen: Tampered digital copy suspected.',
      date: '2025-01-15'
    },
    {
      id: 'T-2025-08',
      status: 'TAMPERING DETECTED',
      statusVariant: 'danger',
      title: 'Record #4421 conflict',
      description: 'Hashes do not match registry. Possible file modification.',
      date: '2025-01-14'
    },
    {
      id: 'T-2025-07',
      status: 'RESOLVED',
      statusVariant: 'success',
      title: 'False alarm: Certificate of Indigency',
      description: 'User uploaded wrong version. Original found and verified.',
      date: '2025-01-13'
    }
  ];

  return (
    <div className="admin-tickets">
      <div className="admin-tickets__panel">
        <div className="admin-tickets__header">
          <h5>Ticket Queue</h5>
          <Badge bg="danger" pill>3 Active</Badge>
        </div>

        <div className="admin-tickets__list">
          {tickets.map((ticket) => (
            <div 
              key={ticket.id}
              className={`admin-tickets__item admin-tickets__item--${ticket.statusVariant}`}
            >
              <div className="admin-tickets__item-header">
                <Badge bg={ticket.statusVariant} className="admin-tickets__badge">
                  {ticket.status}
                </Badge>
                <small className="admin-tickets__id">{ticket.id}</small>
              </div>
              <h6 className="admin-tickets__title">{ticket.title}</h6>
              <p className="admin-tickets__description">{ticket.description}</p>
              <div className="admin-tickets__footer">
                <small className="admin-tickets__date">Date: {ticket.date}</small>
                <Button size="sm" variant="outline-light" className="admin-tickets__btn">
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="admin-tickets__notice">
          <strong>Note:</strong> Ticketing is demo-only in this prototype. Full ticket management system coming soon.
        </div>
      </div>
    </div>
  );
};

export default AdminTickets;