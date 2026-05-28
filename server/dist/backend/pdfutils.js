"use strict";
// server/backend/pdfUtils.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPdfText = extractPdfText;
async function extractPdfText(base64Content) {
    try {
        // Dynamic import for pdf-parse
        const pdfParse = require('pdf-parse');
        // Convert base64 to buffer
        const pdfBuffer = Buffer.from(base64Content, 'base64');
        console.log(`📄 PDF Buffer created: ${pdfBuffer.length} bytes`);
        // Parse PDF correctly by calling the pdf-parse function directly
        const data = await pdfParse(pdfBuffer);
        console.log(`✅ PDF parsed: ${data.numpages || 1} pages, ${data.text.length} characters`);
        return data.text;
    }
    catch (error) {
        console.error('❌ PDF parsing error:', error);
        throw new Error(`Failed to parse PDF: ${error.message}`);
    }
}
//# sourceMappingURL=pdfutils.js.map