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
    const resp = await client.responses.create({
      model: model,
      max_output_tokens: max_tokens,
      instructions: moduleInstructions.instructions,
      input: messages,
    });

    console.log(resp.output_text);

    let content = resp.output_text ?? null;

    // 🔹 Normaliza cuando viene como array
    if (Array.isArray(content)) {
      content = content
        .filter((c) => c.type === "input_text" || c.type === "text")
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
