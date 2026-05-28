interface AIResponse {
    content: string;
    citations: string[];
}
export declare function generateAIResponse(message: string, language?: string): Promise<AIResponse>;
export {};
//# sourceMappingURL=aiServices.d.ts.map