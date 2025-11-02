const logger = require('../utils/logger');

/**
 * Sync Service
 * Coordinates synchronization between HubSpot and QuickBooks
 */
class SyncService {
  constructor(hubspotConnector, quickbooksConnector) {
    this.hubspot = hubspotConnector;
    this.quickbooks = quickbooksConnector;
  }

  /**
   * Transform HubSpot contact to QuickBooks customer format
   * @param {Object} hubspotContact - HubSpot contact object
   * @returns {Object} QuickBooks customer object
   */
  transformContactToCustomer(hubspotContact) {
    const properties = hubspotContact.properties || {};
    return {
      DisplayName: `${properties.firstname || ''} ${properties.lastname || ''}`.trim() || 'Unknown',
      GivenName: properties.firstname || '',
      FamilyName: properties.lastname || '',
      PrimaryEmailAddr: properties.email ? { Address: properties.email } : undefined,
      PrimaryPhone: properties.phone ? { FreeFormNumber: properties.phone } : undefined,
      CompanyName: properties.company || '',
    };
  }

  /**
   * Transform HubSpot deal to QuickBooks invoice format
   * @param {Object} hubspotDeal - HubSpot deal object
   * @param {string} customerId - QuickBooks customer ID
   * @returns {Object} QuickBooks invoice object
   */
  transformDealToInvoice(hubspotDeal, customerId) {
    const properties = hubspotDeal.properties || {};
    return {
      CustomerRef: { value: customerId },
      Line: [
        {
          DetailType: 'SalesItemLineDetail',
          Amount: parseFloat(properties.amount || 0),
          Description: properties.dealname || 'Deal from HubSpot',
          SalesItemLineDetail: {
            Qty: 1,
            UnitPrice: parseFloat(properties.amount || 0),
          },
        },
      ],
    };
  }

  /**
   * Sync contacts from HubSpot to QuickBooks as customers
   * @returns {Promise<Object>} Sync results
   */
  async syncContactsToCustomers() {
    logger.info('Starting contact to customer sync...');
    const results = {
      success: 0,
      failed: 0,
      errors: [],
    };

    try {
      // Fetch contacts from HubSpot
      const hubspotContacts = await this.hubspot.getContacts();
      
      // Fetch existing customers from QuickBooks
      const quickbooksCustomers = await this.quickbooks.getCustomers();
      const existingCustomerEmails = new Set(
        quickbooksCustomers
          .filter(c => c.PrimaryEmailAddr)
          .map(c => c.PrimaryEmailAddr.Address.toLowerCase())
      );

      // Sync each contact
      for (const contact of hubspotContacts) {
        try {
          const email = contact.properties?.email?.toLowerCase();
          
          // Skip if customer already exists in QuickBooks
          if (email && existingCustomerEmails.has(email)) {
            logger.debug(`Customer with email ${email} already exists, skipping`);
            continue;
          }

          const customerData = this.transformContactToCustomer(contact);
          await this.quickbooks.createCustomer(customerData);
          results.success++;
        } catch (error) {
          logger.warn(`Failed to sync contact ${contact.id}:`, error.message);
          results.failed++;
          results.errors.push({
            contactId: contact.id,
            error: error.message,
          });
        }
      }

      logger.info(`Contact sync completed: ${results.success} successful, ${results.failed} failed`);
      return results;
    } catch (error) {
      logger.error('Error in contact sync:', error.message);
      throw error;
    }
  }

  /**
   * Sync deals from HubSpot to QuickBooks as invoices
   * @returns {Promise<Object>} Sync results
   */
  async syncDealsToInvoices() {
    logger.info('Starting deal to invoice sync...');
    const results = {
      success: 0,
      failed: 0,
      errors: [],
    };

    try {
      // Fetch deals from HubSpot
      const hubspotDeals = await this.hubspot.getDeals();
      
      // Fetch customers from QuickBooks to map deals
      const quickbooksCustomers = await this.quickbooks.getCustomers();

      // Sync each deal
      for (const deal of hubspotDeals) {
        try {
          // NOTE: This is simplified for demonstration purposes
          // In production, you should:
          // 1. Match deals to customers based on HubSpot contact associations
          // 2. Use deal properties to find the correct customer
          // 3. Handle cases where customer doesn't exist in QuickBooks
          // TODO: Implement proper customer matching logic
          if (quickbooksCustomers.length === 0) {
            logger.warn('No QuickBooks customers found, skipping deal sync');
            break;
          }

          const customerId = quickbooksCustomers[0].Id;
          const invoiceData = this.transformDealToInvoice(deal, customerId);
          await this.quickbooks.createInvoice(invoiceData);
          results.success++;
        } catch (error) {
          logger.warn(`Failed to sync deal ${deal.id}:`, error.message);
          results.failed++;
          results.errors.push({
            dealId: deal.id,
            error: error.message,
          });
        }
      }

      logger.info(`Deal sync completed: ${results.success} successful, ${results.failed} failed`);
      return results;
    } catch (error) {
      logger.error('Error in deal sync:', error.message);
      throw error;
    }
  }

  /**
   * Perform a full bidirectional sync
   * @returns {Promise<Object>} Combined sync results
   */
  async performFullSync() {
    logger.info('Starting full bidirectional sync...');
    
    const results = {
      contactsToCustomers: null,
      dealsToInvoices: null,
      startTime: new Date(),
      endTime: null,
    };

    try {
      // Sync contacts to customers
      results.contactsToCustomers = await this.syncContactsToCustomers();

      // Sync deals to invoices
      results.dealsToInvoices = await this.syncDealsToInvoices();

      results.endTime = new Date();
      const duration = (results.endTime - results.startTime) / 1000;
      logger.info(`Full sync completed in ${duration.toFixed(2)} seconds`);

      return results;
    } catch (error) {
      logger.error('Error in full sync:', error.message);
      results.endTime = new Date();
      throw error;
    }
  }
}

module.exports = SyncService;
