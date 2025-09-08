// src/services/openaiService.js
const { OpenAI } = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Llama a OpenAI Chat Completions (no streaming).
 * messages: [{ role, content }]
 */
module.exports.getChatCompletion = async function (messages, model = 'gpt-4o-mini', max_tokens = 1024) {
  try {
    const resp = await client.chat.completions.create({
      model,
      messages,
      max_tokens
    });
    // Ajusta según la versión del SDK: normalmente resp.choices[0].message.content
    const content = resp.choices?.[0]?.message?.content ?? null;
    return { raw: resp, text: content };
  } catch (err) {
    console.error('[OpenAI] error', err);
    throw err;
  }
}
