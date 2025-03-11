import React from 'react';
import { useFeatureEntitlements, usePermissionEntitlements, useEntitlements } from "@frontegg/react";
import "../App.css";
import "../index.css";
import ErrorBoundary from './ErrorBoundary';

const EntitlementsInfo = () => {
  // ------------------------------------------------------------
  // TODO: Replace with the entitlement key from your app
  // Documentation: https://developers.frontegg.com/sdks/frontend/react/entitlements#react-hooks
  const entitlementKey = "test";
  // ------------------------------------------------------------
  const featureEntitlements = useFeatureEntitlements(entitlementKey);
  const permissionEntitlements = usePermissionEntitlements(entitlementKey);
  const entitlementsByPermission = useEntitlements({ permissionKey: entitlementKey });
  const entitlementsByFeature = useEntitlements({ featureKey: entitlementKey });

  const isFEntitled = featureEntitlements?.isEntitled || false;
  const isPEntitled = permissionEntitlements?.isEntitled || false;
  const isPEntitled2 = entitlementsByPermission?.isEntitled || false;
  const isFEntitled2 = entitlementsByFeature?.isEntitled || false;

  const hasEntitlement = isFEntitled || isPEntitled || isPEntitled2 || isFEntitled2;

  return (
    <ErrorBoundary>
      <div>
        <label className="info-label">Plans and Features</label>
        <div className="entitlements-section">
          {isFEntitled && (
            <div className="entitlement-item">
              Your plan includes the <b>"{entitlementKey}"</b> feature.
            </div>
          )}
          {isPEntitled && (
            <div className="entitlement-item">
              Your plan includes the <b>"{entitlementKey}"</b> permission.
            </div>
          )}
          {isPEntitled2 && (
            <div className="entitlement-item">
              You have a permission with the <b>"{entitlementKey}"</b> key.
            </div>
          )}
          {isFEntitled2 && (
            <div className="entitlement-item">
              You have a feature with the <b>"{entitlementKey}"</b> key.
            </div>
          )}
          {!hasEntitlement && (
            <div className="entitlement-item">No plans \ features </div>
          )}
        </div>
        <div className="entitlements-doc">
          <p>
            Learn more about plans and features in the&nbsp;
            <a
              href="https://developers.frontegg.com/guides/authorization/entitlements/intro"
              target="_blank"
              rel="noopener noreferrer"
            >
              Frontegg Documentation
            </a>.
          </p>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default EntitlementsInfo; 