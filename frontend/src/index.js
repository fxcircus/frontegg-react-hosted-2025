import React from 'react';
import ReactDOM from 'react-dom'; // For React 17
// For react 18: import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './components/PageTooltipFix.css';

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

// Define all localizations for security features
const localizations = {
  en: {
    adminPortal: {
      security: {
        // Password change form
        "Change password": "CHANGE PASSWORD!!!",
        "Current password": "CURRENT PASSWORD",
        "New password": "NEW PASSWORD",
        "Confirm new password": "CONFIRM NEW PASSWORD",
        "Save changes": "CHANGE PASSWORD",
        "Cancel": "CANCEL",
        
        // Password validation messages
        "1 lowercase letter": "1 LOWERCASE LETTER",
        "1 number": "1 NUMBER",
        "1 special character": "1 SPECIAL CHARACTER", 
        "1 capital letter": "1 CAPITAL LETTER",
        "8 characters minimum": "8 CHARACTERS MINIMUM",
        "avoid 3 or more recurring characters": "AVOID 3 OR MORE RECURRING CHARACTERS",
        
        // Security policy fields
        security: {
          generalSettingsTab: "GENERAL SETTINGS",
          sessionManagementTab: "SESSION MANAGEMENT",
          ipRestrictionTab: "LOGIN RESTRICTIONS",
          domainRestrictionTab: "SIGNUP RESTRICTIONS",
          pageTitle: "SECURITY POLICY",
          subtitle: "SECURITY SETTINGS",
          mfaTitle: "MULTI-FACTOR AUTHENTICATION",
          mfaPolicyDontForceDescription: "USERS CAN ENABLE MFA",
          mfaPolicyForceDescription: "MFA IS REQUIRED FOR ALL USERS",
          mfaPolicyForceExceptSAMLDescription: "MFA IS REQUIRED EXCEPT FOR SAML USERS",
          lockoutTitle: "ACCOUNT LOCKOUT",
          lockoutNotConfigured: "NOT CONFIGURED",
          lockoutEnabledMaxAttempts1: "LOCK ACCOUNT AFTER",
          lockoutEnabledMaxAttempts2: "FAILED ATTEMPTS",
          lockoutDisabled: "DISABLED",
          passwordHistoryTitle: "PASSWORD HISTORY",
          passwordHistoryNotConfigured: "NOT CONFIGURED",
          passwordHistoryEnabledHistorySize1: "PREVENT REUSE OF LAST",
          passwordHistoryEnabledHistorySize2: "PASSWORDS",
          passwordHistoryDisabled: "DISABLED",
          emptyStateText: "NO SECURITY SETTINGS AVAILABLE"
        },
        
        // Edit MFA policy
        security_EditMfaPolicy: {
          title: "EDIT MFA POLICY",
          dontForceTitle: "DON'T FORCE MFA",
          dontForceDescription: "USERS CAN CHOOSE TO ENABLE MFA",
          forceTitle: "FORCE MFA FOR ALL USERS",
          forceDescription: "ALL USERS MUST SET UP MFA",
          forceExceptSAMLTitle: "FORCE MFA EXCEPT FOR SAML",
          forceExceptSAMLDescription: "USERS LOGGING IN VIA SAML ARE EXEMPT",
          cancel: "CANCEL",
          save: "SAVE"
        },
        
        // Edit Lockout policy
        security_EditLockoutPolicy: {
          title: "EDIT LOCKOUT POLICY",
          attemptsInputLabel: "MAX ATTEMPTS",
          attemptsInputPlaceholder: "ENTER NUMBER OF ATTEMPTS",
          attemptsInputErrorMessage: "INVALID NUMBER OF ATTEMPTS",
          cancel: "CANCEL",
          save: "SAVE"
        },
        
        // Edit Password History policy
        security_EditPasswordHistoryPolicy: {
          title: "EDIT PASSWORD HISTORY",
          sizeInputLabel: "HISTORY SIZE",
          sizeInputPlaceholder: "ENTER HISTORY SIZE",
          sizeIsRequired: "HISTORY SIZE IS REQUIRED",
          sizeMustBeNumber: "MUST BE A VALID NUMBER",
          sizeMustBeGt0: "MUST BE GREATER THAN 0",
          sizeMustBelt10: "MUST BE LESS THAN 10",
          cancel: "CANCEL",
          save: "SAVE"
        },
        
        // Edit Password in Security Center
        security_PasswordInnerPage: {
          title: "PASSWORD SECURITY",
          userLockoutTitle: "ACCOUNT LOCKOUT",
          userLockoutDescription: "LOCK ACCOUNTS AFTER FAILED ATTEMPTS",
          passwordHistoryTitle: "PASSWORD HISTORY",
          passwordHistoryDescription: "PREVENT PASSWORD REUSE",
          cancel: "CANCEL",
          save: "SAVE"
        }
      }
    }
  }
};

const themeOptions = {
  adminPortal: {
    components: {
      MuiChip: {
        styleOverrides: {
          label: {
            color: 'red',
            background: 'white'
          }
        }
      }
    }
  }
};

ReactDOM.render(
    <FronteggProvider 
      themeOptions={themeOptions}
      contextOptions={contextOptions}
      hostedLoginBox={true}
      authOptions={authOptions}
      entitlementsOptions={{ enabled: true }}
      localizations={localizations}
      guidesCdnUrl="https://assets.frontegg.com/admin-box/embedded-guides/15422248107"
    >
        <App />
    </FronteggProvider>,
    document.getElementById('root')
);