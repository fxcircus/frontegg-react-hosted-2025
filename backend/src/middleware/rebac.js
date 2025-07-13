const { EntitlementsClientFactory, RequestContextType } = require('@frontegg/e10s-client');
const axios = require('axios');

// Initialize entitlements client
let e10sClient;
let isRebacAvailable = false;

// Check if Entitlements Agent is available
async function checkEntitlementsAgent(url) {
  try {
    const response = await axios.get(`http://${url}/health`, { timeout: 2000 });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

async function initializeReBACClient(pdpHost) {
  const host = pdpHost || process.env.ENTITLEMENTS_AGENT_URL || 'localhost:8181';
  
  // Check if agent is available
  isRebacAvailable = await checkEntitlementsAgent(host.replace('http://', '').replace('https://', ''));
  
  if (!isRebacAvailable) {
    console.warn('⚠️  Entitlements Agent not available at', host);
    console.warn('⚠️  Running in degraded mode - using simplified permissions');
    console.warn('⚠️  To enable full ReBAC: 1) Start Docker, 2) Run: npm run docker:up');
    return;
  }
  
  try {
    // Wait a bit for the agent to be fully ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    e10sClient = EntitlementsClientFactory.create({
      pdpHost: host
    });
    
    // Don't test the client during initialization to avoid monitoring errors
    console.log('✅ ReBAC client initialized at', host);
    isRebacAvailable = true;
  } catch (error) {
    console.error('Failed to initialize ReBAC client:', error.message || error);
    isRebacAvailable = false;
    e10sClient = null;
  }
}

// Middleware to check ReBAC permissions
const checkPermission = (action) => {
  return async (req, res, next) => {
    try {
      if (!e10sClient) {
        return res.status(500).json({ 
          error: 'ReBAC client not initialized' 
        });
      }

      const userId = req.frontegg?.user?.sub;
      if (!userId) {
        return res.status(401).json({ 
          error: 'User not authenticated' 
        });
      }

      // Get document ID from params or body
      const documentId = req.params.id || req.body.documentId;
      if (!documentId) {
        return res.status(400).json({ 
          error: 'Document ID required' 
        });
      }

      // Check permission
      const hasPermission = await canUserAccessDocument(userId, documentId, action);

      if (!hasPermission) {
        const hint = isRebacAvailable 
          ? 'Ensure ReBAC is configured in Frontegg Portal → Entitlements → ReBAC'
          : 'ReBAC is running in fallback mode. Start Entitlements Agent for full functionality';
        
        return res.status(403).json({ 
          error: 'Access denied',
          reason: 'Insufficient permissions',
          hint,
          mode: isRebacAvailable ? 'rebac' : 'fallback'
        });
      }

      // Permission granted, continue
      next();
    } catch (error) {
      console.error('ReBAC permission check error:', error);
      res.status(500).json({ 
        error: 'Permission check failed' 
      });
    }
  };
};

// Helper function to check if user can perform action on document
const canUserAccessDocument = async (userId, documentId, action) => {
  // If ReBAC is not available, use fallback logic
  if (!isRebacAvailable || !e10sClient) {
    // In fallback mode, check ownership for write/delete/share actions
    if (action === 'write' || action === 'delete' || action === 'share') {
      const Document = require('../models/document');
      try {
        const doc = await Document.findByPk(documentId);
        if (!doc) return false;
        return doc.ownerId === userId;
      } catch (error) {
        console.error('Fallback permission check error:', error);
        return false;
      }
    }
    // For read action, allow all authenticated users in fallback mode
    return action === 'read';
  }

  try {
    const result = await e10sClient.isEntitledTo(
      { 
        entityType: 'user', 
        key: userId 
      },
      { 
        type: RequestContextType.Entity,
        entityType: 'document',
        key: documentId,
        action: action
      }
    );

    // Handle various response formats from the entitlements client
    if (result === true || result === false) {
      return result;
    }
    
    if (result && typeof result === 'object') {
      // Check for result property
      if ('result' in result) {
        return result.result || false;
      }
      // Check for entitled property
      if ('entitled' in result) {
        return result.entitled || false;
      }
    }

    // If we can't determine the result, log it and return false
    console.warn('Unexpected response format from Entitlements Client:', result);
    return false;
  } catch (error) {
    // Handle the specific monitoring error
    if (error.message && error.message.includes('Cannot read properties of undefined')) {
      console.error('Entitlements Client error - likely version mismatch or agent not ready:', error.message);
    } else {
      console.error('ReBAC check failed:', error.message || error);
    }
    
    // Fall back to ownership check on error
    if (action === 'write' || action === 'delete' || action === 'share') {
      const Document = require('../models/document');
      try {
        const doc = await Document.findByPk(documentId);
        if (!doc) return false;
        return doc.ownerId === userId;
      } catch (fallbackError) {
        console.error('Fallback check also failed:', fallbackError);
        return false;
      }
    }
    // For read action in fallback mode, allow access
    return action === 'read';
  }
};

// Middleware to check if user is owner
const checkOwner = () => {
  return checkPermission('delete'); // Only owners can delete
};

// Middleware to check if user can read
const checkReader = () => {
  return checkPermission('read');
};

// Middleware to check if user can write
const checkEditor = () => {
  return checkPermission('write');
};

// Middleware to check if user can share
const checkSharer = () => {
  return checkPermission('share');
};

module.exports = {
  initializeReBACClient,
  checkPermission,
  checkOwner,
  checkReader,
  checkEditor,
  checkSharer,
  canUserAccessDocument
};