const {  Schema, model } = require('mongoose')

const PaymentSchema = Schema({
    description: {
        type: String,
        required: [true, 'La descripción es obligatoria']
    },
    comments: {
        type: String,
    },
    image: {
        type: String,
        // default: 'https://res.cloudinary.com/dltvxi4tm/image/upload/v1680155130/products/up8ji7twwgvk41k5vgrm.png'
    },
    amount: {
        type: Number,
        default: 0.0
    },
    payment_method: {
        type: Schema.Types.ObjectId,
        ref: 'PaymentMethod',
        required: [true, 'El método de pago es obligatorio']
    },
    payer: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El Usuario que paga es obligatorio']
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El usuario es obligatorio']
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

PaymentSchema.methods.toJSON = function () {
    const { __v, deleted, ...data } = this.toObject()
    return data
}

module.exports = model( 'Payment', PaymentSchema )