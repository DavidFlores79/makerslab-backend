const { Router } = require('express');
const { validarJWT } = require('../middlewares/validar-jwt.middleware');
const { getConfigurations, updateConfigurations } = require('../controllers/configuration.controller');
const router = Router()

router.get('/', getConfigurations);
router.put('/', [
    validarJWT
], updateConfigurations);

module.exports = router