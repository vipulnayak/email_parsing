const fs = require('fs-extra');
const path = require('path');
const pdfParse = require('pdf-parse');
const { processAttachment } = require('./ocrService');
const { detectInvoice } = require('./invoiceDetectionService');

class PDFHandler {
  async processPDFInvoice(filePath) {
    try {
      console.log('Starting PDF processing:', filePath);
      
      // Ensure file exists
      if (!await fs.pathExists(filePath)) {
        throw new Error('PDF file not found');
      }

      // Read PDF file
      const dataBuffer = await fs.readFile(filePath);
      console.log('PDF file read successfully');
      
      // Parse PDF
      const pdfData = await pdfParse(dataBuffer);
      console.log('PDF parsed successfully');
      
      // Extract text
      const text = pdfData.text;
      
      if (!text) {
        throw new Error('No text could be extracted from the PDF');
      }

      console.log('Text extracted successfully');
      
      // Detect if it's an invoice
      const isInvoice = await detectInvoice(text);
      console.log('Invoice detection result:', isInvoice);
      
      if (isInvoice) {
        // Extract invoice details
        const invoiceDetails = await this.extractInvoiceDetails(text);
        return {
          isInvoice: true,
          text,
          details: invoiceDetails
        };
      }
      
      return {
        isInvoice: false,
        text,
        details: null
      };
    } catch (error) {
      console.error('Error processing PDF:', error);
      throw new Error(`PDF processing failed: ${error.message}`);
    }
  }

  async extractInvoiceDetails(text) {
    try {
      const patterns = {
        invoiceNumber: /(?:invoice|bill|receipt)(?:\s+(?:no|number|#):?\s*)([A-Z0-9-]+)/i,
        date: /(?:date|dated|issued):?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
        amount: /(?:total|amount|sum):?\s*[$€£¥]?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
        dueDate: /(?:due|payment)\s+date:?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i,
        vendor: /(?:from|vendor|supplier|company):?\s*([A-Za-z0-9\s.,&]+(?:\n|$))/i
      };

      const details = {};
      
      for (const [key, pattern] of Object.entries(patterns)) {
        const match = text.match(pattern);
        if (match) {
          details[key] = match[1].trim();
        }
      }

      return details;
    } catch (error) {
      console.error('Error extracting invoice details:', error);
      return {};
    }
  }
}

module.exports = new PDFHandler(); 