const { Router } = require('express');
const { check, body } = require('express-validator')
const { getData, postData, updateData, deleteData, getProfile } = require('../controllers/module_permission_role.controller');
const { validateModuleById, validateRoleById, existProfile, validateProfileById, validatePermissionById } = require('../helpers/db_validators.helper');
const { checkRoleAuth } = require('../middlewares/role-validator.middleware');
const { validarJWT } = require('../middlewares/validar-jwt.middleware');
const { Validator } = require('../middlewares/validator.middleware');
const router = Router()

router.get('/', getData);
router.get('/:role_id', getProfile);
router.post('/',[
    check('module', 'El módulo es obligatorio.').not().isEmpty(),
    check('module', 'No es un id válido.').isMongoId(),
    check('module').custom( validateModuleById ),
    check('role', 'El rol es obligatoria.').not().isEmpty(),
    check('role').custom( validateRoleById ),
    check('role', 'No es un id válido.').isMongoId(),
    body(['module', 'role']).custom( existProfile ),
    Validator,
    check('permissions.*', 'No es un id válido.').isMongoId(),
    Validator,
    check('permissions.*').custom( validatePermissionById ),
    Validator
], postData);
router.put('/:id', [
    check('id').custom( validateProfileById ),
    check('module', 'El módulo es obligatorio.').not().isEmpty(),
    check('module', 'No es un id válido.').isMongoId(),
    check('module').custom( validateModuleById ),
    check('role', 'El rol es obligatoria.').not().isEmpty(),
    check('role').custom( validateRoleById ),
    check('role', 'No es un id válido.').isMongoId(),
    check('permissions.*', 'No es un id válido.').isMongoId(),
    Validator,
    check('permissions.*').custom( validatePermissionById ),
    Validator
], updateData);

router.delete('/:id', [
    validarJWT,
    checkRoleAuth(['SUPER_ROLE', 'ADMIN_ROLE']),
    check('id', 'No es un id válido.').isMongoId(),
    check('id').custom( validateProfileById ),
], deleteData);

module.exports = router