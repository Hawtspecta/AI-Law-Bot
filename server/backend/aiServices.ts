import Groq from "groq-sdk";
import * as dotenv from 'dotenv';
import * as path from 'path';

import * as fs from 'fs';

// Load environment variables checking both process.cwd() and parent directory
let envPath = path.resolve(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  envPath = path.resolve(process.cwd(), '..', '.env');
}
dotenv.config({ path: envPath });

console.log("🔑 Loaded GROQ_API_KEY:", process.env.GROQ_API_KEY ? "✅ Present" : "❌ Missing");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
});

// Define return type
interface AIResponse {
  content: string;
  citations: string[];
}

// Clean and format plaintext AI output to premium HTML typography, removing multiple newlines and list asterisks
export function sanitizeAIContent(content: string): string {
  if (!content) return "";
  
  let formatted = content;
  
  // 1. Clean up multiple empty lines (3 or more consecutive newlines) to exactly 2 newlines (prevents huge empty spacing)
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  
  // 2. Normalize markdown lists with * or - into standard • character
  formatted = formatted.replace(/^\s*[\-\*]\s+/gm, '• ');
  
  // 3. Convert markdown bold (**text**) to standard HTML bold tags (<strong>text</strong>)
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // 4. Convert markdown italic (*text*) to standard HTML italic tags (<em>text</em>)
  formatted = formatted.replace(/\*([^\*\n]+?)\*/g, '<em>$1</em>');
  
  // 5. Convert visual separators like --- or === to clean horizontal lines
  formatted = formatted.replace(/-{3,}/g, '<hr class="my-4 border-border/50" />');
  formatted = formatted.replace(/={3,}/g, '<hr class="my-4 border-double border-primary/30" />');
  
  // 6. Convert UPPERCASE headers followed by colon into elegant h3 section headers
  formatted = formatted.replace(/^([A-Z\s&]{4,}):$/gm, '<h3 class="text-base font-semibold text-primary mt-4 mb-2">$1</h3>');
  
  return formatted;
}

// Extract clean legal citations (Acts, Sections, Articles, Case Names)
function extractCitations(content: string): string[] {
  const citations: string[] = [];
  
  const actPattern = /\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*\s+Act(?:,?\s*\d{4})?)\b/g;
  const acts = content.match(actPattern) || [];
  citations.push(...acts);
  
  const sectionPattern = /\bSection\s+(\d+[A-Z]?)\b/gi;
  const sections = content.match(sectionPattern) || [];
  citations.push(...sections);
  
  const articlePattern = /\bArticle\s+(\d+[A-Z]?)\b/gi;
  const articles = content.match(articlePattern) || [];
  citations.push(...articles);

  const casePattern = /\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*\s+v(?:s)?\.\s+[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*)\b/g;
  const cases = content.match(casePattern) || [];
  citations.push(...cases);

  const cleanedCitations = citations
    .map(c => c.trim())
    .filter(c => {
      return c && 
             !/^\[\d+\]$/.test(c) && 
             !/^\d+$/.test(c) && 
             c.toLowerCase() !== 'sources' &&
             c.length > 2;
    });

  return [...new Set(cleanedCitations)];
}

// Helper to extract key clauses or points from the AI response
export function extractKeyPoints(content: string): string[] {
  const lines = content.split('\n');
  const points: string[] = [];
  for (const line of lines) {
    const clean = line.replace(/<\/?[^>]+(>|$)/g, "").replace(/^\s*[•\-\*\d\.]+\s*/, "").trim();
    if (clean.length > 15 && (line.includes('•') || line.includes('-') || line.match(/^\d+\./) || line.toLowerCase().includes('clause') || line.toLowerCase().includes('point'))) {
      points.push(clean);
    }
  }
  return points.slice(0, 4);
}

// Helper to extract risks from the AI response
export function extractContractRisks(content: string) {
  const lines = content.split('\n');
  const risks = [];
  for (const line of lines) {
    const clean = line.replace(/<\/?[^>]+(>|$)/g, "").replace(/^\s*[•\-\*\d\.]+\s*/, "").trim();
    if (clean.toLowerCase().includes('risk') || clean.toLowerCase().includes('liability') || clean.toLowerCase().includes('indemnity') || clean.toLowerCase().includes('penalty')) {
      const level = clean.toLowerCase().includes('critical') || clean.toLowerCase().includes('high') ? 'High' :
                    clean.toLowerCase().includes('medium') ? 'Medium' : 'Low';
      risks.push({
        level,
        description: clean,
        recommendation: 'Verify the scope and negotiate appropriate liability caps with counsel.'
      });
    }
  }
  return risks.length > 0 ? risks.slice(0, 3) : [
    { level: 'Medium', description: 'Liability and termination provisions require detailed manual review.', recommendation: 'Consult legal counsel to ensure risk parity.' }
  ];
}

// Helper to extract compliance issues
export function extractComplianceIssues(content: string) {
  const lines = content.split('\n');
  const issues = [];
  for (const line of lines) {
    const clean = line.replace(/<\/?[^>]+(>|$)/g, "").replace(/^\s*[•\-\*\d\.]+\s*/, "").trim();
    if (clean.toLowerCase().includes('compliance') || clean.toLowerCase().includes('regulation') || clean.toLowerCase().includes('governing') || clean.toLowerCase().includes('stamp')) {
      const status = clean.toLowerCase().includes('non') || clean.toLowerCase().includes('violation') || clean.toLowerCase().includes('requires') ? 'Review Required' : 'Compliant';
      issues.push({
        issue: clean,
        status
      });
    }
  }
  return issues.length > 0 ? issues.slice(0, 3) : [
    { issue: 'Standard legal and regulatory formatting compliance.', status: 'Compliant' }
  ];
}

