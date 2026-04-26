import React from 'react';
import PropTypes from 'prop-types';

/**
 * Displays a contextual badge for status/priority values.
 * @param {Object} props
 * @param {string} [props.status] - Status label (e.g., 'Success', 'Failed').
 * @param {string} [props.priority] - Priority label (overrides status coloring when present).
 */
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

StatusBadge.propTypes = {
  status: PropTypes.string,
  priority: PropTypes.string,
};

export default StatusBadge;