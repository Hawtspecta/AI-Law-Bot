const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const Groq = require('groq-sdk');
let groqClient = null;
if (GROQ_API_KEY) {
  groqClient = new Groq({ apiKey: GROQ_API_KEY });
}


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

    // Prefer OpenAI embeddings if OPENAI_API_KEY is provided
    if (OPENAI_API_KEY) {
      // Retry with exponential backoff for rate limits
      let attempts = 0;
      while (attempts < 3) {
        const response = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ model: 'text-embedding-3-small', input: text })
        });

        if (response.ok) {
          const data = await response.json();
          if (data?.data && data.data[0]?.embedding) return data.data[0].embedding;
          if (data?.embedding) return data.embedding;
          throw new Error('OpenAI: unexpected embedding response');
        }

        if (response.status === 429) {
          const wait = Math.pow(2, attempts) * 1000;
          attempts += 1;
          console.warn(`⚠️ OpenAI rate-limited, retrying after ${wait}ms (attempt ${attempts})`);
          await new Promise(r => setTimeout(r, wait));
          continue;
        }

        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      console.warn('⚠️ OpenAI embeddings rate-limited repeatedly; using local fallback embedding');
      return generateSimpleEmbedding(text);
    }

    if (groqClient) {
      console.log('🔍 groqClient properties:', Object.keys(groqClient));
      console.log('🔍 groqClient.baseURL:', groqClient.baseURL);
      // Try multiple possible client shapes to support SDK variations
      let embRes = null;

      // 1) Common pattern: groqClient.embeddings.create
      if (groqClient.embeddings && typeof groqClient.embeddings.create === 'function') {
        embRes = await groqClient.embeddings.create({ model: 'text-embedding-3-small', input: text });
      }

      // 2) Alternative: groqClient.openai.embeddings.create
      else if (groqClient.openai && groqClient.openai.embeddings && typeof groqClient.openai.embeddings.create === 'function') {
        embRes = await groqClient.openai.embeddings.create({ model: 'text-embedding-3-small', input: text });
      }

      // 3) Another possible shape: groqClient.embeddingsCreate
      else if (typeof groqClient.embeddingsCreate === 'function') {
        embRes = await groqClient.embeddingsCreate({ model: 'text-embedding-3-small', input: text });
      }

      if (embRes) {
        if (embRes?.data && embRes.data[0]?.embedding) return embRes.data[0].embedding;
        if (embRes?.embedding) return embRes.embedding;
      }

      // 4) Fallback: use the client's fetch helper to call OpenAI-compatible embeddings path
      if (typeof groqClient.fetch === 'function') {
        const base = groqClient.baseURL ? groqClient.baseURL.replace(/\/$/, '') : 'https://api.groq.com';
        const paths = ['/openai/v1/embeddings', '/v1/embeddings', '/embeddings'];

        for (const p of paths) {
          const url = `${base}${p}`;
          const resp = await groqClient.fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
            body: JSON.stringify({ model: 'text-embedding-3-small', input: text })
          });

          if (!resp.ok) {
            // Try next candidate for 404; otherwise surface error
            if (resp.status === 404) continue;
            const textErr = resp.statusText || `status ${resp.status}`;
            throw new Error(`Groq API error: ${textErr}`);
          }

          const data = await resp.json();
          return data.data[0].embedding;
        }
      }

      // If none of the client shapes worked, fallback to simple local embedding
      console.warn('⚠️  Groq embeddings endpoint not available or not found for this API key; using local fallback embeddings');
      return generateSimpleEmbedding(text);
    }

    // Fallback to fetch call (legacy) if groqClient is not available
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
// Helper to identify conversational queries/greetings
function isConversationalQuery(query) {
  const clean = query.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");
  
  if (!clean) return true;

  // Standard greetings and quick acknowledgements
  const conversationalWords = new Set([
    'hi', 'hello', 'hey', 'yo', 'hola', 'namaste', 'greetings',
    'good', 'morning', 'afternoon', 'evening',
    'ok', 'okay', 'yes', 'no', 'thanks', 'thank', 'you', 'thx', 'awesome', 'great', 'cool',
    'bye', 'goodbye', 'see', 'tata', 'tc', 'take', 'care', 'lmao', 'lol', 'sup', 'there',
    'heythere', 'hellothere', 'hithere'
  ]);
  
  const words = clean.split(/\s+/);
  
  // If every word in a short query (<= 3 words) is a conversational word, it is conversational
  if (words.length <= 3 && words.every(word => conversationalWords.has(word))) {
    return true;
  }
  
  // Conversational questions that are not legal queries
  const conversationalPhrases = [
    'how are you',
    'how is it going',
    'how do you do',
    'who are you',
    'what are you',
    'what is your name',
    'what can you do',
    'tell me about yourself',
    'are you a lawyer',
    'are you an ai',
    'how does this work',
    'what is this app'
  ];
  
  if (conversationalPhrases.some(phrase => clean.includes(phrase))) {
    return true;
  }
  
  // If the query is super short (less than 4 characters) and doesn't contain legal terms
  if (clean.length < 4) {
    const legalKeywords = ['law', 'act', 'sec', 'tax', 'ipc', 'fir', 'court', 'judge', 'legal', 'case', 'bill'];
    return !legalKeywords.some(keyword => clean.includes(keyword));
  }
  
  return false;
}

// Main RAG pipeline
async function ragPipeline(query, language = 'en', options = {}) {
  try {
    console.log(`🔍 RAG Pipeline: Processing query in ${language}`);

    // Check if the query is conversational/greeting to bypass RAG and return a warm welcome
    if (isConversationalQuery(query)) {
      console.log(`💬 Conversational Query detected: "${query}". Skipping vector database retrieval.`);
      
      const prompt = `You are an expert AI legal assistant specializing in Indian law. 
The user is saying: "${query}"

Respond in a friendly, conversational, welcoming, and helpful manner. Briefly state who you are (an AI Legal Assistant) and what you can do (answer legal queries, analyze contracts, compare legal documents, and fill legal forms based on Indian law). Encourage them to ask their legal questions. Do NOT cite any laws, sections, or acts for this simple conversational greeting. Respond in ${language === 'en' ? 'English' : language}.`;
      
      const response = await generateResponse(prompt, language);
      return {
        content: response,
        citations: [],
        sources: [],
        context: 'Conversational - RAG skipped'
      };
    }
    
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
