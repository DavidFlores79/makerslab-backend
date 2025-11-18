// src/controllers/chatController.js
const Conversation = require("../models/conversation.model");
const User = require("../models/user.model");
const UserChatUsage = require("../models/user_chat_usage.model");
const configService = require("../services/configurationService");
const { v4: uuidv4 } = require("uuid");
const {
  getChatCompletion,
  getChatResponses,
} = require("../services/openAIService");
const { getChatResponse } = require("../services/openAIChatService");
const { getModuleInstructions } = require("../config/constants");

// helper: recorta el array de messages manteniendo los últimos maxMessages
// Preserves the first system message with module instructions
function trimMessages(messages, maxMessages) {
  if (!messages || messages.length <= maxMessages) return messages;
  
  // Keep system message (first) + last (maxMessages - 1) messages
  const systemMessage = messages[0]?.role === 'system' ? messages[0] : null;
  const recentMessages = messages.slice(-(maxMessages - 1));
  
  return systemMessage ? [systemMessage, ...recentMessages] : recentMessages;
}

// helper: get only the messages to send to AI (limited by maxMessagesToAI)
function getMessagesForAI(messages, maxMessagesToAI) {
  if (!messages || messages.length <= maxMessagesToAI) return messages;
  
  // Always keep system message (first) + last (maxMessagesToAI - 1) messages
  const systemMessage = messages[0]?.role === 'system' ? messages[0] : null;
  const recentMessages = messages.slice(-(maxMessagesToAI - 1));
  
  return systemMessage ? [systemMessage, ...recentMessages] : recentMessages;
}

async function startConversation(req, res, next) {
  try {
    const { module } = req.body;
    const userId = req.user?.id;

    // Buscar si ya existe conversación de este usuario con ese módulo
    let conversation = await Conversation.findOne({ userId, module });

    if (!conversation) {
      // Fetch user data to personalize the conversation
      const user = await User.findById(userId);
      const userName = user?.name || "Usuario";
      
      // Get module instructions and add as system message
      const moduleInstructions = getModuleInstructions(module || "default");
      
      // Personalize instructions with user's name
      const personalizedInstructions = `${moduleInstructions.instructions}\n\nIMPORTANTE: El usuario con quien estás hablando se llama ${userName}. Dirígete a él/ella por su nombre cuando sea apropiado para crear una experiencia más personal y amigable.`;
      
      conversation = new Conversation({
        conversationId: uuidv4(),
        userId,
        messages: [
          {
            role: "system",
            content: personalizedInstructions
          }
        ],
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
    const userId = req.user?.id;
    
    // Get configuration settings from cache
    const chatLimits = await configService.getChatLimits();
    
    // Check daily user message limit
    const todayUsage = await UserChatUsage.getTodayUsage(userId);
    if (todayUsage.totalMessages >= chatLimits.maxUserMessagesPerDay) {
      return res.status(429).json({ 
        error: "Daily message limit reached",
        limit: chatLimits.maxUserMessagesPerDay,
        used: todayUsage.totalMessages,
        message: `Has alcanzado el límite diario de ${chatLimits.maxUserMessagesPerDay} mensajes. Intenta mañana.`
      });
    }
    
    const chatConversation = await Conversation.findOne({ conversationId });
    
    if (!chatConversation) {
      return res.status(404).json({ 
        error: "Conversation not found. Please start a conversation first using /chat/start" 
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

    // Increment usage count
    await UserChatUsage.incrementUsage(userId, conversationId);

    // Append usuario
    chatConversation.messages.push({ role: "user", content: userContent });
    chatConversation.messages = trimMessages(chatConversation.messages, chatLimits.maxMessagesInDB);
    await chatConversation.save();

    // prepare messages for OpenAI (limited by maxMessagesToAI)
    const allMessages = chatConversation.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    
    // Get only the messages to send to AI (respecting maxMessagesToAI limit)
    const messagesToSend = getMessagesForAI(allMessages, chatLimits.maxMessagesToAI);

    // call OpenAI (let it auto-detect model based on content)
    // System message with module instructions is already first message in conversation
    const resp = await getChatResponses(
      messagesToSend,
      null, // auto-detect: gpt-4o for images, gpt-4o-mini for text
      4096
    );

    const assistantText = resp.text ?? "";

    // save assistant message
    chatConversation.messages.push({
      role: "assistant",
      content: assistantText,
    });
    chatConversation.messages = trimMessages(chatConversation.messages, chatLimits.maxMessagesInDB);
    await chatConversation.save();

    // Get updated usage info
    const updatedUsage = await UserChatUsage.getTodayUsage(userId);

    res.json({ 
      assistant: assistantText, 
      raw: resp.raw ?? null,
      usage: {
        messagesUsedToday: updatedUsage.totalMessages,
        dailyLimit: chatLimits.maxUserMessagesPerDay,
        remaining: chatLimits.maxUserMessagesPerDay - updatedUsage.totalMessages
      }
    });
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
      
      // Filter out system messages before sending to frontend
      const userMessages = convo.messages.filter(msg => msg.role !== 'system');
      
      return res.json({
        module: convo.module,
        conversationId: convo.conversationId,
        messages: userMessages,
      });
    }

    const convo = await Conversation.findOne({ conversationId: id });
    if (!convo) return res.status(404).json({ error: "Not found" });
    
    // Filter out system messages before sending to frontend
    const userMessages = convo.messages.filter(msg => msg.role !== 'system');
    
    res.json({ module: convo.module, conversationId: id, messages: userMessages });
  } catch (err) {
    next(err);
  }
}

async function resetConversation(req, res, next) {
  try {
    const { conversationId } = req.params;
    const chatConversation = await Conversation.findOne({ conversationId });
    
    if (!chatConversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Clear all messages
    chatConversation.messages = [];
    await chatConversation.save();

    res.json({ message: "Conversation reset successfully", conversationId });
  } catch (err) {
    next(err);
  }
}

async function getChatUsageStats(req, res, next) {
  try {
    const userId = req.user?.id;
    
    // Get configuration settings from cache
    const chatLimits = await configService.getChatLimits();
    
    // Get today's usage
    const todayUsage = await UserChatUsage.getTodayUsage(userId);
    
    res.json({
      limits: chatLimits,
      usage: {
        messagesUsedToday: todayUsage.totalMessages,
        remaining: chatLimits.maxUserMessagesPerDay - todayUsage.totalMessages,
        percentage: Math.round((todayUsage.totalMessages / chatLimits.maxUserMessagesPerDay) * 100)
      },
      date: todayUsage.date
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  startConversation,
  sendMessage,
  getConversationHandler,
  resetConversation,
  getChatUsageStats,
};
