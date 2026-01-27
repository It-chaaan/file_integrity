import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { formatFileSize, validateFileType, validateFileSize } from '../services/utils';

/**
 * Standardized upload area with drag/drop, validation, and inline hints.
 * @param {Object} props
 * @param {File|null} props.file - Currently selected file.
 * @param {(event: {target: {files: FileList}}) => void} props.onFileChange - Called when a file is selected/dropped.
 * @param {string[]} [props.acceptedTypes=['pdf','doc','docx','txt']] - Allowed extensions (no dots).
 * @param {number} [props.maxSizeMB=5] - Maximum file size in megabytes.
 * @param {boolean} [props.disabled=false] - Disable interactions.
 * @param {string} [props.error=''] - Error message to display below the area.
 * @param {(message: string) => void} [props.onValidationError] - Optional callback when validation fails.
 */
const UploadArea = ({ 
  file, 
  onFileChange, 
  acceptedTypes = ['pdf', 'doc', 'docx', 'txt'], 
  maxSizeMB = 5,
  disabled = false,
  error = '',
  onValidationError = null
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (fileToValidate) => {
    // Check file type (expects a File object)
    const typeValid = validateFileType(fileToValidate, acceptedTypes);
    if (!typeValid) {
      const msg = `Invalid file type. Allowed: ${acceptedTypes.map(t => t.toUpperCase()).join(', ')}`;
      if (onValidationError) onValidationError(msg);
      return false;
    }

    // Check file size (expects a File object)
    const sizeValid = validateFileSize(fileToValidate, maxSizeMB);
    if (!sizeValid) {
      const msg = `File is too large. Maximum size: ${maxSizeMB}MB`;
      if (onValidationError) onValidationError(msg);
      return false;
    }

    return true;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (validateFile(droppedFile) && onFileChange) {
        const syntheticEvent = {
          target: { files: [droppedFile] }
        };
        onFileChange(syntheticEvent);
      }
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile) && onFileChange) {
      onFileChange(e);
    } else if (selectedFile && !validateFile(selectedFile)) {
      // Reset input
      e.target.value = '';
    }
  };
  const formatAcceptedTypes = () => {
    return acceptedTypes.map(type => type.toUpperCase()).join(', ');
  };

  return (
    <div className="upload-area-wrapper">
      <div
        className={`upload-area ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''} ${disabled ? 'disabled' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="File upload area"
      >
        <input
          ref={fileInputRef}
          type="file"
          className="d-none"
          accept={acceptedTypes.map(type => `.${type}`).join(',')}
          onChange={handleFileSelect}
          disabled={disabled}
        />

        {file ? (
          <div className="upload-area-content">
            <i className="bi bi-file-earmark-check text-success upload-icon"></i>
            <p className="upload-filename mb-2">{file.name}</p>
            <p className="upload-filesize text-muted small mb-3">
              {formatFileSize(file.size)}
            </p>
            <p className="upload-area-info-inline text-muted small mb-0">
              Supported formats: {formatAcceptedTypes()} • Max size: {maxSizeMB}MB
            </p>
          </div>
        ) : (
          <div className="upload-area-content">
            <i className="bi bi-cloud-upload text-primary upload-icon"></i>
            <p className="upload-text mb-3">
              Drop your file here or click to browse
            </p>
            <button 
              type="button"
              className="btn btn-dark btn-sm upload-button mb-3"
              disabled={disabled}
            >
              Select File
            </button>
            <p className="upload-area-info-inline text-muted small mb-0">
              Supported formats: {formatAcceptedTypes()} • Max size: {maxSizeMB}MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-danger mt-3 mb-0" role="alert">
          <i className="bi bi-exclamation-circle me-2"></i>
          {error}
        </div>
      )}
    </div>
  );
};

UploadArea.propTypes = {
  file: PropTypes.instanceOf(File),
  onFileChange: PropTypes.func.isRequired,
  acceptedTypes: PropTypes.arrayOf(PropTypes.string),
  maxSizeMB: PropTypes.number,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  onValidationError: PropTypes.func,
};

export default UploadArea;
