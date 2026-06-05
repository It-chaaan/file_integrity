import React from 'react';
import PropTypes from 'prop-types';

/**
 * Displays a contextual badge for status/priority values.
 * @param {Object} props
 * @param {string} [props.status] - Status label (e.g., 'Success', 'Failed').
 * @param {string} [props.priority] - Priority label (overrides status coloring when present).
 */
const StatusBadge = ({ status, priority }) => {
  const formatLabel = () => {
    if (priority) {
      const priorityLabels = {
        urgent: 'Urgent',
        high: 'High',
        medium: 'Medium',
        low: 'Low',
      };
      return priorityLabels[(priority || '').toLowerCase()] || priority;
    }

    const statusLabels = {
      verified: 'Verified',
      failed: 'Failed',
      pending: 'Pending',
      expired: 'Expired',
      open: 'Open',
      in_progress: 'In Progress',
      waiting_response: 'Waiting Response',
      resolved: 'Resolved',
      closed: 'Closed',
    };
    return statusLabels[(status || '').toLowerCase()] || status;
  };

  const getColor = () => {
    if (priority) {
      const normalizedPriority = priority.toLowerCase();
      if (normalizedPriority === 'urgent') return 'danger';
      if (normalizedPriority === 'high') return 'warning';
      if (normalizedPriority === 'medium') return 'info';
      return 'secondary';
    }

    const normalizedStatus = (status || '').toLowerCase();
    if (normalizedStatus === 'verified') return 'success';
    if (normalizedStatus === 'failed') return 'danger';
    if (normalizedStatus === 'pending') return 'warning';
    if (normalizedStatus === 'expired') return 'secondary';
    if (normalizedStatus === 'open') return 'primary';
    if (normalizedStatus === 'in_progress') return 'warning';
    if (normalizedStatus === 'waiting_response') return 'info';
    return 'primary';
  };

  return (
    <span className={`badge bg-${getColor()}`}>
      {formatLabel()}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string,
  priority: PropTypes.string,
};

export default StatusBadge;
