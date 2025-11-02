const { config, validateConfig } = require('./config');
const logger = require('./utils/logger');
const HubSpotConnector = require('./connectors/hubspot');
const QuickBooksConnector = require('./connectors/quickbooks');
const SyncService = require('./services/syncService');

/**
 * Main application entry point
 * Initializes and runs the HubSpot-QuickBooks integration
 */
class Integration {
  constructor() {
    this.hubspot = null;
    this.quickbooks = null;
    this.syncService = null;
    this.syncInterval = null;
  }

  /**
   * Initialize the integration
   */
  async initialize() {
    try {
      logger.info('Initializing HubSpot-QuickBooks Integration...');

      // Validate configuration
      validateConfig();

      // Initialize connectors
      this.hubspot = new HubSpotConnector();
      this.quickbooks = new QuickBooksConnector();

      // Authenticate with QuickBooks
      await this.quickbooks.authenticate();

      // Initialize sync service
      this.syncService = new SyncService(this.hubspot, this.quickbooks);

      logger.info('Integration initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize integration:', error.message);
      throw error;
    }
  }

  /**
   * Run a one-time sync
   */
  async runOnce() {
    try {
      logger.info('Running one-time sync...');
      const results = await this.syncService.performFullSync();
      logger.info('One-time sync completed:', JSON.stringify(results, null, 2));
      return results;
    } catch (error) {
      logger.error('One-time sync failed:', error.message);
      throw error;
    }
  }

  /**
   * Start continuous sync with scheduled intervals
   */
  startContinuousSync() {
    const intervalMs = config.sync.intervalMinutes * 60 * 1000;
    logger.info(`Starting continuous sync (interval: ${config.sync.intervalMinutes} minutes)`);

    // Run initial sync
    this.syncService.performFullSync().catch(error => {
      logger.error('Initial sync failed:', error.message);
    });

    // Schedule recurring syncs
    this.syncInterval = setInterval(async () => {
      try {
        await this.syncService.performFullSync();
      } catch (error) {
        logger.error('Scheduled sync failed:', error.message);
      }
    }, intervalMs);

    logger.info('Continuous sync started');
  }

  /**
   * Stop continuous sync
   */
  stopContinuousSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      logger.info('Continuous sync stopped');
    }
  }

  /**
   * Shutdown the integration gracefully
   */
  async shutdown() {
    logger.info('Shutting down integration...');
    this.stopContinuousSync();
    logger.info('Integration shutdown complete');
  }
}

/**
 * Main execution function
 */
async function main() {
  const integration = new Integration();

  try {
    await integration.initialize();

    // Check command line arguments
    const args = process.argv.slice(2);
    const mode = args[0] || 'once';

    if (mode === 'continuous') {
      integration.startContinuousSync();

      // Handle graceful shutdown
      process.on('SIGINT', async () => {
        logger.info('Received SIGINT, shutting down...');
        await integration.shutdown();
        process.exit(0);
      });

      process.on('SIGTERM', async () => {
        logger.info('Received SIGTERM, shutting down...');
        await integration.shutdown();
        process.exit(0);
      });
    } else {
      // Run once and exit
      await integration.runOnce();
      process.exit(0);
    }
  } catch (error) {
    logger.error('Fatal error:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = Integration;
