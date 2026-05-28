import * as fs from 'fs/promises';
import * as path from 'path';
import { generateAIResponse } from './aiServices';

export interface SourceDocument {
  title: string;
  source: string;
  similarity: number;
  content: string;
}

export interface RAGResponse {
  content: string;
  citations: string[];
  sources: SourceDocument[];
  context: string;
}

// Simple in-memory vector store matching the JS implementation
class SimpleVectorStore {
  private embeddings = new Map<string, number[]>();
  private documents = new Map<string, any>();

  constructor() {
    this.loadEmbeddings();
  }

  async loadEmbeddings() {
    try {
      // Robust path resolution that works for both ts-node and compiled dist runtimes
      const isDist = path.resolve(__dirname).includes('dist');
      const dataDir = isDist 
        ? path.join(__dirname, '../../../data') 
        : path.join(__dirname, '../../data');
      
      const embeddingsPath = path.join(dataDir, 'embeddings.json');
      console.log(`📚 RAG Vector Store: Loading embeddings from ${embeddingsPath}`);
      
      const data = await fs.readFile(embeddingsPath, 'utf8');
      const parsed = JSON.parse(data);
      
      for (const [id, embedding] of Object.entries(parsed.embeddings)) {
        this.embeddings.set(id, embedding as number[]);
      }
      
      for (const [id, doc] of Object.entries(parsed.documents)) {
        this.documents.set(id, doc);
      }
      
      console.log(`📚 RAG Vector Store: Loaded ${this.embeddings.size} embeddings and ${this.documents.size} documents`);
    } catch (error: any) {
      console.warn('📚 RAG Vector Store: No existing embeddings found. Error:', error.message);
      await this.loadSampleData();
    }
  }

  async loadSampleData() {
    try {
      const isDist = path.resolve(__dirname).includes('dist');
      const dataDir = isDist 
        ? path.join(__dirname, '../../../data') 
        : path.join(__dirname, '../../data');
        
      const sampleDataPath = path.join(dataDir, 'sample_legal_data.json');
      console.log(`📚 RAG Vector Store: Loading sample data from ${sampleDataPath}`);
      
      const data = await fs.readFile(sampleDataPath, 'utf8');
      const parsed = JSON.parse(data);
      
      for (const doc of parsed.documents) {
        const embedding = generateSimpleEmbedding(doc.content);
        this.addEmbedding(doc.id, embedding, doc);
      }
      
      await this.saveEmbeddings();
      console.log(`📚 RAG Vector Store: Loaded ${parsed.documents.length} sample legal documents`);
    } catch (error) {
      console.error('❌ Error loading sample data:', error);
    }
  }

  async saveEmbeddings() {
    try {
      const isDist = path.resolve(__dirname).includes('dist');
      const dataDir = isDist 
        ? path.join(__dirname, '../../../data') 
        : path.join(__dirname, '../../data');
        
      const embeddingsPath = path.join(dataDir, 'embeddings.json');
      await fs.mkdir(path.dirname(embeddingsPath), { recursive: true });
      
      const data = {
        embeddings: Object.fromEntries(this.embeddings),
        documents: Object.fromEntries(this.documents)
      };
      
      await fs.writeFile(embeddingsPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('❌ Error saving embeddings:', error);
    }
  }

  addEmbedding(id: string, embedding: number[], document: any) {
    this.embeddings.set(id, embedding);
    this.documents.set(id, document);
  }

  // Simple cosine similarity
  cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
  }

  async search(queryEmbedding: number[], topK = 5) {
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

// Simple text-based 384-dimension embedding matching the JS implementation
export function generateSimpleEmbedding(text: string): number[] {
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
  const sumSq = embedding.reduce((sum, val) => sum + val * val, 0);
  const magnitude = Math.sqrt(sumSq);
  if (magnitude === 0) return embedding;
  return embedding.map(val => val / magnitude);
}

const vectorStore = new SimpleVectorStore();

// Smart function to extract all legal acts, sections, articles, and bracketed citations
export function extractLegalCitations(text: string): string[] {
  const citations: string[] = [];
  
  // Bracketed references like [1], [2] or (See section X)
  const bracketPattern = /\[\d+\]|\(See [^)]+\)/g;
  const brackets = text.match(bracketPattern) || [];
  citations.push(...brackets);
  
  // Extract Act names e.g., "Negotiable Instruments Act, 1881" or "Consumer Protection Act, 2019"
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

// RAG pipeline implementation
export async function ragPipeline(query: string, language = 'en', options: any = {}): Promise<RAGResponse> {
  try {
    console.log(`🔍 RAG Pipeline: Processing query in ${language}`);
    
    // Step 1: Get query embedding
    const queryEmbedding = generateSimpleEmbedding(query);
    
    // Step 2: Search for relevant documents
    const searchResults = await vectorStore.search(queryEmbedding, 5);
    
    // Step 3: Prepare context
    let context = '';
    const sources: SourceDocument[] = [];
    
    if (searchResults.length > 0) {
      context = 'Relevant Legal Context:\n\n';
      searchResults.forEach((result, index) => {
        // Similarity threshold
        if (result.similarity > 0.1) {
          context += `[Source ${index + 1}]: ${result.document.content}\n\n`;
          sources.push({
            title: result.document.title || `Source ${index + 1}`,
            source: result.document.source || 'Database',
            similarity: result.similarity,
            content: result.document.content.substring(0, 250) + '...'
          });
        }
      });
    } else {
      context = 'No specific legal context found. Please provide a general legal response.';
    }
    
    // Step 4: Generate response with context using generateAIResponse
    const prompt = options.searchMode 
      ? `Based on the following legal context, provide a comprehensive and accurate answer to the search query "${query}".
         Structure your response as follows:
         1. Direct answer to the question
         2. Relevant legal provisions and citations
         3. Practical implications
         4. Any important considerations or limitations

         Always include specific legal citations and references.

         ${context}`
      : `Based on the following legal context, answer this user question: "${query}".
         Structure your response as follows:
         1. Clear answer to the question
         2. Relevant legal provisions and citations
         3. Step-by-step guidance if applicable
         4. Important considerations or warnings

         Always include specific legal citations and references.

         ${context}`;
    
    const response = await generateAIResponse(prompt, language);
    
    // Step 5: Extract citations using our comprehensive extractor
    const citations = extractLegalCitations(response.content);
    
    return {
      content: response.content,
      citations: citations.length > 0 ? citations : ['AI Generated with Groq Llama 3.3'],
      sources,
      context: context.substring(0, 500) + '...'
    };
    
  } catch (error) {
    console.error('❌ RAG Pipeline error:', error);
    
    return {
      content: `I apologize, but I encountered an error while processing your legal query: "${query}". Please try rephrasing your question.`,
      citations: [],
      sources: [],
      context: 'Error in RAG pipeline'
    };
  }
}
