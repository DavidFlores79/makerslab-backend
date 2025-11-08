// src/services/openaiService.js
const { max } = require("moment");
const { OpenAI } = require("openai");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const getChatResponses = async function (
  moduleInstructions,
  messages,
  model = "gpt-4o-mini",
  max_tokens = 1024
) {
  try {
    // Transform messages to OpenAI format
    const formattedMessages = messages.map((msg) => {
      // If content is already a string, keep it
      if (typeof msg.content === "string") {
        return msg;
      }

      // If content is an array, transform it to OpenAI's expected format
      if (Array.isArray(msg.content)) {
        const content = msg.content.map((item) => {
          if (item.type === "input_text") {
            return { type: "text", text: item.text };
          }
          if (item.type === "input_image") {
            return {
              type: "image_url",
              image_url: { url: item.image_url },
            };
          }
          return item; // pass through if already correct format
        });
        return { role: msg.role, content };
      }

      return msg;
    });

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
