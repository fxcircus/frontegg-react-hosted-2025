import React from 'react';
import { useFeatureEntitlements, usePermissionEntitlements, useEntitlements } from "@frontegg/react";
import Card from './Card';
import "../App.css";
import "../index.css";
import ErrorBoundary from './ErrorBoundary';
import { FEATURE_KEYS, PERMISSION_KEYS } from '../constants/entitlements';

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
  // Using centralized entitlement keys from constants/entitlements.js
  // See https://developers.frontegg.com/sdks/frontend/react/entitlements for details.
  const featureKey = FEATURE_KEYS.TEST; // Feature entitlement key
  const permissionKey = PERMISSION_KEYS.MY_PERMISSION; // Permission entitlement key
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
      <Card 
        title="Plans and Features" 
        subtitle="View your account's entitlements and permissions."
        tooltipContent="Entitlements allow you to control feature access and permissions based on subscription plans. Features can be toggled on/off per tenant, while permissions define what actions users can perform."
        tooltipLink="https://developers.frontegg.com/guides/authorization/entitlements/intro"
      >
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
      </Card>
    </ErrorBoundary>
  );
};

export default EntitlementsInfo;
