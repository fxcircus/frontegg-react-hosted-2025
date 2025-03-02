# Frontegg - Hosted Login React Integration

This project demonstrates how to integrate Frontegg's hosted login solution into a React application. It provides a seamless authentication experience with minimal setup.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Frontegg Account Setup](#frontegg-account-setup)
- [Code Setup](#code-setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Features](#features)
- [Components Overview](#components-overview)
- [Support](#support)

## Prerequisites

- Node.js and npm installed on your machine.

## Frontegg Account Setup

Sign up for a Frontegg account in one of our public regions:

- EU ➜ https://portal.frontegg.com/signup
- US ➜ https://portal.us.frontegg.com/signup
- CA ➜ https://portal.ca.frontegg.com/signup
- AU ➜ https://portal.au.frontegg.com/signup

Complete the initial onboarding form and note down your Client ID and API Key from the Frontegg Portal.

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

1. Create a `.env` file in the root directory of the project.

2. Add your Frontegg credentials to the `.env` file:

   ```plaintext
   # Found in the Keys & Domains page
   REACT_APP_CLIENT_ID=[YOUR-CLIENT-ID]

   # Found in the Applications page under your application
   REACT_APP_BASE_URL=https://[YOUR_SUBDOMAIN].frontegg.com
   REACT_APP_APP_ID=[APPLICATION_ID]
   ```

3. Save the file.

## Running the Application

Start the development server:

```bash
npm start
```

Open your browser and navigate to `http://localhost:3000`. Sign up as a new user and explore the features Frontegg provides out of the box!

![App Screenshot](./images/app_screenshot.png)

## Features

- **Hosted Login with Frontegg**

- **Account Switching and [Entitlements](https://developers.frontegg.com/guides/authorization/entitlements/feature-based/plans)**: Easily switch between different accounts and manage user entitlements.
- **JWT Token Decoding**: View and decode the JWT token issued to users. Inspect the token's claims.
- **Copy Values with a Click**: Click on any value to copy it to your clipboard.
- **[Admin Portal](https://developers.frontegg.com/guides/admin-portal/intro)**: Manage users, SSO connections, and other administrative tasks
- **[Step-Up MFA](https://developers.frontegg.com/guides/step-up/intro)**: Enhance security by stepping up Multi-Factor Authentication (MFA) for sensitive operations. Learn more about.

## Components Overview

- **[App.js](src/App.js)**: The main application component.

- **[UserProfile.js](src/components/UserProfile.js)**: Displays user profile information, including name, email, and profile picture.

- **[UserInfo.js](src/components/UserInfo.js)**: Shows detailed user information, including JWT tokens and user IDs. Allows users to copy values and toggle between encoded and decoded JWT views.

- **[AccountSwitcher.js](src/components/AccountSwitcher.js)**: Provides functionality to switch between different user accounts or tenants.

- **[EntitlementsInfo.js](src/components/EntitlementsInfo.js)**: Displays user plans and features.

- **[AppInfo.js](src/components/AppInfo.js)**: Provides a brief introduction and welcome message for the application.

- **[ErrorBoundary.js](src/components/ErrorBoundary.js)**: A component that catches JavaScript errors anywhere in the child component tree and displays a fallback UI.

## Support

For any questions or support, please refer to the [Frontegg documentation](https://developers.frontegg.com/guides/getting-started/home) or contact Frontegg support.