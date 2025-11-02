/**
 * Example Usage of HubSpot-QuickBooks Integration
 * 
 * This file demonstrates different ways to use the integration
 */

const Integration = require('../src/index');

// Example 1: Basic one-time sync
async function exampleOneTimeSync() {
  console.log('=== Example 1: One-Time Sync ===\n');
  
  const integration = new Integration();
  
  try {
    await integration.initialize();
    const results = await integration.runOnce();
    
    console.log('Sync Results:');
    console.log(`- Contacts synced: ${results.contactsToCustomers.success}`);
    console.log(`- Contacts failed: ${results.contactsToCustomers.failed}`);
    console.log(`- Deals synced: ${results.dealsToInvoices.success}`);
    console.log(`- Deals failed: ${results.dealsToInvoices.failed}`);
    console.log(`- Duration: ${(results.endTime - results.startTime) / 1000}s`);
  } catch (error) {
    console.error('Sync failed:', error.message);
  }
}

// Example 2: Continuous sync with custom interval
async function exampleContinuousSync() {
  console.log('=== Example 2: Continuous Sync ===\n');
  
  const integration = new Integration();
  
  try {
    await integration.initialize();
    integration.startContinuousSync();
    
    console.log('Integration is running...');
    console.log('Press Ctrl+C to stop');
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\nShutting down...');
      await integration.shutdown();
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start:', error.message);
  }
}

// Example 3: Using individual sync methods
async function exampleSelectiveSync() {
  console.log('=== Example 3: Selective Sync ===\n');
  
  const integration = new Integration();
  
  try {
    await integration.initialize();
    
    // Sync only contacts to customers
    console.log('Syncing contacts to customers...');
    const contactResults = await integration.syncService.syncContactsToCustomers();
    console.log(`Synced ${contactResults.success} contacts`);
    
    // Optionally sync deals later
    console.log('\nSyncing deals to invoices...');
    const dealResults = await integration.syncService.syncDealsToInvoices();
    console.log(`Synced ${dealResults.success} deals`);
  } catch (error) {
    console.error('Sync failed:', error.message);
  }
}

// Example 4: Error handling and monitoring
async function exampleWithMonitoring() {
  console.log('=== Example 4: Sync with Monitoring ===\n');
  
  const integration = new Integration();
  
  try {
    await integration.initialize();
    const results = await integration.runOnce();
    
    // Check for errors
    if (results.contactsToCustomers.failed > 0) {
      console.log('\nContact sync errors:');
      results.contactsToCustomers.errors.forEach(err => {
        console.log(`- Contact ${err.contactId}: ${err.error}`);
      });
    }
    
    if (results.dealsToInvoices.failed > 0) {
      console.log('\nDeal sync errors:');
      results.dealsToInvoices.errors.forEach(err => {
        console.log(`- Deal ${err.dealId}: ${err.error}`);
      });
    }
    
    // Calculate success rate
    const totalAttempts = results.contactsToCustomers.success + 
                         results.contactsToCustomers.failed +
                         results.dealsToInvoices.success + 
                         results.dealsToInvoices.failed;
    const totalSuccess = results.contactsToCustomers.success + 
                        results.dealsToInvoices.success;
    const successRate = totalAttempts > 0 ? (totalSuccess / totalAttempts * 100).toFixed(2) : 0;
    
    console.log(`\nOverall success rate: ${successRate}%`);
  } catch (error) {
    console.error('Sync failed:', error.message);
  }
}

// Run examples based on command line argument
const examples = {
  'once': exampleOneTimeSync,
  'continuous': exampleContinuousSync,
  'selective': exampleSelectiveSync,
  'monitoring': exampleWithMonitoring,
};

const exampleName = process.argv[2] || 'once';
const exampleFunction = examples[exampleName];

if (exampleFunction) {
  exampleFunction().catch(error => {
    console.error('Example failed:', error.message);
    process.exit(1);
  });
} else {
  console.log('Available examples:');
  console.log('  node example-usage.js once       - One-time sync');
  console.log('  node example-usage.js continuous - Continuous sync');
  console.log('  node example-usage.js selective  - Selective sync');
  console.log('  node example-usage.js monitoring - Sync with monitoring');
}
