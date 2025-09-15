const { Router } = require('express');
const { verifyGuestToken, validateJWT } = require('../middlewares/validar-jwt.middleware');
const { sendContactEmail } = require('../controllers/email.controller');
const router = Router()

router.post('/',[
    verifyGuestToken,
], sendContactEmail);

router.post('/notification',[
    validateJWT,
], sendInformacionEmail);

module.exports = router