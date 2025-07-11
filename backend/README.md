# Frontegg Demo Application - Backend

This is the Node.js/Express backend for the Frontegg Demo Application, providing secure API endpoints demonstrating JWT authentication, permission-based authorization, and ReBAC (Relationship-Based Access Control).

📚 **Frontegg Backend Documentation**: [Node.js SDK Guide](https://docs.frontegg.com/docs/frontegg-nodejs-client) | [Backend Protection](https://docs.frontegg.com/docs/sdk-backend-protection)

## Overview

The backend showcases production-ready patterns for:
- JWT token verification with Frontegg - [JWT Verification Guide](https://docs.frontegg.com/docs/using-public-key-to-verify-jwt)
- Permission-based API protection - [Permissions Guide](https://developers.frontegg.com/guides/authorization/rbac/permissions)
- ReBAC integration for fine-grained access control - [ReBAC Documentation](https://developers.frontegg.com/guides/authorization/rebac)
- Multi-tenant data isolation - [Multi-Tenancy Architecture](https://docs.frontegg.com/docs/vendor-tenant-users-in-frontegg)
- Secure user-to-user interactions

## Prerequisites

- Node.js 16+ and npm
- Docker and Docker Compose (for ReBAC features)
- Frontegg account with API credentials - [Getting Started](https://docs.frontegg.com/reference/getting-started-with-your-api)

## Environment Configuration

Create a `.env` file in the backend directory:

```env
# Frontegg Configuration
FRONTEGG_CLIENT_ID=your_client_id
FRONTEGG_API_KEY=your_api_key
FRONTEGG_BASE_URL=https://app-xxx.frontegg.com

# Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:3000

# ReBAC Configuration
ENTITLEMENTS_AGENT_URL=http://localhost:8181
```

📚 Learn more: [Entitlements Agent Setup](https://developers.frontegg.com/guides/authorization/entitlements/agent)

## Running the Backend

### With Docker (Full ReBAC Support)
```bash
# From root directory
npm start

# Or from backend directory
docker-compose up -d  # Start Entitlements Agent
npm run dev          # Start server with nodemon
```

### Without Docker (Mock ReBAC)
```bash
npm run dev:no-rebac
```

## Architecture

```
backend/
├── src/
│   ├── controllers/     # Route handlers
│   │   ├── documents.js # ReBAC document management
│   │   └── pokemon.js   # Backend SDK demo
│   ├── middleware/      # Express middleware
│   │   ├── auth.js      # JWT verification
│   │   ├── permissions.js # Permission checks
│   │   ├── rebac.js     # ReBAC integration
│   │   └── rebac-mock.js # Fallback for no Docker
│   ├── models/          # Database schemas
│   │   ├── database.js  # SQLite setup
│   │   ├── document.js  # Document model
│   │   └── pokemon.js   # Pokemon model
│   ├── services/        # External integrations
│   │   └── frontegg.js  # Frontegg SDK client
│   └── server.js        # Express app setup
├── docker-compose.yml   # Entitlements Agent
└── database.sqlite      # Local database
```

## API Endpoints

### Authentication
- `POST /api/auth/verify-token` - Verify and decode JWT tokens

### Pokemon (Backend SDK Demo)
- `GET /api/pokemon/catch` - Catch a Pokemon (requires `pokemon.catch`)
- `GET /api/pokemon/my-collection` - View collection (requires `pokemon.view`)
- `POST /api/pokemon/trade/:userId` - Trade Pokemon (requires `pokemon.trade`)

📚 See full documentation: [Pokemon API Guide](../docs/POKEMON_API.md)

### Documents (ReBAC Demo)
- `POST /api/documents` - Create document
- `GET /api/documents` - List accessible documents
- `GET /api/documents/:id` - Get document (requires read permission)
- `PUT /api/documents/:id` - Update document (requires write permission)
- `DELETE /api/documents/:id` - Delete document (requires owner)
- `POST /api/documents/:id/share` - Share document (requires owner)
- `DELETE /api/documents/:id/share/:userId` - Revoke access

### Permissions
- `POST /api/permissions/check` - Check specific permission

## Security Implementation

### JWT Verification (`middleware/auth.js`)

Every protected endpoint uses JWT verification:

```javascript
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Fetch public keys from Frontegg
const client = jwksClient({
  jwksUri: `${FRONTEGG_BASE_URL}/.well-known/jwks.json`
});

// Verify token signature and claims
jwt.verify(token, getKey, {
  algorithms: ['RS256'],
  audience: FRONTEGG_CLIENT_ID,
  issuer: FRONTEGG_BASE_URL
});
```

### Permission Checking (`middleware/permissions.js`)

Middleware validates user permissions:

```javascript
function checkPermission(required) {
  return (req, res, next) => {
    const userPermissions = req.user.permissions || [];
    if (!userPermissions.includes(required)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: required 
      });
    }
    next();
  };
}
```

### ReBAC Integration (`middleware/rebac.js`)

Fine-grained access control for documents:

```javascript
// Check if user can perform action on resource
const canAccess = await e10sClient.isEntitledTo(
  { entityType: 'user', key: userId },
  { 
    type: RequestContextType.Entity,
    entityType: 'document',
    key: documentId,
    action: 'read'
  }
);
```

## Database

The backend uses SQLite for simplicity:
- Auto-creates `database.sqlite` on first run
- Stores users, documents, and Pokemon data
- Includes document sharing relationships

To reset the database:
```bash
rm database.sqlite
npm run dev  # Database recreates automatically
```

## Docker Services

The `docker-compose.yml` starts:
- **Frontegg Entitlements Agent**: Local ReBAC policy engine
  - Port: 8181
  - Health checks included
  - Auto-restarts on failure

## Error Handling

Consistent error responses:

```json
// 401 Unauthorized
{
  "error": "No token provided"
}

// 403 Forbidden
{
  "error": "Insufficient permissions",
  "message": "This action requires the 'document.write' permission",
  "required": "document.write"
}

// 404 Not Found
{
  "error": "Document not found"
}
```

## Development Scripts

```bash
npm run dev           # Start with nodemon (auto-reload)
npm run dev:no-rebac  # Start without Docker/ReBAC
npm start            # Production mode
```

## Testing the APIs

### Using the Frontend
Navigate to the respective sections in the UI to test features interactively.

### Using cURL

1. Get your JWT token from browser DevTools:
   - Open Application → Local Storage → frontegg → user → accessToken

2. Test endpoints:
```bash
# Verify token
curl -X POST http://localhost:5000/api/auth/verify-token \
  -H "Content-Type: application/json" \
  -d '{"token": "YOUR_JWT_TOKEN"}'

# Catch Pokemon
curl -X GET http://localhost:5000/api/pokemon/catch \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create document
curl -X POST http://localhost:5000/api/documents \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "My Document", "content": "Hello World"}'
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000
# Kill the process or change PORT in .env
```

### Docker Issues
```bash
# Check if Entitlements Agent is running
docker ps

# View logs
docker-compose logs -f

# Restart services
docker-compose down
docker-compose up -d
```

### Permission Denied Errors
1. Check user permissions in Frontegg Portal
2. Verify ReBAC configuration for documents
3. Ensure Docker services are running

## Learn More

### Frontegg Documentation
- [Node.js SDK Reference](https://docs.frontegg.com/docs/frontegg-nodejs-client)
- [Backend Protection Guide](https://docs.frontegg.com/docs/sdk-backend-protection)
- [JWT Verification](https://docs.frontegg.com/docs/using-public-key-to-verify-jwt)
- [Permissions & Roles](https://developers.frontegg.com/guides/authorization/rbac/permissions)
- [ReBAC Guide](https://developers.frontegg.com/guides/authorization/rebac)
- [API Protection](https://developers.frontegg.com/guides/integrations/protect-backend-api/overview)

### Project Documentation
- [Pokemon API Documentation](../docs/POKEMON_API.md)
- [Main README](../README.md)
- [Setup Guide](../SETUP.md)