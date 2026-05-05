# Frontegg Demo Application

A comprehensive full-stack demo application showcasing Frontegg's authentication, authorization, and enterprise features including Multi-Tenancy, Admin Portal, API Playground, and Relationship-Based Access Control (ReBAC) with a document management system.

## 🚀 Quick Start

**New to the project? See our [5-minute Setup Guide](SETUP.md) for step-by-step instructions!**

```bash
# 1. Clone and install dependencies
git clone <repo-url>
cd leadDev_react_hosted
npm run install:all

# 2. Configure environment variables (see Setup Instructions below)

# 3. Start everything with one command
npm start
```

The `npm start` command will automatically:
- ✅ Check prerequisites (Node.js, Docker, environment files)
- ✅ Verify ports 3000 and 5000 are available before starting
- ✅ Start Docker containers (Entitlements Agent for ReBAC) 
- ✅ Wait for services to be healthy
- ✅ Launch the backend API server on http://localhost:5000
- ✅ Launch the React frontend on http://localhost:3000
- ✅ Handle graceful shutdown on exit

**Port Conflict Detection**: The startup script now detects if ports are already in use and provides helpful error messages with instructions on how to resolve conflicts.

## Features

### Core Authentication & User Management
- **Hosted Authentication**: Secure login/logout with Frontegg's hosted login - [Docs](https://docs.frontegg.com/docs/react-hosted-login-guide)
- **JWT Token Display**: View and decode authentication tokens - [JWT Verification](https://docs.frontegg.com/docs/using-public-key-to-verify-jwt)
- **User Profile**: Display user details, roles, and permissions - [Authentication Methods](https://developers.frontegg.com/sdks/components/auth-functions)
- **Multi-Factor Authentication**: Step-up authentication support - [Step-up Auth Guide](https://developers.frontegg.com/guides/step-up/intro)

### Multi-Tenancy
- **Tenant Hierarchy Switcher**: Visual tenant navigation with sub-accounts - [Sub-accounts & Hierarchy](https://developers.frontegg.com/api/tenants/sub-accounts-and-hierarchy)
- **Tenant Metadata**: View and manage tenant-specific settings - [Tenant Metadata API](https://developers.frontegg.com/api/tenants/accounts/tenantcontrollerv1_addtenantmetadata)
- **Tenant Isolation**: Proper data separation between tenants - [Architecture Guide](https://docs.frontegg.com/docs/vendor-tenant-users-in-frontegg)
- **Account Switching**: Seamless switching between tenant contexts - [Switch Active Tenant](https://docs.frontegg.com/docs/switch-active-tenant-from-your-application)

### Self-Service Portal
- **Full Admin Portal**: Click "Self Service Portal" button in sidebar to open Frontegg's admin portal - [Admin Portal Integration](https://docs.frontegg.com/docs/react-self-service)
- **User Management**: Manage team members, roles, and permissions - [Self-Service Portal Guide](https://developers.frontegg.com/guides/admin-portal/intro)
- **Security Settings**: Configure authentication methods and security policies - [Admin Portal Modules](https://docs.frontegg.com/docs/customizing-admin-portal-modules)

### API Development Tools
- **API Playground**: Test Frontegg APIs with live authentication - [API Introduction](https://developers.frontegg.com/api/overview)
- **Common Endpoints**: Pre-configured API examples by category - [API Reference](https://docs.frontegg.com/reference/getting-started-with-your-api)
- **Request Builder**: Custom headers and request body support - [Getting Started with APIs](https://docs.frontegg.com/reference/permissionscontrollerv1_getallpermissions)
- **cURL Export**: Copy requests as cURL commands
- **Response Viewer**: Formatted JSON responses with timing

### Document Management with ReBAC
- **Create & Manage Documents**: Full CRUD operations
- **Fine-grained Permissions**: Owner, Editor, and Viewer roles - [ReBAC Guide](https://developers.frontegg.com/guides/authorization/rebac)
- **Document Sharing**: Share with specific users and permissions - [Entitlements Overview](https://docs.frontegg.com/docs/entitlements)
- **Access Control**: Real-time permission validation - [RBAC & Entitlements](https://developers.frontegg.com/guides/authorization/entitlements-rbac-overview)
- **Relationship-Based Security**: Powered by Frontegg ReBAC - [Getting Started with Entitlements](https://developers.frontegg.com/guides/authorization/entitlements/intro)

### Backend SDK Demo (Pokemon Game)
- **API Protection Examples**: Learn how to protect your backend APIs - [Backend Protection Guide](https://docs.frontegg.com/docs/sdk-backend-protection)
- **Permission-Based Access**: Role-based permissions in action - [Permissions Guide](https://developers.frontegg.com/guides/authorization/rbac/permissions)
- **JWT Verification**: Comprehensive token validation - [JWT Verification Docs](https://docs.frontegg.com/docs/using-public-key-to-verify-jwt)
- **Interactive Demo**: Pokemon-themed game demonstrating security patterns - [Node.js SDK](https://docs.frontegg.com/docs/frontegg-nodejs-client)
- **Production-Ready Code**: Copy and adapt authentication middleware - [Protect Backend API](https://developers.frontegg.com/guides/integrations/protect-backend-api/overview)

## Architecture

```
leadDev_react_hosted/
├── frontend/              # React application
│   ├── src/
│   │   └── components/
│   │       └── DocumentManager/  # ReBAC demo components
│   └── package.json
├── backend/               # Node.js/Express API
│   ├── src/
│   │   ├── controllers/   # API route handlers
│   │   ├── middleware/    # Auth & ReBAC checks
│   │   ├── models/        # MongoDB schemas
│   │   └── services/      # Frontegg integration
│   ├── docker-compose.yml # Local services
│   └── package.json
└── package.json          # Root scripts
```

## Prerequisites

- Node.js 16+ and npm
- Docker and Docker Compose (for Entitlements Agent only)
- Frontegg account with ReBAC enabled

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install all dependencies
npm run install:all
```

### 2. Configure Environment Variables

Create `.env` files in both frontend and backend directories:

**backend/.env**
```env
# Copy from backend/.env.example
FRONTEGG_CLIENT_ID=your_client_id
FRONTEGG_API_KEY=your_api_key
FRONTEGG_BASE_URL=https://app-xxx.frontegg.com
PORT=5000
ENTITLEMENTS_AGENT_URL=http://localhost:8181
FRONTEND_URL=http://localhost:3000
```

**frontend/.env**
```env
# Copy existing .env and add:
REACT_APP_BACKEND_URL=http://localhost:5000
```

### 3. Configure ReBAC

ReBAC has its own setup (entity types, relations, actions) and a recommended
demo flow. See **[REBAC.md](REBAC.md)** for the dedicated guide, including
the automated `npm run rebac:setup` script and the demo walkthrough.

### 4. Start the Application

**Recommended - Single Command**:
```bash
npm start  # Starts Docker, backend, and frontend automatically
```

**Manual Start (for development)**:
```bash
# Terminal 1: Start Docker containers
npm run docker:up

# Terminal 2: Start backend and frontend
npm run dev

# Or start them separately:
npm run dev:frontend  # React app on http://localhost:3000
npm run dev:backend   # API server on http://localhost:5000
```

**Without Docker** (ReBAC features will be mocked):
```bash
npm run dev:no-docker
```

**Note**: SQLite database will be created automatically when the backend starts for the first time.

## Using the Application

### Navigation
The app features a modern sidebar navigation with the following sections:

1. **Dashboard** - Overview with interactive stats cards
2. **User & Auth** - JWT tokens, user details, and authentication info
3. **Tenants** - Tenant hierarchy management and metadata
4. **Documents (ReBAC)** - Document management with relationship-based permissions
5. **Backend SDK** - Pokemon game demo showcasing API protection patterns
6. **JWT Verifier** - Tool to validate and decode JWT tokens
7. **API Playground** - Test Frontegg APIs interactively

### Using the ReBAC Demo

See **[REBAC.md](REBAC.md)** for the full walkthrough and a ~3 minute demo
script you can present from.

### Using the Backend SDK Demo (Pokemon Game)

1. **Navigate to Backend SDK** in the sidebar
2. **Configure permissions** in Frontegg Portal - [Permissions Setup](https://developers.frontegg.com/guides/authorization/rbac/permissions):
   - Add permissions: `pokemon.catch`, `pokemon.view`, `pokemon.trade`
   - Assign permissions to roles - [Roles Configuration](https://developers.frontegg.com/guides/authorization/rbac/roles)
3. **Play the demo game**:
   - Catch Pokemon (requires catch permission)
   - View your collection
   - Trade with other users
4. **Learn from the code**:
   - Check `backend/src/middleware/auth.js` for JWT verification
   - Review `backend/src/middleware/permissions.js` for permission checks
   - See API documentation in `docs/POKEMON_API.md`

## ReBAC

The full ReBAC permission model, demo script, and API endpoints are
documented in **[REBAC.md](REBAC.md)**.

## API Endpoints

### Pokemon Backend SDK Demo Endpoints

- `GET /api/pokemon/catch` - Catch a random Pokemon (requires `pokemon.catch` permission)
- `GET /api/pokemon/my-collection` - View your Pokemon collection (requires `pokemon.view` permission)
- `POST /api/pokemon/trade/:userId` - Trade Pokemon with another user (requires `pokemon.trade` permission)
- `POST /api/auth/verify-token` - Verify and decode JWT tokens (no permission required)

## Future Enhancements

This demo is prepared for Frontegg's upcoming hierarchical permissions:
- Folder structure is modeled in the database
- UI components ready for folder navigation
- Permission inheritance logic can be enabled when available

## Troubleshooting

> ReBAC-specific issues (agent down, MISSING_RELATION, bundle propagation)
> are covered in **[REBAC.md → Troubleshooting](REBAC.md#troubleshooting)**.

### Database Issues
- SQLite database is stored as `backend/database.sqlite`
- Delete this file to reset the database
- Database is created automatically on first run

## Development Scripts

### Root Level Commands
```bash
npm start               # 🚀 Start everything (Docker + Backend + Frontend)
npm run dev             # Start frontend and backend (requires Docker running)
npm run dev:no-docker   # Start without Docker (mock ReBAC)
npm run install:all     # Install all dependencies
npm run docker:up       # Start Docker services only
npm run docker:down     # Stop Docker services
npm run docker:logs     # View Docker container logs
```

### Frontend Commands
```bash
cd frontend
npm start               # Start React dev server (port 3000)
npm run build          # Build for production
npm test               # Run tests
```

### Backend Commands
```bash
cd backend
npm run dev            # Start with nodemon (port 5000)
npm start              # Start production server
```

## Learn More

- [Frontegg ReBAC Documentation](https://developers.frontegg.com/guides/authorization/rebac)
- [Frontegg React SDK](https://developers.frontegg.com/sdks/frontend/react)
- [Entitlements Agent Setup](https://developers.frontegg.com/guides/authorization/entitlements/agent)

## Common Issues & Solutions

> ReBAC-specific errors (403, MISSING_RELATION, agent connection refused)
> are covered in **[REBAC.md → Troubleshooting](REBAC.md#troubleshooting)**.

### Authentication Issues
1. **Error**: "No token provided" or "Invalid token"
   - **Solution**: Log out and log back in to refresh token
   - **Check**: Verify `.env` files have correct Frontegg credentials

### Setup Issues
1. **Error**: "npm install" fails
   - **Solution**: Clear npm cache: `npm cache clean --force`
   - **Alternative**: Delete `node_modules` and `package-lock.json`, then reinstall

2. **Error**: Port already in use
   - **Automatic Detection**: The startup script now detects port conflicts and shows which process is using the port
   - **Solutions**:
     - Kill the process: `lsof -ti:5000 | xargs kill -9` (for port 5000)
     - Use a different port: `PORT=5001 npm start`
     - Frontend port: Change with `PORT=3001 npm start`
   - **Note**: The backend server also provides clear error messages if started separately

## License

This is a demo application for educational purposes.