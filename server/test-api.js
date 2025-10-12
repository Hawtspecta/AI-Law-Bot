import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function testGroq() {
  try {
    const message = "Explain the right to privacy under Indian Constitution.";
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful AI legal assistant for Indian law." },
        { role: "user", content: message }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024
    });

    const content = chatCompletion.choices[0]?.message?.content || "";
    console.log("\n🧠 AI Response:\n", content);
  } catch (error) {
    console.error("Groq Error:", error);
  }
}

testGroq();
