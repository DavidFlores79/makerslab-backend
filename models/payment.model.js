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
    image_name: {
        type: String,
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
    payment_status: {
        type: Schema.Types.ObjectId,
        ref: 'PaymentStatus',
        required: [true, 'El status de pago es obligatorio']
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El Usuario es obligatorio']
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El Usuario es obligatorio']
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