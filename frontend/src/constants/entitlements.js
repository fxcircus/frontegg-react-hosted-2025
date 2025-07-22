/**
 * Centralized configuration for all Frontegg entitlement keys used across the application.
 * 
 * To use custom permission/feature keys:
 * 1. Update the values in this file
 * 2. Ensure the keys match your Frontegg workspace configuration
 * 3. All components will automatically use the updated values
 * 
 * Learn more: https://developers.frontegg.com/guides/authorization/entitlements/intro
 */

// Feature entitlement keys
export const FEATURE_KEYS = {
  TEST: 'test'
};

// Permission entitlement keys
export const PERMISSION_KEYS = {
  MY_PERMISSION: 'myPermission'
};

// Pokemon-specific permissions
export const POKEMON_PERMISSIONS = {
  CATCH: 'pokemon.catch',
  VIEW: 'pokemon.view',
  TRADE: 'pokemon.trade'
};