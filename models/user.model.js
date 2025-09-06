const {  Schema, model } = require('mongoose')

const UserSchema = Schema({
    email: {
        type: String,
        unique: true,
        sparse: true,
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
    },
    image: {
        type: String,
        default: 'https://res.cloudinary.com/dltvxi4tm/image/upload/v1751821656/files/63f5014ee1ea6226ba9dbfd3_gmwwgx.png'
    },
    imagePublicId: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'El teléfono es obligatorio'],
        unique: true
    },
    role: {
        type: Schema.Types.ObjectId,
        ref: 'Role',
        required: [true, 'El id del role es obligatorio']
    },
    status: {
        type: Boolean,
        default: true
    },
    deleted: {
        type: Boolean,
        default: false
    },
    google: {
        type: Boolean,
        default: false
    },
    phoneVerificationCode: {
        type: String,
    },
    phoneVerificationCodeExpiresAt: {
        type: Date,
    }
},
{
    versionKey: false,
    timestamps: true
})

UserSchema.methods.toJSON = function () {
    const { __v, password, deleted, ...data } = this.toObject()
    return data
}

module.exports = model( 'User', UserSchema )

// const user = {
//     name: '',
//     email: '',
//     password: '',
//     image: '',
//     role: '',
//     status: true,
//     deleted: false,
//     google: false,
// }