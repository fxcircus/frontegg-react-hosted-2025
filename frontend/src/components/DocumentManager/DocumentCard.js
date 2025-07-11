import React, { useState, useEffect } from 'react';
import './DocumentManager.css';

const DocumentCard = ({ 
  document, 
  onUpdate, 
  onDelete, 
  onShare, 
  checkPermission, 
  currentUserId 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(document.title);
  const [editContent, setEditContent] = useState(document.content || '');
  const [permissions, setPermissions] = useState({
    canRead: false,
    canWrite: false,
    canDelete: false,
    canShare: false
  });

  useEffect(() => {
    checkDocumentPermissions();
  }, [document.id]);

  const checkDocumentPermissions = async () => {
    const [canRead, canWrite, canDelete, canShare] = await Promise.all([
      checkPermission(document.id, 'read'),
      checkPermission(document.id, 'write'),
      checkPermission(document.id, 'delete'),
      checkPermission(document.id, 'share')
    ]);

    setPermissions({ canRead, canWrite, canDelete, canShare });
  };

  const handleSave = () => {
    onUpdate(document.id, {
      title: editTitle,
      content: editContent
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(document.title);
    setEditContent(document.content || '');
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOwner = document.ownerId === currentUserId;

  return (
    <div className="document-card">
      <div className="document-header">
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="edit-title"
          />
        ) : (
          <h3>{document.title}</h3>
        )}
        
        <div className="document-actions">
          {permissions.canWrite && !isEditing && (
            <button 
              className="btn-icon"
              onClick={() => setIsEditing(true)}
              title="Edit document"
            >
              ✏️
            </button>
          )}
          {permissions.canShare && (
            <button 
              className="btn-icon"
              onClick={onShare}
              title="Share document"
            >
              🔗
            </button>
          )}
          {permissions.canDelete && (
            <button 
              className="btn-icon btn-danger"
              onClick={() => onDelete(document.id)}
              title="Delete document"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      <div className="document-meta">
        <span className="meta-item">
          {isOwner ? '👑 Owner' : '👤 Shared with you'}
        </span>
        <span className="meta-item">
          Created: {formatDate(document.createdAt)}
        </span>
        {document.updatedAt !== document.createdAt && (
          <span className="meta-item">
            Updated: {formatDate(document.updatedAt)}
          </span>
        )}
      </div>

      <div className="document-content">
        {isEditing ? (
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="edit-content"
            rows="10"
            placeholder="Enter document content..."
          />
        ) : (
          <div className="content-display">
            {document.content || <em>No content</em>}
          </div>
        )}
      </div>

      {isEditing && (
        <div className="edit-actions">
          <button className="btn-primary" onClick={handleSave}>
            Save Changes
          </button>
          <button className="btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      )}

      <div className="permissions-info">
        <h4>Your Permissions</h4>
        <div className="permission-badges">
          {permissions.canRead && <span className="badge badge-read">Read</span>}
          {permissions.canWrite && <span className="badge badge-write">Write</span>}
          {permissions.canShare && <span className="badge badge-share">Share</span>}
          {permissions.canDelete && <span className="badge badge-delete">Delete</span>}
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;