require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./models/database');

// Import middleware and services
const { authenticate } = require('./middleware/auth');

// Check if we should use mock ReBAC (when Docker is not available)
const USE_MOCK_REBAC = process.env.USE_MOCK_REBAC === 'true' || process.env.DISABLE_REBAC === 'true';
const rebacModule = USE_MOCK_REBAC ? './middleware/rebac-mock' : './middleware/rebac';

const { 
  initializeReBACClient, 
  checkReader, 
  checkEditor, 
  checkOwner, 
  checkSharer 
} = require(rebacModule);
const fronteggService = require('./services/frontegg');

// Import controllers
const DocumentController = require('./controllers/documents');

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Frontegg initialization is handled in the middleware and services

// Initialize services
fronteggService.initialize();

// Initialize controller
const documentController = new DocumentController();

// Database connection
async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log('Connected to SQLite database');
    
    // Sync database models
    await sequelize.sync({ alter: true });
    console.log('Database models synchronized');
    
    return sequelize;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }
}

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: false,
      entitlementsAgent: false,
      fronteggApi: false
    },
    rebacHint: null
  };

  // Check database
  try {
    await sequelize.authenticate();
    health.services.database = true;
  } catch (error) {
    health.status = 'degraded';
  }

  // Check Entitlements Agent
  try {
    const axios = require('axios');
    await axios.get(`${process.env.ENTITLEMENTS_AGENT_URL}/health`);
    health.services.entitlementsAgent = true;
  } catch (error) {
    health.status = 'degraded';
    health.rebacHint = 'Entitlements Agent not running. Run: npm run docker:up';
  }

  // Check Frontegg API
  try {
    const axios = require('axios');
    await axios.get(`${process.env.FRONTEGG_BASE_URL}/.well-known/openid-configuration`);
    health.services.fronteggApi = true;
  } catch (error) {
    health.status = 'unhealthy';
  }

  res.json(health);
});

// Document routes
app.post('/api/documents', authenticate, (req, res) => 
  documentController.create(req, res)
);

app.get('/api/documents', authenticate, (req, res) => 
  documentController.list(req, res)
);

app.get('/api/documents/mine', authenticate, (req, res) => 
  documentController.getMyDocuments(req, res)
);

app.get('/api/documents/:id', authenticate, (req, res) => 
  documentController.getById(req, res)
);

app.put('/api/documents/:id', authenticate, checkEditor(), (req, res) => 
  documentController.update(req, res)
);

app.delete('/api/documents/:id', authenticate, checkOwner(), (req, res) => 
  documentController.delete(req, res)
);

app.post('/api/documents/:id/share', authenticate, checkSharer(), (req, res) => 
  documentController.share(req, res)
);

app.delete('/api/documents/:id/share/:userId', authenticate, checkSharer(), (req, res) => 
  documentController.revokeAccess(req, res)
);

// Permission check endpoint (for frontend use)
app.post('/api/permissions/check', authenticate, async (req, res) => {
  try {
    const { documentId, action } = req.body;
    const userId = req.frontegg.user.sub;
    
    const { canUserAccessDocument } = require('./middleware/rebac');
    const hasPermission = await canUserAccessDocument(userId, documentId, action);
    
    res.json({
      success: true,
      hasPermission,
      userId,
      documentId,
      action
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to check permission'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
async function startServer() {
  await connectDB();
  
  // Initialize ReBAC client
  await initializeReBACClient(process.env.ENTITLEMENTS_AGENT_URL);
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    console.log(`Entitlements Agent: ${process.env.ENTITLEMENTS_AGENT_URL || 'http://localhost:8181'}`);
  });
}

startServer().catch(console.error);