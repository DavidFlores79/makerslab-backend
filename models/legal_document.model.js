const { Schema, model } = require('mongoose');

const legalDocumentSchema = new Schema({
    type: {
        type: String,
        enum: ['terms_and_conditions', 'privacy_policy'],
        required: [true, 'Document type is required'],
        index: true
    },
    language: {
        type: String,
        enum: ['en', 'es'],
        required: [true, 'Language is required'],
        index: true
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Content is required']
    },
    version: {
        type: String,
        default: '1.0'
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    effectiveDate: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Compound index to ensure only one active document per type and language
legalDocumentSchema.index({ type: 1, language: 1, isActive: 1 });

// Method to deactivate previous versions when a new one is activated
legalDocumentSchema.statics.activateDocument = async function(docId) {
    const doc = await this.findById(docId);
    if (!doc) {
        throw new Error('Document not found');
    }

    // Deactivate all other documents of the same type and language
    await this.updateMany(
        { 
            type: doc.type, 
            language: doc.language, 
            _id: { $ne: docId } 
        },
        { isActive: false }
    );

    // Activate the selected document
    doc.isActive = true;
    await doc.save();

    return doc;
};

module.exports = model('LegalDocument', legalDocumentSchema);
