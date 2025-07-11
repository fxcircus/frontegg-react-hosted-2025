# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a Frontegg Demo Application - a React-based sample app demonstrating Frontegg's hosted authentication and authorization services. The app showcases enterprise-grade user management features including multi-tenancy, entitlements, JWT token handling, and admin portal integration.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on port 7242)
npm start

# Build for production
npm build

# Run tests
npm test
```

## Architecture

### Core Dependencies
- **React 18.2.0** with React Router DOM 6.21.1
- **@frontegg/react 7.10.1** - Frontegg's React SDK
- **jwt-decode 4.0.0** - JWT token decoding

### Application Structure
The app uses Frontegg's hosted login flow where authentication redirects to Frontegg's servers. Key architectural patterns:

1. **Authentication Flow**: 
   - App.js checks authentication status via `useAuth()` hook
   - Unauthenticated users are redirected to Frontegg's hosted login
   - Authenticated users see the main app with user info and features

2. **Component Organization**:
   - `App.js` - Main router and authentication guard
   - `components/Navbar.js` - Navigation with user actions
   - `components/UserInfo.js` - JWT token display and user details
   - `components/EntitlementsInfo.js` - Feature flags and permissions
   - `components/AccountSwitcher.js` - Multi-tenant switching
   - `components/ErrorBoundary.js` - Global error handling

3. **State Management**: 
   - Authentication state managed by Frontegg's context provider
   - User data accessed via Frontegg hooks (`useAuth`, `useFeatureEntitlements`, etc.)

### Environment Configuration
Required environment variables in `.env`:
```
REACT_APP_CLIENT_ID=<frontegg-client-id>
REACT_APP_BASE_URL=<frontegg-base-url>
REACT_APP_APP_ID=<frontegg-app-id>
```

### Key Features
- **Multi-tenancy**: URL-based tenant resolution (`subdomain.example.com`)
- **Entitlements**: Feature flags and permission-based access control
- **Admin Portal**: Embedded admin interface for user management
- **JWT Display**: View and decode user tokens
- **MFA Support**: Step-up authentication capabilities

## Development Notes

1. The app uses Create React App - avoid ejecting unless necessary
2. Frontegg configuration is extensive in `index.js` - includes security policies, localization, and admin portal settings
3. When modifying authentication flows, test with different tenant configurations
4. The `VerifyJWT` component requires a backend service running on port 5050
5. Some components (TenantMetadata, TenantHierarchySwitcher) are currently commented out in App.js