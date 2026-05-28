export interface Message {
    role: "user" | "assistant";
    content: string;
    citations?: string[];
}
export declare const apiClient: {
    sendChatMessage: (data: {
        message: string;
        language?: string;
        userId: string;
        sessionId: string;
    }) => Promise<{
        assistantMessage: Message;
    }>;
    uploadDocument: (data: {
        fileName: string;
        fileContent: string;
        fileType: string;
        userId: string;
    }) => Promise<unknown>;
    exportChat: (sessionId: string) => Promise<unknown>;
    submitFeedback: (data: {
        userId: string;
        type: string;
        message: string;
        rating: number;
        sessionId: string;
    }) => Promise<unknown>;
};
//# sourceMappingURL=routes.d.ts.map