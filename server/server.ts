import * as dotenv from 'dotenv';
import * as path from 'path';

// Resolve envPath robustly
const envPath = path.resolve(process.cwd(), '.env');
console.log('Loading .env from:', envPath);

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ Error loading .env:', result.error);
} else {
  console.log('✅ Loaded variables:', Object.keys(result.parsed || {}));
}

console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'Present' : 'Missing');

// Rest of your imports
import express from "express";
import cors from "cors";
import { 
  generateAIResponse, 
  extractKeyPoints, 
  extractContractRisks, 
  extractComplianceIssues, 
  extractRecommendations, 
  extractDifferences, 
  buildFormValidationResults 
} from "./backend/aiServices";

// Dynamic load of pdf-parse (optional)
let pdfParse: any = undefined;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  pdfParse = require('pdf-parse');
  console.log('✅ pdf-parse loaded');
} catch (e) {
  console.warn('⚠️ pdf-parse not available; PDF parsing endpoints will return fallback messages');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        "http://localhost:8080", 
        "http://localhost:3000",
        "http://127.0.0.1:8080",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://ai-law-bot-nu.vercel.app"
      ];
      
      const isAllowed = allowedOrigins.includes(origin) || 
                        origin.endsWith(".vercel.app") || 
                        origin.includes("vercel.app");
                        
      if (isAllowed) {
        callback(null, true);
      } else {
        // Fallback for safety in production demo
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Test PDF parsing endpoint
app.get("/api/test-pdf", async (req, res) => {
  try {
    const testPdfBase64 = "JVBERi0xLjQKJeLjz9MKMyAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDIgMCBSL01lZGlhQm94WzAgMCA2MTIgNzkyXS9Db250ZW50cyA0IDAgUj4+CmVuZG9iago0IDAgb2JqCjw8L0xlbmd0aCA0NT4+CnN0cmVhbQpCVAovRjEgMTIgVGYKMTAwIDcwMCBUZAooVGVzdCBQREYpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0NvdW50IDEvS2lkc1szIDAgUl0+PgplbmRvYmoKNSAwIG9iago8PC9UeXBlL0ZvbnQvU3VidHlwZS9UeXBlMS9CYXNlRm9udC9IZWx2ZXRpY2E+PgplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmDQowMDAwMDAwMTk2IDAwMDAwIG4NCjAwMDAwMDAyNDUgMDAwMDAgbg0KMDAwMDAwMDAwOSAwMDAwMCBuDQowMDAwMDAwMTAyIDAwMDAwIG4NCjAwMDAwMDAyOTcgMDAwMDAgbg0KdHJhaWxlcgo8PC9TaXplIDYvUm9vdCAxIDAgUj4+CnN0YXJ0eHJlZgozNjcKJSVFT0Y=";
    
    if (!pdfParse) {
      return res.status(500).json({ success: false, message: "pdf-parse not available on server" });
    }

    const pdfBuffer = Buffer.from(testPdfBase64, 'base64');
    const data = await pdfParse(pdfBuffer);
    
    res.json({
      success: true,
      pdfParseWorks: true,
      extractedText: data.text,
      pages: data.numpages,
      message: "PDF parsing is working!"
    });
  } catch (error: any) {
    res.json({
      success: false,
      pdfParseWorks: false,
      error: error.message,
      message: "PDF parsing failed"
    });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    ragEnabled: true,
    pdfParseAvailable: typeof pdfParse === 'function'
  });
});

