"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
// Resolve envPath robustly checking both process.cwd() and parent directory
let envPath = path.resolve(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
    envPath = path.resolve(process.cwd(), '..', '.env');
}
console.log('Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });
if (result.error) {
    console.error('❌ Error loading .env:', result.error);
}
else {
    console.log('✅ Loaded variables:', Object.keys(result.parsed || {}));
}
console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'Present' : 'Missing');
// Rest of your imports
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const aiServices_1 = require("./backend/aiServices");
const ragServices_1 = require("./backend/ragServices");
// Dynamic load of pdf-parse (optional)
let pdfParse = undefined;
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    pdfParse = require('pdf-parse');
    console.log('✅ pdf-parse loaded');
}
catch (e) {
    console.warn('⚠️ pdf-parse not available; PDF parsing endpoints will return fallback messages');
}
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, etc.)
        if (!origin)
            return callback(null, true);
        const allowedOrigins = [
            "http://localhost:8080",
            "http://localhost:3000",
            "http://127.0.0.1:8080",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "https://ai-law-bot-nu.vercel.app"
        ];
        const isAllowed = allowedOrigins.includes(origin) ||
            origin.endsWith(".vercel.app") ||
            origin.includes("vercel.app");
        if (isAllowed) {
            callback(null, true);
        }
        else {
            // Fallback for safety in production demo
            callback(null, true);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "50mb" }));
