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
  // If ReBAC is not available, fall back to ownership-only access for ALL
  // actions (including read). Granting read to everyone hid the case where
  // the agent was up but no associations existed — the demo looked like it
  // worked when ReBAC was actually doing nothing.
  if (!isRebacAvailable || !e10sClient) {
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

  try {
    console.log(`[ReBAC] Checking permission: User ${userId} -> Document ${documentId} -> Action: ${action}`);
    
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

    // Distinguish three cases from the e10s client:
    //   - explicit true/false  -> trust the agent
    //   - object with result/entitled set -> trust the agent
    //   - empty / undefined response -> agent has NO data for this entity
    //     (e.g. bundle hasn't been regenerated since the schema was created)
    //     -> fall back to local ownership instead of silently denying
    let isEntitled = null; // null = "no decision"
    let justification = null;

    if (result === true || result === false) {
      isEntitled = result;
    } else if (result && typeof result === 'object') {
      if ('justification' in result) justification = result.justification;
      if ('result' in result && typeof result.result === 'boolean') {
        isEntitled = result.result;
      } else if ('entitled' in result && typeof result.entitled === 'boolean') {
        isEntitled = result.entitled;
      }
    }

    // MISSING_RELATION = the agent's bundle doesn't have the relation assignments
    // for this entity yet (typical during first-time relation propagation).
    // Treat it like "no decision" and fall back to ownership.
    if (isEntitled === false && justification === 'MISSING_RELATION') {
      console.warn(`[ReBAC] Agent says MISSING_RELATION for doc=${documentId} (relations not in bundle yet) — falling back to ownership`);
      isEntitled = null;
    }

    if (isEntitled === null) {
      console.warn('[ReBAC] No decision from agent — falling back to ownership');
      const Document = require('../models/document');
      try {
        const doc = await Document.findByPk(documentId);
        if (!doc) {
          console.log(`[ReBAC] Fallback DENIED (doc ${documentId} not in local DB)`);
          return false;
        }
        const owns = doc.ownerId === userId;
        console.log(`[ReBAC] Fallback ${owns ? 'GRANTED' : 'DENIED'} (ownership: ${owns ? 'match' : `mismatch — doc.ownerId=${doc.ownerId}`})`);
        return owns;
      } catch (fallbackError) {
        console.error('[ReBAC] Fallback check also failed:', fallbackError.message);
        return false;
      }
    }

    console.log(`[ReBAC] Permission result: ${isEntitled ? 'GRANTED' : 'DENIED'}`);
    return isEntitled;
  } catch (error) {
    // Compact one-line error — full axios objects are useless noise in logs.
    const reason = error.code === 'ECONNREFUSED'
      ? 'agent not reachable'
      : (error.message || String(error)).split('\n')[0].slice(0, 200);
    console.warn(`[ReBAC] Check threw (${reason}) — falling back to ownership`);

    const Document = require('../models/document');
    try {
      const doc = await Document.findByPk(documentId);
      if (!doc) {
        console.log(`[ReBAC] Fallback DENIED (doc ${documentId} not in local DB)`);
        return false;
      }
      const owns = doc.ownerId === userId;
      console.log(`[ReBAC] Fallback ${owns ? 'GRANTED' : 'DENIED'} (ownership: ${doc.ownerId === userId ? 'match' : `mismatch — doc.ownerId=${doc.ownerId}`})`);
      return owns;
    } catch (fallbackError) {
      console.error('[ReBAC] Fallback check also failed:', fallbackError.message);
      return false;
    }
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