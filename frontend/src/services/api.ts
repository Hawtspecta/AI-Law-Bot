const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
    return this.request<ChatResponse>('/api/chat', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async uploadDocument(request: DocumentUploadRequest): Promise<DocumentUploadResponse> {
    return this.request<DocumentUploadResponse>('/api/documents', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async searchLegal(request: LegalSearchRequest): Promise<LegalSearchResponse> {
    return this.request<LegalSearchResponse>('/api/search', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async updateUserLanguage(userId: string, language: string): Promise<{ success: boolean; user: any; message: string }> {
    return this.request(`/api/users/${userId}/language`, {
      method: 'PATCH',
      body: JSON.stringify({ language }),
    });
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health');
  }

  // Authentication methods (Features #2, #3)
  async login(request: AuthRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async register(request: AuthRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Session management (Feature #9)
  async createSession(userId?: string, title?: string): Promise<SessionResponse> {
    return this.request<SessionResponse>('/api/sessions', {
      method: 'POST',
      body: JSON.stringify({ userId, title }),
    });
  }

  // Contract analysis (Feature #18)
  async analyzeContract(request: ContractAnalysisRequest): Promise<ContractAnalysisResponse> {
    return this.request<ContractAnalysisResponse>('/api/contracts/analyze', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Form assistance (Feature #19)
  async fillForm(request: FormFillRequest): Promise<FormFillResponse> {
    return this.request<FormFillResponse>('/api/forms/fill', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Document comparison (Feature #20)
  async compareDocuments(request: DocumentComparisonRequest): Promise<DocumentComparisonResponse> {
    return this.request<DocumentComparisonResponse>('/api/documents/compare', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Legal news (Feature #7)
  async getLegalNews(region?: string, topic?: string, limit?: number): Promise<LegalNewsResponse> {
    const params = new URLSearchParams();
    if (region) params.append('region', region);
    if (topic) params.append('topic', topic);
    if (limit) params.append('limit', limit.toString());
    
    return this.request<LegalNewsResponse>(`/api/news?${params.toString()}`);
  }

  // Chat export (Feature #15)
  async exportChat(sessionId: string): Promise<ChatExportResponse> {
    return this.request<ChatExportResponse>(`/api/chat/export/${sessionId}`, {
      method: 'POST',
    });
  }

  // Feedback system (Feature #16)
  async submitFeedback(request: FeedbackRequest): Promise<FeedbackResponse> {
    return this.request<FeedbackResponse>('/api/feedback', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Privacy controls (Features #21, #22)
  async updatePrivacy(userId: string, request: PrivacyRequest): Promise<PrivacyResponse> {
    return this.request<PrivacyResponse>(`/api/users/${userId}/privacy`, {
      method: 'PATCH',
      body: JSON.stringify(request),
    });
  }

  // Metrics (Feature #11)
  async getMetrics(): Promise<MetricsResponse> {
    return this.request<MetricsResponse>('/api/metrics');
  }
}

export const apiClient = new ApiClient();
export default apiClient;
