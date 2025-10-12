const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;


// Simple in-memory vector store (in production, use ChromaDB or FAISS)
class SimpleVectorStore {
  constructor() {
    this.embeddings = new Map();
    this.documents = new Map();
    this.loadEmbeddings();
  }

  async loadEmbeddings() {
    try {
      const embeddingsPath = path.join(__dirname, 'data', 'embeddings.json');
      const data = await fs.readFile(embeddingsPath, 'utf8');
      const parsed = JSON.parse(data);
      
      for (const [id, embedding] of Object.entries(parsed.embeddings)) {
        this.embeddings.set(id, embedding);
      }
      
      for (const [id, doc] of Object.entries(parsed.documents)) {
        this.documents.set(id, doc);
      }
      
      console.log(`📚 Loaded ${this.embeddings.size} embeddings and ${this.documents.size} documents`);
    } catch (error) {
      console.log('📚 No existing embeddings found, loading sample legal data');
      await this.loadSampleData();
    }
  }

  async loadSampleData() {
    try {
      const sampleDataPath = path.join(__dirname, 'data', 'sample_legal_data.json');
      const data = await fs.readFile(sampleDataPath, 'utf8');
      const parsed = JSON.parse(data);
      
      for (const doc of parsed.documents) {
        const embedding = await getEmbedding(doc.content);
        this.addEmbedding(doc.id, embedding, doc);
      }
      
      await this.saveEmbeddings();
      console.log(`📚 Loaded ${parsed.documents.length} sample legal documents`);
    } catch (error) {
      console.error('❌ Error loading sample data:', error);
    }
  }

  async saveEmbeddings() {
    const data = {
      embeddings: Object.fromEntries(this.embeddings),
      documents: Object.fromEntries(this.documents)
    };
    
    const embeddingsPath = path.join(__dirname, 'data', 'embeddings.json');
    await fs.mkdir(path.dirname(embeddingsPath), { recursive: true });
    await fs.writeFile(embeddingsPath, JSON.stringify(data, null, 2));
  }

  addEmbedding(id, embedding, document) {
    this.embeddings.set(id, embedding);
    this.documents.set(id, document);
  }

