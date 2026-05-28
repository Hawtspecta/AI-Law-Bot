interface AIResponse {
    content: string;
    citations: string[];
}
export declare function sanitizeAIContent(content: string): string;
export declare function extractKeyPoints(content: string): string[];
export declare function extractContractRisks(content: string): {
    level: string;
    description: string;
    recommendation: string;
}[];
export declare function extractComplianceIssues(content: string): {
    issue: string;
    status: string;
}[];
export declare function extractRecommendations(content: string): string[];
export declare function extractDifferences(content: string): {
    section: string;
    document1: string;
    document2: string;
    impact: string;
    recommendation: string;
}[];
export declare function buildFormValidationResults(formType: string, userInputs: any): any;
export declare function generateAIResponse(message: string, language?: string): Promise<AIResponse>;
export {};
//# sourceMappingURL=aiServices.d.ts.map