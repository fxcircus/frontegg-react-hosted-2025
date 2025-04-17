import React from 'react';
import ReactDOM from 'react-dom'; // For React 17
// For react 18: import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { FronteggProvider } from '@frontegg/react';

const contextOptions = {
  baseUrl: process.env.REACT_APP_BASE_URL,   // Use environment variable
  clientId: process.env.REACT_APP_CLIENT_ID, // Use environment variable
  appId: process.env.REACT_APP_APP_ID,       // Use environment variable

  tenantResolver: () => ({
    tenant: new URLSearchParams(window.location.search).get("organization"),
  }),
};

const authOptions = {
  keepSessionAlive: true,
  enableSessionPerTenant: true
};

const localizations = {}

// For react 18: 
// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
ReactDOM.render(
    <FronteggProvider 
      contextOptions={contextOptions}
      hostedLoginBox={true}
      authOptions={authOptions}
      entitlementsOptions={{ enabled: true }}
      localizations={localizations}
    >
        <App />
    </FronteggProvider>,
    document.getElementById('root')
);