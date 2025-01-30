const { Router } = require('express');
const { check } = require('express-validator')
const { getData, postData, updateData, deleteData } = require('../controllers/event_participation_mode.controller');
const { validateEventParticipationModeById } = require('../helpers/db_validators.helper');
const { checkRoleAuth } = require('../middlewares/role-validator.middleware');
const { validarJWT } = require('../middlewares/validar-jwt.middleware');
const { Validator } = require('../middlewares/validator.middleware');
const router = Router()

router.get('/', [
    checkRoleAuth(['SUPER_ROLE', 'ADMIN_ROLE']),
], getData);
router.post('/',[
    checkRoleAuth(['SUPER_ROLE', 'ADMIN_ROLE']),
    check('name', 'Este campo es obligatorio.').not().isEmpty(),
    Validator
], postData);
router.put('/:id', [
    checkRoleAuth(['SUPER_ROLE', 'ADMIN_ROLE']),
    check('id', 'No es un id válido.').isMongoId(),
    check('id').custom( validateEventParticipationModeById ),
    check('name', 'Este campo es obligatorio.').not().isEmpty(),
    check('status', 'El campo debe ser de tipo Boolean.').optional().isBoolean(),
    Validator
], updateData);

router.delete('/:id', [
    validarJWT,
    checkRoleAuth(['SUPER_ROLE', 'ADMIN_ROLE']),
    check('id', 'No es un id válido.').isMongoId(),
    check('id').custom( validateEventParticipationModeById ),
    Validator
], deleteData);

module.exports = router