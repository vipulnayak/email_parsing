const pdfParse = require('pdf-parse');
const pdf2pic = require('pdf2pic');
const fs = require('fs').promises;
const path = require('path');

async function parseInvoicePDF(pdfPath) {
  try {
    const dataBuffer = await fs.readFile(pdfPath);
    const data = await pdfParse(dataBuffer);

    // Extract text content
    const text = data.text;
    
    // Parse invoice details using regex or other text processing methods
    const parsedData = {
      items: extractItems(text),
      totalAmount: extractTotalAmount(text),
      clientInfo: extractClientInfo(text),
      invoiceDate: extractDate(text, 'invoice'),
      dueDate: extractDate(text, 'due')
    };

    return parsedData;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}

async function generatePDFPreview(pdfPath) {
  try {
    const outputDir = path.join(__dirname, '../uploads/previews');
    await fs.mkdir(outputDir, { recursive: true });

    const baseFilename = path.basename(pdfPath, '.pdf');
    const outputPath = path.join(outputDir, `${baseFilename}_preview.png`);

    const options = {
      density: 100,
      saveFilename: baseFilename,
      savePath: outputDir,
      format: "png",
      width: 600
    };

    const convert = pdf2pic.fromPath(pdfPath, options);
    await convert(1); // Convert first page only

    return outputPath;
  } catch (error) {
    console.error('Preview generation error:', error);
    throw new Error(`Failed to generate preview: ${error.message}`);
  }
}

// Helper functions for text extraction
function extractItems(text) {
  // Implement item extraction logic
  // Return array of items with their details
}

function extractTotalAmount(text) {
  // Implement total amount extraction logic
}

function extractClientInfo(text) {
  // Implement client info extraction logic
}

function extractDate(text, type) {
  // Implement date extraction logic
}

module.exports = {
  parseInvoicePDF,
  generatePDFPreview
}; 