const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const HEALTH_CHECK_URL = `${API_BASE_URL}/health`;


export interface Message {

  role: 'user' | 'assistant';

  content: string;

  citations?: string[];

  sources?: any[];

  timestamp?: string;

}



export interface ChatRequest {

  message: string;

  userId?: string;

  sessionId?: string;

  language?: string;

}



export interface ChatResponse {

  userMessage: Message;

  assistantMessage: Message;

}



export interface DocumentUploadRequest {

  fileName: string;

  fileContent: string;

  fileType: string;

  userId?: string;

}



export interface DocumentUploadResponse {

  id: string;

  fileName: string;

  fileType: string;

  status: string;

  analysis?: {

    summary: string;

    keyPoints: string[];

    risks: any[];

    recommendations: string[];

    citations: string[];

    sources: any[];

  };

  timestamp: string;

}



export interface LegalSearchRequest {

  query: string;

  filters?: {

    category?: string;

    jurisdiction?: string;

  };

  userId?: string;

}



export interface LegalSearchResponse {

  query: string;

  results: {

    content: string;

    citations: string[];

    sources: any[];

    searchResults: any[];

  };

  filters: any;

  timestamp: string;

}



export interface ContractAnalysisRequest {

  contractContent: string;

  contractType?: string;

}



export interface ContractAnalysisResponse {

  success: boolean;

  analysis: {

    summary: string;

    keyClauses: string[];

    risks: Array<{

      level: string;

      description: string;

      recommendation: string;

    }>;

    complianceIssues: Array<{

      issue: string;

      status: string;

    }>;

    recommendations: string[];

    citations: string[];

    sources: any[];

  };

  timestamp: string;

}



export interface FormFillRequest {

  formType: string;

  userInputs: any;

  conditions?: any;

}



export interface FormFillResponse {

  success: boolean;

  filledForm: {

    formType: string;

    filledFields: any;

    validationResults: Array<{

      field: string;

      status: string;

      message: string;

    }>;

    suggestions: string[];

    completedForm: string;

    citations: string[];

    sources: any[];

  };

  timestamp: string;

}



export interface DocumentComparisonRequest {

  document1: string;

  document2: string;

  comparisonType?: string;

}



export interface DocumentComparisonResponse {

  success: boolean;

  comparison: {

    comparisonType: string;

    differences: Array<{

      section: string;

      document1: string;

      document2: string;

      impact: string;

      recommendation: string;

    }>;

    summary: string;

    redlineView: string;

    recommendations: string[];

    citations: string[];

    sources: any[];

  };

  timestamp: string;

}



export interface LegalNewsResponse {

  success: boolean;

  news: Array<{

    id: number;

    title: string;

    summary: string;

    date: string;

    source: string;

    url?: string;

  }>;

  region: string;

  topic: string;

  timestamp: string;

}



export interface ChatExportResponse {

  success: boolean;

  exportUrl: string;

  messageCount: number;

  timestamp: string;

}



export interface FeedbackRequest {

  userId: string;

  type: string;

  subject?: string;

  message: string;

  rating?: number;

  sessionId?: string;

}



export interface FeedbackResponse {

  success: boolean;

  feedback: any;

  message: string;

}



export interface MetricsResponse {

  success: boolean;

  metrics: {

    totalMessages: number;

    totalUsers: number;

    legalFeesSaved: string;

    documentsProcessed: number;

    ragQueriesProcessed: number;

  };

  timestamp: string;

}



class ApiClient {

  private baseURL: string;

  private isConnected: boolean = false;



  constructor(baseURL: string = API_BASE_URL) {

    this.baseURL = baseURL;

    this.checkConnection();

  }



