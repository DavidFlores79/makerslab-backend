const { Schema, model } = require('mongoose')

const UserModuleAccessSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    module: {
        type: Schema.Types.ObjectId,
        ref: 'Module',
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'trial', 'expired', 'revoked'],
        default: 'active',
    },
    grantType: {
        type: String,
        enum: ['purchased', 'assigned', 'trial', 'gifted', 'promotional'],
        default: 'assigned',
    },
    grantedAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        default: null, // null = perpetual
    },
    // TODO: integrate Stripe — link to internal Payment document
    paymentRef: {
        type: Schema.Types.ObjectId,
        ref: 'Payment',
        default: null,
    },
    // Stripe charge/session ID stored at time of purchase
    paymentReference: {
        type: String,
        default: null,
    },
    pricePaid: {
        type: Number,
        default: null,
    },
    currency: {
        type: String,
        default: null,
    },
    grantedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    notes: {
        type: String,
        default: null,
    },
    autoRenew: {
        type: Boolean,
        default: false,
    },
    renewalPeriod: {
        type: String,
        enum: ['monthly', 'annual', 'none'],
        default: 'none',
    },
    deleted: {
        type: Boolean,
        default: false,
    },
},
{
    versionKey: false,
    timestamps: true,
})

UserModuleAccessSchema.index({ user: 1, module: 1 }, { unique: true })
UserModuleAccessSchema.index({ module: 1, status: 1, expiresAt: 1 })
UserModuleAccessSchema.index({ user: 1, status: 1 })

UserModuleAccessSchema.methods.toJSON = function () {
    const { __v, _id, deleted, ...data } = this.toObject()
    data.id = _id
    return data
}

module.exports = model('UserModuleAccess', UserModuleAccessSchema)
