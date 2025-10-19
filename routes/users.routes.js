const { Router } = require('express');
const { check } = require('express-validator')
const { getData, postData, updateData, deleteData, getRoles, deleteUsersExceptFirstThree, getDatum } = require('../controllers/users.controller');
const { validateRole, validateEmail, validateUserById, validateRoleById } = require('../helpers/db_validators.helper');
const { checkRoleAuth } = require('../middlewares/role-validator.middleware');
const { validateJWT } = require('../middlewares/validar-jwt.middleware');
const { Validator } = require('../middlewares/validator.middleware');
const { checkPermissions } = require('../middlewares/permission-validator.middleware');
const router = Router()

router.delete('/delete-all-users', [
    validateJWT,
    checkPermissions(['ELIMINAR']),
    checkRoleAuth(['SUPER_ROLE']),
],deleteUsersExceptFirstThree);

router.get('/', [
    validateJWT,
    // checkPermissions(['VISUALIZAR'])
], getData);
router.get('/:id', [
    validateJWT
], getDatum);
router.get('/roles', getRoles);
router.post('/',[
    validateJWT,
    checkPermissions(['CREAR']),
    check('name', 'El nombre es obligatorio.').not().isEmpty(),
    check('email', 'El email es obligatorio.').not().isEmpty(),
    check('email', 'No es un correo válido.').isEmail(),
    check('password', 'El password es obligatorio.').not().isEmpty(),
    check('password', 'El password debe contener más de 6 caracteres.').isLength({ min: 6 }),
    //Validacion personalizada que usa el modelo roles
    // check('role').custom( validateRole ),
    check('role', 'No es un id válido.').optional().isMongoId(),
    check('role').optional().custom( validateRoleById ),
    check('email').custom( validateEmail ),
    Validator
], postData);
router.put('/:id', [
    validateJWT,
    // checkPermissions(['MODIFICAR']),
    check('id', 'No es un id válido.').isMongoId(),
    check('id').custom( validateUserById ),
    // check('role').custom( validateRole ),
    check('email').custom( validateEmail ),
    check('role._id', 'No es un id válido.').optional().isMongoId(),
    check('role._id').optional().custom( validateRoleById ),
    Validator
], updateData);

router.delete('/:id', [
    validateJWT,
    checkPermissions(['ELIMINAR']),
    checkRoleAuth(['SUPER_ROLE', 'ADMIN_ROLE']),
    check('id', 'No es un id válido.').isMongoId(),
    check('id').custom( validateUserById ),
    Validator
], deleteData);

//Version 2


module.exports = router