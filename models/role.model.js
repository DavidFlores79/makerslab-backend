const {  Schema, model } = require('mongoose')

const RoleSchema = Schema({
    name: {
        type: String,
        unique: [true, 'El nombre debe ser unico'],
        required: [true, 'El nombre es obligatorio'],
        // enum : ['USER_ROLE','ADMIN_ROLE','VENTAS_ROLE'],
    },
    modules: [
        {
            type: Schema.Types.ObjectId,
            required: [true, 'El id del módulo es obligatorio'],
            ref: 'Module',
        },
    ],
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

RoleSchema.methods.toJSON = function () {
    const { __v, deleted, ...data } = this.toObject()
    return data
}

module.exports = model( 'Role', RoleSchema )