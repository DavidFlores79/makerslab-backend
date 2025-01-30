const { Schema, model } = require('mongoose')

const EventParticipantSchema = Schema({
    academic_degree_name: { type: String, required: true, },
    institution: { type: String, required: true, },
    work_title: { type: String, required: true, },
    is_work_unpublished: { type: Boolean, required: true, },
    country: { type: String, required: true, },
    occupation: { type: Schema.Types.ObjectId, ref: 'Occupation', required: true, },
    participation_mode: { type: Schema.Types.ObjectId, ref: 'EventParticipationMode', required: true, },
    state: { type: Schema.Types.ObjectId, ref: 'State', default: null, },
    extra_fields_presenter: {
        presentation_title: { type: String },
        presentation_summary: { type: String },
        presentation_file: { type: String },
    },
    extra_fields_attendee: {
        attendee_interests: [{ type: String }],
    },
    registration_date: { type: Date, default: Date.now },
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

EventParticipantSchema.methods.toJSON = function () {
    const { __v, deleted, ...data } = this.toObject()
    return data
}

module.exports = model('EventParticipant', EventParticipantSchema)