const mongoose = require('mongoose');
const os = require('os');

/**
 * Basic health check endpoint
 * Returns 200 if the server is running
 */
const healthCheck = async (req, res) => {
  try {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
};

/**
 * Readiness probe - checks if the application is ready to serve traffic
 * Verifies database connection and other critical dependencies
 */
const readinessCheck = async (req, res) => {
  try {
    const checks = {
      database: 'unknown',
      timestamp: new Date().toISOString(),
    };

    // Check database connection
    if (mongoose.connection.readyState === 1) {
      checks.database = 'connected';
      
      // Optionally ping the database to ensure it's responsive
      await mongoose.connection.db.admin().ping();
      
      res.status(200).json({
        status: 'ready',
        checks,
      });
    } else {
      checks.database = 'disconnected';
      res.status(503).json({
        status: 'not ready',
        checks,
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
};

/**
 * Liveness probe - checks if the application is alive
 * Returns 200 if the process is running
 */
const livenessCheck = async (req, res) => {
  try {
    res.status(200).json({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
};

/**
 * Application information endpoint
 * Returns metadata about the application
 */
const getInfo = async (req, res) => {
  try {
    const packageJson = require('../package.json');
    
    const info = {
      application: {
        name: packageJson.name || 'congreso-backend',
        version: packageJson.version || '1.0.0',
        description: packageJson.description || 'Backend API',
        environment: process.env.NODE_ENV || 'development',
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: Math.floor(process.uptime()),
        hostname: os.hostname(),
        cpus: os.cpus().length,
        totalMemory: `${Math.round(os.totalmem() / 1024 / 1024)} MB`,
        freeMemory: `${Math.round(os.freemem() / 1024 / 1024)} MB`,
      },
      database: {
        status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        name: mongoose.connection.name || 'N/A',
        host: mongoose.connection.host || 'N/A',
      },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(info);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
};

module.exports = {
  healthCheck,
  readinessCheck,
  livenessCheck,
  getInfo,
};
