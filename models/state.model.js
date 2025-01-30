const {  Schema, model } = require('mongoose')

const StateSchema = Schema({
    code: {
        type: String,
        unique: [true, 'El código debe ser único'],
        required: [true, 'El código es obligatorio']
    },
    name: {
        type: String,
        unique: [true, 'El nombre debe ser único'],
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
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El Usuario es obligatorio']
    }
},
{
    versionKey: false,
    timestamps: true
})

StateSchema.methods.toJSON = function () {
    const { __v, deleted, ...data } = this.toObject()
    return data
}

module.exports = model( 'State', StateSchema )