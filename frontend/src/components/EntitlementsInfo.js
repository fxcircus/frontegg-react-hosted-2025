import React from 'react';
import { useFeatureEntitlements, usePermissionEntitlements, useEntitlements } from "@frontegg/react";
import Card from './Card';
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
  // Replace with the correct keys from your app
  // See https://developers.frontegg.com/sdks/frontend/react/entitlements for details.
  const featureKey = "test"; // Feature entitlement key
  const permissionKey = "fe.secure.read.securityPolicy"; // Permission entitlement key
  // ------------------------------------------------------------

  console.log('Before hooks');
  
  // Feature-based entitlements
  const featureEntitlements = useSafeEntitlement(useFeatureEntitlements, featureKey);

  // Permission-based entitlements
  const permissionEntitlements = useSafeEntitlement(usePermissionEntitlements, permissionKey);

  // Generic entitlement checks
  const entitlementsByPermission = useSafeEntitlement(useEntitlements, { permissionKey });
  const entitlementsByFeature = useSafeEntitlement(useEntitlements, { featureKey });

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
      <Card title="Plans and Features" subtitle="View your account's entitlements and permissions.">
        <div className="entitlements-section">
          {isFEntitled && (
            <div className="entitlement-item">
              Your plan includes the <b>"{featureKey}"</b> feature.
            </div>
          )}
          {isPEntitled && (
            <div className="entitlement-item">
              Your plan includes the <b>"{permissionKey}"</b> permission.
            </div>
          )}
          {isPEntitled2 && (
            <div className="entitlement-item">
              You have a permission with the <b>"{permissionKey}"</b> key.
            </div>
          )}
          {isFEntitled2 && (
            <div className="entitlement-item">
              You have a feature with the <b>"{featureKey}"</b> key.
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
      </Card>
    </ErrorBoundary>
  );
};

export default EntitlementsInfo;
