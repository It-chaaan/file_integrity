import React from 'react';

const StatusBadge = ({ status, priority }) => {
  const getColor = () => {
    if (priority) {
      if (priority === 'Critical') return 'danger';
      if (priority === 'High') return 'warning';
      if (priority === 'Medium') return 'info';
      return 'secondary';
    }
    
    if (status === 'Active' || status === 'Success') return 'success';
    if (status === 'Failed' || status === 'Inactive') return 'danger';
    if (status === 'Revoked' || status === 'Under Review') return 'warning';
    if (status === 'Expired') return 'secondary';
    if (status === 'Open') return 'primary';
    return 'primary';
  };

  return (
    <span className={`badge bg-${getColor()}`}>
      {status || priority}
    </span>
  );
};

export default StatusBadge;