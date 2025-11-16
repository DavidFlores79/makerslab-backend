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
  model = "gpt-4o-mini",
  max_tokens = 1024
) {
  try {
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
      model: model,
      messages: apiMessages,
      max_tokens: max_tokens,
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
  model = "gpt-4o-mini",
  max_tokens = 1024
) {
  try {
    const resp = await client.chat.completions.create({
      model,
      messages,
      max_tokens,
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
