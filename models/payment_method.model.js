const {  Schema, model } = require('mongoose')

const PaymentMethodSchema = Schema({
    name: {
        type: String,
        unique: [true, 'El nombre debe ser único'],
        required: [true, 'El nombre es obligatorio']
    },
    description: {
        type: String,
    },
    status: {
        type: Boolean,
        default: true
    },
    deleted: {
        type: Boolean,
        default: false
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El id del usuario es obligatorio']
    }
},
{
    versionKey: false,
    timestamps: true
})

PaymentMethodSchema.methods.toJSON = function () {
    const { __v, _id, deleted, ...data } = this.toObject()
    data.id = _id
    return data
}

module.exports = model( 'PaymentMethod', PaymentMethodSchema )