const { Router } = require('express');
const { check } = require('express-validator');
const { uploadImage, uploadFile, showImage, uploadImageCloudinary, uploadCloudinary } = require('../controllers/uploads.controller');
const { coleccionesPermitidas, validateUserById } = require('../helpers/db_validators.helper');

const { Validator } = require('../middlewares/validator.middleware');
const collections = ['users', 'products', 'modules', 'permissions', 'posters'];

const router = Router()

router.post('/', uploadFile)
router.put('/:coleccion/:id', [
    check('id', 'No es un id válido.').isMongoId(),
    // TODO: checkIdExistInCollection(['id', 'coleccion']),
    check('coleccion').custom( c => coleccionesPermitidas( c, collections) ),
    Validator
], uploadImage)
router.get('/:coleccion/:id', [
    check('id', 'No es un id válido.').isMongoId(),
    // TODO: checkIdExistInCollection(['id', 'coleccion']),
    check('coleccion').custom( c => coleccionesPermitidas( c, collections) ),
    Validator
], showImage)

router.put('/cloud/:coleccion/:id', [
    check('id', 'No es un id válido.').isMongoId(),
    // TODO: checkIdExistInCollection(['id', 'coleccion']),
    check('coleccion').custom( c => coleccionesPermitidas( c, collections) ),
    Validator
], uploadImageCloudinary)

router.post('/cloud/:coleccion', [
    check('coleccion').custom( c => coleccionesPermitidas( c, collections) ),
    Validator
], uploadCloudinary)


module.exports = router