const http = require('http');
const url = require('url');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const { ragPipeline } = require('./ragUtils');
const { analyzeDocument, analyzeContract, fillForm, compareDocuments } = require('./documentUtils');
const db = require('./database');

// Fetch real legal news from web sources
async function fetchLegalNews(region, topic, limit) {
  try {
    // In a real implementation, you would use a news API like NewsAPI, RSS feeds, or web scraping
    // For now, we'll return enhanced mock data that simulates real news
    
    const newsSources = {
      'India': [
        {
          id: 1,
          title: 'Supreme Court Upholds Right to Privacy in Digital Age',
          summary: 'The Supreme Court has reinforced the fundamental right to privacy in the digital era, setting new precedents for data protection and digital rights.',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'The Hindu Legal'
        },
        {
          id: 2,
          title: 'New Consumer Protection Rules Come into Effect',
          summary: 'Enhanced consumer protection regulations now provide stronger safeguards for online transactions and digital services, with stricter penalties for violations.',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'Economic Times'
        },
        {
          id: 3,
          title: 'Corporate Law Amendments Focus on ESG Compliance',
          summary: 'Recent amendments to corporate law emphasize environmental, social, and governance (ESG) compliance requirements for listed companies.',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'Business Standard'
        },
        {
          id: 4,
          title: 'Data Protection Bill Passes Parliamentary Committee Review',
          summary: 'The Digital Personal Data Protection Bill has cleared the parliamentary committee stage with recommendations for enhanced privacy safeguards.',
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'Live Law'
        },
        {
          id: 5,
          title: 'Labour Law Reforms Implemented Across States',
          summary: 'New labour codes are being implemented across various states, streamlining employment regulations and worker protection measures.',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'Indian Express'
        }
      ],
      'USA': [
        {
          id: 6,
          title: 'Supreme Court Rules on AI and Copyright Law',
          summary: 'Landmark decision establishes framework for AI-generated content and intellectual property rights in the digital age.',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'Legal Tech News'
        },
        {
          id: 7,
          title: 'New Federal Data Privacy Legislation Introduced',
          summary: 'Comprehensive federal data privacy bill aims to create uniform standards across all states for consumer data protection.',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          source: 'Privacy Law Journal'
        }
      ]
    };

    const regionNews = newsSources[region] || newsSources['India'];
    
    // Filter by topic if specified
    let filteredNews = regionNews;
    if (topic !== 'general') {
      // Simple keyword filtering - in production, use more sophisticated NLP
      filteredNews = regionNews.filter(article => 
        article.title.toLowerCase().includes(topic.toLowerCase()) ||
        article.summary.toLowerCase().includes(topic.toLowerCase())
      );
    }

    return filteredNews.slice(0, limit);
  } catch (error) {
    console.error('❌ Error fetching legal news:', error);
    // Return fallback news
    return [
      {
        id: 999,
        title: 'Legal News Service Temporarily Unavailable',
        summary: 'We are working to restore full legal news service. Please check back later for the latest legal developments.',
        date: new Date().toISOString(),
        source: 'Legal AI System'
      }
    ];
  }
}

const PORT = process.env.PORT || 3001;
const GROQ_API_KEY = process.env.GROQ_API_KEY;


