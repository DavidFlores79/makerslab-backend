const { Schema, model } = require('mongoose');

const UserChatUsageSchema = new Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    messageCount: {
        type: Number,
        default: 0
    },
    conversationId: {
        type: String,
        required: true
    }
}, {
    versionKey: false,
    timestamps: true
});

// Compound index for efficient queries by user and date
UserChatUsageSchema.index({ userId: 1, date: 1 });

// Method to get or create today's usage record
UserChatUsageSchema.statics.getTodayUsage = async function(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const records = await this.find({
        userId,
        date: { $gte: today, $lt: tomorrow }
    });
    
    const totalMessages = records.reduce((sum, record) => sum + record.messageCount, 0);
    
    return {
        records,
        totalMessages,
        date: today
    };
};

// Method to increment message count
UserChatUsageSchema.statics.incrementUsage = async function(userId, conversationId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const record = await this.findOneAndUpdate(
        {
            userId,
            conversationId,
            date: today
        },
        {
            $inc: { messageCount: 1 }
        },
        {
            upsert: true,
            new: true
        }
    );
    
    return record;
};

module.exports = model('UserChatUsage', UserChatUsageSchema);
