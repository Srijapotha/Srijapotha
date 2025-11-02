const axios = require('axios');
const { config } = require('../config');
const logger = require('../utils/logger');

/**
 * HubSpot API Connector
 * Handles communication with HubSpot CRM
 */
class HubSpotConnector {
  constructor() {
    this.apiKey = config.hubspot.apiKey;
    this.baseUrl = config.hubspot.baseUrl;
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Fetch contacts from HubSpot
   * @param {number} limit - Maximum number of contacts to fetch
   * @returns {Promise<Array>} Array of contact objects
   */
  async getContacts(limit = 100) {
    try {
      logger.info(`Fetching contacts from HubSpot (limit: ${limit})`);
      const response = await this.client.get('/crm/v3/objects/contacts', {
        params: { limit },
      });
      logger.info(`Successfully fetched ${response.data.results.length} contacts`);
      return response.data.results;
    } catch (error) {
      logger.error('Error fetching HubSpot contacts:', error.message);
      throw error;
    }
  }

  /**
   * Get a specific contact by ID
   * @param {string} contactId - HubSpot contact ID
   * @returns {Promise<Object>} Contact object
   */
  async getContactById(contactId) {
    try {
      logger.debug(`Fetching HubSpot contact: ${contactId}`);
      const response = await this.client.get(`/crm/v3/objects/contacts/${contactId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching HubSpot contact ${contactId}:`, error.message);
      throw error;
    }
  }

  /**
   * Fetch deals (invoices) from HubSpot
   * @param {number} limit - Maximum number of deals to fetch
   * @returns {Promise<Array>} Array of deal objects
   */
  async getDeals(limit = 100) {
    try {
      logger.info(`Fetching deals from HubSpot (limit: ${limit})`);
      const response = await this.client.get('/crm/v3/objects/deals', {
        params: { limit },
      });
      logger.info(`Successfully fetched ${response.data.results.length} deals`);
      return response.data.results;
    } catch (error) {
      logger.error('Error fetching HubSpot deals:', error.message);
      throw error;
    }
  }

  /**
   * Update a contact in HubSpot
   * @param {string} contactId - HubSpot contact ID
   * @param {Object} properties - Properties to update
   * @returns {Promise<Object>} Updated contact object
   */
  async updateContact(contactId, properties) {
    try {
      logger.debug(`Updating HubSpot contact: ${contactId}`);
      const response = await this.client.patch(`/crm/v3/objects/contacts/${contactId}`, {
        properties,
      });
      logger.info(`Successfully updated HubSpot contact: ${contactId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error updating HubSpot contact ${contactId}:`, error.message);
      throw error;
    }
  }
}

module.exports = HubSpotConnector;
