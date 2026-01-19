import React from 'react';

const Topbar = ({ user, role }) => {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="bg-white border-bottom p-3 d-flex justify-content-end align-items-center" style={{ marginLeft: '250px' }}>
      <div className="d-flex align-items-center">
        <div
          className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2 fw-bold"
          style={{ width: '40px', height: '40px', fontSize: '0.9rem' }}
        >
          {getInitials(user.name)}
        </div>
        <div>
          <div className="fw-bold" style={{ fontSize: '0.9rem' }}>{user.name}</div>
          <small className="text-muted">{role}</small>
        </div>
      </div>
    </div>
  );
};

export default Topbar;