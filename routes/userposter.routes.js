const { Router } = require('express');
const { check } = require('express-validator')
const { postData, updateData, getCategories, getMyPoster } = require('../controllers/posters.controller');
const { validateCategoryById, existPosterName, validatePosterById } = require('../helpers/db_validators.helper');
const { validarJWT } = require('../middlewares/validar-jwt.middleware');
const { Validator } = require('../middlewares/validator.middleware');
const { checkPermissions } = require('../middlewares/permission-validator.middleware');
const router = Router()

router.get('/', getMyPoster);
router.get('/categories', getCategories);
router.post('/',[
    check('name', 'El nombre es obligatorio.').not().isEmpty(),
    check('status', 'El status debe ser de tipo Boolean.').isBoolean(),
    check('available', 'Disponible debe ser de tipo Boolean.').isBoolean().optional(),
    check('category._id', 'No es un id válido.').isMongoId(),
    check('category').custom( validateCategoryById ),
    check('name').custom( existPosterName ),
    Validator
], postData);
router.put('/:id', [
    check('id', 'No es un id válido.').isMongoId(),
    check('id').custom( validatePosterById ),
    check('name').custom( existPosterName ),
    check('category._id', 'No es un id válido.').isMongoId().custom( validateCategoryById ).optional(),
    Validator
], updateData);

module.exports = router