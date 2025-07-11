const Document = require('../models/document');
const fronteggService = require('../services/frontegg');

// Import ReBAC based on environment
const USE_MOCK_REBAC = process.env.USE_MOCK_REBAC === 'true' || process.env.DISABLE_REBAC === 'true';
const rebacModule = USE_MOCK_REBAC ? '../middleware/rebac-mock' : '../middleware/rebac';
const { canUserAccessDocument } = require(rebacModule);

class DocumentController {
  constructor() {
    // No need for db parameter with Sequelize
  }

  // Create a new document
  async create(req, res) {
    try {
      const { title, content, folderId, tags } = req.body;
      const userId = req.frontegg.user.sub;

      // Create document in database
      const document = await Document.create({
        title,
        content,
        ownerId: userId,
        folderId: folderId || null,
        tags: tags || []
      });

      // Assign owner relation in Frontegg
      try {
        await fronteggService.assignOwner(userId, document.id);
      } catch (rebacError) {
        console.warn('ReBAC assignment failed:', rebacError.message);
        console.warn('To enable ReBAC: Frontegg Portal → [Environment] → Entitlements → ReBAC → Configure');
        // Continue anyway - document is created, just without ReBAC relation
      }

      res.status(201).json({
        success: true,
        document
      });
    } catch (error) {
      console.error('Error creating document:', error);
      console.error('Error details:', error.response?.data || error.message);
      res.status(500).json({
        error: 'Failed to create document',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        hint: error.message?.includes('403') ? 'Check ReBAC configuration in Frontegg Portal → Entitlements → ReBAC' : undefined
      });
    }
  }

  // Get a single document
  async getById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.frontegg.user.sub;

      // Check if user has read permission
      const canRead = await canUserAccessDocument(userId, id, 'read');
      if (!canRead) {
        return res.status(403).json({
          error: 'Access denied',
          hint: 'If you are the document owner, ensure ReBAC is configured in Frontegg Portal → Entitlements → ReBAC'
        });
      }

      const document = await Document.findByPk(id);
      if (!document) {
        return res.status(404).json({
          error: 'Document not found'
        });
      }

      res.json({
        success: true,
        document
      });
    } catch (error) {
      console.error('Error getting document:', error);
      res.status(500).json({
        error: 'Failed to get document'
      });
    }
  }

  // List all documents user has access to
  async list(req, res) {
    try {
      const userId = req.frontegg.user.sub;
      
      // Get all documents and filter by access
      // In a production app, this would be optimized with proper queries
      const allDocuments = await Document.findAll();
      
      const accessibleDocuments = [];
      for (const doc of allDocuments) {
        const canRead = await canUserAccessDocument(userId, doc.id, 'read');
        if (canRead) {
          accessibleDocuments.push(doc);
        }
      }

      res.json({
        success: true,
        documents: accessibleDocuments
      });
    } catch (error) {
      console.error('Error listing documents:', error);
      res.status(500).json({
        error: 'Failed to list documents'
      });
    }
  }

  // Update a document (requires write permission)
  async update(req, res) {
    try {
      const { id } = req.params;
      const { title, content, tags } = req.body;
      const userId = req.frontegg.user.sub;

      // Permission check is handled by middleware
      const updates = {};
      if (title !== undefined) updates.title = title;
      if (content !== undefined) updates.content = content;
      if (tags !== undefined) updates.tags = tags;

      const [updateCount] = await Document.update(updates, {
        where: { id }
      });
      
      if (updateCount === 0) {
        return res.status(404).json({
          error: 'Document not found'
        });
      }

      const updatedDocument = await Document.findByPk(id);
      res.json({
        success: true,
        document: updatedDocument
      });
    } catch (error) {
      console.error('Error updating document:', error);
      res.status(500).json({
        error: 'Failed to update document'
      });
    }
  }

  // Delete a document (requires owner permission)
  async delete(req, res) {
    try {
      const { id } = req.params;
      
      // Permission check is handled by middleware
      const deleteCount = await Document.destroy({
        where: { id }
      });
      
      if (deleteCount === 0) {
        return res.status(404).json({
          error: 'Document not found'
        });
      }

      // Note: In production, you'd also want to clean up all ReBAC relations
      // This would require tracking all users who have access

      res.json({
        success: true,
        message: 'Document deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      res.status(500).json({
        error: 'Failed to delete document'
      });
    }
  }

  // Share a document with another user
  async share(req, res) {
    try {
      const { id } = req.params;
      const { targetUserId, permission } = req.body;
      const userId = req.frontegg.user.sub;

      // Validate permission type
      if (!['viewer', 'editor'].includes(permission)) {
        return res.status(400).json({
          error: 'Invalid permission. Must be "viewer" or "editor"'
        });
      }

      // Check if user can share (handled by middleware)
      
      // Share the document
      await fronteggService.shareDocument(id, targetUserId, permission);

      res.json({
        success: true,
        message: `Document shared with ${targetUserId} as ${permission}`
      });
    } catch (error) {
      console.error('Error sharing document:', error);
      res.status(500).json({
        error: 'Failed to share document',
        hint: 'Ensure ReBAC is configured with document entity and share permissions in Frontegg Portal'
      });
    }
  }

  // Revoke access to a document
  async revokeAccess(req, res) {
    try {
      const { id, userId: targetUserId } = req.params;
      
      // Permission check is handled by middleware
      
      // Revoke all permissions for the user
      const results = await fronteggService.revokeAllAccess(id, targetUserId);
      
      res.json({
        success: true,
        message: `Access revoked for user ${targetUserId}`,
        details: results
      });
    } catch (error) {
      console.error('Error revoking access:', error);
      res.status(500).json({
        error: 'Failed to revoke access'
      });
    }
  }

  // Get my documents (owned by the user)
  async getMyDocuments(req, res) {
    try {
      const userId = req.frontegg.user.sub;
      const documents = await Document.findByOwner(userId);
      
      res.json({
        success: true,
        documents
      });
    } catch (error) {
      console.error('Error getting my documents:', error);
      res.status(500).json({
        error: 'Failed to get documents'
      });
    }
  }
}

module.exports = DocumentController;