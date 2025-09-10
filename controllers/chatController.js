// src/controllers/chatController.js
const Conversation = require("../models/conversation.model");
const { v4: uuidv4 } = require("uuid");
const { getChatCompletion } = require("../services/openAIService");

const MAX_MESSAGES = Number(process.env.CONVO_MAX_MESSAGES || 30);

// helper: recorta el array de messages manteniendo los últimos MAX_MESSAGES
function trimMessages(messages) {
  if (!messages || messages.length <= MAX_MESSAGES) return messages;
  return messages.slice(-MAX_MESSAGES);
}

async function startConversation(req, res, next) {
  try {
    const { conversationId, systemPrompt } = req.body;
    const id = conversationId || uuidv4();

    const exists = await Conversation.findOne({ conversationId: id });
    if (exists) {
      return res.json({ conversationId: id });
    }

    const doc = new Conversation({
      conversationId: id,
      userId: req.user?.id,
      messages: systemPrompt ? [{ role: "system", content: systemPrompt }] : [],
    });
    await doc.save();
    res.json({ conversationId: id });
  } catch (err) {
    next(err);
  }
}

async function sendMessage(req, res, next) {
  try {
    const { conversationId, content, imageUrl } = req.body;
    let convo = await Conversation.findOne({ conversationId });
    if (!convo) {
      // create new conversation if not exists
      convo = new Conversation({ conversationId, userId: req.user?.id, messages: [] });
    }

    // Prepare user message content for OpenAI
    let userMessageContent;
    if (imageUrl) {
      userMessageContent = [
        { type: "text", text: content },
        { type: "image_url", image_url: { url: imageUrl } },
      ];
    } else {
      userMessageContent = content;
    }

    // append user message
    convo.messages.push({ role: "user", content: userMessageContent });
    convo.messages = trimMessages(convo.messages);
    await convo.save();

    // prepare messages for OpenAI (convert to expected shape)
    const messages = convo.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // call OpenAI
    const resp = await getChatCompletion(
      messages,
      process.env.OPENAI_MODEL || "gpt-4o-mini",
      4096
    );

    const assistantText = resp.text ?? "";

    // save assistant message
    convo.messages.push({ role: "assistant", content: assistantText });
    convo.messages = trimMessages(convo.messages);
    await convo.save();

    res.json({ assistant: assistantText, raw: resp.raw ?? null });
  } catch (err) {
    next(err);
  }
}

async function getConversationHandler(req, res, next) {
  try {
    const id = req.params.id;
    const userId = req.params.userId;

    if (userId) {
      // Buscar por userId
      const convo = await Conversation.findOne({ userId }).sort({ updatedAt: -1 });
      if (!convo) return res.status(404).json({ error: "Not found" });
      return res.json({ conversationId: convo.conversationId, messages: convo.messages });
    }

    const convo = await Conversation.findOne({ conversationId: id });
    if (!convo) return res.status(404).json({ error: "Not found" });
    res.json({ conversationId: id, messages: convo.messages });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  startConversation,
  sendMessage,
  getConversationHandler,
};