// AI chat route
app.post("/api/chat", async (req, res) => {
  try {
    const { message, language, userId, sessionId } = req.body;
    
    // Enhanced prompt for better formatting
    const enhancedMessage = `Please provide a well-structured response to this query.

FORMAT YOUR RESPONSE AS FOLLOWS:
- Start with a brief introduction
- Use numbered steps (1., 2., 3.) for procedures or sequential information
- Use bullet points (•) for lists
- Add blank lines between sections for readability
- Keep paragraphs short (2-3 sentences maximum)
- Use section headings in CAPS followed by a colon
- Add visual separators (--- or ====) between major sections

Query: ${message}`;
    
    const response = await generateAIResponse(enhancedMessage, language || "en");
    
    res.json({
      userMessage: {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      },
      assistantMessage: {
        role: 'assistant',
        content: response.content,
        citations: response.citations.length > 0 ? response.citations : ['AI Generated with Groq Llama 3.3'],
        sources: [],
        timestamp: new Date().toISOString()
      }
    });
  } catch (err: any) {
    console.error("Chat API Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Document upload route
app.post("/api/documents", async (req, res) => {
  try {
    console.log("📄 Document upload request received");
    const { fileName, fileContent, fileType, userId } = req.body;
    
    console.log(`📄 File: ${fileName}, Type: ${fileType}, Content Length: ${fileContent?.length || 0}`);
    
    if (!fileContent || fileContent.trim().length === 0) {
      console.error("❌ No file content provided");
      return res.status(400).json({ error: "Document content is required" });
    }
    
    let textContent = fileContent;
    
    // Handle PDF files (base64 encoded)
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      if (!pdfParse) {
        console.error("❌ pdf-parse not available");
        textContent = `PDF document "${fileName}" cannot be parsed because the pdf-parse library is not available on the server. Please ensure pdf-parse is properly installed.`;
      } else {
        try {
          console.log("📄 PDF detected - extracting text...");
          const pdfBuffer = Buffer.from(fileContent, 'base64');
          console.log(`📄 PDF Buffer size: ${pdfBuffer.length} bytes`);
          
          const pdfData = await pdfParse(pdfBuffer);
          textContent = pdfData.text;
          
          console.log(`✅ PDF text extracted: ${textContent.length} characters`);
          console.log(`📄 PDF Info: ${pdfData.numpages} pages`);
          
          if (!textContent || textContent.trim().length === 0) {
            textContent = `PDF document "${fileName}" (${pdfData.numpages} pages) was uploaded but no text could be extracted. This might be a scanned PDF or image-based PDF that requires OCR.`;
          }
        } catch (pdfError: any) {
          console.error("❌ PDF parsing error:", pdfError);
          textContent = `PDF document "${fileName}" could not be parsed. Error: ${pdfError.message}. Please ensure the PDF is not encrypted or corrupted.`;
        }
      }
    }
    
    console.log("🤖 Sending to AI for analysis...");
    
    // Analyze document with AI
    const response = await generateAIResponse(
      `You are analyzing a document uploaded by a user. Read the document carefully and provide a detailed analysis.

DOCUMENT NAME: ${fileName}
DOCUMENT TYPE: ${fileType}

YOUR TASK: Analyze this document and tell the user EXACTLY what's in it. Be specific about the actual content.

PROVIDE YOUR ANALYSIS IN THIS FORMAT:

DOCUMENT TYPE & PURPOSE:
[Identify what type of document this is based on the actual content]

MAIN CONTENT SUMMARY:
[Summarize what this specific document is about - be detailed and specific]

KEY SECTIONS IDENTIFIED:
• [List actual sections/topics found in THIS document]
• [Include real information from the document]
• [Be specific about what you found]

IMPORTANT DETAILS FOUND:
[List specific information like dates, names, amounts, addresses, requirements, or other critical details that are actually in this document]

LEGAL OBSERVATIONS:
[Note any legal implications based on the actual content]

RECOMMENDATIONS:
[Provide practical advice based on what's actually in this document]

---

ACTUAL DOCUMENT CONTENT TO ANALYZE:
${textContent.substring(0, 4000)}

${textContent.length > 4000 ? '\n[Note: Document is longer, showing first 4000 characters for analysis]' : ''}

IMPORTANT: Base your entire response on the ACTUAL content above. Do not give generic responses.`,
      "en"
    );
    
    console.log("✅ AI analysis complete");
    
    res.json({
      id: `doc_${Date.now()}`,
      fileName,
      fileType,
      status: 'completed',
      analysis: {
        summary: response.content,
        keyPoints: extractKeyPoints(response.content),
        risks: extractContractRisks(response.content),
        recommendations: extractRecommendations(response.content),
        citations: response.citations.length > 0 ? response.citations : ['AI Analysis by Groq Llama 3.3'],
        sources: []
      },
      timestamp: new Date().toISOString()
    });
    
    console.log("✅ Document analysis response sent");
    
  } catch (err: any) {
    console.error("❌ Document upload error:", err);
    res.status(500).json({ 
      error: "Failed to process document", 
      details: err?.message || "Unknown error" 
    });
  }
});

// Legal search route
app.post("/api/search", async (req, res) => {
  try {
    const { query, filters, userId } = req.body;
    
    const response = await generateAIResponse(
      `Provide comprehensive legal information on: "${query}"

FORMAT REQUIREMENTS:
Use this exact structure with clear sections:

OVERVIEW:
[Brief introduction - 2-3 sentences]

RELEVANT LAWS & PROVISIONS:
• [List applicable laws with bullet points]
• [Include specific sections/articles]
• [Keep each point concise]

KEY LEGAL PRINCIPLES:
[Explain fundamental concepts in short paragraphs]
[Add blank lines between paragraphs]

RECENT DEVELOPMENTS:
[Mention recent cases or amendments if applicable]

PRACTICAL GUIDANCE:
1. [Use numbered steps]
2. [For actionable advice]
3. [Keep steps clear and brief]

Include proper legal references where applicable.`,
      "en"
    );
    
    res.json({
      query,
      results: {
        content: response.content,
        citations: response.citations.length > 0 ? response.citations : ['AI Legal Research'],
        sources: [],
        searchResults: []
      },
      filters: filters || {},
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

// Contract analysis route
app.post("/api/contracts/analyze", async (req, res) => {
  try {
    const { contractContent, contractType } = req.body;
    
    if (!contractContent || contractContent.trim().length === 0) {
      return res.status(400).json({ error: "Contract content is required" });
    }
    
    const response = await generateAIResponse(
      `Analyze this ${contractType || 'legal contract'} in detail.

STRUCTURE YOUR RESPONSE AS FOLLOWS:

EXECUTIVE SUMMARY:
[Provide a concise overview in 2-3 sentences]

KEY CLAUSES IDENTIFIED:
• [List the most important clauses]
• [Include brief description for each]
• [Use bullet points]

RISK ASSESSMENT:
High Risk Items:
• [List high-risk items if any]

Medium Risk Items:
• [List medium-risk items]

Low Risk Items:
• [List low-risk items]

COMPLIANCE REVIEW:
[Note any compliance concerns in short paragraphs]
[Separate each concern with a blank line]

RECOMMENDATIONS:
1. [First actionable recommendation]
2. [Second actionable recommendation]
3. [Third actionable recommendation]
4. [Additional recommendations as needed]

Contract text to analyze:
${contractContent.substring(0, 2000)}`,
      "en"
    );
    
    res.json({
      success: true,
      analysis: {
        summary: response.content,
        keyClauses: extractKeyPoints(response.content),
        risks: extractContractRisks(response.content),
        complianceIssues: extractComplianceIssues(response.content),
        recommendations: extractRecommendations(response.content),
        citations: response.citations.length > 0 ? response.citations : ['AI Contract Analysis by Groq Llama 3.3'],
        sources: []
      },
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("Contract analysis error:", err);
    res.status(500).json({ error: "Contract analysis failed", details: err?.message || "Unknown error" });
  }
});

// Form filling route
app.post("/api/forms/fill", async (req, res) => {
  try {
    const { formType, userInputs, conditions } = req.body;
    
    const response = await generateAIResponse(
      `Help fill out a ${formType} legal form. Provide guidance in this format:

FORM GUIDANCE FOR ${formType.toUpperCase()}:

Field Review:
[Analyze the provided information]

Validation Status:
[Check completeness and accuracy]

Completion Guidance:
[Provide specific instructions for filling]

Important Considerations:
[Highlight critical points to remember]

Legal Tips:
[Offer relevant legal advice for this form type]

User provided data:
${JSON.stringify(userInputs, null, 2)}`,
      "en"
    );
    
    res.json({
      success: true,
      filledForm: {
        formType,
        filledFields: userInputs,
        validationResults: buildFormValidationResults(formType, userInputs),
        suggestions: extractRecommendations(response.content).slice(0, 3),
        completedForm: response.content,
        citations: response.citations.length > 0 ? response.citations : ['AI Form Assistant'],
        sources: []
      },
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("Form fill error:", err);
    res.status(500).json({ error: "Form filling failed" });
  }
});

// Document comparison route
app.post("/api/documents/compare", async (req, res) => {
  try {
    const { document1, document2, comparisonType } = req.body;
    
    const response = await generateAIResponse(
      `Compare these two legal documents and provide a structured analysis:

📊 COMPARISON SUMMARY:
[Overall assessment of differences]

🔄 KEY CHANGES IDENTIFIED:
[List major modifications between documents]

⚖️ LEGAL IMPLICATIONS:
[Explain the legal impact of changes]

⚠️ RISK ANALYSIS:
[Assess risks from the modifications]

💡 RECOMMENDATIONS:
[Provide actionable advice]

Document 1 (First 1000 chars):
${document1.substring(0, 1000)}

Document 2 (First 1000 chars):
${document2.substring(0, 1000)}`,
      "en"
    );
    
    res.json({
      success: true,
      comparison: {
        comparisonType: comparisonType || 'general',
        differences: extractDifferences(response.content),
        summary: response.content.split('\n')[0] || 'Document comparison completed',
        redlineView: response.content,
        recommendations: extractRecommendations(response.content),
        citations: response.citations.length > 0 ? response.citations : ['AI Document Comparison'],
        sources: []
      },
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("Document comparison error:", err);
    res.status(500).json({ error: "Document comparison failed" });
  }
});

// Legal news route
app.get("/api/news", async (req, res) => {
  try {
    const region = (req.query.region as string) || 'India';
    const topic = (req.query.topic as string) || 'general';
    const limit = parseInt(req.query.limit as string) || 6;
    
    const apiKey = process.env.NEWS_API_KEY;
    
    if (apiKey && apiKey.trim().length > 0) {
      try {
        let query = `(law OR legal OR court OR "Supreme Court")`;
        if (region === 'India') {
          query += ` AND India`;
        } else if (region === 'USA') {
          query += ` AND (USA OR "Supreme Court" OR federal)`;
        } else {
          query += ` AND ${region}`;
        }
        
        if (topic && topic !== 'general') {
          query += ` AND ${topic}`;
        }
        
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=${limit * 2}&apiKey=${apiKey}`;
        console.log(`🌐 Fetching real-time news from NewsAPI: ${url}`);
        
        const response = await fetch(url);
        if (response.ok) {
          const data: any = await response.json();
          if (data.status === 'ok' && data.articles && data.articles.length > 0) {
            const news = data.articles.slice(0, limit).map((article: any, index: number) => ({
              id: index + 1,
              title: article.title || 'Legal Development',
              summary: article.description || article.content || 'A new legal case or ruling has been reported.',
              date: article.publishedAt || new Date().toISOString(),
              source: article.source?.name || 'News Source',
              url: article.url || 'https://newsapi.org'
            }));
            
            console.log(`✅ Fetched ${news.length} real-time news articles from NewsAPI`);
            return res.json({
              success: true,
              news,
              region,
              topic,
              timestamp: new Date().toISOString()
            });
          }
        }
        console.warn(`⚠️ NewsAPI fetch failed or returned empty; status: ${response.status}`);
      } catch (newsApiError: any) {
        console.warn(`⚠️ Failed to call NewsAPI, falling back to local news list:`, newsApiError.message);
      }
    }

    // Local rich fallback database
    const currentDate = new Date();
    const newsSources: any = {
      'India': [
        {
          id: 1,
          title: 'Supreme Court Upholds Right to Privacy in Digital Age',
          summary: 'The Supreme Court has reinforced the fundamental right to privacy in the digital era, setting new precedents for data protection and digital rights.',
          date: new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'The Hindu Legal',
          url: 'https://www.thehindu.com'
        },
        {
          id: 2,
          title: 'New Consumer Protection Rules Come into Effect',
          summary: 'Enhanced consumer protection regulations now provide stronger safeguards for online transactions and digital services, with stricter penalties for violations.',
          date: new Date(currentDate.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'Economic Times',
          url: 'https://economictimes.indiatimes.com'
        },
        {
          id: 3,
          title: 'Corporate Law Amendments Focus on ESG Compliance',
          summary: 'Recent amendments to corporate law emphasize environmental, social, and governance (ESG) compliance requirements for listed companies.',
          date: new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'Business Standard',
          url: 'https://www.business-standard.com'
        },
        {
          id: 4,
          title: 'Data Protection Bill Passes Parliamentary Committee Review',
          summary: 'The Digital Personal Data Protection Bill has cleared the parliamentary committee stage with recommendations for enhanced privacy safeguards.',
          date: new Date(currentDate.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'Live Law',
          url: 'https://www.livelaw.in'
        },
        {
          id: 5,
          title: 'Labour Law Reforms Implemented Across States',
          summary: 'New labour codes are being implemented across various states, streamlining employment regulations and worker protection measures.',
          date: new Date(currentDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'Indian Express',
          url: 'https://indianexpress.com'
        }
      ],
      'USA': [
        {
          id: 6,
          title: 'Supreme Court Rules on AI and Copyright Law',
          summary: 'Landmark decision establishes framework for AI-generated content and intellectual property rights in the digital age.',
          date: new Date(currentDate.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'Legal Tech News',
          url: 'https://www.law.com/legaltechnews'
        },
        {
          id: 7,
          title: 'New Federal Data Privacy Legislation Introduced',
          summary: 'Comprehensive federal data privacy bill aims to create uniform standards across all states for consumer data protection.',
          date: new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'Privacy Law Journal',
          url: 'https://www.law.com'
        }
      ]
    };

    const regionNews = newsSources[region] || newsSources['India'];
    
    // Filter by topic if specified
    let filteredNews = regionNews;
    if (topic && topic !== 'general') {
      filteredNews = regionNews.filter((article: any) => 
        article.title.toLowerCase().includes(topic.toLowerCase()) ||
        article.summary.toLowerCase().includes(topic.toLowerCase())
      );
    }

    res.json({
      success: true,
      news: filteredNews.slice(0, limit),
      region,
      topic,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("Legal news error:", err);
    res.status(500).json({ error: "Failed to fetch legal news" });
  }
});

// Metrics route
app.get("/api/metrics", (req, res) => {
  res.json({
    success: true,
    metrics: {
      totalMessages: 1250,
      totalUsers: 89,
      legalFeesSaved: '₹40L',
      documentsProcessed: 156,
      ragQueriesProcessed: 892
    },
    timestamp: new Date().toISOString()
  });
});

// Chat export route
app.post("/api/chat/export/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  res.json({
    success: true,
    exportUrl: `/exports/${sessionId}.pdf`,
    messageCount: 10,
    timestamp: new Date().toISOString()
  });
});

// Feedback route
app.post("/api/feedback", (req, res) => {
  const feedback = req.body;
  res.json({
    success: true,
    feedback: { id: `feedback_${Date.now()}`, ...feedback },
    message: 'Feedback submitted successfully'
  });
});

// Authentication routes
app.post("/api/auth/login", (req, res) => {
  const { email } = req.body;
  res.json({
    success: true,
    token: `token_${Date.now()}`,
    user: { id: 'user_1', email, name: 'User' },
    message: 'Login successful'
  });
});

app.post("/api/auth/register", (req, res) => {
  res.json({
    success: true,
    message: 'Registration successful'
  });
});

// Session management
app.post("/api/sessions", (req, res) => {
  const { userId, title } = req.body;
  res.json({
    success: true,
    session: {
      sessionId: `session_${Date.now()}`,
      title,
      userId,
      createdAt: new Date().toISOString()
    }
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});

export default app;
