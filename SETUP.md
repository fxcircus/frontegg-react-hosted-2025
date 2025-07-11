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

### 3. Configure ReBAC (Required for Document Management)

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

1. **Login Page** - Frontegg hosted authentication
2. **Dashboard** - Overview with stats cards
3. **User & Auth** - JWT tokens and user info
4. **Tenants** - Multi-tenant management
5. **API Playground** - Test Frontegg APIs
6. **Embedded Components** - Admin portal features
7. **Documents (ReBAC)** - Document management demo

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
3. **Explore API Playground** with your token
4. **Customize** the UI components

## 🆘 Need Help?

- Check the [main README](README.md) for detailed documentation
- View [Frontegg Docs](https://developers.frontegg.com)
- Check container logs: `npm run docker:logs`
- Backend health: `http://localhost:5000/api/health`