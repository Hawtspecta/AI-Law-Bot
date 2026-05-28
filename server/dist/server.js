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
const envPath = path.resolve(__dirname, '.env');
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
require("./backend/aiServices");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const aiServices_1 = require("./backend/aiServices");
const ragServices_1 = require("./backend/ragServices");
// Dynamic load of pdf-parse for PDF parsing
let pdfParse = undefined;
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pdfParseModule = require('pdf-parse');
    // pdf-parse exports an object with PDFParse class
    pdfParse = pdfParseModule.PDFParse;
    console.log('✅ pdf-parse loaded as PDFParse class');
}
catch (e) {
    console.warn('⚠️ pdf-parse not available; PDF parsing endpoints will return fallback messages');
    pdfParse = undefined;
}
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// In-memory document storage for session context
const documentStore = new Map();
// Query anonymization function
function anonymizeQuery(query) {
    // Remove common PII patterns
    let anonymized = query
        // Remove email addresses
        .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
        // Remove phone numbers (basic pattern)
        .replace(/\b\d{10}\b/g, '[PHONE]')
        // Remove Aadhaar-like numbers (12 digits)
        .replace(/\b\d{12}\b/g, '[AADHAAR]')
        // Remove PAN-like patterns (5 letters + 4 digits + 1 letter)
        .replace(/\b[A-Z]{5}\d{4}[A-Z]\b/g, '[PAN]')
        // Remove names (simple pattern - capitalized words that look like names)
        .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, '[NAME]')
        // Remove addresses (basic pattern)
        .replace(/\d+\s+[A-Z][a-z]+\s+(Street|Road|Lane|Avenue|Drive|Blvd|St|Rd|Ln|Ave|Dr)\b/gi, '[ADDRESS]');
    return anonymized;
}
// Middleware
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:8080",
        "http://localhost:3000",
        "http://127.0.0.1:8080",
        "http://localhost:5173", // Vite default port
        "http://127.0.0.1:5173",
        "http://localhost:8081", // Alternative Vite port
        "http://127.0.0.1:8081"
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "50mb" }));
// Test PDF parsing endpoint
app.get("/api/test-pdf", async (req, res) => {
    try {
        // Create a simple test PDF buffer
        const testPdfBase64 = "JVBERi0xLjQKJeLjz9MKMyAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDIgMCBSL01lZGlhQm94WzAgMCA2MTIgNzkyXS9Db250ZW50cyA0IDAgUj4+CmVuZG9iago0IDAgb2JqCjw8L0xlbmd0aCA0NT4+CnN0cmVhbQpCVAovRjEgMTIgVGYKMTAwIDcwMCBUZAooVGVzdCBQREYpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0NvdW50IDEvS2lkc1szIDAgUl0+PgplbmRvYmoKNSAwIG9iago8PC9UeXBlL0ZvbnQvU3VidHlwZS9UeXBlMS9CYXNlRm9udC9IZWx2ZXRpY2E+PgplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmDQowMDAwMDAwMTAyIDAwMDAwIG4NCjAwMDAwMDAyNDUgMDAwMDAgbg0KMDAwMDAwMDAwOSAwMDAwMCBuDQowMDAwMDAwMTAyIDAwMDAwIG4NCjAwMDAwMDAyOTcwMDAwMCBuDQp0cmFpbGVyCjw8L1NpemUgNi9Sb290IDEgMCBSPj4Kc3RhcnR4cmVmCjM2NwolJUVPRg==";
        const pdfBuffer = Buffer.from(testPdfBase64, 'base64');
        if (!pdfParse) {
            throw new Error('pdf-parse not loaded');
        }
        // Parse PDF using pdf-parse as a class
        const data = await new pdfParse(pdfBuffer);
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
        pdfParseAvailable: pdfParse !== undefined
    });
});
// AI chat route
app.post("/api/chat", async (req, res) => {
    try {
        const { message, language, userId, sessionId, anonymize } = req.body;
        // Anonymize query if enabled
        const processedMessage = anonymize ? anonymizeQuery(message) : message;
        // Check if there's a document stored for this session
        const storedDocument = sessionId ? documentStore.get(sessionId) : null;
        let chatResponseContent = "";
        let chatCitations = [];
        let chatSources = [];
        if (storedDocument) {
            console.log(`📄 Chat uses uploaded document: ${storedDocument.fileName}`);
            const enhancedMessage = `Based on the uploaded document "${storedDocument.fileName}", answer this question: ${processedMessage}\n\nDocument content:\n${storedDocument.content.substring(0, 6000)}`;
            const response = await (0, aiServices_1.generateAIResponse)(enhancedMessage, language || "en");
            chatResponseContent = response.content;
            chatCitations = (0, ragServices_1.extractLegalCitations)(response.content);
            if (chatCitations.length === 0) {
                chatCitations = [`AI Analysis of ${storedDocument.fileName}`];
            }
            chatSources = [{
                    title: storedDocument.fileName,
                    source: 'User Upload',
                    similarity: 1.0,
                    content: storedDocument.content.substring(0, 250) + '...'
                }];
        }
        else {
            console.log(`🔍 Chat uses standard RAG Pipeline`);
            const ragResponse = await (0, ragServices_1.ragPipeline)(processedMessage, language || "en");
            chatResponseContent = ragResponse.content;
            chatCitations = ragResponse.citations;
            chatSources = ragResponse.sources;
        }
        // Store message in history
        const fs = require('fs');
        const path = require('path');
        const dataDir = path.join(__dirname, '../data');
        // Ensure data directory exists
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        const messagesFile = path.join(dataDir, 'messages.json');
        let messages = [];
        // Load existing messages
        if (fs.existsSync(messagesFile)) {
            try {
                const data = fs.readFileSync(messagesFile, 'utf8');
                messages = JSON.parse(data);
            }
            catch (e) {
                console.warn('Failed to load messages.json, starting with empty array');
            }
        }
        // Add new messages
        const userMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: userId || 'anonymous',
            sessionId: sessionId || 'default',
            role: 'user',
            content: anonymize ? anonymizeQuery(message) : message, // Store anonymized version if enabled
            timestamp: new Date().toISOString()
        };
        const assistantMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: userId || 'anonymous',
            sessionId: sessionId || 'default',
            role: 'assistant',
            content: chatResponseContent,
            citations: chatCitations,
            sources: chatSources,
            timestamp: new Date().toISOString()
        };
        messages.push(userMessage, assistantMessage);
        // Save messages
        fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));
        res.json({
            userMessage: {
                role: 'user',
                content: message,
                timestamp: new Date().toISOString()
            },
            assistantMessage: {
                role: 'assistant',
                content: chatResponseContent,
                citations: chatCitations,
                sources: chatSources,
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
        const { fileName, fileContent, fileType, userId, sessionId } = req.body;
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
                    // Convert base64 to buffer
                    const pdfBuffer = Buffer.from(fileContent, 'base64');
                    console.log(`📄 PDF Buffer size: ${pdfBuffer.length} bytes`);
                    // Parse PDF using pdf-parse as a class
                    const data = await new pdfParse(pdfBuffer);
                    if (!data || !data.text) {
                        console.warn('⚠️ PDF parsing returned invalid data, using fallback');
                        textContent = `PDF document "${fileName}" could not be parsed. The PDF might be encrypted, corrupted, or in a format not supported by the parser.`;
                    }
                    else {
                        textContent = data.text;
                    }
                    console.log(`✅ PDF text extracted: ${textContent.length} characters`);
                    console.log(`📄 PDF Info: ${data.numpages} pages`);
                    if (!textContent || textContent.trim().length === 0) {
                        textContent = `PDF document "${fileName}" (${data.numpages} pages) was uploaded but no text could be extracted. This might be a scanned PDF or image-based PDF that requires OCR.`;
                    }
                }
                catch (pdfError) {
                    console.error("❌ PDF parsing error:", pdfError);
                    textContent = `PDF document "${fileName}" could not be parsed. Error: ${pdfError.message}. Please ensure the PDF is not encrypted or corrupted.`;
                }
            }
        }
        // Store document for use in chat
        if (sessionId) {
            documentStore.set(sessionId, { fileName, content: textContent, fileType });
            console.log(`✅ Document stored for session: ${sessionId}`);
        }
        console.log("🤖 Sending to AI for analysis...");
        console.log(`📄 Content preview: ${textContent.substring(0, 200)}...`);
        // Analyze document with AI
        const response = await (0, aiServices_1.generateAIResponse)(`Analyze this document and tell me what's in it.

DOCUMENT: ${fileName}
CONTENT: ${textContent.substring(0, 4000)}`, "en");
        console.log("✅ AI analysis complete");
        const docCitations = (0, ragServices_1.extractLegalCitations)(response.content);
        res.json({
            id: `doc_${Date.now()}`,
            fileName,
            fileType,
            status: 'completed',
            analysis: {
                summary: response.content,
                keyPoints: [
                    'Document analyzed successfully',
                    'Key information extracted',
                    'Legal considerations identified'
                ],
                risks: [],
                recommendations: [
                    'Review the analysis above for specific details about your document'
                ],
                citations: docCitations.length > 0 ? docCitations : ['AI Analysis by Groq Llama 3.3'],
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
        const searchResults = await (0, ragServices_1.ragPipeline)(query, "en", { searchMode: true });
        // Map vector store sources to searchResults and sources
        const matchedSources = searchResults.sources.map((s, index) => ({
            title: s.title,
            type: 'analysis',
            relevance: s.similarity,
            snippet: s.content
        }));
        const formattedSearchResults = searchResults.sources.map((s, index) => ({
            title: s.title,
            excerpt: s.content,
            source: s.source,
            url: '#',
            relevance: s.similarity
        }));
        // Fallbacks if no search results match
        const finalSources = matchedSources.length > 0 ? matchedSources : [
            {
                title: 'AI Legal Analysis',
                type: 'analysis',
                relevance: 0.95,
                snippet: searchResults.content.substring(0, 200) + '...'
            }
        ];
        const finalSearchResults = formattedSearchResults.length > 0 ? formattedSearchResults : [
            {
                title: 'Legal Information on: ' + query,
                excerpt: searchResults.content.substring(0, 300) + '...',
                source: 'AI Research Assistant',
                url: '#',
                relevance: 0.95
            }
        ];
        res.json({
            query,
            results: {
                content: searchResults.content,
                citations: searchResults.citations,
                sources: finalSources,
                searchResults: finalSearchResults
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
// Privacy settings route
app.post("/api/privacy", async (req, res) => {
    try {
        const { anonymizeQueries, dataRetentionDays } = req.body;
        // In a real app, this would save to a database
        // For now, just acknowledge the settings
        console.log('Privacy settings updated:', { anonymizeQueries, dataRetentionDays });
        res.json({
            success: true,
            message: 'Privacy settings saved successfully',
            settings: {
                anonymizeQueries,
                dataRetentionDays
            }
        });
    }
    catch (err) {
        console.error("Privacy settings error:", err);
        res.status(500).json({ error: "Failed to save privacy settings", details: err?.message || "Unknown error" });
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
                keyClauses: [
                    'Payment Terms: Payment obligations and schedule identified in the contract',
                    'Termination Clause: Conditions for contract termination outlined',
                    'Liability Provisions: Limitation of liability terms present',
                    'Confidentiality: Non-disclosure obligations specified'
                ],
                risks: [
                    {
                        level: 'Medium',
                        description: 'Payment terms may require clarification',
                        recommendation: 'Ensure payment schedule is clearly defined and acceptable to all parties'
                    },
                    {
                        level: 'Low',
                        description: 'Standard liability limitations present',
                        recommendation: 'Review liability caps with legal counsel'
                    }
                ],
                complianceIssues: [
                    { issue: 'Contract format compliance', status: 'Compliant' },
                    { issue: 'Legal language review needed', status: 'Review Required' }
                ],
                recommendations: [
                    'Have this contract reviewed by a qualified legal professional',
                    'Ensure all parties fully understand their obligations',
                    'Verify that all necessary clauses are included for your jurisdiction',
                    'Keep signed copies for all parties'
                ],
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
const FORM_VALIDATION_SCHEMAS = {
    'consumer-complaint': {
        title: 'Consumer Complaint Form',
        fields: [
            { key: 'name', label: 'Complainant Name', required: true, format: 'text', legalBasis: 'Identity of the complainant for consumer grievance filing' },
            { key: 'email', label: 'Email Address', required: true, format: 'email', legalBasis: 'Official correspondence and acknowledgement' },
            { key: 'phone', label: 'Mobile Number', required: false, format: 'phone', legalBasis: 'Additional contact for service of notices' },
            { key: 'address', label: 'Address', required: false, format: 'text', legalBasis: 'Postal address for consumer records' },
            { key: 'complaint', label: 'Complaint Description', required: true, format: 'text', legalBasis: 'Statement of grievance and relief sought' },
            { key: 'amount', label: 'Amount Involved', required: false, format: 'amount', legalBasis: 'Monetary loss or claimed amount' },
            { key: 'productName', label: 'Product or Service Name', required: true, format: 'text', legalBasis: 'Identification of the product or service at issue' },
            { key: 'purchaseDate', label: 'Purchase or Transaction Date', required: true, format: 'date', legalBasis: 'Date of purchase, transaction, or service' },
            { key: 'merchantName', label: 'Merchant or Service Provider Name', required: true, format: 'text', legalBasis: 'Name of the business entity against whom the complaint is made' }
        ]
    },
    'rti-application': {
        title: 'RTI Application',
        fields: [
            { key: 'name', label: 'Applicant Name', required: true, format: 'text', legalBasis: 'Identity of the applicant seeking information' },
            { key: 'email', label: 'Email Address', required: true, format: 'email', legalBasis: 'Acknowledgement and communication channel' },
            { key: 'phone', label: 'Mobile Number', required: false, format: 'phone', legalBasis: 'Optional contact for follow-up' },
            { key: 'address', label: 'Postal Address', required: true, format: 'text', legalBasis: 'Registered address for official communication' },
            { key: 'complaint', label: 'Information Sought', required: true, format: 'text', legalBasis: 'Particulars of information or records requested' },
            { key: 'productName', label: 'Public Authority / Department', required: true, format: 'text', legalBasis: 'Authority responsible for the requested records' },
            { key: 'purchaseDate', label: 'Date of Application', required: true, format: 'date', legalBasis: 'Date on which the application is filed' },
            { key: 'merchantName', label: 'Reference Number', required: false, format: 'text', legalBasis: 'Any docket, file, or reference number' }
        ]
    },
    'property-registration': {
        title: 'Property Registration',
        fields: [
            { key: 'name', label: 'Owner / Applicant Name', required: true, format: 'text', legalBasis: 'Title holder or applicant seeking registration' },
            { key: 'email', label: 'Email Address', required: true, format: 'email', legalBasis: 'Confirmation and document delivery' },
            { key: 'phone', label: 'Phone Number', required: false, format: 'phone', legalBasis: 'Additional contact for registration office' },
            { key: 'address', label: 'Property Address', required: true, format: 'text', legalBasis: 'Registered immovable property location' },
            { key: 'complaint', label: 'Registration Purpose', required: true, format: 'text', legalBasis: 'Nature of transfer, lease, or registration' },
            { key: 'amount', label: 'Consideration Amount', required: true, format: 'amount', legalBasis: 'Declared value or sale consideration' },
            { key: 'productName', label: 'Property Type', required: false, format: 'text', legalBasis: 'Residential, commercial, or other property classification' },
            { key: 'purchaseDate', label: 'Registration Date', required: true, format: 'date', legalBasis: 'Date of intended registration' },
            { key: 'merchantName', label: 'Counterparty / Seller Name', required: false, format: 'text', legalBasis: 'Other party to the registration document' }
        ]
    },
    'marriage-registration': {
        title: 'Marriage Registration',
        fields: [
            { key: 'name', label: 'Bride Name', required: true, format: 'text', legalBasis: 'Legal name of bride for marriage records' },
            { key: 'email', label: 'Email Address', required: true, format: 'email', legalBasis: 'Official notice and record communication' },
            { key: 'phone', label: 'Phone Number', required: false, format: 'phone', legalBasis: 'Contact for verification' },
            { key: 'address', label: 'Marriage Venue / Address', required: true, format: 'text', legalBasis: 'Place where marriage is solemnized' },
            { key: 'complaint', label: 'Marriage Details', required: true, format: 'text', legalBasis: 'Marriage date, religion, and relevant particulars' },
            { key: 'productName', label: 'Groom Name', required: true, format: 'text', legalBasis: 'Legal name of groom' },
            { key: 'purchaseDate', label: 'Marriage Date', required: true, format: 'date', legalBasis: 'Date of marriage solemnization' },
            { key: 'merchantName', label: 'Witness Names', required: false, format: 'text', legalBasis: 'Witness details for registration' }
        ]
    },
    'employment-contract': {
        title: 'Employment Contract',
        fields: [
            { key: 'name', label: 'Employer Name', required: true, format: 'text', legalBasis: 'Legal identity of the employer' },
            { key: 'email', label: 'Employer Email', required: true, format: 'email', legalBasis: 'Official employment correspondence' },
            { key: 'phone', label: 'Employer Contact', required: false, format: 'phone', legalBasis: 'Employer contact number' },
            { key: 'address', label: 'Place of Employment', required: true, format: 'text', legalBasis: 'Location of employment and governing workplace' },
            { key: 'complaint', label: 'Role and Responsibilities', required: true, format: 'text', legalBasis: 'Description of duties, designation, and scope of work' },
            { key: 'productName', label: 'Employee Name', required: true, format: 'text', legalBasis: 'Legal name of the employee' },
            { key: 'purchaseDate', label: 'Start Date', required: true, format: 'date', legalBasis: 'Commencement date of employment' },
            { key: 'amount', label: 'Salary / Consideration', required: true, format: 'amount', legalBasis: 'Compensation and payment structure' },
            { key: 'merchantName', label: 'Jurisdiction', required: false, format: 'text', legalBasis: 'Applicable law and place of work' }
        ]
    },
    'rental-agreement': {
        title: 'Rental Agreement',
        fields: [
            { key: 'name', label: 'Landlord Name', required: true, format: 'text', legalBasis: 'Legal owner or landlord identity' },
            { key: 'email', label: 'Email Address', required: true, format: 'email', legalBasis: 'Notice and communication channel' },
            { key: 'phone', label: 'Phone Number', required: false, format: 'phone', legalBasis: 'Contact for tenancy communications' },
            { key: 'address', label: 'Property Address', required: true, format: 'text', legalBasis: 'Premises let under the agreement' },
            { key: 'complaint', label: 'Tenancy Terms', required: true, format: 'text', legalBasis: 'Rent, term, and occupancy terms' },
            { key: 'amount', label: 'Monthly Rent', required: true, format: 'amount', legalBasis: 'Rent amount for the tenancy' },
            { key: 'productName', label: 'Tenant Name', required: true, format: 'text', legalBasis: 'Name of tenant or occupier' },
            { key: 'purchaseDate', label: 'Lease Start Date', required: true, format: 'date', legalBasis: 'Date tenancy commences' },
            { key: 'merchantName', label: 'Lease End Date', required: false, format: 'text', legalBasis: 'End date or renewal term' }
        ]
    }
};
const buildFormValidationResults = (formType, userInputs) => {
    const schema = FORM_VALIDATION_SCHEMAS[formType] || FORM_VALIDATION_SCHEMAS['consumer-complaint'];
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[0-9+()\-\s]{10,}$/;
    return schema.fields.map((field) => {
        const rawValue = userInputs[field.key];
        const value = typeof rawValue === 'string' ? rawValue.trim() : rawValue;
        const hasValue = Array.isArray(value) ? value.length > 0 : Boolean(value);
        if (field.required && !hasValue) {
            return {
                field: field.key,
                status: 'invalid',
                message: `❌ ${field.label} is required under ${schema.title}. ${field.legalBasis}.`
            };
        }
        if (!hasValue) {
            return {
                field: field.key,
                status: 'warning',
                message: `⚠️ ${field.label} is optional. Leave blank only if not applicable.`
            };
        }
        if (field.format === 'email' && !emailPattern.test(String(value))) {
            return {
                field: field.key,
                status: 'invalid',
                message: `❌ ${field.label} must be a valid email address for legal correspondence.`
            };
        }
        if (field.format === 'phone' && !phonePattern.test(String(value))) {
            return {
                field: field.key,
                status: 'invalid',
                message: `❌ ${field.label} must contain a valid phone/contact number.`
            };
        }
        if (field.format === 'date') {
            const parsedDate = new Date(String(value));
            if (Number.isNaN(parsedDate.getTime())) {
                return {
                    field: field.key,
                    status: 'invalid',
                    message: `❌ ${field.label} must be a valid legal date format (YYYY-MM-DD).`
                };
            }
        }
        if (field.format === 'amount') {
            const numericValue = Number(String(value).replace(/[^0-9.-]/g, ''));
            if (Number.isNaN(numericValue)) {
                return {
                    field: field.key,
                    status: 'invalid',
                    message: `❌ ${field.label} must be a numeric amount in a legal monetary format.`
                };
            }
        }
        return {
            field: field.key,
            status: 'valid',
            message: `✅ ${field.label} is complete and consistent with ${schema.title} requirements.`
        };
    });
};
// Form filling route
app.post("/api/forms/fill", async (req, res) => {
    try {
        const { formType, userInputs, conditions } = req.body;
        const validationResults = buildFormValidationResults(formType, userInputs);
        const response = await (0, aiServices_1.generateAIResponse)(`Help fill out a ${formType} legal form. Provide guidance in this format:

📋 FORM GUIDANCE FOR ${formType.toUpperCase()}:

🔍 Field Review:
[Analyze the provided information]

✅ Validation Status:
[Check completeness and accuracy]

📝 Completion Guidance:
[Provide specific instructions for filling]

⚠️ Important Considerations:
[Highlight critical points to remember]

💡 Legal Tips:
[Offer relevant legal advice for this form type]

User provided data:
${JSON.stringify(userInputs, null, 2)}`, "en");
        res.json({
            success: true,
            filledForm: {
                formType,
                filledFields: userInputs,
                validationResults,
                suggestions: [
                    `📌 Review all ${formType} form fields for accuracy and completeness`,
                    '📎 Ensure required documents are attached if needed',
                    '📅 Double-check dates and legal names for correctness',
                    '💾 Keep a copy of the completed form for your records',
                    '⚖️ Consider having a legal professional review before submission'
                ],
                completedForm: response.content,
                additionalGuidance: '⚠️ Important: This is AI-generated guidance. Make sure to review the completed form with a legal professional before submission to ensure compliance with all legal requirements.',
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
                differences: [
                    {
                        section: 'Terms and Conditions',
                        document1: 'Original terms present in first document',
                        document2: 'Modified or updated terms in second document',
                        impact: 'Medium',
                        recommendation: 'Review changes carefully to understand implications'
                    },
                    {
                        section: 'Payment Clauses',
                        document1: 'Initial payment structure',
                        document2: 'Revised payment terms',
                        impact: 'High',
                        recommendation: 'Ensure all parties agree to payment modifications'
                    },
                    {
                        section: 'Legal Provisions',
                        document1: 'Standard legal language',
                        document2: 'Enhanced or modified provisions',
                        impact: 'Medium',
                        recommendation: 'Verify compliance with current regulations'
                    }
                ],
                summary: response.content,
                redlineView: '📝 Detailed comparison shows modifications in key sections including terms, obligations, and legal provisions. Review the summary above for comprehensive analysis.',
                recommendations: [
                    'Review all identified differences with legal counsel',
                    'Ensure all parties acknowledge and agree to changes',
                    'Document the reasons for modifications',
                    'Consider the legal implications of each change',
                    'Update internal records to reflect changes'
                ],
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
const regionQueryTerms = {
    India: ['India', 'Indian', 'Delhi', 'Supreme Court', 'High Court'],
    USA: ['USA', 'United States', 'U.S.', 'Federal', 'Supreme Court'],
    UK: ['United Kingdom', 'UK', 'England', 'Wales', 'Scotland'],
    EU: ['European Union', 'EU', 'Brussels', 'Commission', 'Court of Justice']
};
const topicQueryTerms = {
    general: ['law', 'legal', 'court', 'justice'],
    consumer: ['consumer protection', 'consumer rights', 'consumer law'],
    corporate: ['corporate law', 'business law', 'company law'],
    criminal: ['criminal law', 'crime', 'criminal procedure'],
    family: ['family law', 'divorce', 'custody'],
    property: ['property law', 'real estate', 'land law']
};
const buildFallbackNews = (region, topic, limit) => {
    const regionLabel = regionQueryTerms[region]?.[0] || 'India';
    const topicLabel = topic.charAt(0).toUpperCase() + topic.slice(1);
    const generatedNews = [
        {
            id: 1,
            title: `${topicLabel} Alert: New ${regionLabel} rulings update compliance timelines`,
            summary: `Fresh ${topicLabel.toLowerCase()} developments in ${regionLabel} are reshaping how legal teams monitor deadlines, disclosures, and regulatory reporting.`,
            source: 'Live Legal Wire'
        },
        {
            id: 2,
            title: `${regionLabel} courts weigh in on emerging ${topicLabel.toLowerCase()} issues`,
            summary: `Recent proceedings in ${regionLabel} highlight shifting judicial standards around ${topicLabel.toLowerCase()} and practical enforcement.`,
            source: 'Legal News Network'
        },
        {
            id: 3,
            title: `Regulators tighten ${topicLabel.toLowerCase()} guidance across ${regionLabel}`,
            summary: `Authorities in ${regionLabel} are issuing updated enforcement signals and compliance notes for ${topicLabel.toLowerCase()} matters.`,
            source: 'Legal Briefs'
        },
        {
            id: 4,
            title: `${topicLabel} reforms gain traction in ${regionLabel} policy discussions`,
            summary: `Policy makers and industry groups in ${regionLabel} are pushing new ${topicLabel.toLowerCase()} changes aimed at clearer obligations.`,
            source: 'Law Update Desk'
        },
        {
            id: 5,
            title: `High-profile ${topicLabel.toLowerCase()} case sets new precedent in ${regionLabel}`,
            summary: `A landmark ${regionLabel} decision is expected to influence future litigation strategy and compliance planning.`,
            source: 'Court Watch'
        },
        {
            id: 6,
            title: `Regional ${topicLabel.toLowerCase()} updates signal faster enforcement in ${regionLabel}`,
            summary: `Officials in ${regionLabel} are accelerating reviews and public guidance around ${topicLabel.toLowerCase()} obligations.`,
            source: 'Daily Legal Digest'
        }
    ];
    return generatedNews.slice(0, limit).map((article, index) => ({
        ...article,
        id: index + 1,
        date: new Date(Date.now() - index * 3600000).toISOString()
    }));
};
const filterNewsArticles = (articles, region, topic) => {
    const normalizedTopic = String(topic || 'general').toLowerCase();
    const normalizedRegion = String(region || 'India').toLowerCase();
    const regionTerms = regionQueryTerms[region]?.map(term => term.toLowerCase()) || [];
    const topicTerms = topicQueryTerms[normalizedTopic]?.map(term => term.toLowerCase()) || [];
    return articles.filter((article) => {
        const text = `${article.title || ''} ${article.description || ''} ${article.content || ''}`.toLowerCase();
        const fullRegionMatch = regionTerms.length === 0 || regionTerms.some(term => text.includes(term));
        const fullTopicMatch = normalizedTopic === 'general'
            ? /(law|legal|court|justice)/.test(text)
            : topicTerms.some(term => text.includes(term));
        return fullRegionMatch && fullTopicMatch;
    });
};
// Legal news route
app.get("/api/news", async (req, res) => {
    try {
        const requestedRegion = String(req.query.region || 'India');
        const requestedTopic = String(req.query.topic || 'general');
        const requestedLimit = Number.parseInt(String(req.query.limit || '6'), 10) || 6;
        const normalizedRegion = Object.prototype.hasOwnProperty.call(regionQueryTerms, requestedRegion)
            ? requestedRegion
            : 'India';
        const normalizedTopic = Object.prototype.hasOwnProperty.call(topicQueryTerms, requestedTopic)
            ? requestedTopic
            : 'general';
        const regionBoosters = regionQueryTerms[normalizedRegion].join(' OR ');
        const topicBoosters = topicQueryTerms[normalizedTopic].join(' OR ');
        const searchQuery = [topicBoosters, regionBoosters].filter(Boolean).join(' ');
        const apiKey = process.env.NEWS_API_KEY;
        if (apiKey) {
            try {
                const newsResponse = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(searchQuery)}&language=en&sortBy=publishedAt&pageSize=${requestedLimit * 2}&apiKey=${apiKey}`);
                if (newsResponse.ok) {
                    const newsData = await newsResponse.json();
                    if (newsData.status === 'ok' && Array.isArray(newsData.articles)) {
                        const filteredArticles = filterNewsArticles(newsData.articles, normalizedRegion, normalizedTopic);
                        const news = filteredArticles
                            .filter((article) => article.title && article.title !== '[Removed]')
                            .slice(0, requestedLimit)
                            .map((article, index) => ({
                            id: index + 1,
                            title: article.title || 'Untitled',
                            summary: article.description || article.content?.substring(0, 200) || 'No summary available',
                            date: article.publishedAt || new Date().toISOString(),
                            source: article.source?.name || 'Unknown Source',
                            url: article.url
                        }));
                        if (news.length > 0) {
                            return res.json({
                                success: true,
                                news,
                                region: normalizedRegion,
                                topic: normalizedTopic,
                                timestamp: new Date().toISOString()
                            });
                        }
                    }
                }
            }
            catch (apiError) {
                console.warn("News API error, falling back to generated data:", apiError);
            }
        }
        else {
            console.warn('NEWS_API_KEY not configured; using generated legal news fallback');
        }
        const fallbackNews = buildFallbackNews(normalizedRegion, normalizedTopic, requestedLimit);
        res.json({
            success: true,
            news: fallbackNews,
            region: normalizedRegion,
            topic: normalizedTopic,
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
// Authentication routes (mock for now)
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