import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const getChatResponse = async (message, moduleInstructions) => {
  // Initialize the OpenAI client with your API key
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await client.responses.create({
    model: "gpt-4o-mini",
    max_output_tokens: 1024,
    instructions: moduleInstructions.instructions,
    input: [
        { role: "user", content: message }
    ],
  });

  console.log(response.output_text);
  
  return response;
};

export { getChatResponse };
