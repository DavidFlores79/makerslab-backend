const { body } = require('express-validator');

const validateCreateLegalDocument = [
    body('type')
        .notEmpty()
        .withMessage('Document type is required')
        .isIn(['terms_and_conditions', 'privacy_policy'])
        .withMessage('Document type must be "terms_and_conditions" or "privacy_policy"'),
    
    body('language')
        .notEmpty()
        .withMessage('Language is required')
        .isIn(['en', 'es'])
        .withMessage('Language must be "en" or "es"'),
    
    body('title')
        .notEmpty()
        .withMessage('Title is required')
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage('Title must be between 3 and 200 characters'),
    
    body('content')
        .notEmpty()
        .withMessage('Content is required')
        .isLength({ min: 10 })
        .withMessage('Content must be at least 10 characters'),
    
    body('version')
        .optional()
        .trim()
        .isLength({ min: 1, max: 20 })
        .withMessage('Version must be between 1 and 20 characters'),
    
    body('effectiveDate')
        .optional()
        .isISO8601()
        .withMessage('Effective date must be a valid date')
];

const validateUpdateLegalDocument = [
    body('type')
        .optional()
        .isIn(['terms_and_conditions', 'privacy_policy'])
        .withMessage('Document type must be "terms_and_conditions" or "privacy_policy"'),
    
    body('language')
        .optional()
        .isIn(['en', 'es'])
        .withMessage('Language must be "en" or "es"'),
    
    body('title')
        .optional()
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage('Title must be between 3 and 200 characters'),
    
    body('content')
        .optional()
        .isLength({ min: 10 })
        .withMessage('Content must be at least 10 characters'),
    
    body('version')
        .optional()
        .trim()
        .isLength({ min: 1, max: 20 })
        .withMessage('Version must be between 1 and 20 characters'),
    
    body('effectiveDate')
        .optional()
        .isISO8601()
        .withMessage('Effective date must be a valid date')
];

module.exports = {
    validateCreateLegalDocument,
    validateUpdateLegalDocument
};
