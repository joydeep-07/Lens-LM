import Groq from "groq-sdk";
import { DEFAULT_SYSTEM_PROMPT } from "../config/prompts.js"; 

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const getGroqChatCompletion = async (
  messages,
  modelName = "llama-3.3-70b-versatile",
  systemPrompt = DEFAULT_SYSTEM_PROMPT, 
) => {
  try {
    const formattedMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    const response = await groq.chat.completions.create({
      messages: formattedMessages,
      model: modelName,
      temperature: 0.7,
      max_tokens: 2048,
    });

    return response.choices[0]?.message?.content || "No response generated.";
  } catch (error) {
    console.error("Groq API error:", error.message);
    throw new Error("Failed to communicate with AI service.");
  }
};
