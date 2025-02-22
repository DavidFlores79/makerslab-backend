const { Router } = require('express');
const { validarJWT, verifyGuestToken } = require('../middlewares/validar-jwt.middleware');
const { Validator } = require('../middlewares/validator.middleware');
const { getStates, getOcuppations, getEventParticipationModes, getPaymentMethods, getPaymentStatus } = require('../controllers/catalogs.controller');
const router = Router()

router.get('/states',[
    verifyGuestToken,
], getStates);

router.get('/occupations',[
    verifyGuestToken,
], getOcuppations);

router.get('/participation-modes',[
    verifyGuestToken,
], getEventParticipationModes);

router.get('/payment-methods',[
    verifyGuestToken,
], getPaymentMethods);

router.get('/payment-status',[
    verifyGuestToken,
], getPaymentStatus);

module.exports = router