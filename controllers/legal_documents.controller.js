const LegalDocument = require('../models/legal_document.model');

// Get active legal documents (public endpoint)
const getActiveLegalDocuments = async (req, res) => {
    try {
        const { type, language } = req.query;
        
        const filter = { isActive: true };
        
        if (type) {
            if (!['terms_and_conditions', 'privacy_policy'].includes(type)) {
                return res.status(400).json({ 
                    message: 'Invalid document type. Must be "terms_and_conditions" or "privacy_policy".' 
                });
            }
            filter.type = type;
        }
        
        if (language) {
            if (!['en', 'es'].includes(language)) {
                return res.status(400).json({ 
                    message: 'Invalid language. Must be "en" or "es".' 
                });
            }
            filter.language = language;
        }

        const documents = await LegalDocument.find(filter)
            .select('-createdBy -updatedBy')
            .sort({ type: 1, language: 1 });

        res.status(200).json({
            success: true,
            count: documents.length,
            data: documents
        });
    } catch (error) {
        console.error('Error fetching active legal documents:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error.' 
        });
    }
};

// Get all legal documents (admin endpoint)
const getAllLegalDocuments = async (req, res) => {
    try {
        const { type, language, isActive } = req.query;
        
        const filter = {};
        
        if (type) {
            if (!['terms_and_conditions', 'privacy_policy'].includes(type)) {
                return res.status(400).json({ 
                    message: 'Invalid document type. Must be "terms_and_conditions" or "privacy_policy".' 
                });
            }
            filter.type = type;
        }
        
        if (language) {
            if (!['en', 'es'].includes(language)) {
                return res.status(400).json({ 
                    message: 'Invalid language. Must be "en" or "es".' 
                });
            }
            filter.language = language;
        }

        if (isActive !== undefined) {
            filter.isActive = isActive === 'true';
        }

        const documents = await LegalDocument.find(filter)
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email')
            .sort({ type: 1, language: 1, createdAt: -1 });

        res.status(200).json({
            success: true,
            count: documents.length,
            data: documents
        });
    } catch (error) {
        console.error('Error fetching all legal documents:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error.' 
        });
    }
};

// Get a single legal document by ID
const getLegalDocumentById = async (req, res) => {
    try {
        const { id } = req.params;

        const document = await LegalDocument.findById(id)
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');

        if (!document) {
            return res.status(404).json({ 
                success: false,
                message: 'Legal document not found.' 
            });
        }

        res.status(200).json({
            success: true,
            data: document
        });
    } catch (error) {
        console.error('Error fetching legal document:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error.' 
        });
    }
};

// Create a new legal document
const createLegalDocument = async (req, res) => {
    try {
        const { type, language, title, content, version, effectiveDate } = req.body;
        
        const newDocument = new LegalDocument({
            type,
            language,
            title,
            content,
            version,
            effectiveDate,
            isActive: false, // New documents start as inactive by default
            createdBy: req.user._id
        });

        await newDocument.save();

        res.status(201).json({
            success: true,
            message: 'Legal document created successfully.',
            data: newDocument
        });
    } catch (error) {
        console.error('Error creating legal document:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                success: false,
                message: 'Validation error.',
                errors: Object.values(error.errors).map(e => e.message)
            });
        }
        
        res.status(500).json({ 
            success: false,
            message: 'Internal server error.' 
        });
    }
};

// Update a legal document
const updateLegalDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, language, title, content, version, effectiveDate } = req.body;

        const document = await LegalDocument.findById(id);
        
        if (!document) {
            return res.status(404).json({ 
                success: false,
                message: 'Legal document not found.' 
            });
        }

        // Update fields
        if (type) document.type = type;
        if (language) document.language = language;
        if (title) document.title = title;
        if (content) document.content = content;
        if (version) document.version = version;
        if (effectiveDate) document.effectiveDate = effectiveDate;
        document.updatedBy = req.user._id;

        await document.save();

        res.status(200).json({
            success: true,
            message: 'Legal document updated successfully.',
            data: document
        });
    } catch (error) {
        console.error('Error updating legal document:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                success: false,
                message: 'Validation error.',
                errors: Object.values(error.errors).map(e => e.message)
            });
        }
        
        res.status(500).json({ 
            success: false,
            message: 'Internal server error.' 
        });
    }
};

// Activate a legal document (deactivates others of same type/language)
const activateLegalDocument = async (req, res) => {
    try {
        const { id } = req.params;

        const document = await LegalDocument.activateDocument(id);

        res.status(200).json({
            success: true,
            message: 'Legal document activated successfully.',
            data: document
        });
    } catch (error) {
        console.error('Error activating legal document:', error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Internal server error.' 
        });
    }
};

// Deactivate a legal document
const deactivateLegalDocument = async (req, res) => {
    try {
        const { id } = req.params;

        const document = await LegalDocument.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );

        if (!document) {
            return res.status(404).json({ 
                success: false,
                message: 'Legal document not found.' 
            });
        }

        res.status(200).json({
            success: true,
            message: 'Legal document deactivated successfully.',
            data: document
        });
    } catch (error) {
        console.error('Error deactivating legal document:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error.' 
        });
    }
};

// Delete a legal document
const deleteLegalDocument = async (req, res) => {
    try {
        const { id } = req.params;

        const document = await LegalDocument.findByIdAndDelete(id);

        if (!document) {
            return res.status(404).json({ 
                success: false,
                message: 'Legal document not found.' 
            });
        }

        res.status(200).json({
            success: true,
            message: 'Legal document deleted successfully.'
        });
    } catch (error) {
        console.error('Error deleting legal document:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error.' 
        });
    }
};

module.exports = {
    getActiveLegalDocuments,
    getAllLegalDocuments,
    getLegalDocumentById,
    createLegalDocument,
    updateLegalDocument,
    activateLegalDocument,
    deactivateLegalDocument,
    deleteLegalDocument
};
