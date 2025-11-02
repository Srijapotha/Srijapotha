const axios = require('axios');
const { config } = require('../config');
const logger = require('../utils/logger');

/**
 * QuickBooks API Connector
 * Handles communication with QuickBooks Online API
 */
class QuickBooksConnector {
  constructor() {
    this.clientId = config.quickbooks.clientId;
    this.clientSecret = config.quickbooks.clientSecret;
    this.realmId = config.quickbooks.realmId;
    this.baseUrl = config.quickbooks.baseUrl;
    this.accessToken = null;
  }

  /**
   * Authenticate with QuickBooks (simplified - real implementation would use OAuth2)
   * @returns {Promise<void>}
   * 
   * NOTE: This is a demonstration implementation. In production, you must:
   * 1. Implement full OAuth2 authorization flow
   * 2. Handle token refresh mechanism
   * 3. Store tokens securely (encrypted database or secrets manager)
   * 4. Never use hardcoded tokens
   */
  async authenticate() {
    try {
      logger.info('Authenticating with QuickBooks...');
      // In a real implementation, this would handle OAuth2 flow
      // For demonstration, we're simulating authentication
      // TODO: Implement proper OAuth2 flow for production
      this.accessToken = 'demo_access_token';
      logger.info('QuickBooks authentication successful (demo mode)');
    } catch (error) {
      logger.error('Error authenticating with QuickBooks:', error.message);
      throw error;
    }
  }

  /**
   * Get the API client with authentication headers
   * @returns {Object} Axios instance
   */
  getClient() {
    if (!this.accessToken) {
      throw new Error('Not authenticated. Call authenticate() first.');
    }
    return axios.create({
      baseURL: `${this.baseUrl}/v3/company/${this.realmId}`,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  }

  /**
   * Fetch customers from QuickBooks
   * @param {number} maxResults - Maximum number of customers to fetch
   * @returns {Promise<Array>} Array of customer objects
   */
  async getCustomers(maxResults = 100) {
    try {
      logger.info(`Fetching customers from QuickBooks (max: ${maxResults})`);
      const client = this.getClient();
      const response = await client.get('/query', {
        params: {
          query: `SELECT * FROM Customer MAXRESULTS ${maxResults}`,
        },
      });
      const customers = response.data.QueryResponse?.Customer || [];
      logger.info(`Successfully fetched ${customers.length} customers`);
      return customers;
    } catch (error) {
      logger.error('Error fetching QuickBooks customers:', error.message);
      throw error;
    }
  }

  /**
   * Create a customer in QuickBooks
   * @param {Object} customerData - Customer data
   * @returns {Promise<Object>} Created customer object
   */
  async createCustomer(customerData) {
    try {
      logger.debug(`Creating QuickBooks customer: ${customerData.DisplayName}`);
      const client = this.getClient();
      const response = await client.post('/customer', customerData);
      logger.info(`Successfully created QuickBooks customer: ${customerData.DisplayName}`);
      return response.data.Customer;
    } catch (error) {
      logger.error(`Error creating QuickBooks customer:`, error.message);
      throw error;
    }
  }

  /**
   * Update a customer in QuickBooks
   * @param {Object} customerData - Customer data with Id and SyncToken
   * @returns {Promise<Object>} Updated customer object
   */
  async updateCustomer(customerData) {
    try {
      logger.debug(`Updating QuickBooks customer: ${customerData.Id}`);
      const client = this.getClient();
      const response = await client.post('/customer', customerData);
      logger.info(`Successfully updated QuickBooks customer: ${customerData.Id}`);
      return response.data.Customer;
    } catch (error) {
      logger.error(`Error updating QuickBooks customer:`, error.message);
      throw error;
    }
  }

  /**
   * Fetch invoices from QuickBooks
   * @param {number} maxResults - Maximum number of invoices to fetch
   * @returns {Promise<Array>} Array of invoice objects
   */
  async getInvoices(maxResults = 100) {
    try {
      logger.info(`Fetching invoices from QuickBooks (max: ${maxResults})`);
      const client = this.getClient();
      const response = await client.get('/query', {
        params: {
          query: `SELECT * FROM Invoice MAXRESULTS ${maxResults}`,
        },
      });
      const invoices = response.data.QueryResponse?.Invoice || [];
      logger.info(`Successfully fetched ${invoices.length} invoices`);
      return invoices;
    } catch (error) {
      logger.error('Error fetching QuickBooks invoices:', error.message);
      throw error;
    }
  }

  /**
   * Create an invoice in QuickBooks
   * @param {Object} invoiceData - Invoice data
   * @returns {Promise<Object>} Created invoice object
   */
  async createInvoice(invoiceData) {
    try {
      logger.debug(`Creating QuickBooks invoice`);
      const client = this.getClient();
      const response = await client.post('/invoice', invoiceData);
      logger.info(`Successfully created QuickBooks invoice`);
      return response.data.Invoice;
    } catch (error) {
      logger.error(`Error creating QuickBooks invoice:`, error.message);
      throw error;
    }
  }
}

module.exports = QuickBooksConnector;