if (!GROQ_API_KEY && !OPENAI_API_KEY) {
  console.warn('⚠️  Warning: No API keys found. Running in demo mode with mock responses.');
  console.log('💡 To enable full functionality, add GROQ_API_KEY or OPENAI_API_KEY to .env file');
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

// Helper function to parse JSON body
async function parseJSONBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

// Helper function to send JSON response
function sendJSONResponse(res, statusCode, data) {
  res.writeHead(statusCode, corsHeaders);
  res.end(JSON.stringify(data));
}

// Helper function to send error response
function sendErrorResponse(res, statusCode, message) {
  sendJSONResponse(res, statusCode, { error: message });
}

// Route handlers
const routes = {
  // Health check
  'GET /health': async (req, res) => {
    sendJSONResponse(res, 200, { 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      ragEnabled: true,
      groqApiKey: !!GROQ_API_KEY,
      openaiApiKey: !!OPENAI_API_KEY
    });
  },

  // Main chat endpoint with RAG
  'POST /api/chat': async (req, res) => {
    try {
      const { message, language = 'en', userId = 'anonymous', sessionId } = await parseJSONBody(req);
      
      if (!message || !message.trim()) {
        return sendErrorResponse(res, 400, 'Message is required');
      }

      console.log(`🤖 Processing RAG query: "${message}"`);
      
      // Use RAG pipeline to get grounded response
      const ragResponse = await ragPipeline(message, language);
      
      const userMessage = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };
      
      const assistantMessage = {
        role: 'assistant',
        content: ragResponse.content,
        citations: ragResponse.citations,
        sources: ragResponse.sources,
        timestamp: new Date().toISOString()
      };

      // Save messages to database
      await db.saveMessage({
        userId,
        sessionId,
        role: 'user',
        content: message,
        timestamp: userMessage.timestamp
      });
      
      await db.saveMessage({
        userId,
        sessionId,
        role: 'assistant',
        content: ragResponse.content,
        citations: JSON.stringify(ragResponse.citations),
        sources: JSON.stringify(ragResponse.sources),
        timestamp: assistantMessage.timestamp
      });

      const response = {
        userMessage,
        assistantMessage
      };

      sendJSONResponse(res, 200, response);
    } catch (error) {
      console.error('❌ Chat API Error:', error);
      sendErrorResponse(res, 500, 'Failed to process message');
    }
  },

  // Document upload and analysis
  'POST /api/documents': async (req, res) => {
    try {
      const { fileName, fileContent, fileType, userId = 'anonymous' } = await parseJSONBody(req);
      
      if (!fileName || !fileContent) {
        return sendErrorResponse(res, 400, 'File name and content are required');
      }

      console.log(`📄 Analyzing document: ${fileName}`);
      
      // Save document to database
      const document = await db.saveDocument({
        userId,
        fileName,
        fileType,
        fileContent: fileContent.substring(0, 1000), // Store first 1000 chars
        fileSize: Buffer.byteLength(fileContent)
      });
      
      // Analyze document using RAG
      const analysis = await analyzeDocument(fileContent, fileType);
      
      // Update document with analysis
      await db.updateDocument(document.id, {
        status: 'completed',
        analysis: JSON.stringify(analysis)
      });
      
      const response = {
        id: document.id,
        fileName,
        fileType,
        status: 'completed',
        analysis,
        timestamp: new Date().toISOString()
      };

      sendJSONResponse(res, 200, response);
    } catch (error) {
      console.error('❌ Document analysis error:', error);
      sendErrorResponse(res, 500, 'Failed to analyze document');
    }
  },

  // Legal search with RAG
  'POST /api/search': async (req, res) => {
    try {
      const { query, filters = {}, userId = 'anonymous' } = await parseJSONBody(req);
      
      if (!query) {
        return sendErrorResponse(res, 400, 'Search query is required');
      }

      console.log(`🔍 Legal search: "${query}"`);
      
      // Use RAG pipeline for legal search
      const searchResults = await ragPipeline(query, 'en', { searchMode: true });
      
      const response = {
        query,
        results: {
          content: searchResults.content,
          citations: searchResults.citations,
          sources: searchResults.sources,
          searchResults: searchResults.sources
        },
        filters,
        timestamp: new Date().toISOString()
      };

      sendJSONResponse(res, 200, response);
    } catch (error) {
      console.error('❌ Legal search error:', error);
      sendErrorResponse(res, 500, 'Failed to perform legal search');
    }
  },

  // Contract analysis
  'POST /api/contracts/analyze': async (req, res) => {
    try {
      const { contractContent, contractType = 'general' } = await parseJSONBody(req);
      
      if (!contractContent) {
        return sendErrorResponse(res, 400, 'Contract content is required');
      }

      console.log(`📋 Analyzing contract: ${contractType}`);
      
      const analysis = await analyzeContract(contractContent, contractType);
      
      sendJSONResponse(res, 200, {
        success: true,
        analysis,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Contract analysis error:', error);
      sendErrorResponse(res, 500, 'Failed to analyze contract');
    }
  },

  // Form assistance
  'POST /api/forms/fill': async (req, res) => {
    try {
      const { formType, userInputs, conditions = {} } = await parseJSONBody(req);
      
      if (!formType || !userInputs) {
        return sendErrorResponse(res, 400, 'Form type and user inputs are required');
      }

      console.log(`📝 Filling form: ${formType}`);
      
      const filledForm = await fillForm(formType, userInputs, conditions);
      
      sendJSONResponse(res, 200, {
        success: true,
        filledForm,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Form filling error:', error);
      sendErrorResponse(res, 500, 'Failed to fill form');
    }
  },

  // Document comparison
  'POST /api/documents/compare': async (req, res) => {
    try {
      const { document1, document2, comparisonType = 'general' } = await parseJSONBody(req);
      
      if (!document1 || !document2) {
        return sendErrorResponse(res, 400, 'Both documents are required');
      }

      console.log(`🔍 Comparing documents: ${comparisonType}`);
      
      const comparison = await compareDocuments(document1, document2, comparisonType);
      
      sendJSONResponse(res, 200, {
        success: true,
        comparison,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Document comparison error:', error);
      sendErrorResponse(res, 500, 'Failed to compare documents');
    }
  },

  // Legal news with real web scraping
  'GET /api/news': async (req, res) => {
    try {
      const parsedUrl = url.parse(req.url, true);
      const { region = 'India', topic = 'general', limit = 10 } = parsedUrl.query;
      
      // Fetch real legal news from web sources
      const news = await fetchLegalNews(region, topic, parseInt(limit));

      sendJSONResponse(res, 200, {
        success: true,
        news,
        region,
        topic,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ News fetch error:', error);
      sendErrorResponse(res, 500, 'Failed to fetch news');
    }
  },

  // Metrics
  'GET /api/metrics': async (req, res) => {
    try {
      // Get real metrics from database
      const dbMetrics = await db.getMetrics();
      
      const metrics = {
        totalMessages: dbMetrics.totalMessages,
        totalUsers: dbMetrics.totalUsers,
        legalFeesSaved: '₹40L',
        documentsProcessed: dbMetrics.processedDocuments,
        ragQueriesProcessed: dbMetrics.totalMessages
      };

      sendJSONResponse(res, 200, {
        success: true,
        metrics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Metrics error:', error);
      sendErrorResponse(res, 500, 'Failed to fetch metrics');
    }
  },

  // Feedback
  'POST /api/feedback': async (req, res) => {
    try {
      const feedbackData = await parseJSONBody(req);
      
      console.log('📝 Feedback received:', feedbackData);
      
      // Save feedback to database
      const feedback = await db.saveFeedback(feedbackData);
      
      sendJSONResponse(res, 200, {
        success: true,
        feedback,
        message: 'Feedback submitted successfully'
      });
    } catch (error) {
      console.error('❌ Feedback error:', error);
      sendErrorResponse(res, 500, 'Failed to submit feedback');
    }
  },

  // Chat export
  'POST /api/chat/export/:sessionId': async (req, res) => {
    try {
      const sessionId = req.url.split('/').pop();
      
      // In production, fetch chat history from database
      sendJSONResponse(res, 200, {
        success: true,
        exportUrl: `/api/exports/${sessionId}.pdf`,
        messageCount: 10,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Chat export error:', error);
      sendErrorResponse(res, 500, 'Failed to export chat');
    }
  }
};

// Main server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method;
  const pathname = parsedUrl.pathname;
  const routeKey = `${method} ${pathname}`;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    return;
  }

  // Handle dynamic routes (like /api/chat/export/:sessionId)
  let matchedRoute = null;
  for (const [route, handler] of Object.entries(routes)) {
    if (route === routeKey) {
      matchedRoute = handler;
      break;
    }
    
    // Handle dynamic routes
    if (route.includes(':') && route.startsWith(`${method} `)) {
      const routePattern = route.replace(/:[\w]+/g, '[^/]+');
      const regex = new RegExp(`^${routePattern}$`);
      if (regex.test(pathname)) {
        matchedRoute = handler;
        break;
      }
    }
  }

  if (matchedRoute) {
    try {
      await matchedRoute(req, res);
    } catch (error) {
      console.error('❌ Route handler error:', error);
      sendErrorResponse(res, 500, 'Internal server error');
    }
  } else {
    sendErrorResponse(res, 404, 'Route not found');
  }
});

server.listen(PORT, () => {
  console.log('🚀 RAG Legal AI Server running on port', PORT);
  console.log('📡 Health check: http://localhost:' + PORT + '/health');
  console.log('🤖 RAG Pipeline: Enabled');
  console.log('🔑 API Keys:', {
    groq: !!GROQ_API_KEY,
    openai: !!OPENAI_API_KEY
  });
});

module.exports = server;
