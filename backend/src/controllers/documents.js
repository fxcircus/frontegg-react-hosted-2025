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

      // Assign owner relation in Frontegg using user's token
      try {
        // Extract user token from request
        const authHeader = req.headers.authorization;
        const userToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
        
        if (userToken) {
          await fronteggService.assignOwner(userId, document.id, userToken);
        } else {
          console.warn('No user token found in request - ReBAC assignment skipped');
        }
      } catch (rebacError) {
        console.error('ReBAC assignment failed:', rebacError.message);
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

  // ADMIN DEMO ENDPOINTS - Bypass entitlements for demo purposes

  // Get ALL documents in database (admin/demo only)
  async getAllDocuments(req, res) {
    try {
      console.log('[ADMIN] Fetching ALL documents from database (bypassing entitlements)');
      const allDocuments = await Document.findAll({
        order: [['created_at', 'DESC']]
      });
      
      res.json({
        success: true,
        documents: allDocuments,
        totalCount: allDocuments.length,
        warning: 'This endpoint bypasses entitlements and shows ALL documents'
      });
    } catch (error) {
      console.error('Error getting all documents:', error);
      res.status(500).json({
        error: 'Failed to get all documents'
      });
    }
  }

  // Delete ALL documents (admin/demo only)
  async deleteAllDocuments(req, res) {
    try {
      console.log('[ADMIN] Deleting ALL documents from database');
      const count = await Document.destroy({
        where: {},
        truncate: true
      });
      
      res.json({
        success: true,
        message: `Deleted ${count} documents`,
        warning: 'All documents have been permanently deleted'
      });
    } catch (error) {
      console.error('Error deleting all documents:', error);
      res.status(500).json({
        error: 'Failed to delete all documents'
      });
    }
  }

  // Seed demo documents (admin/demo only)
  async seedDemoDocuments(req, res) {
    try {
      console.log('[ADMIN] Seeding demo documents');
      
      // Clear existing documents first
      await Document.destroy({
        where: {},
        truncate: true
      });

      // Create demo documents with memorable IDs
      const demoDocuments = [
        {
          id: 'doc-001',
          title: 'Company Strategy 2024',
          content: 'This document outlines our strategic goals and initiatives for 2024...',
          ownerId: req.frontegg.user.sub,
          tags: ['strategy', 'confidential', '2024']
        },
        {
          id: 'doc-002',
          title: 'Q4 Financial Report',
          content: 'Financial performance metrics and analysis for Q4...',
          ownerId: req.frontegg.user.sub,
          tags: ['finance', 'quarterly', 'reports']
        },
        {
          id: 'doc-003',
          title: 'Engineering Roadmap',
          content: 'Technical roadmap and feature planning for the engineering team...',
          ownerId: req.frontegg.user.sub,
          tags: ['engineering', 'roadmap', 'planning']
        },
        {
          id: 'doc-004',
          title: 'Marketing Campaign Brief',
          content: 'Overview of the upcoming marketing campaign and target audience...',
          ownerId: req.frontegg.user.sub,
          tags: ['marketing', 'campaign', 'brief']
        },
        {
          id: 'doc-005',
          title: 'Product Requirements Document',
          content: 'Detailed requirements for the new product feature set...',
          ownerId: req.frontegg.user.sub,
          tags: ['product', 'requirements', 'specifications']
        }
      ];

      const createdDocuments = await Document.bulkCreate(demoDocuments);
      
      // Try to assign owner relations in ReBAC (but don't fail if it doesn't work)
      const authHeader = req.headers.authorization;
      const userToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
      
      if (userToken) {
        for (const doc of createdDocuments) {
          try {
            await fronteggService.assignOwner(req.frontegg.user.sub, doc.id, userToken);
            console.log(`[ADMIN] Assigned owner relation for document ${doc.id}`);
          } catch (error) {
            console.error(`[ADMIN] Failed to assign ReBAC relation for ${doc.id}:`, error.message);
          }
        }
      }

      res.json({
        success: true,
        documents: createdDocuments,
        message: `Created ${createdDocuments.length} demo documents`,
        note: 'Documents created with memorable IDs for easy demonstration'
      });
    } catch (error) {
      console.error('Error seeding demo documents:', error);
      res.status(500).json({
        error: 'Failed to seed demo documents'
      });
    }
  }
}

module.exports = DocumentController;