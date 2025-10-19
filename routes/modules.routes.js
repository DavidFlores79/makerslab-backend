const { Router } = require('express');
const { check } = require('express-validator')
const { getData, postData, updateData, deleteData, getDatum } = require('../controllers/modules.controller');
const { validateRoute, validateModuleById, validatePermissionById } = require('../helpers/db_validators.helper');
const { checkRoleAuth } = require('../middlewares/role-validator.middleware');
const { validateJWT } = require('../middlewares/validar-jwt.middleware');
const { Validator } = require('../middlewares/validator.middleware');
const { checkPermissions } = require('../middlewares/permission-validator.middleware');
const router = Router()

router.get('/', [
    // checkPermissions(['VISUALIZAR'])
    validateJWT,
], getData);
router.get('/:id', [
    check('id', 'Invalid ID.').isMongoId(),
    check('id').custom( validateModuleById ),
], getDatum);
router.post('/',[
    // checkPermissions(['CREAR']),
    check('title', 'Title is required.').not().isEmpty(),
    check('route', 'Route is required.').not().isEmpty(),

    Validator
], postData);
router.put('/:id', [
    // checkPermissions(['MODIFICAR']),
    check('id', 'Invalid ID.').isMongoId(),
    check('id').custom( validateModuleById ),
    check('route').custom( validateRoute ),
    Validator
], updateData);

router.delete('/:id', [
    // checkPermissions(['ELIMINAR']),
    validateJWT,
    // checkRoleAuth(['SUPER_ROLE', 'ADMIN_ROLE']),
    check('id', 'Invalid ID.').isMongoId(),
    check('id').custom( validateModuleById ),
], deleteData);

module.exports = router