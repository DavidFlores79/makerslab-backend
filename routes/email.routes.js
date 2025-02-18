const { Router } = require('express');
const { verifyGuestToken } = require('../middlewares/validar-jwt.middleware');
const { Validator } = require('../middlewares/validator.middleware');
const { sendContactEmail } = require('../controllers/email.controller');
const router = Router()

router.post('/',[
    verifyGuestToken,
], sendContactEmail);

module.exports = router