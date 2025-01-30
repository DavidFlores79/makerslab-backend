const { Router } = require('express');
const { check } = require('express-validator')
const { getData, postData, updateData, deleteData } = require('../controllers/event_participant.controller');
const { validateUserById, validateEventParticipantById } = require('../helpers/db_validators.helper');
const { checkRoleAuth } = require('../middlewares/role-validator.middleware');
const { validarJWT } = require('../middlewares/validar-jwt.middleware');
const { Validator } = require('../middlewares/validator.middleware');
const { checkPermissions } = require('../middlewares/permission-validator.middleware');
const router = Router()

router.get('/', [
    checkRoleAuth(['SUPER_ROLE', 'ADMIN_ROLE']),
    // checkPermissions(['VISUALIZAR'])
], getData);
router.post('/',[
    // checkPermissions(['CREAR']),
    checkRoleAuth(['SUPER_ROLE', 'ADMIN_ROLE']),
    check('academic_degree_name', 'Este campo es obligatorio.').not().isEmpty(),
    check('institution', 'Este campo es obligatorio.').not().isEmpty(),
    check('country', 'Este campo es obligatorio.').not().isEmpty(),
    check('status', 'El status debe ser de tipo Boolean.').optional().isBoolean(),
    check('is_work_unpublished', 'La opción debe ser de tipo Boolean.').isBoolean(),
    check('owner', 'No es un id válido.').optional().isMongoId(),
    check('owner').optional().custom( validateUserById ),
    check('occupation', 'No es un id válido.').isMongoId(),
    // check('occupation').custom( validateOcupationById ),
    Validator
], postData);
router.put('/:id', [
    // checkPermissions(['MODIFICAR']),
    checkRoleAuth(['SUPER_ROLE', 'ADMIN_ROLE']),
    check('id', 'No es un id válido.').isMongoId(),
    check('id').custom( validateEventParticipantById ),
    check('academic_degree_name', 'Este campo es obligatorio.').not().isEmpty(),
    check('institution', 'Este campo es obligatorio.').not().isEmpty(),
    check('country', 'Este campo es obligatorio.').not().isEmpty(),
    check('status', 'El status debe ser de tipo Boolean.').optional().isBoolean(),
    check('is_work_unpublished', 'La opción debe ser de tipo Boolean.').optional().isBoolean(),
    check('owner', 'No es un id válido.').optional().isMongoId(),
    check('owner').optional().custom( validateUserById ),
    check('occupation', 'No es un id válido.').optional().isMongoId(),
    // check('occupation').optional().custom( validateOcupationById ),
    Validator
], updateData);

router.delete('/:id', [
    // checkPermissions(['ELIMINAR']),
    validarJWT,
    checkRoleAuth(['SUPER_ROLE', 'ADMIN_ROLE']),
    check('id', 'No es un id válido.').isMongoId(),
    check('id').custom( validateEventParticipantById ),
    Validator
], deleteData);

module.exports = router