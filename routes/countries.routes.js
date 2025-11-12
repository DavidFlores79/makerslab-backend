const { Router } = require('express');
const { check } = require('express-validator');
const {
    getCountries,
    getCountryById,
    getCountryByCode,
    createCountry,
    updateCountry,
    deleteCountry
} = require('../controllers/countries.controller');
const { validateJWT } = require('../middlewares/validar-jwt.middleware');
const { Validator } = require('../middlewares/validator.middleware');
const { checkPermissions } = require('../middlewares/permission-validator.middleware');
const { checkRoleAuth } = require('../middlewares/role-validator.middleware');

const router = Router();

// Public routes - no authentication required
router.get('/', getCountries);
router.get('/id/:id', [
    check('id', 'No es un id válido.').isMongoId(),
    Validator
], getCountryById);
router.get('/code/:code', [
    check('code', 'El código del país es requerido.').not().isEmpty(),
    check('code', 'El código debe tener 2 caracteres.').isLength({ min: 2, max: 2 }),
    Validator
], getCountryByCode);

// Protected routes - require authentication and permissions
router.post('/', [
    validateJWT,
    checkPermissions(['CREAR']),
    check('name', 'El nombre del país es obligatorio.').not().isEmpty(),
    check('code', 'El código del país es obligatorio.').not().isEmpty(),
    check('code', 'El código debe tener 2 caracteres.').isLength({ min: 2, max: 2 }),
    check('phoneCode', 'El código telefónico es obligatorio.').not().isEmpty(),
    Validator
], createCountry);

router.put('/:id', [
    validateJWT,
    checkPermissions(['MODIFICAR']),
    check('id', 'No es un id válido.').isMongoId(),
    Validator
], updateCountry);

router.delete('/:id', [
    validateJWT,
    checkPermissions(['ELIMINAR']),
    checkRoleAuth(['SUPER_ROLE', 'ADMIN_ROLE']),
    check('id', 'No es un id válido.').isMongoId(),
    Validator
], deleteCountry);

module.exports = router;
