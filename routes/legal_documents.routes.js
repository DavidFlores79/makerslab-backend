const { Router } = require('express');
const { validateJWT } = require('../middlewares/validar-jwt.middleware');
const { 
    getActiveLegalDocuments,
    getAllLegalDocuments,
    getLegalDocumentById,
    createLegalDocument,
    updateLegalDocument,
    activateLegalDocument,
    deactivateLegalDocument,
    deleteLegalDocument
} = require('../controllers/legal_documents.controller');
const { 
    validateCreateLegalDocument,
    validateUpdateLegalDocument 
} = require('../validators/legal_document.validator');
const { Validator } = require('../middlewares/validator.middleware');

const router = Router();

// Public routes - No authentication required
router.get('/active', getActiveLegalDocuments);

// Protected routes - Authentication required
router.get('/', [validateJWT], getAllLegalDocuments);
router.get('/:id', [validateJWT], getLegalDocumentById);

router.post('/', [
    validateJWT,
    validateCreateLegalDocument,
    Validator
], createLegalDocument);

router.put('/:id', [
    validateJWT,
    validateUpdateLegalDocument,
    Validator
], updateLegalDocument);

router.patch('/:id/activate', [validateJWT], activateLegalDocument);
router.patch('/:id/deactivate', [validateJWT], deactivateLegalDocument);

router.delete('/:id', [validateJWT], deleteLegalDocument);

module.exports = router;
