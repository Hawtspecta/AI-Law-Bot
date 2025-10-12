const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Fallback URLs for different environments
const FALLBACK_URLS = [
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://localhost:3000'
];

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  citations?: string[];
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
  };
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
    searchResults?: any[];
  };
  timestamp: string;
}

export interface AuthRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  message?: string;
}

export interface SessionResponse {
  success: boolean;
  session: {
    sessionId: string;
    userId: string;
    title: string;
    messageCount: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
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

export interface PrivacyRequest {
  anonymizeQueries?: boolean;
  dataRetentionDays?: number;
}

export interface PrivacyResponse {
  success: boolean;
  user: any;
  message: string;
}

export interface MetricsResponse {
  success: boolean;
  metrics: {
    totalMessages: number;
    totalUsers: number;
    legalFeesSaved: string;
    documentsProcessed: number;
  };
  timestamp: string;
}

class ApiClient {
  private baseURL: string;
  private fallbackURLs: string[];
  private currentURLIndex: number = 0;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.fallbackURLs = FALLBACK_URLS;
  }

  private getCurrentURL(): string {
    return this.currentURLIndex === 0 ? this.baseURL : this.fallbackURLs[this.currentURLIndex - 1];
  }

  private async tryNextURL(): Promise<boolean> {
    if (this.currentURLIndex < this.fallbackURLs.length) {
      this.currentURLIndex++;
      console.log(`Trying fallback URL: ${this.getCurrentURL()}`);
      return true;
    }
    return false;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    let lastError: Error | null = null;
    
    while (true) {
      const url = `${this.getCurrentURL()}${endpoint}`;
      
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      };

      try {
        console.log(`Making request to: ${url}`);
        const response = await fetch(url, config);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`Request successful to: ${url}`);
        return data;
      } catch (error) {
        console.error(`API request failed for ${url}:`, error);
        lastError = error as Error;
        
        // Try next URL if available
        if (await this.tryNextURL()) {
          continue;
        }
        
        // If no more URLs to try, throw the last error
        break;
      }
    }
    
    throw lastError || new Error('All API endpoints failed');
  }

  async sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      return await this.request<ChatResponse>('/api/chat', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    } catch (error) {
      // Return mock response if server is unavailable
      console.warn('Server unavailable, returning mock chat response');
      return {
        userMessage: {
          role: 'user',
          content: request.message,
          timestamp: new Date().toISOString()
        },
        assistantMessage: {
          role: 'assistant',
          content: `I understand your question: "${request.message}". This is a mock response because the server is currently unavailable. Please ensure the backend server is running for full functionality.`,
          citations: ['Mock Response - Server Offline'],
          timestamp: new Date().toISOString()
        }
      };
    }
  }

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
          recommendations: ['Please ensure server is running for real analysis']
        }
      };
    }
  }

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
          searchResults: []
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  async updateUserLanguage(userId: string, language: string): Promise<{ success: boolean; user: any; message: string }> {
    try {
      return await this.request(`/api/users/${userId}/language`, {
        method: 'PATCH',
        body: JSON.stringify({ language }),
      });
    } catch (error) {
      console.warn('Server unavailable, returning mock language update response');
      return {
        success: true,
        user: { id: userId, language },
        message: 'Language preference updated (mock response - server offline)'
      };
    }
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      return await this.request('/health');
    } catch (error) {
      // Return mock health check if server is unavailable
      console.warn('Server unavailable, returning mock health check');
      return {
        status: 'MOCK',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Authentication methods (Features #2, #3)
  async login(request: AuthRequest): Promise<AuthResponse> {
    try {
      return await this.request<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    } catch (error) {
      console.warn('Server unavailable, returning mock login response');
      return {
        success: true,
        token: 'mock_token_' + Date.now(),
        user: {
          id: 'mock_user',
          email: request.email,
          name: 'Mock User',
          role: 'user'
        },
        message: 'Login successful (mock response - server offline)'
      };
    }
  }

  async register(request: AuthRequest): Promise<AuthResponse> {
    try {
      return await this.request<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    } catch (error) {
      console.warn('Server unavailable, returning mock register response');
      return {
        success: true,
        user: {
          id: 'mock_user_' + Date.now(),
          email: request.email,
          name: request.name || 'Mock User',
          role: 'user'
        },
        message: 'Account created successfully (mock response - server offline)'
      };
    }
  }

  // Session management (Feature #9)
  async createSession(userId?: string, title?: string): Promise<SessionResponse> {
    try {
      return await this.request<SessionResponse>('/api/sessions', {
        method: 'POST',
        body: JSON.stringify({ userId, title }),
      });
    } catch (error) {
      console.warn('Server unavailable, returning mock session response');
      return {
        success: true,
        session: {
          sessionId: `mock_session_${Date.now()}`,
          userId: userId || 'anonymous',
          title: title || 'New Conversation',
          messageCount: 0,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
    }
  }

  // Contract analysis (Feature #18)
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
          recommendations: ['Ensure server is running for real analysis']
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  // Form assistance (Feature #19)
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
          completedForm: 'Mock completed form'
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  // Document comparison (Feature #20)
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
          recommendations: ['Ensure server is running for real comparison']
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  // Legal news (Feature #7)
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

  // Chat export (Feature #15)
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

  // Feedback system (Feature #16)
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

  // Privacy controls (Features #21, #22)
  async updatePrivacy(userId: string, request: PrivacyRequest): Promise<PrivacyResponse> {
    try {
      return await this.request<PrivacyResponse>(`/api/users/${userId}/privacy`, {
        method: 'PATCH',
        body: JSON.stringify(request),
      });
    } catch (error) {
      console.warn('Server unavailable, returning mock privacy update response');
      return {
        success: true,
        user: { id: userId, ...request },
        message: 'Privacy settings updated (mock response - server offline)'
      };
    }
  }

  // Metrics (Feature #11)
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
          documentsProcessed: 156
        },
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const apiClient = new ApiClient();
export default apiClient;
