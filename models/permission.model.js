const {  Schema, model } = require('mongoose')

const PermissionSchema = Schema({
    name: {
        type: String,
        unique: [true, 'El nombre debe ser unico'],
        required: [true, 'El nombre es obligatorio'],
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

PermissionSchema.methods.toJSON = function () {
    const { __v, _id, deleted, ...data } = this.toObject()
    data.id = _id
    return data
}

module.exports = model( 'Permission', PermissionSchema )