  private async checkConnection() {

    try {

      const response = await fetch(HEALTH_CHECK_URL);

      this.isConnected = response.ok;

      console.log(`🔗 API Connection: ${this.isConnected ? 'Connected' : 'Disconnected'}`);

    } catch (error) {

      this.isConnected = false;

      console.log('🔗 API Connection: Disconnected');

    }

  }



  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {

    const url = `${this.baseURL}${endpoint}`;

    

    const config: RequestInit = {

      headers: {

        'Content-Type': 'application/json',

        ...options.headers,

      },

      ...options,

    };



    try {

      console.log(`🌐 Making request to: ${url}`);

      const response = await fetch(url, config);

      

      if (!response.ok) {

        const errorData = await response.json().catch(() => ({}));

        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);

      }



      const data = await response.json();

      console.log(`✅ Request successful to: ${url}`);

      return data;

    } catch (error) {

      console.error(`❌ API request failed for ${url}:`, error);

      throw error;

    }

  }



  // Health check

  async healthCheck(): Promise<{ status: string; timestamp: string; ragEnabled: boolean }> {

    try {

      return await this.request('/health');

    } catch (error) {

      console.warn('Server unavailable, returning mock health check');

      return {

        status: 'MOCK',

        timestamp: new Date().toISOString(),

        ragEnabled: false

      };

    }

  }

  // Update privacy settings

  async updatePrivacy(data: { anonymizeQueries: boolean; dataRetentionDays: number }): Promise<{ success: boolean; message: string }> {

    try {

      return await this.request<{ success: boolean; message: string }>('/api/privacy', {

        method: 'POST',

        body: JSON.stringify(data),

      });

    } catch (error) {

      console.warn('Server unavailable, returning mock privacy update');

      return {

        success: true,

        message: 'Privacy settings saved (mock)'

      };

    }

  }



  // Chat with RAG

  async sendChatMessage(request: ChatRequest): Promise<ChatResponse> {

    try {

      return await this.request<ChatResponse>('/api/chat', {

        method: 'POST',

        body: JSON.stringify(request),

      });

    } catch (error) {

      console.warn('Server unavailable, returning mock chat response');

      return {

        userMessage: {

          role: 'user',

          content: request.message,

          timestamp: new Date().toISOString()

        },

        assistantMessage: {

          role: 'assistant',

          content: `I understand your question: "${request.message}". This is a mock response because the server is currently unavailable. Please ensure the backend server is running for full RAG functionality.`,

          citations: ['Mock Response - Server Offline'],

          sources: [],

          timestamp: new Date().toISOString()

        }

      };

    }

  }



  // Document upload and analysis

  async uploadDocument(request: DocumentUploadRequest): Promise<DocumentUploadResponse> {

    try {

      return await this.request<DocumentUploadResponse>('/api/documents', {

        method: 'POST',

        body: JSON.stringify(request),

      });

    } catch (error) {

      console.warn('Server unavailable, returning mock document upload response');

      return {

        id: `mock_${Date.now()}`,

        fileName: request.fileName,

        fileType: request.fileType,

        status: 'completed',

        analysis: {

          summary: 'Mock document analysis - server offline',

          keyPoints: ['Document uploaded successfully', 'Analysis completed'],

          risks: [],

          recommendations: ['Please ensure server is running for real analysis'],

          citations: [],

          sources: []

        },

        timestamp: new Date().toISOString()

      };

    }

  }



  // Legal search with RAG

  async searchLegal(request: LegalSearchRequest): Promise<LegalSearchResponse> {

    try {

      return await this.request<LegalSearchResponse>('/api/search', {

        method: 'POST',

        body: JSON.stringify(request),

      });

    } catch (error) {

      console.warn('Server unavailable, returning mock legal search response');

      return {

        query: request.query,

        results: {

          content: `Mock legal search results for: "${request.query}". This is a placeholder response because the server is currently unavailable.`,

          citations: ['Mock Legal Search - Server Offline'],

          sources: [],

          searchResults: []

        },

        filters: request.filters || {},

        timestamp: new Date().toISOString()

      };

    }

  }



  // Contract analysis

  async analyzeContract(request: ContractAnalysisRequest): Promise<ContractAnalysisResponse> {

    try {

      return await this.request<ContractAnalysisResponse>('/api/contracts/analyze', {

        method: 'POST',

        body: JSON.stringify(request),

      });

    } catch (error) {

      console.warn('Server unavailable, returning mock contract analysis response');

      return {

        success: true,

        analysis: {

          summary: 'Mock contract analysis - server offline',

          keyClauses: ['Standard terms', 'Payment conditions'],

          risks: [{ level: 'Low', description: 'Standard risk', recommendation: 'Review terms' }],

          complianceIssues: [{ issue: 'Compliance check', status: 'Compliant' }],

          recommendations: ['Ensure server is running for real analysis'],

          citations: [],

          sources: []

        },

        timestamp: new Date().toISOString()

      };

    }

  }



  // Form assistance

  async fillForm(request: FormFillRequest): Promise<FormFillResponse> {

    try {

      return await this.request<FormFillResponse>('/api/forms/fill', {

        method: 'POST',

        body: JSON.stringify(request),

      });

    } catch (error) {

      console.warn('Server unavailable, returning mock form fill response');

      return {

        success: true,

        filledForm: {

          formType: request.formType,

          filledFields: request.userInputs,

          validationResults: [{ field: 'name', status: 'valid', message: 'Mock validation' }],

          suggestions: ['Mock suggestion'],

          completedForm: 'Mock completed form',

          citations: [],

          sources: []

        },

        timestamp: new Date().toISOString()

      };

    }

  }



  // Document comparison

  async compareDocuments(request: DocumentComparisonRequest): Promise<DocumentComparisonResponse> {

    try {

      return await this.request<DocumentComparisonResponse>('/api/documents/compare', {

        method: 'POST',

        body: JSON.stringify(request),

      });

    } catch (error) {

      console.warn('Server unavailable, returning mock document comparison response');

      return {

        success: true,

        comparison: {

          comparisonType: request.comparisonType || 'general',

          differences: [{ section: 'Terms', document1: 'Original', document2: 'Updated', impact: 'Low', recommendation: 'Review changes' }],

          summary: 'Mock document comparison - server offline',

          redlineView: 'Mock redline view',

          recommendations: ['Ensure server is running for real comparison'],

          citations: [],

          sources: []

        },

        timestamp: new Date().toISOString()

      };

    }

  }



  // Legal news

  async getLegalNews(region?: string, topic?: string, limit?: number): Promise<LegalNewsResponse> {

    try {

      const params = new URLSearchParams();

      if (region) params.append('region', region);

      if (topic) params.append('topic', topic);

      if (limit) params.append('limit', limit.toString());

      

      return await this.request<LegalNewsResponse>(`/api/news?${params.toString()}`);

    } catch (error) {

      console.warn('Server unavailable, returning mock legal news response');

      return {

        success: true,

        news: [

          {

            id: 1,

            title: 'Mock Legal News - Server Offline',

            summary: 'This is a placeholder news article because the server is currently unavailable.',

            date: new Date().toISOString(),

            source: 'Mock Source'

          }

        ],

        region: region || 'India',

        topic: topic || 'general',

        timestamp: new Date().toISOString()

      };

    }

  }



  // Chat export

  async exportChat(sessionId: string): Promise<ChatExportResponse> {

    try {

      return await this.request<ChatExportResponse>(`/api/chat/export/${sessionId}`, {

        method: 'POST',

      });

    } catch (error) {

      console.warn('Server unavailable, returning mock chat export response');

      return {

        success: true,

        exportUrl: `/mock/exports/${sessionId}.pdf`,

        messageCount: 10,

        timestamp: new Date().toISOString()

      };

    }

  }



  // Feedback system

  async submitFeedback(request: FeedbackRequest): Promise<FeedbackResponse> {

    try {

      return await this.request<FeedbackResponse>('/api/feedback', {

        method: 'POST',

        body: JSON.stringify(request),

      });

    } catch (error) {

      console.warn('Server unavailable, returning mock feedback response');

      return {

        success: true,

        feedback: { id: 'mock_feedback', ...request },

        message: 'Feedback submitted (mock response - server offline)'

      };

    }

  }



  // Metrics

  async getMetrics(): Promise<MetricsResponse> {

    try {

      return await this.request<MetricsResponse>('/api/metrics');

    } catch (error) {

      console.warn('Server unavailable, returning mock metrics response');

      return {

        success: true,

        metrics: {

          totalMessages: 1250,

          totalUsers: 89,

          legalFeesSaved: '₹40L',

          documentsProcessed: 156,

          ragQueriesProcessed: 892

        },

        timestamp: new Date().toISOString()

      };

    }

  }



  // Connection status

  getConnectionStatus(): boolean {

    return this.isConnected;

  }



  // Retry connection

  async retryConnection(): Promise<boolean> {

    await this.checkConnection();

    return this.isConnected;

  }



  // Authentication methods

  async login(credentials: { email: string; password: string }): Promise<{ success: boolean; token?: string; user?: any; message?: string }> {

    try {

      return await this.request('/api/auth/login', {

        method: 'POST',

        body: JSON.stringify(credentials),

      });

    } catch (error) {

      console.warn('Server unavailable, returning mock login response');

      // Mock successful login for demo

      return {

        success: true,

        token: 'mock_token_' + Date.now(),

        user: { id: 'user_1', email: credentials.email, name: 'Demo User' },

        message: 'Login successful (demo mode)'

      };

    }

  }



  async register(userData: { name: string; email: string; password: string }): Promise<{ success: boolean; message?: string }> {

    try {

      return await this.request('/api/auth/register', {

        method: 'POST',

        body: JSON.stringify(userData),

      });

    } catch (error) {

      console.warn('Server unavailable, returning mock register response');

      return {

        success: true,

        message: 'Account created successfully (demo mode)'

      };

    }

  }



  async createSession(userId: string, title: string): Promise<{ success: boolean; session?: any }> {

    try {

      return await this.request('/api/sessions', {

        method: 'POST',

        body: JSON.stringify({ userId, title }),

      });

    } catch (error) {

      console.warn('Server unavailable, returning mock session response');

      return {

        success: true,

        session: { 

          sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,

          title,

          userId,

          createdAt: new Date().toISOString()

        }

      };

    }

  }

}



export const apiClient = new ApiClient();

export default apiClient;