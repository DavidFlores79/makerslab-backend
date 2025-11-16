/**
 * Configuration Service
 * Implements caching and database override for configuration values
 * Follows best practices from Node.js ecosystem
 */

const Configuration = require('../models/configuration.model');
const NodeCache = require('node-cache');
const appConfig = require('./app.config');

class ConfigurationService {
  constructor() {
    // Initialize cache with TTL from app config
    this.cache = new NodeCache({
      stdTTL: appConfig.cache.ttl,
      checkperiod: appConfig.cache.checkPeriod,
    });
    
    this.CACHE_KEY = 'app_configuration';
  }

  /**
   * Get configuration with caching
   * Priority: Cache -> Database -> Environment Variables
   */
  async getConfiguration() {
    // Try cache first
    const cached = this.cache.get(this.CACHE_KEY);
    if (cached) {
      return cached;
    }

    // Fetch from database
    let dbConfig = await Configuration.findOne();
    
    // If no config in DB, create default from env variables
    if (!dbConfig) {
      dbConfig = new Configuration({
        companyName: appConfig.app.name,
        companyLogo: appConfig.app.logo,
        chatLimits: appConfig.chat.limits,
        userLimits: appConfig.user,
      });
      await dbConfig.save();
    }

    // Merge with environment config (env variables take precedence for sensitive data)
    const mergedConfig = {
      ...dbConfig.toObject(),
      // Override with app config for system-level settings
      jwt: appConfig.jwt,
      openai: appConfig.openai,
      email: appConfig.email,
      cloudinary: appConfig.cloudinary,
    };

    // Cache the result
    this.cache.set(this.CACHE_KEY, mergedConfig);
    
    return mergedConfig;
  }

  /**
   * Get chat limits specifically (most frequently accessed)
   */
  async getChatLimits() {
    const config = await this.getConfiguration();
    return config.chatLimits || appConfig.chat.limits;
  }

  /**
   * Get user limits
   */
  async getUserLimits() {
    const config = await this.getConfiguration();
    return config.userLimits || appConfig.user;
  }

  /**
   * Update configuration and invalidate cache
   */
  async updateConfiguration(updates) {
    const config = await Configuration.findOne();
    
    if (!config) {
      const newConfig = new Configuration(updates);
      await newConfig.save();
      this.invalidateCache();
      return newConfig;
    }

    // Update existing configuration
    Object.keys(updates).forEach(key => {
      config[key] = updates[key];
    });

    await config.save();
    this.invalidateCache();
    
    return config;
  }

  /**
   * Invalidate cache (call this when configuration is updated)
   */
  invalidateCache() {
    this.cache.del(this.CACHE_KEY);
  }

  /**
   * Force refresh configuration from database
   */
  async refresh() {
    this.invalidateCache();
    return this.getConfiguration();
  }

  /**
   * Get all configuration (for admin panel)
   */
  async getAllConfiguration() {
    return this.getConfiguration();
  }
}

// Export singleton instance
module.exports = new ConfigurationService();
