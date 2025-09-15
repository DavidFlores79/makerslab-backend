const { Router } = require('express');
const { validateJWT } = require('../middlewares/validar-jwt.middleware');
const { getConfigurations, updateConfigurations } = require('../controllers/configuration.controller');
const router = Router()

router.get('/', getConfigurations);
router.put('/', [
    validateJWT
], updateConfigurations);

module.exports = router