/**
 * Centralized Environment Configuration
 * 
 * This file provides a single source of truth for all environment variables.
 * Never hardcode URLs directly in components - always import from here.
 * 
 * IMPORTANT: localhost:3000 is strictly forbidden in frontend code!
 * All API calls MUST use API_BASE_URL from this config.
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://be-fms-dev-h6fed7awcqd7cxb5.centralus-01.azurewebsites.net';

export const ENV_CONFIG = {
  apiUrl: API_BASE_URL,
  superTenantId: import.meta.env.VITE_SUPER_TENANT_ID,
  systemSuperUserId: import.meta.env.VITE_SYSTEM_SUPER_USER_ID,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;
