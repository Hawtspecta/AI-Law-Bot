"use strict";
// src/services/api.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiClient = void 0;
const BASE_URL = "http://localhost:3001";
const API_URL = process.env.VITE_API_URL || "http://localhost:3001";
exports.apiClient = {
    sendChatMessage: async (data) => {
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
        const { assistantMessage: assistantMessageRaw } = responseData;
        const assistantMessage = {
            role: "assistant",
            content: assistantMessageRaw.content,
            citations: assistantMessageRaw.citations
                ? JSON.parse(assistantMessageRaw.citations)
                : [],
        };
        return { assistantMessage };
    },
    uploadDocument: async (data) => {
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
    exportChat: async (sessionId) => {
        const response = await fetch(`${API_URL}/api/exports/${sessionId}`, {
            method: "POST",
        });
        if (!response.ok) {
            throw new Error(`Failed to export chat: ${response.statusText}`);
        }
        return await response.json();
    },
    submitFeedback: async (data) => {
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
//# sourceMappingURL=routes.js.map