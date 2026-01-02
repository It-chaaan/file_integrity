import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { formatTimestamp, downloadFile } from '../../../utils/crypto';
import './styles/DetailsModal.css';

const DetailsModal = ({ show, onHide, entry }) => {
  if (!entry) return null;

  const handleDownload = () => {
    if (entry.file) {
      downloadFile(entry.file, entry.name);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="details-modal">
      <Modal.Header closeButton className="details-modal__header">
        <Modal.Title>Registry Entry Details</Modal.Title>
      </Modal.Header>
      <Modal.Body className="details-modal__body">
        <div className="details-modal__row">
          <strong>Document:</strong>
          <span>{entry.name || '-'}</span>
        </div>
        <div className="details-modal__row">
          <strong>Type:</strong>
          <span>{entry.type || '-'}</span>
        </div>
        <div className="details-modal__row">
          <strong>Reference:</strong>
          <span>{entry.reference || '-'}</span>
        </div>
        <div className="details-modal__row">
          <strong>Signed By:</strong>
          <span>{entry.signedBy || '-'}</span>
        </div>
        <div className="details-modal__row">
          <strong>Timestamp:</strong>
          <span>{formatTimestamp(entry.timestamp)}</span>
        </div>
        <div className="details-modal__hash">
          <strong>Fingerprint (SHA-256):</strong>
          <pre>{entry.hash || '-'}</pre>
        </div>
        <div className="details-modal__row">
          <strong>File:</strong>
          <span>
            {entry.file ? entry.file.name : 'Original file not available'}
          </span>
        </div>
      </Modal.Body>
      <Modal.Footer className="details-modal__footer">
        <Button 
          className="details-modal__download-btn"
          onClick={handleDownload}
          disabled={!entry.file}
        >
          <i className="bi bi-download me-2"></i>
          Download File
        </Button>
        <Button variant="outline-light" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DetailsModal;