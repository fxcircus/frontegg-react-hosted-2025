import React from 'react';
import './DocumentManager.css';

const DocumentList = ({ documents, selectedDocument, onSelectDocument, currentUserId }) => {
  const getDocumentIcon = (doc) => {
    if (doc.ownerId === currentUserId) {
      return '👑'; // Owner
    }
    return '📄'; // Shared document
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="document-list">
      <h3>Your Documents</h3>
      {documents.length === 0 ? (
        <div className="empty-list">
          <p>No documents yet. Create your first document!</p>
        </div>
      ) : (
        <ul className="doc-list">
          {documents.map(doc => (
            <li
              key={doc.id}
              className={`doc-item ${selectedDocument?.id === doc.id ? 'selected' : ''}`}
              onClick={() => onSelectDocument(doc)}
            >
              <span className="doc-icon">{getDocumentIcon(doc)}</span>
              <div className="doc-info">
                <span className="doc-title">{doc.title}</span>
                <span className="doc-date">{formatDate(doc.createdAt)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DocumentList;