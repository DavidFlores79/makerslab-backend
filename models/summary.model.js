const {  Schema, model } = require('mongoose')

const SummarySchema = Schema({
    title: {
        type: String,
        required: [true, 'El Título es obligatorio']
    },
    comments: {
        type: String,
    },
    image: {
        type: String,
        default: 'https://res.cloudinary.com/dltvxi4tm/image/upload/v1680155130/products/up8ji7twwgvk41k5vgrm.png'
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El Usuario es obligatorio (owner)']
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El usuario es obligatorio (creator)']
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

SummarySchema.methods.toJSON = function () {
    const { __v, deleted, ...data } = this.toObject()
    return data
}

module.exports = model( 'Summary', SummarySchema )