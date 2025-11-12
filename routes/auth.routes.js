const { Router } = require('express');
const { check } = require('express-validator')
const { login, googleSignIn, register, verifyRegistrationOtp, loginWithPhoneNumber, verifyPhoneNumber, forgotPassword, resendOtp, changePassword } = require('../controllers/auth.controller');
const { validateLoginEmail } = require('../helpers/db_validators.helper');
const { Validator } = require('../middlewares/validator.middleware');
const { validateJWT } = require('../middlewares/validar-jwt.middleware');
// const { postData } = require('../controllers/users.controller');
const router = Router()

router.post('/login',[
    check('email', 'El email es obligatorio.').not().isEmpty(),
    check('email', 'No es un correo válido.').isEmail(),
    check('password', 'El password es obligatorio.').not().isEmpty(),
    check('email').custom( validateLoginEmail ),
    Validator
], login);

router.post('/signup',[
    check('name', 'El nombre es obligatorio.').not().isEmpty(),
    check('phone', 'El teléfono es obligatorio.').not().isEmpty(),
    check('phone', 'No es un teléfono válido.').isMobilePhone('any'),
    check('password', 'El password es obligatorio.').not().isEmpty(),
    check('password', 'El password debe contener más de 6 caracteres.').isLength({ min: 6 }),
    // check('email').custom( validateEmail ),
    Validator
], register);

router.post('/verify-registration', [
    check('registrationId', 'El registrationId es obligatorio.').not().isEmpty(),
    check('registrationId', 'No es un registrationId válido.').isMongoId(),
    check('otp', 'El OTP es obligatorio.').not().isEmpty(),
    check('otp', 'El OTP debe tener 6 dígitos.').isLength({ min: 6, max: 6 }),
    Validator
], verifyRegistrationOtp);

router.post('/phone-login', [
    check('phone', 'El teléfono es obligatorio.').not().isEmpty(),
    check('phone', 'No es un teléfono válido.').isMobilePhone('any'),
    Validator
], loginWithPhoneNumber);

router.post('/forgot-password', [
    check('phone', 'El teléfono es obligatorio.').not().isEmpty(),
    check('phone', 'No es un teléfono válido.').matches(/^\+[1-9]\d{1,14}$/),
    Validator
], forgotPassword);

router.post('/phone-verify', [
    check('resetRequestId', 'El resetRequestId es obligatorio.').not().isEmpty(),
    check('resetRequestId', 'No es un resetRequestId válido.').isMongoId(),
    check('otp', 'El OTP es obligatorio.').not().isEmpty(),
    Validator
], verifyPhoneNumber);

router.post('/resend-code', [
    // Supports both resetRequestId (password reset) and registrationId (signup)
    Validator
], resendOtp);

//change password
router.post('/change-password', [
    validateJWT,
    check('confirmPassword', 'El confirm password es obligatorio.').not().isEmpty(),
    check('newPassword', 'El nuevo password es obligatorio.').not().isEmpty(),
    //booth passwords must be the same
    check('newPassword').custom((value, { req }) => {
        if (value !== req.body.confirmPassword) {
            throw new Error('Los passwords no coinciden');
        }
        return true;
    }),
    Validator
], changePassword);

router.post('/google-auth',[
    check('id_token', 'Google Token es obligatorio.').not().isEmpty(),
    Validator
], googleSignIn);

module.exports = router