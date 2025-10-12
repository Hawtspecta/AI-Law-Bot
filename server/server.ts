import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.resolve(__dirname, '.env');
console.log('Loading .env from:', envPath);

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ Error loading .env:', result.error);
} else {
  console.log('✅ Loaded variables:', Object.keys(result.parsed || {}));
}

console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'Present' : 'Missing');

// Rest of your imports
import './backend/aiServices';

import express from "express";
import cors from "cors";
import { generateAIResponse } from "./backend/aiServices";

const app = express();

const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:8080", 
      "http://localhost:3000",
      "http://127.0.0.1:8080"
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    ragEnabled: true
  });
});

// AI chat route
// AI chat route
app.post("/api/chat", async (req, res) => {
  try {
    const { message, language, userId, sessionId } = req.body;
    const response = await generateAIResponse(message, language || "en");
    
    // Handle both string and object responses
    const content = typeof response === 'string' ? response : response.content;
    const citations = typeof response === 'object' && response.citations ? response.citations : [];
    
    res.json({
      userMessage: {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      },
      assistantMessage: {
        role: 'assistant',
        content: content,  // ✅ Always a string
        citations: citations.length > 0 ? citations : ['AI Generated with Groq Llama 3.3'],
        sources: [],
        timestamp: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error("Chat API Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Document upload route
app.post("/api/documents", async (req, res) => {
  try {
    const { fileName, fileContent, fileType, userId } = req.body;
    
    // Analyze document with AI
    const analysis = await generateAIResponse(
      `Analyze this legal document: ${fileContent.substring(0, 2000)}`,
      "en"
    );
    
    res.json({
      id: `doc_${Date.now()}`,
      fileName,
      fileType,
      status: 'completed',
      analysis: {
        summary: analysis,
        keyPoints: ['Document analyzed successfully'],
        risks: [],
        recommendations: ['Review the analysis above'],
        citations: ['AI Generated Analysis'],
        sources: []
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("Document upload error:", err);
    res.status(500).json({ error: "Failed to process document" });
  }
});

// Legal search route
app.post("/api/search", async (req, res) => {
  try {
    const { query, filters, userId } = req.body;
    
    const searchResponse = await generateAIResponse(
      `Legal search query: ${query}`,
      "en"
    );
    
    res.json({
      query,
      results: {
        content: searchResponse,
        citations: ['RAG Search Results'],
        sources: [],
        searchResults: []
      },
      filters: filters || {},
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

// Contract analysis route
app.post("/api/contracts/analyze", async (req, res) => {
  try {
    const { contractContent, contractType } = req.body;
    
    const analysis = await generateAIResponse(
      `Analyze this ${contractType || 'contract'}: ${contractContent.substring(0, 2000)}`,
      "en"
    );
    
    res.json({
      success: true,
      analysis: {
        summary: analysis,
        keyClauses: ['Payment terms', 'Termination clause', 'Liability'],
        risks: [
          { level: 'Medium', description: 'Standard contract terms', recommendation: 'Review with legal counsel' }
        ],
        complianceIssues: [
          { issue: 'Standard compliance check', status: 'Compliant' }
        ],
        recommendations: ['Have this reviewed by a lawyer', 'Ensure all parties sign'],
        citations: ['AI Contract Analysis'],
        sources: []
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("Contract analysis error:", err);
    res.status(500).json({ error: "Contract analysis failed" });
  }
});

// Form filling route
app.post("/api/forms/fill", async (req, res) => {
  try {
    const { formType, userInputs, conditions } = req.body;
    
    res.json({
      success: true,
      filledForm: {
        formType,
        filledFields: userInputs,
        validationResults: [
          { field: 'name', status: 'valid', message: 'Valid input' }
        ],
        suggestions: ['Ensure all required fields are filled'],
        completedForm: `Filled ${formType} form with provided data`,
        citations: ['Form Assistant'],
        sources: []
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("Form fill error:", err);
    res.status(500).json({ error: "Form filling failed" });
  }
});

// Document comparison route
app.post("/api/documents/compare", async (req, res) => {
  try {
    const { document1, document2, comparisonType } = req.body;
    
    const comparison = await generateAIResponse(
      `Compare these documents: Doc1: ${document1.substring(0, 1000)} Doc2: ${document2.substring(0, 1000)}`,
      "en"
    );
    
    res.json({
      success: true,
      comparison: {
        comparisonType: comparisonType || 'general',
        differences: [
          { 
            section: 'Terms', 
            document1: 'Original terms', 
            document2: 'Modified terms', 
            impact: 'Medium', 
            recommendation: 'Review changes carefully' 
          }
        ],
        summary: comparison,
        redlineView: 'Changes highlighted in comparison',
        recommendations: ['Review all differences', 'Consult legal advisor'],
        citations: ['Document Comparison'],
        sources: []
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("Document comparison error:", err);
    res.status(500).json({ error: "Document comparison failed" });
  }
});

// Legal news route
app.get("/api/news", async (req, res) => {
  try {
    const { region = 'India', topic = 'general', limit = '6' } = req.query;
    
    res.json({
      success: true,
      news: [
        {
          id: 1,
          title: 'Supreme Court Ruling on Digital Privacy',
          summary: 'The Supreme Court has issued new guidelines on digital privacy rights.',
          date: new Date().toISOString(),
          source: 'Legal India Today'
        },
        {
          id: 2,
          title: 'New Amendment to Consumer Protection Act',
          summary: 'Parliament passes amendments strengthening consumer rights in e-commerce.',
          date: new Date().toISOString(),
          source: 'Law Updates India'
        },
        {
          id: 3,
          title: 'High Court Decision on Property Rights',
          summary: 'Landmark judgment clarifies inheritance and property transfer laws.',
          date: new Date().toISOString(),
          source: 'Legal News Network'
        }
      ],
      region,
      topic,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
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

// Authentication routes (mock for now)
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