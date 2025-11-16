const { Schema, model } = require('mongoose')

const configurationSchema = new Schema({
    companyLogo: {
        type: String, // URL of the logo stored in Cloudinary
        default: 'https://res.cloudinary.com/dltvxi4tm/image/upload/v1751821656/files/63f5014ee1ea6226ba9dbfd3_gmwwgx.png'
    },
    companyName: {
        type: String,
        default: "Makerslab"
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
    chatLimits: {
        maxMessagesInDB: {
            type: Number,
            default: 30, // Maximum messages to store in database per conversation
            min: 10,
            max: 100
        },
        maxMessagesToAI: {
            type: Number,
            default: 20, // Maximum messages to send as context to AI (from stored messages)
            min: 5,
            max: 50
        },
        maxUserMessagesPerDay: {
            type: Number,
            default: 100, // Maximum messages a user can send per day
            min: 10,
            max: 1000
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