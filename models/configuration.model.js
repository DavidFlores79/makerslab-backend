const { Schema, model } = require('mongoose')

const configurationSchema = new Schema({
    companyName: {
        type: String,
        default: "Congreso Promoción Salud 2025"
    },
    companyAddress: {
        type: String,
        default: "Calle 90 S/N x 59 y 59A Contiguo al Hospital O'Horán"
    },
    companyEmail: {
        type: String,
        default: "congreso_promocionsalud@correo.uady.mx"
    },
    companyPhone: {
        type: String,
        default: "9994124345"
    },
    companyLogo: {
        type: String, // URL of the logo stored in Cloudinary
        default: "https://www.congresopromocionsalud.com/assets/public/img/brand/logo_congreso.png"
    },
    userLimits: {
        maxPayments: {
            type: Number,
            default: 2 // Default maximum payments per user
        },
        maxSummaries: {
            type: Number,
            default: 1 // Default maximum summaries per user
        }
    },
    landingPageLabels: {
        header: {
            type: String,
            default: "Welcome to Our Platform"
        },
        aboutUs: {
            type: String,
            default: "About Us"
        },
        contact: {
            type: String,
            default: "Contact Us"
        }
    }
},
{
    versionKey: false,
    timestamps: true
});

configurationSchema.methods.toJSON = function () {
    const { __v, deleted, ...data } = this.toObject()
    return data
}

module.exports = model('Configuration', configurationSchema)