// src/services/openaiService.js
const { max } = require("moment");
const { OpenAI } = require("openai");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Converts an HTTP(S) URL to a base64 data URL
 * Required for OpenAI Vision API compatibility
 */
async function convertUrlToBase64DataUrl(url) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const mimeType = response.headers.get('content-type') || 'image/jpeg';
  return `data:${mimeType};base64,${base64}`;
}

const getChatResponses = async function (
  moduleInstructions,
  messages,
  model, // Auto-detect based on content
  max_tokens = 1024
) {
  try {
    // Auto-detect if images are present in messages
    const hasImages = messages.some(msg => 
      Array.isArray(msg.content) && 
      msg.content.some(item => item.type === "input_image")
    );

    // Select model based on content and environment variables
    // OPENAI_MODEL_VISION: for image recognition (default: gpt-4o)
    // OPENAI_MODEL_TEXT: for text-only conversations (default: gpt-4o-mini)
    let selectedModel = model;
    
    if (!selectedModel) {
      // Auto-select based on content using environment variables
      selectedModel = hasImages 
        ? (process.env.OPENAI_MODEL_VISION || "gpt-4o")
        : (process.env.OPENAI_MODEL_TEXT || "gpt-4o-mini");
    } else if (hasImages && !selectedModel.includes("vision") && !selectedModel.includes("4o")) {
      // Override non-vision models when images are present
      const visionModel = process.env.OPENAI_MODEL_VISION || "gpt-4o";
      console.warn(`[OpenAI] Model '${selectedModel}' doesn't support images, switching to ${visionModel}`);
      selectedModel = visionModel;
    }

    console.log("[OpenAI getChatResponses] Model selection:", {
      hasImages,
      selectedModel,
      providedModel: model,
      messagesCount: messages.length
    });

    // Transform messages to OpenAI format
    const formattedMessages = await Promise.all(messages.map(async (msg) => {
      // If content is already a string, keep it
      if (typeof msg.content === "string") {
        return msg;
      }

      // If content is an array, transform it to OpenAI's expected format
      if (Array.isArray(msg.content)) {
        const content = await Promise.all(msg.content.map(async (item) => {
          if (item.type === "input_text") {
            return { type: "text", text: item.text };
          }
          if (item.type === "input_image") {
            // ✅ Convert HTTP URL to base64 data URL for OpenAI Vision API
            const imageDataUrl = await convertUrlToBase64DataUrl(item.image_url);
            return {
              type: "image_url",
              image_url: { url: imageDataUrl },
            };
          }
          return item; // pass through if already correct format
        }));
        return { role: msg.role, content };
      }

      return msg;
    }));

    // Add system message with instructions at the beginning
    const apiMessages = [
      { role: "system", content: moduleInstructions.instructions },
      ...formattedMessages,
    ];

    const resp = await client.chat.completions.create({
      model: selectedModel,
      messages: apiMessages,
      max_tokens: max_tokens,
    });

    console.log("[OpenAI getChatResponses] Response received:", {
      model: selectedModel,
      usage: resp.usage,
      finishReason: resp.choices?.[0]?.finish_reason
    });

    let content = resp.choices?.[0]?.message?.content ?? null;

    // 🔹 Normaliza cuando viene como array
    if (Array.isArray(content)) {
      content = content
        .filter((c) => c.type === "text")
        .map((c) => c.text)
        .join("\n");
    }

    return { raw: resp, text: content };
  } catch (err) {
    console.error("[OpenAI] error", err);
    throw err;
  }
};

const getChatCompletion = async function (
  messages,
  model = "gpt-4o",
  max_tokens = 1024
) {
  try {
    console.log("[OpenAI getChatCompletion] Request:", {
      model,
      messagesCount: messages.length,
      max_tokens
    });

    const resp = await client.chat.completions.create({
      model,
      messages,
      max_tokens,
    });

    console.log("[OpenAI getChatCompletion] Response received:", {
      model,
      usage: resp.usage,
      finishReason: resp.choices?.[0]?.finish_reason
    });

    let content = resp.choices?.[0]?.message?.content ?? null;

    // 🔹 Normaliza cuando viene como array
    if (Array.isArray(content)) {
      content = content
        .filter((c) => c.type === "text")
        .map((c) => c.text)
        .join("\n");
    }

    return { raw: resp, text: content };
  } catch (err) {
    console.error("[OpenAI] error", err);
    throw err;
  }
};

module.exports = { getChatCompletion, getChatResponses };
