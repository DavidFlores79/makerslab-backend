const { Schema, model } = require('mongoose');

const CountrySchema = Schema({
    name: {
        type: String,
        required: [true, 'El nombre del país es obligatorio'],
        unique: true
    },
    code: {
        type: String,
        required: [true, 'El código del país es obligatorio'],
        unique: true,
        uppercase: true,
        minlength: 2,
        maxlength: 2
    },
    phoneCode: {
        type: String,
        required: [true, 'El código telefónico es obligatorio']
    },
    status: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Override toJSON to customize response
CountrySchema.methods.toJSON = function() {
    const { __v, _id, ...country } = this.toObject();
    country.uid = _id;
    return country;
};

module.exports = model('Country', CountrySchema);
