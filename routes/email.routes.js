const { Router } = require('express');
const { verifyGuestToken, validarJWT } = require('../middlewares/validar-jwt.middleware');
const { sendContactEmail } = require('../controllers/email.controller');
const router = Router()

router.post('/',[
    verifyGuestToken,
], sendContactEmail);

router.post('/notification',[
    validarJWT,
], sendInformacionEmail);

module.exports = router