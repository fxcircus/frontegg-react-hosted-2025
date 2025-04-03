import React from 'react';
import { useFeatureEntitlements, usePermissionEntitlements, useEntitlements } from "@frontegg/react";
import "../App.css";
import "../index.css";
import ErrorBoundary from './ErrorBoundary';

// Default entitlements object when none are provided.
const fallbackEntitlements = { isEntitled: false, list: [] };

// Custom hook to safely handle Frontegg entitlement hooks
const useSafeEntitlement = (hook, ...args) => {
  try {
    const result = hook(...args);
    return result ?? fallbackEntitlements;
  } catch (error) {
    console.error('Error in entitlement hook:', error);
    return fallbackEntitlements;
  }
};

const EntitlementsInfo = () => {
  // ------------------------------------------------------------
  // Replace with the entitlement key from your app
  // See https://developers.frontegg.com/sdks/frontend/react/entitlements for details.
  const entitlementKey = "test";
  // ------------------------------------------------------------

  console.log('Before hooks');
  
  // Use our safe wrapper for each hook
  const featureEntitlements = useSafeEntitlement(useFeatureEntitlements, entitlementKey);
  const permissionEntitlements = useSafeEntitlement(usePermissionEntitlements, entitlementKey);
  const entitlementsByPermission = useSafeEntitlement(useEntitlements, { permissionKey: entitlementKey });
  const entitlementsByFeature = useSafeEntitlement(useEntitlements, { featureKey: entitlementKey });

  console.log('Processed Entitlements:', {
    featureEntitlements,
    permissionEntitlements,
    entitlementsByPermission,
    entitlementsByFeature
  });

  // Directly use the returned object properties.
  const isFEntitled = featureEntitlements.isEntitled;
  const isPEntitled = permissionEntitlements.isEntitled;
  const isPEntitled2 = entitlementsByPermission.isEntitled;
  const isFEntitled2 = entitlementsByFeature.isEntitled;

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
            <div className="entitlement-item">No plans / features</div>
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
