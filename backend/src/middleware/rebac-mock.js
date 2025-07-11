// Mock ReBAC middleware for development without Entitlements Agent
// WARNING: This is for demo purposes only when Docker is not available
// ReBAC features will not actually work - all permissions will be granted

const mockE10sClient = {
  isEntitledTo: async (subject, request) => {
    console.warn('⚠️  Using mock ReBAC client - all permissions granted');
    console.log('Mock permission check:', {
      subject,
      action: request.action,
      entityType: request.entityType,
      key: request.key
    });
    
    // Always return true for demo purposes
    return {
      result: true,
      justification: 'Mock mode - all permissions granted'
    };
  }
};

// Mock middleware that always grants permission
const checkPermission = (action) => {
  return async (req, res, next) => {
    console.warn(`⚠️  Mock ReBAC: Granting ${action} permission`);
    next();
  };
};

// Mock helper function
const canUserAccessDocument = async (userId, documentId, action) => {
  console.warn(`⚠️  Mock ReBAC: Granting ${action} access for user ${userId} on document ${documentId}`);
  return true;
};

module.exports = {
  initializeReBACClient: () => {
    console.warn('⚠️  ReBAC Mock Mode Active - Docker/Entitlements Agent not available');
    console.warn('⚠️  All permissions will be granted for demo purposes');
  },
  checkPermission,
  checkOwner: () => checkPermission('delete'),
  checkReader: () => checkPermission('read'),
  checkEditor: () => checkPermission('write'),
  checkSharer: () => checkPermission('share'),
  canUserAccessDocument,
  e10sClient: mockE10sClient
};