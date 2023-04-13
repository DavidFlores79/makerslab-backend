const { Router } = require('express');
const { check } = require('express-validator')
const { getData, postData, updateData, deleteData } = require('../controllers/users.controller');
const { validateRole, validateEmail, validateUserById } = require('../helpers/db_validators.helper');
const checkRoleAuth = require('../middlewares/role-validator.middleware');
const { validarJWT } = require('../middlewares/validar-jwt.middleware');
const { Validator } = require('../middlewares/validator.middleware');
const router = Router()

router.get('/', getData);
router.post('/',[
    check('name', 'El nombre es obligatorio.').not().isEmpty(),
    check('email', 'El email es obligatorio.').not().isEmpty(),
    check('email', 'No es un correo válido.').isEmail(),
    check('password', 'El password es obligatorio.').not().isEmpty(),
    check('password', 'El password debe contener más de 6 caracteres.').isLength({ min: 6 }),
    
    //Validacion personalizada que usa el modelo roles
    check('role').custom( validateRole ),
    check('email').custom( validateEmail ),
    
    Validator
], postData);
router.put('/:id', [
    check('id', 'No es un id válido.').isMongoId(),
    check('id').custom( validateUserById ),
    check('role').custom( validateRole ),
    check('email').custom( validateEmail ),
    Validator
], updateData);

router.delete('/:id', [
    validarJWT,
    checkRoleAuth(['SUPER_ROLE', 'ADMIN_ROLE']),
    check('id', 'No es un id válido.').isMongoId(),
    check('id').custom( validateUserById ),
    Validator
], deleteData);

module.exports = router