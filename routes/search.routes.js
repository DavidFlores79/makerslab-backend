const { Router } = require('express');
const { searchData, searchError } = require('../controllers/search.controller')

const router = Router();

router.get('/', searchError)
router.get('/:coleccion', searchError)
router.get('/:coleccion/:termino', searchData)

module.exports = router;