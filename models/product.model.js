const {  Schema, model } = require('mongoose')

const ProductSchema = Schema({
    name: {
        type: String,
        unique: [true, 'El nombre debe ser unico'],
        required: [true, 'El nombre es obligatorio']
    },
    description: {
        type: String,
    },
    image: {
        type: String,
        default: 'https://res.cloudinary.com/dltvxi4tm/image/upload/v1680155130/products/up8ji7twwgvk41k5vgrm.png'
    },
    price: {
        type: Number,
        default: 0.0
    },
    available: {
        type: Boolean,
        default: false
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El id del usuario es obligatorio']
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'El id de categoría es obligatorio']
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

ProductSchema.methods.toJSON = function () {
    const { __v, deleted, ...data } = this.toObject()
    return data
}

module.exports = model( 'Product', ProductSchema )