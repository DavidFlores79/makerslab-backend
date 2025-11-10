const { Router } = require('express');
const { getInfo } = require('../controllers/health.controller');

const router = Router();

/**
 * @route   GET /info
 * @desc    Get application information (version, environment, uptime, system info)
 * @access  Public
 */
router.get('/', getInfo);

module.exports = router;
