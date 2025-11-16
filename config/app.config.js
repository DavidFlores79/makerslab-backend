/**
 * Application Configuration
 * Follows Node.js best practices:
 * - Environment variables for deployment-specific settings
 * - Hierarchical configuration structure
 * - Type safety and validation
 * - Single source of truth
 */

const config = {
  // Server Configuration
  server: {
    port: Number(process.env.PORT) || 3000,
    env: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || '*',
  },

  // Database Configuration
  database: {
    uri: process.env.MONGODB,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '2h',
  },

  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    modelVision: process.env.OPENAI_MODEL_VISION || 'gpt-4o',
    modelText: process.env.OPENAI_MODEL_TEXT || 'gpt-4o-mini',
  },

  // Email Configuration  
  email: {
    smtp: {
      host: process.env.SMTP2GO_HOST,
      port: Number(process.env.SMTP2GO_PORT) || 587,
      username: process.env.SMTP2GO_USERNAME,
      password: process.env.SMTP2GO_PASSWORD,
      from: process.env.SMTP2GO_FROM_NAME,
    },
    recipients: (process.env.MAIL_RECIPIENTS || '').split(',').filter(Boolean),
  },

  // Cloudinary Configuration
  cloudinary: {
    cloudName: 'dltvxi4tm',
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  // Chat Limits (Environment-based with database override capability)
  // These are DEFAULT values - can be overridden by database Configuration
  chat: {
    limits: {
      maxMessagesInDB: Number(process.env.CHAT_MAX_MESSAGES_IN_DB) || 30,
      maxMessagesToAI: Number(process.env.CHAT_MAX_MESSAGES_TO_AI) || 20,
      maxUserMessagesPerDay: Number(process.env.CHAT_MAX_USER_MESSAGES_PER_DAY) || 100,
    },
  },

  // User Limits
  user: {
    maxPayments: Number(process.env.USER_MAX_PAYMENTS) || 2,
    maxSummaries: Number(process.env.USER_MAX_SUMMARIES) || 1,
  },

  // Application defaults (can be overridden by database Configuration)
  app: {
    name: process.env.APP_NAME || 'MakersLab',
    logo: process.env.APP_LOGO || 'https://www.congresopromocionsalud.com/assets/public/img/brand/logo_congreso.png',
  },

  // Feature Flags
  features: {
    enableChatUsageTracking: process.env.ENABLE_CHAT_USAGE_TRACKING !== 'false',
    enableEmailNotifications: process.env.ENABLE_EMAIL_NOTIFICATIONS !== 'false',
  },

  // Cache Configuration
  cache: {
    ttl: Number(process.env.CACHE_TTL) || 300, // 5 minutes default
    checkPeriod: Number(process.env.CACHE_CHECK_PERIOD) || 600, // 10 minutes
  },
};

// Validation function
function validateConfig() {
  const required = [
    'database.uri',
    'jwt.secret',
    'openai.apiKey',
  ];

  const missing = [];
  
  required.forEach(path => {
    const keys = path.split('.');
    let value = config;
    
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined || value === null || value === '') {
        missing.push(path);
        break;
      }
    }
  });

  if (missing.length > 0) {
    throw new Error(`Missing required configuration: ${missing.join(', ')}`);
  }
}

// Validate on load (only in production)
if (config.server.env === 'production') {
  validateConfig();
}

module.exports = config;
