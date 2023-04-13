const {  Schema, model } = require('mongoose')

const CategorySchema = Schema({
    name: {
        type: String,
        unique: [true, 'El nombre debe ser unico'],
        required: [true, 'El nombre es obligatorio']
    },
    status: {
        type: Boolean,
        default: true
    },
    deleted: {
        type: Boolean,
        default: false
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El id del usuario es obligatorio']
    }
},
{
    versionKey: false,
    timestamps: true
})

CategorySchema.methods.toJSON = function () {
    const { __v, deleted, ...data } = this.toObject()
    return data
}

module.exports = model( 'Category', CategorySchema )