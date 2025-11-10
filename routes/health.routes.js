const { Router } = require('express');
const {
  healthCheck,
  readinessCheck,
  livenessCheck,
  getInfo,
} = require('../controllers/health.controller');

const router = Router();

/**
 * @route   GET /health
 * @desc    Basic health check - returns 200 if server is running
 * @access  Public
 */
router.get('/', healthCheck);

/**
 * @route   GET /health/ready
 * @desc    Readiness probe - checks if app is ready to serve traffic
 * @access  Public
 */
router.get('/ready', readinessCheck);

/**
 * @route   GET /health/live
 * @desc    Liveness probe - checks if app is alive
 * @access  Public
 */
router.get('/live', livenessCheck);

module.exports = router;