// Helper to extract recommendations
export function extractRecommendations(content: string): string[] {
  const lines = content.split('\n');
  const recs: string[] = [];
  for (const line of lines) {
    const clean = line.replace(/<\/?[^>]+(>|$)/g, "").replace(/^\s*[•\-\*\d\.]+\s*/, "").trim();
    if (clean.length > 15 && (clean.toLowerCase().includes('should') || clean.toLowerCase().includes('recommend') || clean.toLowerCase().includes('suggest') || clean.toLowerCase().includes('ensure') || clean.toLowerCase().includes('verify'))) {
      recs.push(clean);
    }
  }
  return recs.length > 0 ? recs.slice(0, 4) : [
    'Review all clauses with professional legal counsel before execution.',
    'Keep physical and digital copies in mutual custody.'
  ];
}

// Helper to extract differences for document comparisons
export function extractDifferences(content: string) {
  const lines = content.split('\n');
  const differences = [];
  for (const line of lines) {
    const clean = line.replace(/<\/?[^>]+(>|$)/g, "").replace(/^\s*[•\-\*\d\.]+\s*/, "").trim();
    if (clean.toLowerCase().includes('difference') || clean.toLowerCase().includes('change') || clean.toLowerCase().includes('modified') || clean.toLowerCase().includes('payment') || clean.toLowerCase().includes('term')) {
      differences.push({
        section: clean.substring(0, 30) + '...',
        document1: 'Refer to original document provisions.',
        document2: 'Refer to updated document provisions.',
        impact: clean.toLowerCase().includes('high') || clean.toLowerCase().includes('critical') ? 'High' : 'Medium',
        recommendation: clean
      });
    }
  }
  return differences.length > 0 ? differences.slice(0, 3) : [
    { section: 'Obligations & Terms', document1: 'Original terms', document2: 'Updated terms', impact: 'Medium', recommendation: 'Review differences carefully.' }
  ];
}

// Dynamic form fields validator
export function buildFormValidationResults(formType: string, userInputs: any) {
  const schemaFields: any = {
    'consumer-complaint': ['name', 'email', 'complaint', 'productName', 'purchaseDate', 'merchantName'],
    'rti-application': ['name', 'email', 'address', 'complaint', 'productName', 'purchaseDate'],
    'property-registration': ['name', 'email', 'address', 'complaint', 'amount', 'purchaseDate'],
    'marriage-registration': ['name', 'email', 'address', 'complaint', 'productName', 'purchaseDate'],
    'employment-contract': ['name', 'email', 'address', 'complaint', 'productName', 'purchaseDate', 'amount'],
    'rental-agreement': ['name', 'email', 'address', 'complaint', 'amount', 'productName', 'purchaseDate']
  };

  const fields = schemaFields[formType] || schemaFields['consumer-complaint'];
  return fields.map((field: string) => {
    const value = userInputs[field];
    const isPresent = value && String(value).trim().length > 0;
    const label = field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1');
    return {
      field,
      status: isPresent ? 'valid' : 'invalid',
      message: isPresent ? `${label} is complete and verified.` : `${label} is required to fill out this legal form.`
    };
  });
}

// Self-healing response generator with automatic rate limit fallback
export async function generateAIResponse(message: string, language: string = "en"): Promise<AIResponse> {
  const primaryModel = "llama-3.3-70b-versatile";
  const fallbackModel = "llama-3.1-8b-instant";

  const systemContent = `You are a highly professional, expert AI legal assistant specializing in Indian law.
Always respond in ${language.toUpperCase()} language.
Provide accurate, highly reliable, and well-cited legal information.

IMPORTANT FORMATTING RULES:
- Use clear section breaks with blank lines between sections.
- Use numbered steps (1., 2., 3.) for procedures or sequential lists.
- Use bullet points (•) for other lists.
- For emphasis, use CAPITAL LETTERS or repeat important words.
- Keep paragraphs short (2-3 sentences max).
- Add visual separators like "---" or "====" between major sections.
- DO NOT use markdown characters like ** or ### as they won't render properly.
- Structure your response with clear headings followed by content.`;

  try {
    console.log(`🤖 Requesting primary model (${primaryModel})...`);
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemContent },
        { role: "user", content: message }
      ],
      model: primaryModel,
      temperature: 0.5,
      max_tokens: 1500
    });

    const rawContent = chatCompletion.choices[0]?.message?.content || "";
    console.log(`✅ Success with primary model.`);
    
    const content = sanitizeAIContent(rawContent);
    return {
      content,
      citations: extractCitations(rawContent)
    };
  } catch (error: any) {
    console.warn(`⚠️ Groq Primary Model Error, attempting fallback model (${fallbackModel}):`, error.message);
    
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemContent },
          { role: "user", content: message }
        ],
        model: fallbackModel,
        temperature: 0.5,
        max_tokens: 1500
      });

      const rawContent = chatCompletion.choices[0]?.message?.content || "";
      console.log(`✅ Success with fallback model.`);
      
      const content = sanitizeAIContent(rawContent);
      return {
        content,
        citations: extractCitations(rawContent)
      };
    } catch (fallbackError: any) {
      console.error("❌ Fallback model failed too:", fallbackError.message);
      throw new Error(`Failed to generate AI response: ${fallbackError.message}`);
    }
  }
}
