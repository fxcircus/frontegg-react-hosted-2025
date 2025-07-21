import React, { useState, useEffect } from 'react';
import { useAuth } from '@frontegg/react';
import DocumentList from './DocumentList';
import DocumentCard from './DocumentCard';
import ShareDialog from './ShareDialog';
import LoadingSpinner from '../LoadingSpinner';
import Toast from '../Toast';
import './DocumentManager.css';
import '../DocsLink.css';

const DocumentManager = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [allDocuments, setAllDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [documentToShare, setDocumentToShare] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
    fetchAllDocuments();
  }, [user]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/documents', {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const data = await response.json();
      setDocuments(data.documents);
    } catch (err) {
      setError(err.message);
      setToastMessage('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllDocuments = async () => {
    try {
      const response = await fetch('/api/documents/admin/all', {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch all documents');
      }

      const data = await response.json();
      setAllDocuments(data.documents);
    } catch (err) {
      console.error('Failed to fetch all documents:', err);
    }
  };


  const updateDocument = async (documentId, updates) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update document');
      }

      const data = await response.json();
      setDocuments(documents.map(doc => 
        doc.id === documentId ? data.document : doc
      ));
      setToastMessage('Document updated successfully');
    } catch (err) {
      setToastMessage('Failed to update document');
    }
  };

  const deleteDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      setDocuments(documents.filter(doc => doc.id !== documentId));
      setAllDocuments(allDocuments.filter(doc => doc.id !== documentId));
      setSelectedDocument(null);
      setToastMessage('Document deleted successfully');
    } catch (err) {
      setToastMessage('Failed to delete document');
    }
  };

  const shareDocument = async (documentId, targetUserId, permission) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          targetUserId,
          permission
        })
      });

      if (!response.ok) {
        throw new Error('Failed to share document');
      }

      setToastMessage(`Document shared successfully`);
      setShowShareDialog(false);
      setDocumentToShare(null);
    } catch (err) {
      setToastMessage('Failed to share document');
    }
  };

  const checkPermission = async (documentId, action) => {
    try {
      const response = await fetch('/api/permissions/check', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          documentId,
          action
        })
      });

      const data = await response.json();
      return data.hasPermission;
    } catch (err) {
      console.error('Permission check failed:', err);
      return false;
    }
  };

  const seedDemoDocuments = async () => {
    try {
      const response = await fetch('/api/documents/admin/seed', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to seed documents');
      }

      const data = await response.json();
      setToastMessage(data.message);
      
      // Refresh both lists
      await fetchDocuments();
      await fetchAllDocuments();
    } catch (err) {
      setToastMessage('Failed to seed demo documents');
    }
  };

  const deleteAllDocuments = async () => {
    if (!window.confirm('Are you sure you want to delete ALL documents? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/documents/admin/all', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete documents');
      }

      const data = await response.json();
      setToastMessage(data.message);
      setDocuments([]);
      setAllDocuments([]);
      setSelectedDocument(null);
    } catch (err) {
      setToastMessage('Failed to delete all documents');
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading documents..." />;
  }

  return (
    <div className="document-manager">
      <div className="document-manager-header">
        <div className="page-title-wrapper">
          <h2>ReBAC Document Database</h2>
          <a href="https://developers.frontegg.com/guides/authorization/rebac#relationship-based-access-control-in-frontegg" 
             target="_blank" 
             rel="noopener noreferrer"
             className="docs-link"
             title="Learn more about ReBAC">
            <span className="tooltip-icon">?</span>
          </a>
        </div>
        <p>Demonstrate ReBAC permissions with document sharing</p>
      </div>

      <div className="demo-controls">
        <h3>Demo Controls</h3>
        <div className="demo-actions">
          <button 
            className="btn-primary"
            onClick={seedDemoDocuments}
          >
            Seed Demo Documents
          </button>
          <button 
            className="btn-danger"
            onClick={deleteAllDocuments}
          >
            Delete All Documents
          </button>
        </div>
        <p className="demo-info">
          The "Seed Demo Documents" button re-initializes the database with 5 test documents (doc-001 through doc-005) for demonstration purposes.
        </p>
      </div>

      <div className="document-comparison">
        <div className="document-column">
          <h3>All Documents in Database</h3>
          <p className="column-description">Complete list of documents (bypasses permissions)</p>
          {allDocuments.length === 0 ? (
            <div className="empty-state">
              <p>No documents in database</p>
              <button onClick={seedDemoDocuments}>Seed Demo Documents</button>
            </div>
          ) : (
            <div className="document-list all-documents">
              {allDocuments.map(doc => (
                <div key={doc.id} className="document-item">
                  <div className="doc-id">ID: {doc.id}</div>
                  <div className="doc-title">{doc.title}</div>
                  <div className="doc-owner">Owner: {doc.ownerId === user.sub ? 'You' : doc.ownerId}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="document-column">
          <h3>Documents You Have Access To</h3>
          <p className="column-description">Documents visible based on your permissions</p>
          {documents.length === 0 ? (
            <div className="empty-state">
              <p>You don't have access to any documents</p>
            </div>
          ) : (
            <DocumentList
              documents={documents}
              selectedDocument={selectedDocument}
              onSelectDocument={setSelectedDocument}
              currentUserId={user.sub}
            />
          )}
        </div>

        <div className="document-detail-section">
          {selectedDocument ? (
            <DocumentCard
              document={selectedDocument}
              onUpdate={updateDocument}
              onDelete={deleteDocument}
              onShare={() => {
                setDocumentToShare(selectedDocument);
                setShowShareDialog(true);
              }}
              checkPermission={checkPermission}
              currentUserId={user.sub}
            />
          ) : (
            <div className="no-document-selected">
              <p>Select a document from your accessible list to view details</p>
            </div>
          )}
        </div>
      </div>

      {showShareDialog && documentToShare && (
        <ShareDialog
          document={documentToShare}
          onShare={shareDocument}
          onClose={() => {
            setShowShareDialog(false);
            setDocumentToShare(null);
          }}
        />
      )}

      <Toast 
        message={toastMessage} 
        type={error ? 'error' : 'info'} 
        onClose={() => setToastMessage('')} 
      />
    </div>
  );
};

export default DocumentManager;