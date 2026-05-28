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
export declare function generateSimpleEmbedding(text: string): number[];
export declare function extractLegalCitations(text: string): string[];
export declare function ragPipeline(query: string, language?: string, options?: any): Promise<RAGResponse>;
//# sourceMappingURL=ragServices.d.ts.map