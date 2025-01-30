const { Router } = require('express');
const { check } = require('express-validator')
const { getData, postData, updateData, deleteData } = require('../controllers/occupation.controller');
const { validateSummaryStatusById } = require('../helpers/db_validators.helper');
const { checkRoleAuth } = require('../middlewares/role-validator.middleware');
const { validarJWT } = require('../middlewares/validar-jwt.middleware');
const { Validator } = require('../middlewares/validator.middleware');
const { checkPermissions } = require('../middlewares/permission-validator.middleware');
const router = Router()

router.get('/', [
    checkPermissions(['VISUALIZAR'])
], getData);
router.post('/',[
    checkPermissions(['CREAR']),
    check('title', 'El título es obligatorio.').not().isEmpty(),
    check('comments', 'Debe ser un string').optional().isString(),
    check('status', 'El status debe ser de tipo Boolean.').optional().isBoolean(),
    Validator
], postData);
router.put('/:id', [
    checkPermissions(['MODIFICAR']),
    check('id', 'No es un id válido.').isMongoId(),
    check('id').custom( validateSummaryStatusById ),
    Validator
], updateData);

router.delete('/:id', [
    checkPermissions(['ELIMINAR']),
    validarJWT,
    checkRoleAuth(['SUPER_ROLE', 'ADMIN_ROLE']),
    check('id', 'No es un id válido.').isMongoId(),
    check('id').custom( validateSummaryStatusById ),
    Validator
], deleteData);

module.exports = router