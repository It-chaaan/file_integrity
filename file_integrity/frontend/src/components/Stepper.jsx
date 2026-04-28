import React from 'react';
import PropTypes from 'prop-types';

const Stepper = ({ steps, currentStep }) => {
  return (
    <div className="d-flex align-items-center justify-content-center mb-4 py-3">
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="d-flex flex-column align-items-center">
            <div
              className={`rounded-circle d-flex align-items-center justify-content-center fw-bold ${
                index + 1 <= currentStep
                  ? 'bg-primary text-white'
                  : 'bg-light text-muted border'
              }`}
              style={{ width: '40px', height: '40px', fontSize: '16px' }}
            >
              {index + 1}
            </div>
            <small className="mt-2 text-center" style={{ maxWidth: '100px' }}>
              {step}
            </small>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`mx-3 ${
                index + 1 < currentStep ? 'bg-primary' : 'bg-light'
              }`}
              style={{ width: '60px', height: '2px', marginTop: '-20px' }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Stepper;

Stepper.propTypes = {
  steps: PropTypes.arrayOf(PropTypes.string).isRequired,
  currentStep: PropTypes.number.isRequired,
};