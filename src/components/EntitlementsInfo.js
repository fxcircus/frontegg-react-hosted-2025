import React from 'react';
import { useFeatureEntitlements, usePermissionEntitlements, useEntitlements } from "@frontegg/react";
import "../App.css";
import "../index.css";
import ErrorBoundary from './ErrorBoundary';

const EntitlementsInfo = () => {
  const entitlementKey = "test";

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
      <label className="info-label">Entitlements</label>
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
    </ErrorBoundary>
  );
};

export default EntitlementsInfo; 