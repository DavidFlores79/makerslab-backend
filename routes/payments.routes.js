const { Router } = require('express');
const { check } = require('express-validator')
const { getData, postData, updateData, deleteData, getPaymentMethods } = require('../controllers/payment.controller');
const { validatePaymentById, validatePaymentMethodById } = require('../helpers/db_validators.helper');
const { checkRoleAuth } = require('../middlewares/role-validator.middleware');
const { validarJWT } = require('../middlewares/validar-jwt.middleware');
const { Validator } = require('../middlewares/validator.middleware');
const { checkPermissions } = require('../middlewares/permission-validator.middleware');
const router = Router()

router.get('/', [
    checkPermissions(['VISUALIZAR'])
], getData);
router.get('/payment-methods', getPaymentMethods);
router.post('/',[
    checkPermissions(['CREAR']),
    check('description', 'La descripción es obligatorio.').not().isEmpty(),
    check('status', 'El status debe ser de tipo Boolean.').optional().isBoolean(),
    check('payment_method', 'No es un id válido.').isMongoId(),
    check('payment_method').custom( validatePaymentMethodById ),
    Validator
], postData);
router.put('/:id', [
    checkPermissions(['MODIFICAR']),
    check('id', 'No es un id válido.').isMongoId(),
    check('id').custom( validatePaymentById ),
    check('payment_method._id', 'No es un id válido.').isMongoId().custom( validatePaymentMethodById ).optional(),
    Validator
], updateData);

router.delete('/:id', [
    // checkPermissions(['ELIMINAR']),
    validarJWT,
    checkRoleAuth(['SUPER_ROLE', 'ADMIN_ROLE']),
    check('id', 'No es un id válido.').isMongoId(),
    check('id').custom( validatePaymentById ),
    Validator
], deleteData);

module.exports = router