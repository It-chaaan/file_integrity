export const mockDocuments = [
  {
    id: 'DOC-2026-001847',
    documentId: 'DOC-2026-001847',
    fileName: 'Barangay_Clearance_2026.pdf',
    type: 'Barangay Clearance',
    documentType: 'Barangay Clearance',
    fileType: 'application/pdf',
    department: 'Barangay Captain Office',
    uploadedBy: 'Christian',
    fileSize: 2516582,
    hash: 'd4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35',
    shortHash: 'd4735e3a...13ab35',
    status: 'verified',
    uploadDate: '2026-01-08T14:32:15Z',
    signature: '3045022100f1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0'
  },
  {
    id: 'DOC-2026-001846',
    documentId: 'DOC-2026-001846',
    fileName: 'Certificate_of_Residency_2026.pdf',
    type: 'Certificate of Residency',
    documentType: 'Certificate of Residency',
    fileType: 'application/pdf',
    department: 'Barangay Secretary',
    uploadedBy: 'Joshua',
    fileSize: 1887437,
    hash: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
    shortHash: 'a1b2c3d4...f0a1b2',
    status: 'verified',
    uploadDate: '2026-01-07T10:15:30Z',
    signature: '3045022100a1b2c3d4e5f6a7b8c9d0e1f2a3b4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0'
  },
  {
    id: 'DOC-2026-001845',
    documentId: 'DOC-2026-001845',
    fileName: 'Business_Permit_Barangay_2026.pdf',
    type: 'Business Permit (Barangay)',
    documentType: 'Business Permit (Barangay)',
    fileType: 'application/pdf',
    department: 'Barangay Treasurer',
    uploadedBy: 'Christian',
    fileSize: 2516582,
    hash: 'd4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35',
    shortHash: 'd4735e3a...13ab35',
    status: 'pending',
    uploadDate: '2026-01-08T09:20:45Z',
    signature: '3045022100d4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35'
  }
];

export const getDocuments = () => mockDocuments;
export const getDocumentById = (id) => mockDocuments.find(d => d.id === id);