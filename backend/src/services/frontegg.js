const axios = require('axios');

class FronteggService {
  constructor() {
    this.apiClient = null;
  }

  initialize() {
    // Create axios instance for Frontegg API
    this.apiClient = axios.create({
      baseURL: process.env.FRONTEGG_BASE_URL,
      headers: {
        'frontegg-client-id': process.env.FRONTEGG_CLIENT_ID,
        'frontegg-api-key': process.env.FRONTEGG_API_KEY
      }
    });
  }

  async assignRelation(subjectUserId, documentId, relation) {
    try {
      const response = await this.apiClient.post('/resources/relations/v1/assign', {
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
      console.error('Error assigning relation:', error);
      if (error.response?.status === 403 || error.response?.status === 404) {
        const enhancedError = new Error(`ReBAC Error: ${error.message}. Configure ReBAC in Frontegg Portal → [Environment] → Entitlements → ReBAC`);
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

  async assignOwner(ownerId, documentId) {
    return this.assignRelation(ownerId, documentId, 'owner');
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