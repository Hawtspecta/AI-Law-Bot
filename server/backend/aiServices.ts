import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateAIResponse(message: string, language: string = 'en') {
  try {
    const languageInstructions = {
      en: "Respond in English. You are a helpful AI legal assistant for Indian law. Provide clear, accurate information and cite relevant laws and acts.",
      hi: "Respond in Hindi (हिन्दी). आप भारतीय कानून के लिए एक सहायक AI कानूनी सहायक हैं। स्पष्ट, सटीक जानकारी प्रदान करें और प्रासंगिक कानूनों और अधिनियमों का उल्लेख करें।",
      mr: "Respond in Marathi (मराठी). तुम्ही भारतीय कायद्यासाठी एक सहायक AI कायदेशीर सहाय्यक आहात. स्पष्ट, अचूक माहिती द्या आणि संबंधित कायदे आणि कायद्यांचा उल्लेख करा.",
      ta: "Respond in Tamil (தமிழ்). நீங்கள் இந்திய சட்டத்திற்கான உதவியாளர் AI சட்ட உதவியாளர். தெளிவான, துல்லியமான தகவலை வழங்குங்கள் மற்றும் தொடர்புடைய சட்டங்கள் மற்றும் சட்டங்களை மேற்கோள் காட்டுங்கள்.",
      kn: "Respond in Kannada (ಕನ್ನಡ). ನೀವು ಭಾರತೀಯ ಕಾನೂನಿಗಾಗಿ ಸಹಾಯಕ AI ಕಾನೂನು ಸಹಾಯಕ. ಸ್ಪಷ್ಟ, ನಿಖರವಾದ ಮಾಹಿತಿಯನ್ನು ಒದಗಿಸಿ ಮತ್ತು ಸಂಬಂಧಿತ ಕಾನೂನುಗಳು ಮತ್ತು ಕಾಯಿದೆಗಳನ್ನು ಉಲ್ಲೇಖಿಸಿ."
    };

    const systemPrompt = languageInstructions[language as keyof typeof languageInstructions] || languageInstructions.en;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const content = completion.choices[0]?.message?.content || "I apologize, but I couldn't generate a response.";
    
    // Extract potential citations
    const citations = extractCitations(content);

    return {
      content,
      citations
    };
  } catch (error) {
    console.error('AI Service Error:', error);
    return {
      content: "I'm having trouble processing your request. Please try again.",
      citations: []
    };
  }
}

function extractCitations(text: string): string[] {
  const citations: string[] = [];
  const actPattern = /([A-Z][a-z]+(?: [A-Z][a-z]+)* Act,? \d{4})/g;
  const sectionPattern = /Section \d+/g;
  
  const acts = text.match(actPattern) || [];
  const sections = text.match(sectionPattern) || [];
  
  return [...new Set([...acts, ...sections])];
}

export async function analyzeDocument(content: string, fileType: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a legal document analyzer. Analyze the document and identify key points, risks, and compliance issues."
        },
        {
          role: "user",
          content: `Analyze this document:\n\n${content.substring(0, 8000)}`
        }
      ],
      temperature: 0.5,
      max_tokens: 1500
    });

    const analysis = completion.choices[0]?.message?.content || "";
    
    return {
      summary: analysis.substring(0, 500),
      keyPoints: extractKeyPoints(analysis),
      risks: extractRisks(analysis),
      recommendations: extractRecommendations(analysis)
    };
  } catch (error) {
    console.error('Document Analysis Error:', error);
    throw error;
  }
}

function extractKeyPoints(text: string): string[] {
  // Simple extraction - enhance as needed
  return text.split('\n').filter(line => line.trim().length > 0).slice(0, 5);
}

function extractRisks(text: string): any[] {
  return [];
}

function extractRecommendations(text: string): string[] {
  return [];
}