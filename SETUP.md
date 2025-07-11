# Quick Setup Guide

This guide will help you get the Frontegg Demo Application running in minutes.

## Prerequisites

- **Node.js 16+** - [Download here](https://nodejs.org/)
- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
- **Frontegg Account** - [Sign up here](https://portal.frontegg.com/signup)

## 🚀 Quick Start (5 minutes)

### 1. Clone and Install

```bash
git clone <repository-url>
cd leadDev_react_hosted
npm run install:all
```

### 2. Configure Frontegg Credentials

#### Get your credentials:
1. Log into [Frontegg Portal](https://portal.frontegg.com)
2. Go to **[Environment]** → **Settings** → **API Keys**
3. Copy your Client ID and API Key

📚 Learn more: [Getting Started with Frontegg APIs](https://docs.frontegg.com/reference/getting-started-with-your-api)

#### Create environment files:

**backend/.env**
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials
```

**frontend/.env**
```bash
# Copy your existing .env file or create new:
REACT_APP_CLIENT_ID=your-workspace-client-id
REACT_APP_BASE_URL=https://app-xxx.frontegg.com
REACT_APP_APP_ID=your-app-id
```

### 3. Configure Permissions & ReBAC

#### Backend SDK Demo Permissions
1. In Frontegg Portal, go to **[Environment]** → **Authorization** → **Permissions** - [Permissions Guide](https://developers.frontegg.com/guides/authorization/rbac/permissions)
2. Add these permissions:
   - `pokemon.catch` - Catch Pokemon
   - `pokemon.view` - View Pokemon collection
   - `pokemon.trade` - Trade Pokemon
3. Assign permissions to roles in **Authorization** → **Roles** - [Roles Guide](https://developers.frontegg.com/guides/authorization/rbac/roles)

#### ReBAC Configuration (Required for Document Management)
📚 Learn more: [ReBAC Documentation](https://developers.frontegg.com/guides/authorization/rebac)

1. In Frontegg Portal, go to **[Environment]** → **Entitlements** → **ReBAC**
2. Click **"Configure ReBAC"**
3. Add Entity:
   - **Entity Key**: `document`
   - **Entity Name**: `Document`
4. Add Relations:
   - `owner` - Owner
   - `editor` - Editor  
   - `viewer` - Viewer
5. Add Actions:
   - `read` → Allow: viewer, editor, owner
   - `write` → Allow: editor, owner
   - `delete` → Allow: owner
   - `share` → Allow: owner
6. Click **Save**

For Entitlements Agent setup: [Agent Documentation](https://developers.frontegg.com/guides/authorization/entitlements/agent)

### 4. Start Everything

```bash
npm start
```

This single command will:
- ✅ Check prerequisites
- ✅ Start Docker containers
- ✅ Launch the backend API
- ✅ Launch the React frontend
- ✅ Open your browser

## 🎯 What You'll See

1. **Login Page** - Frontegg hosted authentication - [Hosted Login Guide](https://docs.frontegg.com/docs/react-hosted-login-guide)
2. **Dashboard** - Overview with stats cards
3. **User & Auth** - JWT tokens and user info - [Authentication Basics](https://developers.frontegg.com/guides/authentication/overview)
4. **Tenants** - Multi-tenant management - [Multi-Tenancy Architecture](https://docs.frontegg.com/docs/vendor-tenant-users-in-frontegg)
5. **Documents (ReBAC)** - Document management demo - [ReBAC Guide](https://developers.frontegg.com/guides/authorization/rebac)
6. **Backend SDK** - Pokemon game demonstrating API protection - [Backend Protection](https://docs.frontegg.com/docs/sdk-backend-protection)
7. **JWT Verifier** - Token validation tool - [JWT Verification](https://docs.frontegg.com/docs/using-public-key-to-verify-jwt)
8. **Embedded Components** - Admin portal features - [Admin Portal Guide](https://docs.frontegg.com/docs/react-self-service)
9. **API Playground** - Test Frontegg APIs - [API Reference](https://docs.frontegg.com/reference/getting-started-with-your-api)

## 🔧 Troubleshooting

### Docker Issues

```bash
# Check if Docker is running
docker info

# View container logs
npm run docker:logs

# Restart containers
npm run docker:down
npm run docker:up
```

### ReBAC Not Working

1. Check configuration in Frontegg Portal
2. Verify Entitlements Agent is running:
   ```bash
   docker ps | grep frontegg-entitlements-agent
   ```
3. Check health endpoint:
   ```bash
   curl http://localhost:5000/api/health
   ```

### Port Conflicts

If ports 3000 or 5000 are in use:
- Frontend: `PORT=3001 npm run dev:frontend`
- Backend: Edit `PORT` in `backend/.env`

### Clean Start

```bash
# Remove all dependencies and Docker containers
npm run clean

# Remove database
npm run clean:db

# Fresh install
npm run install:all
npm start
```

## 📚 Next Steps

1. **Create test users** in Frontegg Portal
2. **Try document sharing** between users
3. **Play the Pokemon game** to understand API protection
4. **Explore API Playground** with your token
5. **Check JWT Verifier** to understand token structure
6. **Customize** the UI components for your needs

## 🆘 Need Help?

- Check the [main README](README.md) for detailed documentation
- View [Backend SDK Demo Docs](docs/POKEMON_API.md) for API protection examples
- View [Frontegg Docs](https://developers.frontegg.com)
- Check container logs: `npm run docker:logs`
- Backend health: `http://localhost:5000/api/health`