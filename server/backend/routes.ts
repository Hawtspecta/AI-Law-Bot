// src/services/api.ts

export interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: string[];
}
const BASE_URL = "http://localhost:3001";


const API_URL = process.env.VITE_API_URL || "http://localhost:3001";

export const apiClient = {
  sendChatMessage: async (data: {
    message: string;
    language?: string;
    userId: string;
    sessionId: string;
  }): Promise<{ assistantMessage: Message }> => {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: data.message,
        language: data.language || "en",
        userId: data.userId,
        sessionId: data.sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }

    const responseData = await response.json();

    // Safely assert the type of responseData
    const { assistantMessage: assistantMessageRaw } = responseData as {
      assistantMessage: { content: string; citations?: string };
    };

    const assistantMessage: Message = {
      role: "assistant",
      content: assistantMessageRaw.content,
      citations: assistantMessageRaw.citations
        ? JSON.parse(assistantMessageRaw.citations)
        : [],
    };

    return { assistantMessage };
  },

  uploadDocument: async (data: {
    fileName: string;
    fileContent: string;
    fileType: string;
    userId: string;
  }) => {
    const response = await fetch(`${API_URL}/api/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to upload document: ${response.statusText}`);
    }

    return await response.json();
  },

  exportChat: async (sessionId: string) => {
    const response = await fetch(`${API_URL}/api/exports/${sessionId}`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Failed to export chat: ${response.statusText}`);
    }

    return await response.json();
  },

  submitFeedback: async (data: {
    userId: string;
    type: string;
    message: string;
    rating: number;
    sessionId: string;
  }) => {
    const response = await fetch(`${API_URL}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit feedback: ${response.statusText}`);
    }

    return await response.json();
  },
};
