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
  
  // 1. Extract Act names, e.g. "Negotiable Instruments Act, 1881", "Consumer Protection Act, 2019"
  const actPattern = /\b([A-Z][a-zA-Z\s]+Act(?:,?\s*\d{4})?)\b/g;
  const acts = text.match(actPattern) || [];
  citations.push(...acts);
  
  // 2. Major codes and constitutions that don't end in "Act"
  const codesPattern = /\b(Indian Penal Code|Constitution of India|Code of Criminal Procedure|Code of Civil Procedure|Civil Procedure Code|Criminal Procedure Code|IPC|CrPC|CPC|Bharatiya Nyaya Sanhita|BNS|Bharatiya Nagarik Suraksha Sanhita|BNSS|Bharatiya Sakshya Adhiniyam|BSA)\b/gi;
  const codes = text.match(codesPattern) || [];
  citations.push(...codes);
  
  // 3. Sections, e.g. "Section 138", "Sec. 138", "Sec 138", "Sections 138"
  const sectionPattern = /\b(?:Section|Sec\.?|Sections)\s+(\d+[A-Z]?)\b/gi;
  const sections = text.match(sectionPattern) || [];
  citations.push(...sections);
  
  // 4. Articles, e.g. "Article 21", "Art. 21", "Art 21"
  const articlePattern = /\b(?:Article|Art\.?)\s+(\d+[A-Z]?)\b/gi;
  const articles = text.match(articlePattern) || [];
  citations.push(...articles);

  // 5. Case Names, e.g. "Marbury v. Madison", "K.S. Puttaswamy v. Union of India"
  const casePattern = /\b([A-Z][a-zA-Z0-9'\.\s]+v(?:s)?\.\s+[A-Z][a-zA-Z0-9'\.\s]+)\b/g;
  const cases = text.match(casePattern) || [];
  citations.push(...cases);
  
  // 6. Extract descriptions from the Sources section if it exists
  const sourcesSectionMatch = text.match(/<h3[^>]*>Sources<\/h3>\s*<ol[^>]*>([\s\S]*?)<\/ol>/i);
  if (sourcesSectionMatch) {
    const listItemsText = sourcesSectionMatch[1];
    const liPattern = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    let liMatch;
    while ((liMatch = liPattern.exec(listItemsText)) !== null) {
      // Strip HTML tags
      const rawText = liMatch[1].replace(/<[^>]+>/g, '').trim();
      // Only keep descriptive source titles (skip plain URLs and extremely long text)
      if (rawText && !rawText.startsWith('http') && rawText.length < 150) {
        citations.push(rawText);
      }
    }
  }

  // Deduplicate and filter out noisy items
  const cleanedCitations = citations
    .map(c => c.trim())
    .filter(c => {
      return c && 
             !/^\[\d+\]$/.test(c) && 
             !/^\d+$/.test(c) && 
             c.toLowerCase() !== 'sources' &&
             c.toLowerCase() !== 'act' &&
             c.length > 2;
    });

  return [...new Set(cleanedCitations)];
}

// RAG pipeline implementation
export async function ragPipeline(query: string, language = 'en', options: any = {}): Promise<RAGResponse> {
  try {
    console.log(`🔍 RAG Pipeline: Processing query in ${language}`);
    
    // Step 1: Get query embedding
    const queryEmbedding = generateSimpleEmbedding(query);
    
    // Step 2: Search for relevant documents
    const searchResults = await vectorStore.search(queryEmbedding, 3);
    
    // Step 3: Prepare context
    let context = '';
    const sources: SourceDocument[] = [];
    
    if (searchResults.length > 0) {
      context = 'Relevant Legal Context:\n\n';
      searchResults.forEach((result, index) => {
        // Lowered similarity threshold to ensure the top matching legal provisions are always provided
        if (result.similarity >= 0.0) {
          context += `[Source ${index + 1}]: ${result.document.content.substring(0, 1200)}\n\n`;
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
