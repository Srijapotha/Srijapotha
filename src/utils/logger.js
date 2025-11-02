const { config } = require('../config');

/**
 * Simple logging utility for the integration
 */
class Logger {
  constructor(level = 'info') {
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
    };
    this.level = this.levels[level] || this.levels.info;
  }

  error(message, ...args) {
    if (this.level >= this.levels.error) {
      console.error(`[ERROR] ${new Date().toISOString()}:`, message, ...args);
    }
  }

  warn(message, ...args) {
    if (this.level >= this.levels.warn) {
      console.warn(`[WARN] ${new Date().toISOString()}:`, message, ...args);
    }
  }

  info(message, ...args) {
    if (this.level >= this.levels.info) {
      console.info(`[INFO] ${new Date().toISOString()}:`, message, ...args);
    }
  }

  debug(message, ...args) {
    if (this.level >= this.levels.debug) {
      console.log(`[DEBUG] ${new Date().toISOString()}:`, message, ...args);
    }
  }
}

// Export a singleton instance
module.exports = new Logger(config.logging.level);
