// src/services/openaiService.js
const { OpenAI } = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const getChatCompletion = async function (messages, model = 'gpt-4o-mini', max_tokens = 1024) {
  try {
    const resp = await client.chat.completions.create({
      model,
      messages,
      max_tokens
    });

    let content = resp.choices?.[0]?.message?.content ?? null;

    // 🔹 Normaliza cuando viene como array
    if (Array.isArray(content)) {
      content = content
        .filter(c => c.type === 'text')
        .map(c => c.text)
        .join('\n');
    }

    return { raw: resp, text: content };
  } catch (err) {
    console.error('[OpenAI] error', err);
    throw err;
  }
};

module.exports = { getChatCompletion };
