// server/backend/pdfUtils.ts

export async function extractPdfText(base64Content: string): Promise<string> {
    try {
      // Dynamic import for pdf-parse
      const pdfParseModule = require('pdf-parse');
      const PDFParse = pdfParseModule.PDFParse;
      
      // Convert base64 to buffer and then to Uint8Array
      const pdfBuffer = Buffer.from(base64Content, 'base64');
      const uint8Array = new Uint8Array(pdfBuffer.buffer, pdfBuffer.byteOffset, pdfBuffer.length);
      
      console.log(`📄 PDF Buffer created: ${pdfBuffer.length} bytes`);
      
      // Parse PDF correctly using class instantiation + load() + getText()
      const pdfData = new PDFParse(uint8Array);
      await pdfData.load();
      const parsedResult = await pdfData.getText();
      
      console.log(`✅ PDF parsed: ${parsedResult.total || 1} pages, ${parsedResult.text.length} characters`);
      
      return parsedResult.text;
    } catch (error: any) {
      console.error('❌ PDF parsing error:', error);
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
  }