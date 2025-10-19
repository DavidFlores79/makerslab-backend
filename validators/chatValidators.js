// src/validators/chatValidators.js
const Joi = require("joi");

const startSchema = Joi.object({
  module: Joi.string().required(),
  conversationId: Joi.string().optional(),
  systemPrompt: Joi.string().optional(),
});

const messageSchema = Joi.object({
  conversationId: Joi.string().required(),
  content: Joi.string().min(1).max(2000).required(),
  imageUrl: Joi.string().uri().optional().allow(null, ''),
});

module.exports = {
  startSchema,
  messageSchema,
};
