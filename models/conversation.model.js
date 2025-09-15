// src/models/conversation.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: mongoose.Schema.Types.Mixed, required: true }, 
  createdAt: { type: Date, default: () => new Date() }
}, { _id: false });

const ConversationSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, unique: true },
  responseId: { type: String, required: false },
  userId: { type: String, required: false },
  module: { type: String, required: false },
  messages: { type: [MessageSchema], default: [] },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() }
});

// actualiza updatedAt en cada save
ConversationSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Conversation', ConversationSchema);