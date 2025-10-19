const { Schema, model } = require('mongoose')

const ModulePermissionRoleSchema = Schema({
    module: {
        type: Schema.Types.ObjectId,
        ref: 'Module',
        required: [true, 'El id del módulo es obligatorio']
    },
    permissions: [
        {
            type: Schema.Types.ObjectId,
            required: [true, 'El id del permiso es obligatorio'],
            ref: 'Permission',
        },
    ],
    role: {
        type: Schema.Types.ObjectId,
        ref: 'Role',
        required: [true, 'El id del role es obligatorio']
    },
},
    {
        versionKey: false,
        timestamps: true
    },
)

ModulePermissionRoleSchema.methods.toJSON = function () {
    const { __v, _id, deleted, ...data } = this.toObject()
    data.id = _id
    return data
}

module.exports = model('Profile', ModulePermissionRoleSchema)