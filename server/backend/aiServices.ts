import Groq from "groq-sdk";
console.log("🔑 Loaded GROQ_API_KEY:", process.env.GROQ_API_KEY ? "✅ Present" : "❌ Missing");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Define return type
interface AIResponse {
  content: string;
  citations: string[];
}

// Optional helper to extract citations or references
function extractCitations(content: string): string[] {
  const regex = /\[\d+\]|\(See [^)]+\)/g;
  return content.match(regex) || [];
}

export async function generateAIResponse(message: string, language: string = "en"): Promise<AIResponse> {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a helpful AI legal assistant for Indian law.
          Always respond in ${language.toUpperCase()} language when possible.
          Provide accurate, well-researched legal information with proper citations where applicable.`
        },
        {
          role: "user",
          content: message
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024
    });

    const content = chatCompletion.choices[0]?.message?.content || "";

    return {
      content,
      citations: extractCitations(content)
    };
  } catch (error) {
    console.error("Groq Error:", error);
    throw new Error("Failed to generate AI response");
  }
}