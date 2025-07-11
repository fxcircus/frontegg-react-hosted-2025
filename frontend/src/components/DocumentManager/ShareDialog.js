import React, { useState } from 'react';
import './DocumentManager.css';

const ShareDialog = ({ document, onShare, onClose }) => {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('viewer');
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    if (!email.trim()) {
      alert('Please enter an email address');
      return;
    }

    setIsSharing(true);
    try {
      await onShare(document.id, email, permission);
      onClose();
    } catch (error) {
      console.error('Share failed:', error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="share-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h3>Share "{document.title}"</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="dialog-content">
          <div className="form-group">
            <label>User Email or ID</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter user email or ID"
              className="share-input"
            />
          </div>

          <div className="form-group">
            <label>Permission Level</label>
            <div className="permission-options">
              <label className="radio-option">
                <input
                  type="radio"
                  value="viewer"
                  checked={permission === 'viewer'}
                  onChange={(e) => setPermission(e.target.value)}
                />
                <span className="option-label">
                  <strong>Viewer</strong>
                  <small>Can read the document</small>
                </span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  value="editor"
                  checked={permission === 'editor'}
                  onChange={(e) => setPermission(e.target.value)}
                />
                <span className="option-label">
                  <strong>Editor</strong>
                  <small>Can read and edit the document</small>
                </span>
              </label>
            </div>
          </div>

          <div className="permission-info">
            <h4>Permission Details</h4>
            <ul>
              <li><strong>Viewer:</strong> Can only read the document</li>
              <li><strong>Editor:</strong> Can read and modify the document content</li>
              <li><strong>Owner:</strong> Has full control including sharing and deletion (cannot be assigned)</li>
            </ul>
          </div>
        </div>

        <div className="dialog-actions">
          <button 
            className="btn-primary"
            onClick={handleShare}
            disabled={isSharing}
          >
            {isSharing ? 'Sharing...' : 'Share Document'}
          </button>
          <button 
            className="btn-secondary"
            onClick={onClose}
            disabled={isSharing}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareDialog;