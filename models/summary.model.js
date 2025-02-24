const {  Schema, model } = require('mongoose')

const SummarySchema = Schema({
    title: {
        type: String,
        required: [true, 'El Título es obligatorio']
    },
    comments: {
        type: String,
    },
    document: {
        type: String,
    },
    document_status: {
        type: Schema.Types.ObjectId,
        ref: 'SummaryStatus',
        required: [true, 'El Estatus de Revisión es obligatorio']
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