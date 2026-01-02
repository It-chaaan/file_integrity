import React, { useState } from 'react';
import { Table, Button, Form } from 'react-bootstrap';
import { useRegistry } from '../../../contexts/RegistryContext';
import { formatTimestamp, downloadFile } from '../../../utils/crypto';
import DetailsModal from '../../common/modals/DetailsModal';
import '../styles/AdminRegistry.css';

const AdminRegistry = () => {
  const { registry } = useRegistry();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleDownload = (index) => {
    const entry = registry[index];
    if (entry?.file) {
      downloadFile(entry.file, entry.name);
    } else {
      alert('File not available.');
    }
  };

  const handleShowDetails = (index) => {
    setSelectedEntry(registry[index]);
    setShowDetails(true);
  };

  const filteredRegistry = registry.filter(entry => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      entry.name?.toLowerCase().includes(query) ||
      entry.hash?.toLowerCase().includes(query) ||
      entry.reference?.toLowerCase().includes(query) ||
      entry.type?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="admin-registry">
      <div className="admin-registry__panel">
        <div className="admin-registry__header">
          <h5>Registry Console</h5>
          <Form.Control
            type="text"
            placeholder="Search by Hash/ID/Name..."
            className="admin-registry__search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="admin-registry__table-container">
          <Table hover className="admin-registry__table">
            <thead>
              <tr>
                <th>Doc ID</th>
                <th>Category</th>
                <th>Document Name</th>
                <th>Fingerprint (SHA-256)</th>
                <th>Signed By</th>
                <th>Timestamp</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistry.length === 0 ? (
                <tr>
                  <td colSpan="7" className="admin-registry__empty">
                    {searchQuery ? 'No matching entries found' : 'No registry entries yet'}
                  </td>
                </tr>
              ) : (
                [...filteredRegistry].reverse().map((entry, idx) => {
                  const originalIndex = registry.indexOf(entry);
                  return (
                    <tr key={originalIndex}>
                      <td>{entry.reference || '-'}</td>
                      <td><span className="admin-registry__badge">{entry.type || '-'}</span></td>
                      <td>{entry.name || '-'}</td>
                      <td>
                        <code className="admin-registry__hash">
                          {entry.hash.slice(0, 16)}...{entry.hash.slice(-8)}
                        </code>
                      </td>
                      <td>{entry.signedBy || 'Admin'}</td>
                      <td>{formatTimestamp(entry.timestamp)}</td>
                      <td>
                        <Button 
                          size="sm" 
                          variant="link" 
                          className="admin-registry__action-btn"
                          onClick={() => handleDownload(originalIndex)}
                        >
                          Download
                        </Button>
                        <Button 
                          size="sm" 
                          variant="link" 
                          className="admin-registry__action-btn"
                          onClick={() => handleShowDetails(originalIndex)}
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>
        
        {filteredRegistry.length > 0 && (
          <div className="admin-registry__footer">
            Showing {filteredRegistry.length} of {registry.length} entries
          </div>
        )}
      </div>

      <DetailsModal 
        show={showDetails}
        onHide={() => setShowDetails(false)}
        entry={selectedEntry}
      />
    </div>
  );
};

export default AdminRegistry;