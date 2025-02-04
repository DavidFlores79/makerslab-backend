const { Router } = require('express');
const { validarJWT, verifyGuestToken } = require('../middlewares/validar-jwt.middleware');
const { Validator } = require('../middlewares/validator.middleware');
const { getStates, getOcuppations, getEventParticipationModes } = require('../controllers/catalogs.controller');
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

module.exports = router