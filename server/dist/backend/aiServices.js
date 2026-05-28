"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAIResponse = generateAIResponse;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
console.log("🔑 Loaded GROQ_API_KEY:", process.env.GROQ_API_KEY ? "✅ Present" : "❌ Missing");
const groq = new groq_sdk_1.default({
    apiKey: process.env.GROQ_API_KEY
});
// Optional helper to extract citations or references
function extractCitations(content) {
    const regex = /\[\d+\]|\(See [^)]+\)/g;
    return content.match(regex) || [];
}
async function generateAIResponse(message, language = "en") {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a helpful AI legal assistant for Indian law.
Always respond in ${language.toUpperCase()} language when possible.
Provide accurate, well-researched legal information with proper citations where applicable.

IMPORTANT FORMATTING RULES:
- Use clear section breaks with blank lines between sections
- Use numbered steps (1., 2., 3.) for procedures
- Use bullet points (•) for lists
- For emphasis, use CAPITAL LETTERS or repeat important words
- Keep paragraphs short (2-3 sentences max)
- Add visual separators like "---" or "====" between major sections
- DO NOT use markdown syntax like ** or ### as they won't render properly
- Structure your response with clear headings followed by content`
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
    }
    catch (error) {
        console.error("Groq Error:", error);
        throw new Error("Failed to generate AI response");
    }
}
//# sourceMappingURL=aiServices.js.map