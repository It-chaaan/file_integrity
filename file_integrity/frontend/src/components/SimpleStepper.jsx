import React from 'react';
import PropTypes from 'prop-types';

// Minimal stepper matching the provided reference image.
// Props:
// - status: one of 'idle' | 'ready' | 'uploading' | 'verifying' | 'complete' | 'error'
// - labels: optional array of 4 labels; defaults provided
export default function SimpleStepper({ status, labels, currentStep }) {
  const steps = labels && labels.length
    ? labels
    : ['Select File', 'Enter Metadata', 'Hash & Sign', 'Complete'];

  const rankMap = { idle: 0, ready: 1, uploading: 2, verifying: 3, complete: 4, error: 2 };
  const normalizedStep = Number.isFinite(currentStep)
    ? Math.max(0, Math.min(steps.length, currentStep - 1))
    : null;
  const currentRank = normalizedStep !== null ? normalizedStep : (rankMap[status] ?? 0);

  return (
    <div className="stepper">
      {steps.map((label, idx) => {
        const isCompleted = currentRank > idx;
        const isActive = currentRank === idx && currentRank < steps.length;

        return (
          <div key={label} className="step">
            <div className={`step-number ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
              {isCompleted ? '' : idx + 1}
            </div>
            <div className="step-label">{label}</div>
            {idx < steps.length - 1 && (
              <div className={`step-line ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}></div>
            )}
          </div>
        );
      })}
    </div>
  );
}

SimpleStepper.propTypes = {
  status: PropTypes.oneOf(['idle', 'ready', 'uploading', 'verifying', 'complete', 'error']),
  labels: PropTypes.arrayOf(PropTypes.string),
  currentStep: PropTypes.number,
};