  // Simple cosine similarity
  cosineSimilarity(a, b) {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  async search(queryEmbedding, topK = 5) {
    const similarities = [];
    
    for (const [id, embedding] of this.embeddings.entries()) {
      const similarity = this.cosineSimilarity(queryEmbedding, embedding);
      similarities.push({ id, similarity, document: this.documents.get(id) });
    }
    
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }
}

const vectorStore = new SimpleVectorStore();

// Get embeddings from OpenAI or Groq
async function getEmbedding(text) {
  try {
    if (!process.env.GROQ_API_KEY && !process.env.OPENAI_API_KEY) {
      console.warn('⚠️  No API keys available, using simple embedding fallback');
      return generateSimpleEmbedding(text);
    }

    const response = await fetch("https://api.groq.com/openai/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small", // Groq supports OpenAI-compatible models
        input: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error("❌ Embedding error (Groq):", error.message);
    throw error;
  }
}


// Simple text-based embedding (fallback)
function generateSimpleEmbedding(text) {
  const words = text.toLowerCase().split(/\s+/);
  const embedding = new Array(384).fill(0);
  
  words.forEach(word => {
    const hash = word.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const index = Math.abs(hash) % 384;
    embedding[index] += 1;
  });
  
  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / magnitude);
}

// Generate response using Groq or OpenAI
async function generateResponse(prompt, language = 'en') {
  try {
    if (GROQ_API_KEY) {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are an expert legal assistant specializing in Indian law. Provide accurate, helpful, and well-cited responses. Always include relevant legal citations and references. Respond in ${language === 'en' ? 'English' : language}.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } else if (OPENAI_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are an expert legal assistant specializing in Indian law. Provide accurate, helpful, and well-cited responses. Always include relevant legal citations and references. Respond in ${language === 'en' ? 'English' : language}.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } else {
      // Fallback when no API keys are available
      console.warn('⚠️  No API keys available, using fallback response');
      return `I understand your legal question: "${prompt.split('\n')[0]}". However, I'm currently running in demo mode without AI capabilities. To get real AI-powered legal assistance, please ensure the GROQ_API_KEY is configured in the .env file. For now, I can provide general legal guidance, but for specific legal advice, please consult with a qualified legal professional.`;
    }
  } catch (error) {
    console.error('❌ Response generation error:', error);
    throw error;
  }
}

// Extract citations from text
function extractCitations(text) {
  const citations = [];
  
  // Extract Act names
  const actPattern = /([A-Z][a-z]+(?: [A-Z][a-z]+)* Act,?\s*\d{4})/g;
  const acts = text.match(actPattern) || [];
  citations.push(...acts);
  
  // Extract Section numbers
  const sectionPattern = /Section\s+(\d+[A-Z]?)/gi;
  const sections = text.match(sectionPattern) || [];
  citations.push(...sections);
  
  // Extract Article numbers
  const articlePattern = /Article\s+(\d+[A-Z]?)/gi;
  const articles = text.match(articlePattern) || [];
  citations.push(...articles);
  
  return [...new Set(citations)];
}

// Main RAG pipeline
async function ragPipeline(query, language = 'en', options = {}) {
  try {
    console.log(`🔍 RAG Pipeline: Processing query in ${language}`);
    
    // Step 1: Get query embedding
    const queryEmbedding = await getEmbedding(query);
    
    // Step 2: Search for relevant documents
    const searchResults = await vectorStore.search(queryEmbedding, 5);
    
    // Step 3: Prepare context
    let context = '';
    const sources = [];
    
    if (searchResults.length > 0) {
      context = 'Relevant Legal Context:\n\n';
      searchResults.forEach((result, index) => {
        if (result.similarity > 0.1) { // Threshold for relevance
          context += `[Source ${index + 1}]: ${result.document.content}\n\n`;
          sources.push({
            title: result.document.title,
            source: result.document.source,
            similarity: result.similarity,
            content: result.document.content.substring(0, 200) + '...'
          });
        }
      });
    } else {
      context = 'No specific legal context found. Please provide a general legal response.';
    }
    
    // Step 4: Generate response with context
    const prompt = options.searchMode 
      ? `You are an expert legal assistant specializing in Indian law. 

Legal Search Query: ${query}

${context}

Based on the above legal context, provide a comprehensive and accurate answer to the query. Structure your response as follows:
1. Direct answer to the question
2. Relevant legal provisions and citations
3. Practical implications
4. Any important considerations or limitations

Always include specific legal citations and references. Respond in ${language === 'en' ? 'English' : language}.`
      : `You are an expert legal assistant specializing in Indian law. 

User Question: ${query}

${context}

Based on the above legal context, provide a helpful and accurate answer to the user's question. Structure your response as follows:
1. Clear answer to the question
2. Relevant legal provisions and citations
3. Step-by-step guidance if applicable
4. Important considerations or warnings

Always include specific legal citations and references. Respond in ${language === 'en' ? 'English' : language}.`;
    
    const response = await generateResponse(prompt, language);
    
    // Step 5: Extract citations
    const citations = extractCitations(response);
    
    return {
      content: response,
      citations,
      sources,
      context: context.substring(0, 500) + '...'
    };
    
  } catch (error) {
    console.error('❌ RAG Pipeline error:', error);
    
    // Fallback response
    return {
      content: `I apologize, but I encountered an error while processing your legal query: "${query}". Please try rephrasing your question or contact support if the issue persists.`,
      citations: [],
      sources: [],
      context: 'Error in RAG pipeline'
    };
  }
}

// Add document to vector store
async function addDocumentToStore(title, content, source = 'Unknown') {
  try {
    const embedding = await getEmbedding(content);
    const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    vectorStore.addEmbedding(id, embedding, {
      title,
      content,
      source,
      timestamp: new Date().toISOString()
    });
    
    await vectorStore.saveEmbeddings();
    console.log(`✅ Added document: ${title}`);
    return id;
  } catch (error) {
    console.error('❌ Error adding document:', error);
    throw error;
  }
}

module.exports = {
  ragPipeline,
  addDocumentToStore,
  vectorStore,
  getEmbedding,
  generateResponse
};
