const { Router } = require('express');
const { check } = require('express-validator')
const { login, googleSignIn, register, loginWithPhoneNumber, verifyPhoneNumber } = require('../controllers/auth.controller');
const { validateLoginEmail } = require('../helpers/db_validators.helper');
const { Validator } = require('../middlewares/validator.middleware');
// const { postData } = require('../controllers/users.controller');
const router = Router()

router.post('/login',[
    check('email', 'El email es obligatorio.').not().isEmpty(),
    check('email', 'No es un correo válido.').isEmail(),
    check('password', 'El password es obligatorio.').not().isEmpty(),
    check('email').custom( validateLoginEmail ),
    Validator
], login);

router.post('/register',[
    check('name', 'El nombre es obligatorio.').not().isEmpty(),
    check('phone', 'El teléfono es obligatorio.').not().isEmpty(),
    check('phone', 'No es un teléfono válido.').isMobilePhone('any'),
    check('password', 'El password es obligatorio.').not().isEmpty(),
    check('password', 'El password debe contener más de 6 caracteres.').isLength({ min: 6 }),
    // check('email').custom( validateEmail ),
    Validator
], register);

router.post('/phone-login', [
    check('phone', 'El teléfono es obligatorio.').not().isEmpty(),
    check('phone', 'No es un teléfono válido.').isMobilePhone('any'),
    Validator
], loginWithPhoneNumber);

router.post('/phone-verify', [
    check('phone', 'El teléfono es obligatorio.').not().isEmpty(),
    check('phone', 'No es un teléfono válido.').isMobilePhone('any'),
    check('otp', 'El OTP es obligatorio.').not().isEmpty(),
    Validator
], verifyPhoneNumber);

router.post('/google-auth',[
    check('id_token', 'Google Token es obligatorio.').not().isEmpty(),
    Validator
], googleSignIn);

module.exports = router