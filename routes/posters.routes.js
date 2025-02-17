const { Router } = require('express');
const { check } = require('express-validator')
const { getData, postData, updateData, deleteData, getCategories, getMyPoster, getHomePosters, getHomePostersByCategory, getPosterById } = require('../controllers/posters.controller');
const { validateCategoryById, existPosterName, validatePosterById } = require('../helpers/db_validators.helper');
const { checkRoleAuth } = require('../middlewares/role-validator.middleware');
const { validarJWT } = require('../middlewares/validar-jwt.middleware');
const { Validator } = require('../middlewares/validator.middleware');
const { checkPermissions } = require('../middlewares/permission-validator.middleware');
const router = Router()

router.get('/', [
    checkPermissions(['VISUALIZAR'])
], getData);
router.get('/:id', [
    validarJWT,
], getPosterById);
router.get('/myposter', getMyPoster);
router.get('/homepage', getHomePosters);
router.get('/homepage/:category', getHomePostersByCategory);
router.get('/categories', getCategories);
router.post('/',[
    checkPermissions(['CREAR']),
    check('name', 'El nombre es obligatorio.').not().isEmpty(),
    check('status', 'El status debe ser de tipo Boolean.').isBoolean(),
    check('available', 'Disponible debe ser de tipo Boolean.').isBoolean().optional(),
    check('category._id', 'No es un id válido.').isMongoId(),
    check('category').custom( validateCategoryById ),
    check('name').custom( existPosterName ),
    Validator
], postData);
router.put('/:id', [
    checkPermissions(['MODIFICAR']),
    check('id', 'No es un id válido.').isMongoId(),
    check('id').custom( validatePosterById ),
    check('name').custom( existPosterName ),
    check('category._id', 'No es un id válido.').isMongoId().custom( validateCategoryById ).optional(),
    Validator
], updateData);

router.delete('/:id', [
    checkPermissions(['ELIMINAR']),
    validarJWT,
    checkRoleAuth(['SUPER_ROLE', 'ADMIN_ROLE']),
    check('id', 'No es un id válido.').isMongoId(),
    check('id').custom( validatePosterById ),
    Validator
], deleteData);

module.exports = router