require('dotenv').config();

/**
 * Configuration module for HubSpot-QuickBooks Integration
 * Loads and validates environment variables
 */
const config = {
  hubspot: {
    apiKey: process.env.HUBSPOT_API_KEY,
    baseUrl: process.env.HUBSPOT_API_BASE_URL || 'https://api.hubapi.com',
  },
  quickbooks: {
    clientId: process.env.QUICKBOOKS_CLIENT_ID,
    clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET,
    realmId: process.env.QUICKBOOKS_REALM_ID,
    environment: process.env.QUICKBOOKS_ENVIRONMENT || 'sandbox',
    baseUrl: process.env.QUICKBOOKS_API_BASE_URL || 'https://sandbox-quickbooks.api.intuit.com',
  },
  sync: {
    intervalMinutes: parseInt(process.env.SYNC_INTERVAL_MINUTES) || 60,
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  }
};

/**
 * Validates that all required configuration is present
 * @throws {Error} If required configuration is missing
 */
function validateConfig() {
  const errors = [];

  if (!config.hubspot.apiKey) {
    errors.push('HUBSPOT_API_KEY is required');
  }

  if (!config.quickbooks.clientId) {
    errors.push('QUICKBOOKS_CLIENT_ID is required');
  }

  if (!config.quickbooks.clientSecret) {
    errors.push('QUICKBOOKS_CLIENT_SECRET is required');
  }

  if (!config.quickbooks.realmId) {
    errors.push('QUICKBOOKS_REALM_ID is required');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}

module.exports = { config, validateConfig };
