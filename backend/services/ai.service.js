import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const getGroqChatCompletion = async (
  messages,
  modelName = "llama-3.3-70b-versatile",
) => {
  try {
    const response = await groq.chat.completions.create({
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
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
