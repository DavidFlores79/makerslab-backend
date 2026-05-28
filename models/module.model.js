const {  Schema, model } = require('mongoose')

const ModuleSchema = Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    route: {
        type: String,
        required: true,
        unique: true
    },
    colorHex: {
        type: String,
        default: '#EEEEEE'
    },
    assetPath: {
        type: String,
    },
    imageUrl: {
        type: String,
        default: 'https://res.cloudinary.com/dltvxi4tm/image/upload/v1751821656/files/63f5014ee1ea6226ba9dbfd3_gmwwgx.png'
    },
    isStatic: {
        type: Boolean,
        default: false
    },
    priority: {
        type: Number,
        default: 0
    },
    isPublic: {
        type: Boolean,
        default: true,
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

ModuleSchema.methods.toJSON = function () {
    const { __v, deleted, _id, ...data } = this.toObject()
    data.id = _id
    return data
}

module.exports = model( 'Module', ModuleSchema )