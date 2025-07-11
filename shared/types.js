// Shared types and constants between frontend and backend

// ReBAC Entity Types
const EntityTypes = {
  USER: 'user',
  DOCUMENT: 'document',
  FOLDER: 'folder' // For future use
};

// ReBAC Relations
const Relations = {
  OWNER: 'owner',
  EDITOR: 'editor',
  VIEWER: 'viewer',
  MEMBER: 'member' // For future folder permissions
};

// ReBAC Actions
const Actions = {
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
  SHARE: 'share',
  MANAGE: 'manage' // For future folder management
};

// Permission levels for UI
const PermissionLevels = {
  VIEWER: {
    key: Relations.VIEWER,
    label: 'Viewer',
    description: 'Can read the document',
    actions: [Actions.READ]
  },
  EDITOR: {
    key: Relations.EDITOR,
    label: 'Editor',
    description: 'Can read and edit the document',
    actions: [Actions.READ, Actions.WRITE]
  },
  OWNER: {
    key: Relations.OWNER,
    label: 'Owner',
    description: 'Has full control including sharing and deletion',
    actions: [Actions.READ, Actions.WRITE, Actions.DELETE, Actions.SHARE]
  }
};

// API Response formats
const APIResponse = {
  success: (data) => ({
    success: true,
    ...data
  }),
  error: (message, details = {}) => ({
    success: false,
    error: message,
    ...details
  })
};

module.exports = {
  EntityTypes,
  Relations,
  Actions,
  PermissionLevels,
  APIResponse
};