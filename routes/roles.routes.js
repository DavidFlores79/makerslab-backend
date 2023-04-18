const { Router } = require('express');
const { check } = require('express-validator')
const { getData, postData, updateData, deleteData, showData } = require('../controllers/roles.controller');
const { existRoleName, validateRoleById, validateModulesById, validateModuleById } = require('../helpers/db_validators.helper');
const { checkRoleAuth } = require('../middlewares/role-validator.middleware');
const { validarJWT } = require('../middlewares/validar-jwt.middleware');
const { Validator } = require('../middlewares/validator.middleware');
const router = Router()

router.get('/', getData);
router.get('/:id', [
    check('id', 'No es un id válido.').isMongoId(),
    check('id').custom( validateRoleById ),
], showData);
router.post('/',[
    check('name', 'El nombre es obligatorio.').not().isEmpty(),
    check('status', 'El status debe ser de tipo Boolean.').isBoolean(),
    check('name').custom( existRoleName ),
    check('modules.*', 'No es un id válido.').isMongoId(),
    check('modules.*').custom( validateModuleById ),
    Validator
], postData);
router.put('/:id', [
    check('id', 'No es un id válido.').isMongoId(),
    check('id').custom( validateRoleById ),
    check('name').custom( existRoleName ),
    check('modules.*', 'No es un id válido.').isMongoId(),
    check('modules.*').custom( validateModuleById ),
    Validator
], updateData);

router.delete('/:id', [
    validarJWT,
    checkRoleAuth(['SUPER_ROLE', 'ADMIN_ROLE']),
    check('id', 'No es un id válido.').isMongoId(),
    check('id').custom( validateRoleById ),
    Validator
], deleteData);

module.exports = router