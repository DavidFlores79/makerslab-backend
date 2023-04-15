const {  Schema, model } = require('mongoose')

const UserSchema = Schema({
    name: {
        type: String,
        required: [true, 'El nombre es obligatorio']
    },
    email: {
        type: String,
        required: [true, 'El correo es obligatorio'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        
    },
    image: {
        type: String,
        default: 'https://res.cloudinary.com/dltvxi4tm/image/upload/v1680155130/products/up8ji7twwgvk41k5vgrm.png'
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