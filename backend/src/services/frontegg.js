const axios = require('axios');

class FronteggService {
  constructor() {
    this.apiClient = null;
  }

  initialize() {
    // Create axios instance for Frontegg API
    // Note: ReBAC operations require user tokens, not API credentials
    this.apiClient = axios.create({
      baseURL: process.env.FRONTEGG_BASE_URL
    });
  }

  async assignRelation(subjectUserId, documentId, relation, userToken) {
    if (!userToken) {
      throw new Error('User token is required for ReBAC operations. ReBAC requires user authentication.');
    }

    const endpoint = '/resources/relations/v1/assign';
    const fullUrl = `${this.apiClient.defaults.baseURL}${endpoint}`;
    
    console.log('🔄 Attempting ReBAC assignment:', {
      url: fullUrl,
      userId: subjectUserId,
      documentId: documentId,
      relation: relation,
      tokenPreview: userToken.substring(0, 20) + '...'
    });

    try {
      const response = await this.apiClient.post(endpoint, {
        assignments: [{
          subjectEntityTypeKey: 'user',
          subjectKey: subjectUserId,
          relationKey: relation,
          targetEntityTypeKey: 'document',
          targetKey: documentId
        }]
      }, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      
      console.log('✅ ReBAC assignment successful:', {
        user: subjectUserId,
        document: documentId,
        relation: relation
      });
      
      return response;
    } catch (error) {
      // Extract trace ID from HTML if present
      let extractedTraceId = null;
      if (typeof error.response?.data === 'string' && error.response.data.includes('frontegg-trace-id:')) {
        const match = error.response.data.match(/Trace ID:\s*([a-f0-9]+)/i);
        if (match) {
          extractedTraceId = match[1];
        }
      }
      
      // Log all response headers
      console.error('❌ ReBAC assignment failed:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        traceId: extractedTraceId,
        allResponseHeaders: error.response?.headers || {}
      });
      
      if (extractedTraceId) {
        console.log(`📍 Frontegg Trace ID: ${extractedTraceId}`);
      }
      
      if (error.response?.status === 403) {
        const errorMessage = extractedTraceId 
          ? `ReBAC Assignment Failed (403): The user token doesn't have permission to create associations. Trace ID: ${extractedTraceId}`
          : `ReBAC Assignment Failed (403): The user token doesn't have permission to create associations.`;
        
        const enhancedError = new Error(errorMessage);
        enhancedError.originalError = error;
        enhancedError.traceId = extractedTraceId;
        enhancedError.responseHeaders = error.response?.headers;
        throw enhancedError;
      }
      if (error.response?.status === 404) {
        const enhancedError = new Error(`ReBAC Not Found (404): Ensure ReBAC is enabled and configured in Frontegg Portal → [Environment] → Entitlements → ReBAC`);
        enhancedError.originalError = error;
        throw enhancedError;
      }
      if (error.response?.status === 401) {
        const enhancedError = new Error(`Authentication Failed (401): The user token is invalid or expired.`);
        enhancedError.originalError = error;
        throw enhancedError;
      }
      throw error;
    }
  }

  async unassignRelation(subjectUserId, documentId, relation) {
    try {
      const response = await this.apiClient.post('/resources/relations/v1/unassign', {
        assignments: [{
          subjectEntityTypeKey: 'user',
          subjectKey: subjectUserId,
          relationKey: relation,
          targetEntityTypeKey: 'document',
          targetKey: documentId
        }]
      });
      return response;
    } catch (error) {
      console.error('Error unassigning relation:', error);
      if (error.response?.status === 403 || error.response?.status === 404) {
        const enhancedError = new Error(`ReBAC Error: ${error.message}. Configure ReBAC in Frontegg Portal → [Environment] → Entitlements → ReBAC`);
        enhancedError.originalError = error;
        throw enhancedError;
      }
      throw error;
    }
  }

  async assignOwner(ownerId, documentId, userToken) {
    return this.assignRelation(ownerId, documentId, 'owner', userToken);
  }

  async shareDocument(documentId, targetUserId, permission) {
    // permission should be 'viewer' or 'editor'
    if (!['viewer', 'editor'].includes(permission)) {
      throw new Error('Invalid permission. Must be "viewer" or "editor"');
    }
    return this.assignRelation(targetUserId, documentId, permission);
  }

  async revokeAccess(documentId, targetUserId, permission) {
    return this.unassignRelation(targetUserId, documentId, permission);
  }

  // Helper to revoke all permissions for a user on a document
  async revokeAllAccess(documentId, targetUserId) {
    const results = [];
    for (const relation of ['viewer', 'editor']) {
      try {
        const result = await this.unassignRelation(targetUserId, documentId, relation);
        results.push({ relation, success: true, result });
      } catch (error) {
        results.push({ relation, success: false, error: error.message });
      }
    }
    return results;
  }

  // Batch operations for performance
  async assignMultipleRelations(assignments) {
    try {
      const formattedAssignments = assignments.map(a => ({
        subjectEntityTypeKey: 'user',
        subjectKey: a.userId,
        relationKey: a.relation,
        targetEntityTypeKey: 'document',
        targetKey: a.documentId
      }));

      const response = await this.apiClient.post('/resources/relations/v1/assign', {
        assignments: formattedAssignments
      });
      return response;
    } catch (error) {
      console.error('Error assigning multiple relations:', error);
      throw error;
    }
  }
}

module.exports = new FronteggService();