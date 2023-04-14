const {  Schema, model } = require('mongoose')

const ModuleSchema = Schema({
    name: {
        type: String,
        unique: [true, 'El nombre debe ser unico'],
        required: [true, 'El nombre es obligatorio'],
    },
    description: {
        type: String,
    },
    route: {
        type: String,
        required: [true, 'La ruta es obligatoria'],
    },
    image: {
        type: String,
        default: 'https://res.cloudinary.com/dltvxi4tm/image/upload/v1680155130/products/up8ji7twwgvk41k5vgrm.png'
    },
    status: {
        type: Boolean,
        default: true
    },
    deleted: {
        type: Boolean,
        default: false
    },
},
{
    versionKey: false,
    timestamps: true
})

ModuleSchema.methods.toJSON = function () {
    const { __v, deleted, ...data } = this.toObject()
    return data
}

module.exports = model( 'Module', ModuleSchema )