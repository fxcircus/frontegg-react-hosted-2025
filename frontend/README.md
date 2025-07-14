# Frontegg Demo Application - Frontend

This is the React frontend for the Frontegg Demo Application, showcasing comprehensive authentication, authorization, and enterprise features including Multi-Tenancy, Admin Portal, API Playground, Backend SDK Demo, and Relationship-Based Access Control (ReBAC).

📚 **Frontegg React SDK Documentation**: [React SDK Guide](https://developers.frontegg.com/sdks/frontend/react)

## Table of Contents

- [Prerequisites](#prerequisites)
- [Frontegg Account Setup](#frontegg-account-setup)
- [Code Setup](#code-setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Features](#features)
- [Components Overview](#components-overview)

## Prerequisites

- Node.js and npm installed on your machine.

## Frontegg Account Setup

Sign up for a Frontegg account in one of our public regions:

- EU ➜ <a href="https://portal.frontegg.com/signup" target="_blank">https://portal.frontegg.com/signup</a>
- US ➜ <a href="https://portal.us.frontegg.com/signup" target="_blank">https://portal.us.frontegg.com/signup</a>
- CA ➜ <a href="https://portal.ca.frontegg.com/signup" target="_blank">https://portal.ca.frontegg.com/signup</a>
- AU ➜ <a href="https://portal.au.frontegg.com/signup" target="_blank">https://portal.au.frontegg.com/signup</a>

Complete the initial onboarding form and note down your Client ID and API Key from the Frontegg Portal.

📚 Learn more: [Getting Started with Frontegg](https://developers.frontegg.com/guides/getting-started/home)

## Code Setup

1. Clone the repository and install the dependencies:

   ```bash
   git clone https://github.com/fxcircus/frontegg-react-demo.git frontegg_sample
   cd frontegg_sample
   npm install
   ```

2. Open the project in your preferred IDE:

   ```bash
   code .
   ```

## Environment Configuration

1. Create a `.env` file in the frontend directory (you can copy from `.env.example`).

2. Add your Frontegg credentials to the `.env` file:

   ```plaintext
   # Frontegg Configuration (Required)
   # Get these from: Frontegg Portal → [Environment] → Settings → API Keys
   REACT_APP_BASE_URL=https://app-xxx.frontegg.com
   REACT_APP_CLIENT_ID=your-client-id-here
   REACT_APP_APP_ID=your-app-id-here
   ```

3. Save the file.

   **Note:** The backend URL defaults to `http://localhost:5000` and doesn't need to be configured unless you're running the backend on a different port.

## Running the Application

**Note:** This frontend requires the backend server to be running for full functionality. See the main [README.md](../README.md) for instructions on running the complete application with `npm start` from the root directory.

Start the frontend development server:

```bash
npm start
```

Open your browser and navigate to `http://localhost:3000`. Sign up as a new user and explore the features Frontegg provides out of the box!

![App Screenshot](./images/app_screenshot_2025.png)

## Features

### Core Authentication & User Management
- **Hosted Login**: Secure authentication with Frontegg's hosted login - [React Hosted Login Guide](https://docs.frontegg.com/docs/react-hosted-login-guide)
- **JWT Token Display**: View and decode authentication tokens - [JWT Verification](https://docs.frontegg.com/docs/using-public-key-to-verify-jwt)
- **User Profile**: Display user details, roles, and permissions - [Auth Functions](https://developers.frontegg.com/sdks/components/auth-functions)
- **Multi-Factor Authentication**: Step-up authentication support - [Step-up Auth Guide](https://developers.frontegg.com/guides/step-up/intro)

### Multi-Tenancy & Entitlements
- **Tenant Hierarchy Switcher**: Visual tenant navigation with sub-accounts - [Sub-accounts & Hierarchy](https://developers.frontegg.com/api/tenants/sub-accounts-and-hierarchy)
- **Tenant Metadata**: View and manage tenant-specific settings - [Tenant Metadata API](https://developers.frontegg.com/api/tenants/accounts/tenantcontrollerv1_addtenantmetadata)
- **Account Switching**: Seamless switching between tenant contexts - [Switch Active Tenant](https://docs.frontegg.com/docs/switch-active-tenant-from-your-application)
- **<a href="https://developers.frontegg.com/guides/authorization/entitlements/feature-based/plans" target="_blank">Feature Entitlements</a>**: Feature flags and permission-based access

### Developer Tools
- **API Playground**: Test Frontegg APIs with live authentication - [API Reference](https://docs.frontegg.com/reference/getting-started-with-your-api)
- **Backend SDK Demo**: Interactive Pokemon game demonstrating API protection - [Backend SDK Protection](https://docs.frontegg.com/docs/sdk-backend-protection)
- **JWT Verifier**: Comprehensive token validation tool - [JWT Verification Docs](https://docs.frontegg.com/docs/using-public-key-to-verify-jwt)
- **Copy Values**: Click on any value to copy it to clipboard

### Admin Features
- **<a href="https://developers.frontegg.com/guides/admin-portal/intro" target="_blank">Admin Portal</a>**: Embedded user management and SSO configuration - [React Self-Service Integration](https://docs.frontegg.com/docs/react-self-service)
- **Document Management (ReBAC)**: Fine-grained permission control with document sharing - [ReBAC Documentation](https://developers.frontegg.com/guides/authorization/rebac)
- **<a href="https://developers.frontegg.com/guides/step-up/intro" target="_blank">Step-Up MFA</a>**: Enhanced security for sensitive operations

## Components Overview

### Core Components
- **[App.js](src/App.js)**: Main application router and authentication guard
- **[Sidebar.js](src/components/Sidebar.js)**: Modern navigation sidebar with collapsible menu
- **[Dashboard.js](src/components/Dashboard.js)**: Overview page with interactive stats cards

### Authentication & User Management
- **[UserAuth.js](src/components/UserAuth.js)**: Combined user info and authentication details
- **[UserInfo.js](src/components/UserInfo.js)**: JWT token display and user details with copy functionality
- **[JWTVerifier](src/components/JWTVerifier/JWTVerifier.js)**: Standalone JWT validation tool

### Multi-Tenancy
- **[TenantHierarchySwitcher.js](src/components/TenantHierarchySwitcher.js)**: Visual tenant hierarchy navigation
- **[TenantMetadata.js](src/components/TenantMetadata.js)**: Display and manage tenant metadata
- **[TenantSelector.js](src/components/TenantSelector.js)**: Quick tenant switching dropdown

### Developer Tools
- **[APIPlayground.js](src/components/APIPlayground.js)**: Interactive API testing interface
- **[Pokemon](src/components/Pokemon/Pokemon.js)**: Backend SDK demo with permission-based game
- **[VerifyJWT.js](src/components/VerifyJWT.js)**: JWT verification using backend service

### Enterprise Features
- **[AdminPortal.js](src/components/AdminPortal.js)**: Embedded admin components showcase
- **[DocumentManager](src/components/DocumentManager/DocumentManager.js)**: ReBAC demo with document sharing
- **[EntitlementsInfo.js](src/components/EntitlementsInfo.js)**: Feature flags and entitlements display

Note: The application now uses the integrated backend at `http://localhost:5000` for all API operations including JWT verification.