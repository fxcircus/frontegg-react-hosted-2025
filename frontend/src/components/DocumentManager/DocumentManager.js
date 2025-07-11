import React, { useState, useEffect } from 'react';
import { useAuth } from '@frontegg/react';
import DocumentList from './DocumentList';
import DocumentCard from './DocumentCard';
import ShareDialog from './ShareDialog';
import LoadingSpinner from '../LoadingSpinner';
import Toast from '../Toast';
import './DocumentManager.css';

const DocumentManager = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [documentToShare, setDocumentToShare] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocContent, setNewDocContent] = useState('');

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
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

  const createDocument = async () => {
    if (!newDocTitle.trim()) {
      setToastMessage('Please enter a document title');
      return;
    }

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newDocTitle,
          content: newDocContent
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create document');
      }

      const data = await response.json();
      setDocuments([...documents, data.document]);
      setToastMessage('Document created successfully');
      setIsCreating(false);
      setNewDocTitle('');
      setNewDocContent('');
    } catch (err) {
      setToastMessage('Failed to create document');
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

  if (isLoading) {
    return <LoadingSpinner message="Loading documents..." />;
  }

  return (
    <div className="document-manager">
      <div className="document-manager-header">
        <h2>Document Management</h2>
        <p>Create, share, and manage documents with ReBAC permissions</p>
      </div>

      <div className="document-actions">
        {!isCreating ? (
          <button 
            className="btn-primary"
            onClick={() => setIsCreating(true)}
          >
            Create New Document
          </button>
        ) : (
          <div className="create-document-form">
            <input
              type="text"
              placeholder="Document title"
              value={newDocTitle}
              onChange={(e) => setNewDocTitle(e.target.value)}
              className="doc-input"
            />
            <textarea
              placeholder="Document content (optional)"
              value={newDocContent}
              onChange={(e) => setNewDocContent(e.target.value)}
              className="doc-textarea"
              rows="3"
            />
            <div className="form-actions">
              <button 
                className="btn-primary"
                onClick={createDocument}
              >
                Create
              </button>
              <button 
                className="btn-secondary"
                onClick={() => {
                  setIsCreating(false);
                  setNewDocTitle('');
                  setNewDocContent('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="document-container">
        <div className="document-list-section">
          <DocumentList
            documents={documents}
            selectedDocument={selectedDocument}
            onSelectDocument={setSelectedDocument}
            currentUserId={user.sub}
          />
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
              <p>Select a document to view details</p>
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