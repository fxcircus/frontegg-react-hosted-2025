import React, { useState } from 'react';
import { useAuth, useStepUp, useIsSteppedUp, useFeatureEntitlements, usePermissionEntitlements, useAuthActions } from "@frontegg/react";
import { jwtDecode } from "jwt-decode";
import Card from './Card';
import Toast from './Toast';
import './UserAuth.css';

const UserAuth = () => {
  const { user } = useAuth();
  const { requestAuthorize } = useAuthActions();
  const [showDecodedToken, setShowDecodedToken] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const stepUp = useStepUp();
  const MAX_AGE = 60;
  const isSteppedUp = useIsSteppedUp({ maxAge: MAX_AGE });

  const copyValue = (value, label) => {
    navigator.clipboard.writeText(value);
    setToastMessage(`${label} copied to clipboard!`);
    setTimeout(() => setToastMessage(""), 2000);
  };

  const getTokenExpiry = () => {
    if (!user?.accessToken) return null;
    try {
      const decoded = jwtDecode(user.accessToken);
      const expiryDate = new Date(decoded.exp * 1000);
      const now = new Date();
      const hoursLeft = Math.floor((expiryDate - now) / (1000 * 60 * 60));
      const minutesLeft = Math.floor((expiryDate - now) / (1000 * 60)) % 60;
      return { 
        hoursLeft, 
        minutesLeft, 
        isExpired: expiryDate < now,
        expiryDate: expiryDate.toLocaleString()
      };
    } catch {
      return null;
    }
  };

  const tokenExpiry = getTokenExpiry();
  const decodedToken = user?.accessToken ? jwtDecode(user.accessToken) : null;

  // Entitlements - hooks must be called unconditionally
  const featureKey = "test";
  const permissionKey = "fe.secure.read.securityPolicy";
  const featureEntitlements = useFeatureEntitlements(featureKey) || { isEntitled: false };
  const permissionEntitlements = usePermissionEntitlements(permissionKey) || { isEntitled: false };

  return (
    <div className="user-auth-container">
      {/* User Info Summary */}
      <Card className="user-summary-card" title="User Profile">
        <div className="user-summary">
          <div className="user-main">
            <img
              src={user?.profilePictureUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=5b68f5&color=fff`}
              alt={user?.name}
              className="user-avatar"
              referrerPolicy="no-referrer"
            />
            <div className="user-details">
              <h2>{user?.name}</h2>
              <p className="user-email">{user?.email}</p>
              <div className="user-roles">
                {user?.roles?.length > 0 ? (
                  user.roles.map((role, index) => (
                    <span key={index} className="role-badge">
                      {role.name || role.key}
                    </span>
                  ))
                ) : (
                  <span className="no-roles">No roles assigned</span>
                )}
              </div>
            </div>
          </div>
          <div className="user-ids">
            <div 
              className="id-item"
              onClick={() => copyValue(user?.id, 'User ID')}
              title="Click to copy"
            >
              <span className="id-label">User ID</span>
              <code className="id-value">{user?.id}</code>
            </div>
            <div 
              className="id-item"
              onClick={() => copyValue(user?.tenantId, 'Tenant ID')}
              title="Click to copy"
            >
              <span className="id-label">Tenant ID</span>
              <code className="id-value">{user?.tenantId}</code>
            </div>
          </div>
          <div className="auth-status">
            {isSteppedUp ? (
              <div className="mfa-badge success">
                <span>✓</span> MFA Verified
              </div>
            ) : (
              <div className="mfa-wrapper">
                <button 
                  className="mfa-button" 
                  onClick={() => stepUp({ maxAge: MAX_AGE })}
                  title="Multi-Factor Authentication adds an extra layer of security by requiring additional verification before accessing sensitive areas"
                >
                  Verify with MFA
                </button>
                <div className="mfa-tooltip">
                  <span className="tooltip-icon">?</span>
                  <div className="tooltip-content">
                    Multi-Factor Authentication adds an extra layer of security by requiring additional verification before accessing sensitive areas.
                    <br /><br />
                    <a href="https://developers.frontegg.com/guides/step-up/intro" target="_blank" rel="noopener noreferrer" style={{color: '#4dabf7', textDecoration: 'underline'}}>
                      Learn more about Step-up Authentication
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="auth-grid">
        {/* JWT Token Section */}
        <Card title="JWT Token" className="jwt-card">
        <div className="jwt-header">
          <div className="token-info">
            <span className={`token-status ${tokenExpiry?.isExpired ? 'expired' : 'valid'}`}>
              {tokenExpiry?.isExpired ? '● Expired' : '● Valid'}
            </span>
            {tokenExpiry && !tokenExpiry.isExpired && (
              <span className="token-expiry">
                Expires in {tokenExpiry.hoursLeft}h {tokenExpiry.minutesLeft}m
              </span>
            )}
          </div>
          <div className="token-actions">
            <button 
              className="refresh-token-btn" 
              onClick={() => {
                requestAuthorize();
                // Dispatch custom event for activity tracking
                window.dispatchEvent(new CustomEvent('frontegg-token-refreshed'));
              }}
              title="Refresh JWT token"
            >
              Refresh Token
            </button>
            <div className="token-toggle">
              <span className="toggle-label">Show Decoded</span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={showDecodedToken}
                  onChange={(e) => setShowDecodedToken(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="jwt-content">
          {showDecodedToken ? (
            <div className="decoded-token">
              <pre onClick={() => copyValue(JSON.stringify(decodedToken, null, 2), 'Decoded Token')}>
                {JSON.stringify(decodedToken, null, 2)}
              </pre>
            </div>
          ) : (
            <div 
              className="raw-token"
              onClick={() => copyValue(user?.accessToken, 'JWT Token')}
            >
              {user?.accessToken}
            </div>
          )}
        </div>
        </Card>

        {/* Permissions & Entitlements */}
        <Card title="Permissions & Entitlements" className="entitlements-card">
        <div className="entitlements-summary">
          <div className="entitlements-stats">
            <div className="entitlement-stat">
              <span className="stat-value">{user?.permissions?.length || 0}</span>
              <span className="stat-label">Total Permissions</span>
            </div>
            <div className="entitlement-stat">
              <span className="stat-value">{user?.tenantIds?.length || 0}</span>
              <span className="stat-label">Active Tenants</span>
            </div>
          </div>
          
          <div className="entitlements-details">
            {featureEntitlements?.isEntitled && (
              <div className="entitlement-message success">
                <span className="entitlement-icon">✓</span>
                Your plan includes the <strong>"{featureKey}"</strong> feature.
              </div>
            )}
            {permissionEntitlements?.isEntitled && (
              <div className="entitlement-message success">
                <span className="entitlement-icon">✓</span>
                Your plan includes the <strong>"{permissionKey}"</strong> permission.
              </div>
            )}
            {!featureEntitlements?.isEntitled && !permissionEntitlements?.isEntitled && (
              <div className="entitlement-message inactive">
                <span className="entitlement-icon">ℹ</span>
                No special features or permissions are currently active.
              </div>
            )}
          </div>
        </div>
        
        <div className="entitlements-footer">
          <a 
            href="https://developers.frontegg.com/guides/authorization/entitlements/intro"
            target="_blank"
            rel="noopener noreferrer"
            className="entitlements-link"
          >
            Learn more about plans and features →
          </a>
        </div>
        </Card>
      </div>

      <Toast 
        message={toastMessage} 
        type="success" 
        onClose={() => setToastMessage('')} 
      />
    </div>
  );
};

export default UserAuth;