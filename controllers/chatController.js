// src/controllers/chatController.js
const Conversation = require("../models/conversation.model");
const { v4: uuidv4 } = require("uuid");
const {
  getChatCompletion,
  getChatResponses,
} = require("../services/openAIService");
const { getChatResponse } = require("../services/openAIChatService");
const { getModuleInstructions } = require("../config/constants");

const MAX_MESSAGES = Number(process.env.CONVO_MAX_MESSAGES || 30);

// helper: recorta el array de messages manteniendo los últimos MAX_MESSAGES
function trimMessages(messages) {
  if (!messages || messages.length <= MAX_MESSAGES) return messages;
  return messages.slice(-MAX_MESSAGES);
}

async function startConversation(req, res, next) {
  try {
    const { module } = req.body;
    const userId = req.user?.id;

    // Buscar si ya existe conversación de este usuario con ese módulo
    let conversation = await Conversation.findOne({ userId, module });

    if (!conversation) {
      conversation = new Conversation({
        conversationId: uuidv4(),
        userId,
        messages: [],
        module,
      });
      await conversation.save();
    }

    res.json({ conversationId: conversation.conversationId });
  } catch (err) {
    next(err);
  }
}

async function sendMessage(req, res, next) {
  try {
    const { conversationId, content, imageUrl } = req.body;
    let chatConversation = await Conversation.findOne({ conversationId });
    if (!chatConversation) {
      // create new conversation if not exists
      chatConversation = new Conversation({
        conversationId,
        userId: req.user?.id,
        messages: [],
      });
    }

    // Normaliza: siempre guardamos content como array de bloques
    const userContent = [];
    if (content && content !== "") {
      userContent.push({ type: "input_text", text: String(content) });
    }
    if (imageUrl) {
      // <-- IMPORTANTE: image_url debe ser STRING o data-uri string (no { url: ... })
      // puede ser: "https://..." o "data:image/png;base64,AAAA..."
      userContent.push({ type: "input_image", image_url: String(imageUrl) });
    }
    // si no hay texto ni imagen, abortar
    if (userContent.length === 0) {
      return res.status(400).json({ error: "Empty message" });
    }

    // Append usuario
    chatConversation.messages.push({ role: "user", content: userContent });
    chatConversation.messages = trimMessages(chatConversation.messages); // tu lógica
    await chatConversation.save();

    // prepare messages for OpenAI (convert to expected shape)
    const messages = chatConversation.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const moduleInstructions = getModuleInstructions(
      chatConversation.module || "default"
    );

    // call OpenAI
    const resp = await getChatResponses(
      moduleInstructions,
      messages,
      process.env.OPENAI_MODEL || "gpt-4o-mini",
      4096
    );

    const assistantText = resp.text ?? "";

    // save assistant message
    chatConversation.messages.push({
      role: "assistant",
      content: assistantText,
    });
    chatConversation.messages = trimMessages(chatConversation.messages);
    await chatConversation.save();

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
      const convo = await Conversation.findOne({ userId }).sort({
        updatedAt: -1,
      });
      if (!convo) return res.status(404).json({ error: "Not found" });
      return res.json({
        module: convo.module,
        conversationId: convo.conversationId,
        messages: convo.messages,
      });
    }

    const convo = await Conversation.findOne({ conversationId: id });
    if (!convo) return res.status(404).json({ error: "Not found" });
    res.json({ module: convo.module, conversationId: id, messages: convo.messages });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  startConversation,
  sendMessage,
  getConversationHandler,
};
