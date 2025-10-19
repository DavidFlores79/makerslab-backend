const { Schema, model } = require('mongoose')

const configurationSchema = new Schema({
    companyLogo: {
        type: String, // URL of the logo stored in Cloudinary
        default: 'https://res.cloudinary.com/dltvxi4tm/image/upload/v1751821656/files/63f5014ee1ea6226ba9dbfd3_gmwwgx.png'
    },
    companyName: {
        type: String,
        default: " Promoción Salud 2025"
    },
    companyAddress: {
        type: String,
    },
    companyEmail: {
        type: String,
    },
    companyPhone: {
        type: String,
    },
    notificationEmails: [{ type: String }],
    userLimits: {
        maxPayments: {
            type: Number,
            default: 2 // Default maximum payments per user
        },
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
    },
    // Nuevo campo: Fecha límite para registrarse
    registrationDeadline: {
        type: Date,
        default: null // o puedes poner una fecha por defecto si lo deseas
    }
},
{
    versionKey: false,
    timestamps: true
});

configurationSchema.methods.toJSON = function () {
    const { __v, _id, deleted, ...data } = this.toObject()
    data.id = _id
    return data
}

module.exports = model('Configuration', configurationSchema)