// Test PDF parsing endpoint
app.get("/api/test-pdf", async (req, res) => {
    try {
        const testPdfBase64 = "JVBERi0xLjQKJeLjz9MKMyAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDIgMCBSL01lZGlhQm94WzAgMCA2MTIgNzkyXS9Db250ZW50cyA0IDAgUj4+CmVuZG9iago0IDAgb2JqCjw8L0xlbmd0aCA0NT4+CnN0cmVhbQpCVAovRjEgMTIgVGYKMTAwIDcwMCBUZAooVGVzdCBQREYpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0NvdW50IDEvS2lkc1szIDAgUl0+PgplbmRvYmoKNSAwIG9iago8PC9UeXBlL0ZvbnQvU3VidHlwZS9UeXBlMS9CYXNlRm9udC9IZWx2ZXRpY2E+PgplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmDQowMDAwMDAwMTk2IDAwMDAwIG4NCjAwMDAwMDAyNDUgMDAwMDAgbg0KMDAwMDAwMDAwOSAwMDAwMCBuDQowMDAwMDAwMTAyIDAwMDAwIG4NCjAwMDAwMDAyOTcgMDAwMDAgbg0KdHJhaWxlcgo8PC9TaXplIDYvUm9vdCAxIDAgUj4+CnN0YXJ0eHJlZgozNjcKJSVFT0Y=";
        if (!pdfParse) {
            return res.status(500).json({ success: false, message: "pdf-parse not available on server" });
        }
        const pdfBuffer = Buffer.from(testPdfBase64, 'base64');
        const data = await pdfParse(pdfBuffer);
        res.json({
            success: true,
            pdfParseWorks: true,
            extractedText: data.text,
            pages: data.numpages,
            message: "PDF parsing is working!"
        });
    }
    catch (error) {
        res.json({
            success: false,
            pdfParseWorks: false,
            error: error.message,
            message: "PDF parsing failed"
        });
    }
});
// Health check
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        ragEnabled: true,
        pdfParseAvailable: typeof pdfParse === 'function'
    });
});
// AI chat route
app.post("/api/chat", async (req, res) => {
    try {
        const { message, language, userId, sessionId } = req.body;
        console.log(`🤖 Processing RAG chat query: "${message}"`);
        const ragResponse = await (0, ragServices_1.ragPipeline)(message, language || "en");
        res.json({
            userMessage: {
                role: 'user',
                content: message,
                timestamp: new Date().toISOString()
            },
            assistantMessage: {
                role: 'assistant',
                content: ragResponse.content,
                citations: ragResponse.citations,
                sources: ragResponse.sources,
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (err) {
        console.error("Chat API Error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Document upload route
app.post("/api/documents", async (req, res) => {
    try {
        console.log("📄 Document upload request received");
        const { fileName, fileContent, fileType, userId } = req.body;
        console.log(`📄 File: ${fileName}, Type: ${fileType}, Content Length: ${fileContent?.length || 0}`);
        if (!fileContent || fileContent.trim().length === 0) {
            console.error("❌ No file content provided");
            return res.status(400).json({ error: "Document content is required" });
        }
        let textContent = fileContent;
        // Handle PDF files (base64 encoded)
        if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
            if (!pdfParse) {
                console.error("❌ pdf-parse not available");
                textContent = `PDF document "${fileName}" cannot be parsed because the pdf-parse library is not available on the server. Please ensure pdf-parse is properly installed.`;
            }
            else {
                try {
                    console.log("📄 PDF detected - extracting text...");
                    const pdfBuffer = Buffer.from(fileContent, 'base64');
                    console.log(`📄 PDF Buffer size: ${pdfBuffer.length} bytes`);
                    const pdfData = await pdfParse(pdfBuffer);
                    textContent = pdfData.text;
                    console.log(`✅ PDF text extracted: ${textContent.length} characters`);
                    console.log(`📄 PDF Info: ${pdfData.numpages} pages`);
                    if (!textContent || textContent.trim().length === 0) {
                        textContent = `PDF document "${fileName}" (${pdfData.numpages} pages) was uploaded but no text could be extracted. This might be a scanned PDF or image-based PDF that requires OCR.`;
                    }
                }
                catch (pdfError) {
                    console.error("❌ PDF parsing error:", pdfError);
                    textContent = `PDF document "${fileName}" could not be parsed. Error: ${pdfError.message}. Please ensure the PDF is not encrypted or corrupted.`;
                }
            }
        }
        console.log("🤖 Sending to AI for analysis...");
        // Analyze document with AI
        const response = await (0, aiServices_1.generateAIResponse)(`You are analyzing a document uploaded by a user. Read the document carefully and provide a detailed analysis.

DOCUMENT NAME: ${fileName}
DOCUMENT TYPE: ${fileType}

YOUR TASK: Analyze this document and tell the user EXACTLY what's in it. Be specific about the actual content.

PROVIDE YOUR ANALYSIS IN THIS FORMAT:

DOCUMENT TYPE & PURPOSE:
[Identify what type of document this is based on the actual content]

MAIN CONTENT SUMMARY:
[Summarize what this specific document is about - be detailed and specific]

KEY SECTIONS IDENTIFIED:
• [List actual sections/topics found in THIS document]
• [Include real information from the document]
• [Be specific about what you found]

IMPORTANT DETAILS FOUND:
[List specific information like dates, names, amounts, addresses, requirements, or other critical details that are actually in this document]

LEGAL OBSERVATIONS:
[Note any legal implications based on the actual content]

RECOMMENDATIONS:
[Provide practical advice based on what's actually in this document]

---

ACTUAL DOCUMENT CONTENT TO ANALYZE:
${textContent.substring(0, 4000)}

${textContent.length > 4000 ? '\n[Note: Document is longer, showing first 4000 characters for analysis]' : ''}

IMPORTANT: Base your entire response on the ACTUAL content above. Do not give generic responses.`, "en");
        console.log("✅ AI analysis complete");
        res.json({
            id: `doc_${Date.now()}`,
            fileName,
            fileType,
            status: 'completed',
            analysis: {
                summary: response.content,
                keyPoints: (0, aiServices_1.extractKeyPoints)(response.content),
                risks: (0, aiServices_1.extractContractRisks)(response.content),
                recommendations: (0, aiServices_1.extractRecommendations)(response.content),
                citations: response.citations.length > 0 ? response.citations : ['AI Analysis by Groq Llama 3.3'],
                sources: []
            },
            timestamp: new Date().toISOString()
        });
        console.log("✅ Document analysis response sent");
    }
    catch (err) {
        console.error("❌ Document upload error:", err);
        res.status(500).json({
            error: "Failed to process document",
            details: err?.message || "Unknown error"
        });
    }
});
// Legal search route
app.post("/api/search", async (req, res) => {
    try {
        const { query, filters, userId } = req.body;
        console.log(`🔍 Legal search with RAG: "${query}"`);
        const searchResults = await (0, ragServices_1.ragPipeline)(query, 'en', { searchMode: true });
        res.json({
            query,
            results: {
                content: searchResults.content,
                citations: searchResults.citations,
                sources: searchResults.sources,
                searchResults: searchResults.sources
            },
            filters: filters || {},
            timestamp: new Date().toISOString()
        });
    }
    catch (err) {
        console.error("Search error:", err);
        res.status(500).json({ error: "Search failed" });
    }
});
// Contract analysis route
app.post("/api/contracts/analyze", async (req, res) => {
    try {
        const { contractContent, contractType } = req.body;
        if (!contractContent || contractContent.trim().length === 0) {
            return res.status(400).json({ error: "Contract content is required" });
        }
        const response = await (0, aiServices_1.generateAIResponse)(`Analyze this ${contractType || 'legal contract'} in detail.

STRUCTURE YOUR RESPONSE AS FOLLOWS:

EXECUTIVE SUMMARY:
[Provide a concise overview in 2-3 sentences]

KEY CLAUSES IDENTIFIED:
• [List the most important clauses]
• [Include brief description for each]
• [Use bullet points]

RISK ASSESSMENT:
High Risk Items:
• [List high-risk items if any]

Medium Risk Items:
• [List medium-risk items]

Low Risk Items:
• [List low-risk items]

COMPLIANCE REVIEW:
[Note any compliance concerns in short paragraphs]
[Separate each concern with a blank line]

RECOMMENDATIONS:
1. [First actionable recommendation]
2. [Second actionable recommendation]
3. [Third actionable recommendation]
4. [Additional recommendations as needed]

Contract text to analyze:
${contractContent.substring(0, 2000)}`, "en");
        res.json({
            success: true,
            analysis: {
                summary: response.content,
                keyClauses: (0, aiServices_1.extractKeyPoints)(response.content),
                risks: (0, aiServices_1.extractContractRisks)(response.content),
                complianceIssues: (0, aiServices_1.extractComplianceIssues)(response.content),
                recommendations: (0, aiServices_1.extractRecommendations)(response.content),
                citations: response.citations.length > 0 ? response.citations : ['AI Contract Analysis by Groq Llama 3.3'],
                sources: []
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (err) {
        console.error("Contract analysis error:", err);
        res.status(500).json({ error: "Contract analysis failed", details: err?.message || "Unknown error" });
    }
});
// Form filling route
app.post("/api/forms/fill", async (req, res) => {
    try {
        const { formType, userInputs, conditions } = req.body;
        const response = await (0, aiServices_1.generateAIResponse)(`Help fill out a ${formType} legal form. Provide guidance in this format:

FORM GUIDANCE FOR ${formType.toUpperCase()}:

Field Review:
[Analyze the provided information]

Validation Status:
[Check completeness and accuracy]

Completion Guidance:
[Provide specific instructions for filling]

Important Considerations:
[Highlight critical points to remember]

Legal Tips:
[Offer relevant legal advice for this form type]

User provided data:
${JSON.stringify(userInputs, null, 2)}`, "en");
        res.json({
            success: true,
            filledForm: {
                formType,
                filledFields: userInputs,
                validationResults: (0, aiServices_1.buildFormValidationResults)(formType, userInputs),
                suggestions: (0, aiServices_1.extractRecommendations)(response.content).slice(0, 3),
                completedForm: response.content,
                citations: response.citations.length > 0 ? response.citations : ['AI Form Assistant'],
                sources: []
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (err) {
        console.error("Form fill error:", err);
        res.status(500).json({ error: "Form filling failed" });
    }
});
// Document comparison route
app.post("/api/documents/compare", async (req, res) => {
    try {
        const { document1, document2, comparisonType } = req.body;
        const response = await (0, aiServices_1.generateAIResponse)(`Compare these two legal documents and provide a structured analysis:

📊 COMPARISON SUMMARY:
[Overall assessment of differences]

🔄 KEY CHANGES IDENTIFIED:
[List major modifications between documents]

⚖️ LEGAL IMPLICATIONS:
[Explain the legal impact of changes]

⚠️ RISK ANALYSIS:
[Assess risks from the modifications]

💡 RECOMMENDATIONS:
[Provide actionable advice]

Document 1 (First 1000 chars):
${document1.substring(0, 1000)}

Document 2 (First 1000 chars):
${document2.substring(0, 1000)}`, "en");
        res.json({
            success: true,
            comparison: {
                comparisonType: comparisonType || 'general',
                differences: (0, aiServices_1.extractDifferences)(response.content),
                summary: response.content.split('\n')[0] || 'Document comparison completed',
                redlineView: response.content,
                recommendations: (0, aiServices_1.extractRecommendations)(response.content),
                citations: response.citations.length > 0 ? response.citations : ['AI Document Comparison'],
                sources: []
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (err) {
        console.error("Document comparison error:", err);
        res.status(500).json({ error: "Document comparison failed" });
    }
});
// Legal news route
app.get("/api/news", async (req, res) => {
    try {
        const region = req.query.region || 'India';
        const topic = req.query.topic || 'general';
        const limit = parseInt(req.query.limit) || 6;
        // Rich fallback database for local offline mode & backfilling
        const currentDate = new Date();
        const localDatabase = {
            'India': {
                'general': [
                    {
                        id: 101,
                        title: 'Supreme Court Upholds Right to Privacy in the Digital Era',
                        summary: 'The Supreme Court of India reinforced the fundamental right to privacy, establishing a new legal benchmark for digital data protection and online citizen rights.',
                        date: new Date(currentDate.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'Live Law India',
                        url: 'https://www.livelaw.in'
                    },
                    {
                        id: 102,
                        title: 'Bar Council Proposes New Professional Ethics Guidelines',
                        summary: 'The Bar Council of India has drafted a modern code of conduct to address digital marketing, virtual consultations, and technology integration in legal practices.',
                        date: new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'Bar and Bench',
                        url: 'https://www.barandbench.com'
                    }
                ],
                'consumer': [
                    {
                        id: 111,
                        title: 'Consumer Commission Penalizes E-Commerce Giant for Delayed Refund',
                        summary: 'The National Consumer Disputes Redressal Commission (NCDRC) issued a landmark ruling penalizing a major online marketplace for violating consumer rights.',
                        date: new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'Consumer Voice',
                        url: 'https://www.livelaw.in'
                    },
                    {
                        id: 112,
                        title: 'New CCPA Guidelines Target Misleading Health Advertisements',
                        summary: 'The Central Consumer Protection Authority (CCPA) issued a strict warning and guidelines prohibiting false health and wellness claims in media.',
                        date: new Date(currentDate.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'Economic Times',
                        url: 'https://economictimes.indiatimes.com'
                    }
                ],
                'corporate': [
                    {
                        id: 121,
                        title: 'NCLT Rules on Corporate Insolvency Resolution Timelines',
                        summary: 'The National Company Law Tribunal issued fresh directives aimed at speeding up the resolution processes under the Insolvency and Bankruptcy Code (IBC).',
                        date: new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'Business Standard',
                        url: 'https://www.business-standard.com'
                    },
                    {
                        id: 122,
                        title: 'SEBI Enhances ESG Disclosure Rules for Top Listed Companies',
                        summary: 'The Securities and Exchange Board of India (SEBI) has mandated comprehensive ESG metrics reporting for India\'s top 1,000 listed corporations.',
                        date: new Date(currentDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'Economic Times',
                        url: 'https://economictimes.indiatimes.com'
                    }
                ],
                'criminal': [
                    {
                        id: 131,
                        title: 'New Criminal Codes BNS, BNSS, and BSA Fully Operational',
                        summary: 'The Bharatiya Nyaya Sanhita, Bharatiya Nagarik Suraksha Sanhita, and Bharatiya Sakshya Adhiniyam have officially replaced old colonial laws, streamlining modern forensic evidence standards.',
                        date: new Date(currentDate.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'Ministry of Home Affairs',
                        url: 'https://www.livelaw.in'
                    },
                    {
                        id: 132,
                        title: 'Supreme Court Sets Strict Standards for Arrest and Custodial Questioning',
                        summary: 'In an essential criminal justice ruling, the Supreme Court refined custody guidelines to ensure strict adherence to human rights during questioning.',
                        date: new Date(currentDate.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'Live Law India',
                        url: 'https://www.livelaw.in'
                    }
                ],
                'family': [
                    {
                        id: 141,
                        title: 'High Court Rules Mutual Consent Divorce Period Can Be Waived',
                        summary: 'The High Court ruled that the statutory six-month waiting period for mutual consent divorce can be waived under specific exceptional circumstances.',
                        date: new Date(currentDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'Indian Express',
                        url: 'https://indianexpress.com'
                    },
                    {
                        id: 142,
                        title: 'Supreme Court Clarifies Child Custody Principles and Joint Guardianship',
                        summary: 'The apex court emphasized that child welfare is the primary benchmark in custody disputes, advocating for joint parenting models where feasible.',
                        date: new Date(currentDate.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'Bar and Bench',
                        url: 'https://www.barandbench.com'
                    }
                ],
                'property': [
                    {
                        id: 151,
                        title: 'RERA Rules Builder Must Pay Penalty for Delayed Construction',
                        summary: 'The Real Estate Regulatory Authority (RERA) ruled that developers must provide compensation to home buyers for projects delayed beyond standard timelines.',
                        date: new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'Property Law Journal',
                        url: 'https://economictimes.indiatimes.com'
                    },
                    {
                        id: 152,
                        title: 'Land Acquisition Compensations Must Match Current Market Value',
                        summary: 'A new judicial amendment establishes that government land acquisition for public infrastructure must be compensated at active market value.',
                        date: new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'Live Law India',
                        url: 'https://www.livelaw.in'
                    }
                ]
            },
            'USA': {
                'general': [
                    {
                        id: 201,
                        title: 'Supreme Court Rules on AI Output and Patent Ownership',
                        summary: 'The US Supreme Court established a landmark ruling on AI-created patent applications, specifying that inventors must be human under current federal patent laws.',
                        date: new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'SCOTUS Blog',
                        url: 'https://www.supremecourt.gov'
                    },
                    {
                        id: 202,
                        title: 'Federal Judiciary Launches New Digital E-Filing System',
                        summary: 'The federal court system introduced an upgraded, highly secure electronic document database to replace obsolete filing legacy portals.',
                        date: new Date(currentDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'US Courts Info',
                        url: 'https://www.uscourts.gov'
                    }
                ],
                'consumer': [
                    {
                        id: 211,
                        title: 'FTC Announces Massive Credit Privacy Settlement',
                        summary: 'The Federal Trade Commission reached a settlement with a major financial bureau over inadequate consumer credit report security.',
                        date: new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'FTC Press Room',
                        url: 'https://www.ftc.gov'
                    },
                    {
                        id: 212,
                        title: 'Consumer Protection Bureau Proposes Elimination of Medical Debt Fees',
                        summary: 'The CFPB drafted new rules aimed at deleting medical debt records from standard consumer credit reports to protect ratings.',
                        date: new Date(currentDate.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'CFPB Blog',
                        url: 'https://www.consumerfinance.gov'
                    }
                ],
                'corporate': [
                    {
                        id: 221,
                        title: 'SEC Mandates Standardized Corporate Climate Risk Reporting',
                        summary: 'The Securities and Exchange Commission (SEC) finalized regulations requiring registered companies to disclose environmental impact metrics.',
                        date: new Date(currentDate.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'SEC News',
                        url: 'https://www.sec.gov'
                    },
                    {
                        id: 222,
                        title: 'Delaware Court Resolves Major Shareholder Acquisition Dispute',
                        summary: 'A crucial ruling in the Delaware Court of Chancery redefined board responsibilities during hostile private equity acquisition attempts.',
                        date: new Date(currentDate.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'Delaware Law Weekly',
                        url: 'https://courts.delaware.gov'
                    }
                ],
                'criminal': [
                    {
                        id: 231,
                        title: 'Justice Department Launches Campaign Against Corporate Fraud',
                        summary: 'The DOJ announced new federal task forces and severe sentencing updates focused on financial cybercrime and systemic embezzlement.',
                        date: new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'DOJ Bureau',
                        url: 'https://www.justice.gov'
                    },
                    {
                        id: 232,
                        title: 'Supreme Court Clarifies Search Standards for Mobile Encrypted Devices',
                        summary: 'A major fourth amendment decision establishes that law enforcement officers must obtain specific judicial warrants before looking through cloud accounts.',
                        date: new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'SCOTUS Blog',
                        url: 'https://www.supremecourt.gov'
                    }
                ],
                'family': [
                    {
                        id: 241,
                        title: 'State Court Establishes Multi-State Child Support Standard',
                        summary: 'An interstate legal commission finalized uniform enforcement rules for child custody and financial support across state lines.',
                        date: new Date(currentDate.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'Family Law Quarterly',
                        url: 'https://www.americanbar.org'
                    },
                    {
                        id: 242,
                        title: 'New Guidelines for Prenuptial Agreements on Digital Intellectual Property',
                        summary: 'Legal guidelines now address how digital assets, streaming accounts, and online content revenue are divided in family law.',
                        date: new Date(currentDate.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'ABA Journal',
                        url: 'https://www.abajournal.com'
                    }
                ],
                'property': [
                    {
                        id: 251,
                        title: 'Federal Housing Agency Redefines Landlord-Tenant Disclosure Policies',
                        summary: 'New HUD rules require complete leasing documentation and explicit disclosure of past maintenance reports to potential tenants.',
                        date: new Date(currentDate.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'HUD Office',
                        url: 'https://www.hud.gov'
                    },
                    {
                        id: 252,
                        title: 'Supreme Court Upholds Commercial Property Zoning Protections',
                        summary: 'A significant land-use case concluded that municipal rezoning restrictions must offer compensation to property owners.',
                        date: new Date(currentDate.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'SCOTUS Blog',
                        url: 'https://www.supremecourt.gov'
                    }
                ]
            },
            'UK': {
                'general': [
                    {
                        id: 301,
                        title: 'UK Supreme Court Refines Judicial Review Boundaries',
                        summary: 'The UK Supreme Court clarified limits on ministerial interventions, ensuring robust legal checks on governmental policy changes.',
                        date: new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'UK Law Gazette',
                        url: 'https://www.lawgazette.co.uk'
                    }
                ],
                'consumer': [
                    {
                        id: 311,
                        title: 'FCA Imposes Heavy Fines on Banks Over Consumer Loan Term Clarity',
                        summary: 'The Financial Conduct Authority penalized multiple high-street banks for failing to clarify additional fee terms for retail borrowers.',
                        date: new Date(currentDate.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'FCA News',
                        url: 'https://www.fca.org.uk'
                    }
                ],
                'corporate': [
                    {
                        id: 321,
                        title: 'UK Companies House Gains Enhanced Powers Against Corporate Fraud',
                        summary: 'Under the Economic Crime and Corporate Transparency Act, Companies House can query, reject, or delete incorrect business details.',
                        date: new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'UK Gov Press',
                        url: 'https://www.gov.uk'
                    }
                ],
                'criminal': [
                    {
                        id: 331,
                        title: 'CPS Introduces Special Cyber Fraud Prosecution Units',
                        summary: 'The Crown Prosecution Service launched specialized litigation departments designed to investigate cross-border digital financial scams.',
                        date: new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'CPS UK',
                        url: 'https://www.cps.gov.uk'
                    }
                ],
                'family': [
                    {
                        id: 341,
                        title: 'UK Adopts No-Fault Divorce Framework for Family Separation',
                        summary: 'An updated matrimonial law framework has streamlined child custody and property split proceedings during uncontested separations.',
                        date: new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'Family Law Reports',
                        url: 'https://www.gov.uk'
                    }
                ],
                'property': [
                    {
                        id: 351,
                        title: 'Leasehold Reform Act Fully Abolishes Marriage Value Ground Rent Fees',
                        summary: 'In an incredible win for leaseholders, Parliament successfully prohibited developers from collecting ground rent for extended leases.',
                        date: new Date(currentDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'UK Law Gazette',
                        url: 'https://www.lawgazette.co.uk'
                    }
                ]
            },
            'EU': {
                'general': [
                    {
                        id: 401,
                        title: 'European Court of Justice Issues Final Ruling on GDPR Cross-Border Transfers',
                        summary: 'The ECJ reinforced data protection laws, clarifying strict compliance standards for transferring data from EU citizens to foreign clouds.',
                        date: new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'EU Commission',
                        url: 'https://ec.europa.eu'
                    }
                ],
                'consumer': [
                    {
                        id: 411,
                        title: 'EU Digital Markets Act Mandates Open Marketplace Protections',
                        summary: 'New DMA guidelines give consumers full control over default apps and browser services on mobile operating systems.',
                        date: new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'EU Legal News',
                        url: 'https://ec.europa.eu'
                    }
                ],
                'corporate': [
                    {
                        id: 421,
                        title: 'EU Approves Mandatory Corporate Supply Chain Due Diligence Directives',
                        summary: 'The Corporate Sustainability Due Diligence Directive (CSDDD) requires EU firms to account for child labor and emissions in supply chains.',
                        date: new Date(currentDate.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'Europe Corporate Law',
                        url: 'https://ec.europa.eu'
                    }
                ],
                'criminal': [
                    {
                        id: 431,
                        title: 'Europol Coordinates Major Clean-Up of Money Laundering Networks',
                        summary: 'A unified European warrant network succeeded in disrupting multiple financial operations running illegal offshore accounts.',
                        date: new Date(currentDate.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'Europol News',
                        url: 'https://www.europol.europa.eu'
                    }
                ],
                'family': [
                    {
                        id: 441,
                        title: 'EU Court Confirms Mutual Recognition of Same-Sex Marriage Rights',
                        summary: 'The CJEU ruled that family rights and parentage certificates established in one member state must be recognized in all others.',
                        date: new Date(currentDate.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'EUR-Lex',
                        url: 'https://eur-lex.europa.eu'
                    }
                ],
                'property': [
                    {
                        id: 451,
                        title: 'New EU Directives Mandate Energy Certifications for Commercial Real Estate',
                        summary: 'A new property law directive establishes mandatory green ratings and efficiency compliance deadlines for commercial properties.',
                        date: new Date(currentDate.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
                        source: 'EU Property News',
                        url: 'https://ec.europa.eu'
                    }
                ]
            }
        };
        const apiKey = process.env.NEWS_API_KEY;
        if (apiKey && apiKey.trim().length > 0) {
            try {
                let query = `(law OR legal OR court)`;
                // Strict regional parameters and negative exclusions
                if (region === 'India') {
                    query += ` AND (India OR Indian OR Delhi OR Mumbai OR "High Court" OR "Supreme Court of India" OR NCLT OR RERA OR "Companies Act")`;
                    query += ` -Bangladesh -Pakistan -Nepal -"Sri Lanka" -US -"United States" -UK -"United Kingdom"`;
                }
                else if (region === 'USA') {
                    query += ` AND (USA OR "United States" OR federal OR "Supreme Court" OR Congress OR SEC OR FTC)`;
                    query += ` -India -Indian -UK -Europe -European -Bangladesh -Pakistan`;
                }
                else if (region === 'UK') {
                    query += ` AND (UK OR "United Kingdom" OR Britain OR British OR Parliament OR London)`;
                    query += ` -India -Indian -US -"United States" -Europe -European -Bangladesh -Pakistan`;
                }
                else if (region === 'EU') {
                    query += ` AND (EU OR "European Union" OR Europe OR European OR Brussels OR Strasbourg OR "European Court")`;
                    query += ` -India -Indian -US -"United States" -UK -"United Kingdom" -China`;
                }
                else {
                    query += ` AND ${region}`;
                }
                // Rich topical subqueries
                const topicQueries = {
                    'consumer': `(consumer OR "buyer rights" OR "unfair trade" OR "defective" OR "customer dispute" OR "Consumer Protection Act")`,
                    'corporate': `(corporate OR company OR companies OR merger OR acquisition OR insolvency OR bankruptcy OR SEC OR SEBI OR NCLT OR ESG)`,
                    'criminal': `(criminal OR prosecution OR bail OR arrest OR crime OR theft OR homicide OR murder OR fraud OR penal)`,
                    'family': `(family OR divorce OR custody OR marriage OR alimony OR adoption OR domestic)`,
                    'property': `(property OR "real estate" OR land OR tenant OR landlord OR lease OR RERA)`
                };
                if (topic && topic !== 'general' && topicQueries[topic]) {
                    query += ` AND ${topicQueries[topic]}`;
                }
                const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=${limit * 4}&apiKey=${apiKey}`;
                console.log(`🌐 Fetching real-time news from NewsAPI: ${url}`);
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    if (data.status === 'ok' && data.articles && data.articles.length > 0) {
                        let news = data.articles.map((article, index) => ({
                            id: index + 1,
                            title: article.title || 'Legal Development',
                            summary: article.description || article.content || 'A new legal case or ruling has been reported.',
                            date: article.publishedAt || new Date().toISOString(),
                            source: article.source?.name || 'News Source',
                            url: article.url || 'https://newsapi.org'
                        }));
                        // Post-fetch double validation filter
                        if (region === 'India') {
                            news = news.filter((article) => {
                                const title = article.title.toLowerCase();
                                const summary = article.summary.toLowerCase();
                                return !title.includes('bangladesh') && !summary.includes('bangladesh') &&
                                    !title.includes('pakistan') && !summary.includes('pakistan') &&
                                    !title.includes('nepal') && !summary.includes('nepal') &&
                                    !title.includes('sri lanka') && !summary.includes('sri lanka');
                            });
                        }
                        else if (region === 'USA') {
                            news = news.filter((article) => {
                                const title = article.title.toLowerCase();
                                const summary = article.summary.toLowerCase();
                                return !title.includes('india') && !summary.includes('india') &&
                                    !title.includes('bangladesh') && !summary.includes('bangladesh');
                            });
                        }
                        else if (region === 'UK') {
                            news = news.filter((article) => {
                                const title = article.title.toLowerCase();
                                const summary = article.summary.toLowerCase();
                                return !title.includes('india') && !summary.includes('india') &&
                                    !title.includes('bangladesh') && !summary.includes('bangladesh');
                            });
                        }
                        else if (region === 'EU') {
                            news = news.filter((article) => {
                                const title = article.title.toLowerCase();
                                const summary = article.summary.toLowerCase();
                                return !title.includes('india') && !summary.includes('india') &&
                                    !title.includes('bangladesh') && !summary.includes('bangladesh');
                            });
                        }
                        // Post-fetch topic verification filter
                        const topicKeywords = {
                            'consumer': ['consumer', 'buyer', 'customer', 'refund', 'product', 'fair trade', 'ccpa', 'ncdrc', 'advertisement', 'commission', 'complaint'],
                            'corporate': ['corporate', 'company', 'companies', 'merger', 'acquisition', 'insolvency', 'bankruptcy', 'sebi', 'nclt', 'esg', 'shareholder', 'board', 'sec', 'securities'],
                            'criminal': ['criminal', 'arrest', 'bail', 'police', 'prosecution', 'trial', 'crime', 'murder', 'fraud', 'theft', 'bns', 'ipc', 'accused', 'court', 'prison', 'jail'],
                            'family': ['family', 'divorce', 'custody', 'marriage', 'alimony', 'maintenance', 'adoption', 'domestic', 'matrimonial', 'spouse'],
                            'property': ['property', 'real estate', 'land', 'tenant', 'landlord', 'lease', 'rera', 'rent', 'zoning', 'eviction', 'housing']
                        };
                        if (topic && topic !== 'general' && topicKeywords[topic]) {
                            const keywords = topicKeywords[topic];
                            news = news.filter((article) => {
                                const title = article.title.toLowerCase();
                                const summary = article.summary.toLowerCase();
                                return keywords.some((kw) => title.includes(kw) || summary.includes(kw));
                            });
                        }
                        // If the filtered list has too few articles, backfill from our high-quality local fallback database
                        if (news.length < limit) {
                            const regionData = localDatabase[region] || localDatabase['India'];
                            const topicArticles = regionData[topic] || regionData['general'] || [];
                            for (const fallback of topicArticles) {
                                if (news.length >= limit)
                                    break;
                                if (!news.some((n) => n.title.toLowerCase() === fallback.title.toLowerCase())) {
                                    news.push(fallback);
                                }
                            }
                        }
                        console.log(`✅ Fetched, validated, and backfilled ${news.length} news articles from NewsAPI for ${region}/${topic}`);
                        return res.json({
                            success: true,
                            news: news.slice(0, limit),
                            region,
                            topic,
                            timestamp: new Date().toISOString()
                        });
                    }
                }
                console.warn(`⚠️ NewsAPI fetch failed or returned empty; status: ${response.status}`);
            }
            catch (newsApiError) {
                console.warn(`⚠️ Failed to call NewsAPI, falling back to local news list:`, newsApiError.message);
            }
        }
        const regionData = localDatabase[region] || localDatabase['India'];
        const topicArticles = regionData[topic] || regionData['general'] || [];
        // If the topic does not have enough articles, backfill with general news of that region
        let filteredNews = [...topicArticles];
        if (filteredNews.length < limit && topic !== 'general') {
            const generalArticles = regionData['general'] || [];
            for (const art of generalArticles) {
                if (!filteredNews.find(a => a.id === art.id)) {
                    filteredNews.push(art);
                }
            }
        }
        res.json({
            success: true,
            news: filteredNews.slice(0, limit),
            region,
            topic,
            timestamp: new Date().toISOString()
        });
    }
    catch (err) {
        console.error("Legal news error:", err);
        res.status(500).json({ error: "Failed to fetch legal news" });
    }
});
// Metrics route
app.get("/api/metrics", (req, res) => {
    res.json({
        success: true,
        metrics: {
            totalMessages: 1250,
            totalUsers: 89,
            legalFeesSaved: '₹40L',
            documentsProcessed: 156,
            ragQueriesProcessed: 892
        },
        timestamp: new Date().toISOString()
    });
});
// Chat export route
app.post("/api/chat/export/:sessionId", (req, res) => {
    const { sessionId } = req.params;
    res.json({
        success: true,
        exportUrl: `/exports/${sessionId}.pdf`,
        messageCount: 10,
        timestamp: new Date().toISOString()
    });
});
// Feedback route
app.post("/api/feedback", (req, res) => {
    const feedback = req.body;
    res.json({
        success: true,
        feedback: { id: `feedback_${Date.now()}`, ...feedback },
        message: 'Feedback submitted successfully'
    });
});
// Authentication routes
app.post("/api/auth/login", (req, res) => {
    const { email } = req.body;
    res.json({
        success: true,
        token: `token_${Date.now()}`,
        user: { id: 'user_1', email, name: 'User' },
        message: 'Login successful'
    });
});
app.post("/api/auth/register", (req, res) => {
    res.json({
        success: true,
        message: 'Registration successful'
    });
});
// Session management
app.post("/api/sessions", (req, res) => {
    const { userId, title } = req.body;
    res.json({
        success: true,
        session: {
            sessionId: `session_${Date.now()}`,
            title,
            userId,
            createdAt: new Date().toISOString()
        }
    });
});
// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({ error: "Route not found" });
});
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
});
exports.default = app;
//# sourceMappingURL=server.js.map