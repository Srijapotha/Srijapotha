# HubSpot-QuickBooks Integration

A robust, production-ready integration that seamlessly syncs data between HubSpot CRM and QuickBooks Online accounting software.

## 🚀 Features

- **Bidirectional Sync**: Synchronize contacts and deals between HubSpot and QuickBooks
- **Contact → Customer Sync**: Automatically create QuickBooks customers from HubSpot contacts
- **Deal → Invoice Sync**: Transform HubSpot deals into QuickBooks invoices
- **Continuous Sync**: Schedule automatic syncs at configurable intervals
- **Error Handling**: Comprehensive error logging and recovery mechanisms
- **Duplicate Prevention**: Smart detection to avoid creating duplicate records
- **Configurable**: Easy-to-configure via environment variables

## 📋 Architecture

```
┌──────────────┐         ┌─────────────────┐         ┌──────────────┐
│   HubSpot    │ ◄─────► │   Integration   │ ◄─────► │  QuickBooks  │
│     CRM      │         │     Service     │         │    Online    │
└──────────────┘         └─────────────────┘         └──────────────┘
     Contacts                                              Customers
     Deals                  Sync Engine                    Invoices
```

### Components

- **Connectors**: API clients for HubSpot and QuickBooks
- **Sync Service**: Business logic for data transformation and synchronization
- **Configuration**: Centralized configuration management
- **Logger**: Structured logging for monitoring and debugging

## 🛠️ Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- HubSpot account with API access
- QuickBooks Online account with API access

### Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Srijapotha/Srijapotha.git
   cd Srijapotha
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your credentials:
   ```env
   # HubSpot Configuration
   HUBSPOT_API_KEY=your_hubspot_api_key_here
   
   # QuickBooks Configuration
   QUICKBOOKS_CLIENT_ID=your_client_id_here
   QUICKBOOKS_CLIENT_SECRET=your_client_secret_here
   QUICKBOOKS_REALM_ID=your_realm_id_here
   QUICKBOOKS_ENVIRONMENT=sandbox  # or 'production'
   
   # Sync Settings
   SYNC_INTERVAL_MINUTES=60
   LOG_LEVEL=info
   ```

## 🔑 API Credentials Setup

### HubSpot API Key

1. Log in to your HubSpot account
2. Navigate to Settings → Integrations → API Key
3. Generate a new API key or use existing one
4. Copy the key to your `.env` file

### QuickBooks OAuth Credentials

1. Go to [QuickBooks Developer Portal](https://developer.intuit.com/)
2. Create a new app or select existing one
3. Get your Client ID and Client Secret from the app keys section
4. Set up OAuth 2.0 redirect URI
5. Copy credentials to your `.env` file

## 🎯 Usage

### One-Time Sync

Run a single synchronization:

```bash
npm start
```

or

```bash
node src/index.js once
```

### Continuous Sync

Run continuous sync with scheduled intervals:

```bash
node src/index.js continuous
```

This will sync data every 60 minutes (configurable via `SYNC_INTERVAL_MINUTES`).

### Programmatic Usage

```javascript
const Integration = require('./src/index');

const integration = new Integration();

// Initialize
await integration.initialize();

// Run one-time sync
const results = await integration.runOnce();
console.log('Sync results:', results);

// Or start continuous sync
integration.startContinuousSync();
```

## 📊 Sync Process

### Contact to Customer Sync

1. Fetches all contacts from HubSpot
2. Fetches existing customers from QuickBooks
3. Compares by email to avoid duplicates
4. Creates new customers in QuickBooks for new contacts
5. Maps fields:
   - `firstname` + `lastname` → `DisplayName`
   - `email` → `PrimaryEmailAddr`
   - `phone` → `PrimaryPhone`
   - `company` → `CompanyName`

### Deal to Invoice Sync

1. Fetches all deals from HubSpot
2. Matches deals to QuickBooks customers
3. Creates invoices in QuickBooks
4. Maps fields:
   - `dealname` → Invoice description
   - `amount` → Invoice amount
   - Contact association → Customer reference

## 🔧 Configuration Options

| Variable | Description | Default |
|----------|-------------|---------|
| `HUBSPOT_API_KEY` | HubSpot API authentication key | Required |
| `QUICKBOOKS_CLIENT_ID` | QuickBooks OAuth client ID | Required |
| `QUICKBOOKS_CLIENT_SECRET` | QuickBooks OAuth client secret | Required |
| `QUICKBOOKS_REALM_ID` | QuickBooks company ID | Required |
| `QUICKBOOKS_ENVIRONMENT` | Environment (sandbox/production) | sandbox |
| `SYNC_INTERVAL_MINUTES` | Minutes between syncs | 60 |
| `LOG_LEVEL` | Logging level (error/warn/info/debug) | info |

## 📝 Logging

The integration includes comprehensive logging:

- **ERROR**: Critical issues requiring immediate attention
- **WARN**: Non-critical issues that should be reviewed
- **INFO**: General information about sync progress
- **DEBUG**: Detailed information for troubleshooting

Example log output:
```
[INFO] 2025-11-02T12:00:00.000Z: Initializing HubSpot-QuickBooks Integration...
[INFO] 2025-11-02T12:00:01.000Z: Fetching contacts from HubSpot (limit: 100)
[INFO] 2025-11-02T12:00:02.000Z: Successfully fetched 45 contacts
[INFO] 2025-11-02T12:00:03.000Z: Fetching customers from QuickBooks (max: 100)
[INFO] 2025-11-02T12:00:04.000Z: Successfully fetched 32 customers
[INFO] 2025-11-02T12:00:05.000Z: Contact sync completed: 13 successful, 0 failed
```

## 🐛 Troubleshooting

### Common Issues

**Authentication Errors**
- Verify your API keys are correct
- Check that QuickBooks OAuth tokens are valid
- Ensure your app has necessary permissions

**Sync Failures**
- Check network connectivity
- Verify API rate limits haven't been exceeded
- Review logs for specific error messages

**Duplicate Records**
- Integration checks email addresses to prevent duplicates
- Manually review existing records before initial sync

## 🔒 Security Best Practices

- Never commit `.env` file to version control
- Store API credentials securely
- Use environment-specific credentials (sandbox vs production)
- Regularly rotate API keys
- Monitor API usage and logs
- Implement rate limiting for production use

## 🚀 Performance Optimization

- Batch API requests when possible
- Implement pagination for large datasets
- Use caching for frequently accessed data
- Monitor API rate limits
- Optimize sync intervals based on data volume

## 📈 Future Enhancements

- [ ] Support for custom field mappings
- [ ] Webhook-based real-time sync
- [ ] Support for more object types (companies, products)
- [ ] Advanced conflict resolution strategies
- [ ] Web-based configuration UI
- [ ] Sync statistics dashboard
- [ ] Multi-tenant support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

## 👩‍💻 Author

**Srija Potha**
- Email: pothasrija941@gmail.com
- LinkedIn: [p-sreeja-31b557230](https://linkedin.com/in/p-sreeja-31b557230)
- Portfolio: [portfolio-srijapotha.vercel.app](https://portfolio-srijapotha.vercel.app)

## 📞 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Contact via email: pothasrija941@gmail.com

---

⭐ **If you find this integration helpful, please give it a star!**
