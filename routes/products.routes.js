const { Router } = require('express');
const { check } = require('express-validator')
const { getData, postData, updateData, deleteData, getCategories } = require('../controllers/products.controller');
const { validateCategoryById, existProductName, validateProductById } = require('../helpers/db_validators.helper');
const { checkRoleAuth } = require('../middlewares/role-validator.middleware');
const { validarJWT } = require('../middlewares/validar-jwt.middleware');
const { Validator } = require('../middlewares/validator.middleware');
const { checkPermissions } = require('../middlewares/permission-validator.middleware');
const router = Router()

router.get('/', [
    checkPermissions(['VISUALIZAR'])
], getData);
router.get('/categories', getCategories);
router.post('/',[
    checkPermissions(['CREAR']),
    check('name', 'El nombre es obligatorio.').not().isEmpty(),
    check('status', 'El status debe ser de tipo Boolean.').isBoolean(),
    check('available', 'Disponible debe ser de tipo Boolean.').isBoolean().optional(),
    check('category._id', 'No es un id válido.').isMongoId(),
    check('category').custom( validateCategoryById ),
    check('name').custom( existProductName ),
    Validator
], postData);
router.put('/:id', [
    checkPermissions(['MODIFICAR']),
    check('id', 'No es un id válido.').isMongoId(),
    check('id').custom( validateProductById ),
    check('name').custom( existProductName ),
    check('category._id', 'No es un id válido.').isMongoId().custom( validateCategoryById ).optional(),
    Validator
], updateData);

router.delete('/:id', [
    checkPermissions(['ELIMINAR']),
    validarJWT,
    checkRoleAuth(['SUPER_ROLE', 'ADMIN_ROLE']),
    check('id', 'No es un id válido.').isMongoId(),
    check('id').custom( validateProductById ),
    Validator
], deleteData);

module.exports = router