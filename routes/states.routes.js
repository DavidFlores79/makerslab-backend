const { Router } = require('express');
const { check, validationResult } = require('express-validator')
const { getData, postData, updateData, deleteData, createAll } = require('../controllers/state.controller');
const { validateStateById } = require('../helpers/db_validators.helper');
const { checkRoleAuth } = require('../middlewares/role-validator.middleware');
const { validarJWT } = require('../middlewares/validar-jwt.middleware');
const { Validator } = require('../middlewares/validator.middleware');
const router = Router()

router.get('/', [
    checkRoleAuth(['SUPER_ROLE', 'ADMIN_ROLE']),
], getData);
router.post('/',[
    checkRoleAuth(['SUPER_ROLE', 'ADMIN_ROLE']),
    check('code', 'Este campo es obligatorio.').not().isEmpty(),
    check('name', 'Este campo es obligatorio.').not().isEmpty(),
    Validator
], postData);
router.post('/all',[
    checkRoleAuth(['SUPER_ROLE', 'ADMIN_ROLE']),  
    check('*').isObject().withMessage('Se espera un array de objetos.'),  
    check('*.code', 'El campo "code" es obligatorio y debe ser un string.').notEmpty().isString(),  
    check('*.name', 'El campo "name" es obligatorio y debe ser un string.').notEmpty().isString(),  
    (req, res, next) => {  
        const errors = validationResult(req.body);  
        if (!errors.isEmpty()) {  
            return res.status(400).json({ errors: errors.array() });  
        }  
        next();  
    },
], createAll);
router.put('/:id', [
    checkRoleAuth(['SUPER_ROLE', 'ADMIN_ROLE']),
    check('id', 'No es un id válido.').isMongoId(),
    check('id').custom( validateStateById ),
    check('code', 'Este campo es obligatorio.').optional().not().isEmpty(),
    check('name', 'Este campo es obligatorio.').optional().not().isEmpty(),
    check('status', 'El campo debe ser de tipo Boolean.').optional().isBoolean(),
    Validator
], updateData);

router.delete('/:id', [
    validarJWT,
    checkRoleAuth(['SUPER_ROLE', 'ADMIN_ROLE']),
    check('id', 'No es un id válido.').isMongoId(),
    check('id').custom( validateStateById ),
    Validator
], deleteData);

module.exports = router