const tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');
const fs = require('fs').promises;
const path = require('path');

class OCRService {
  async processAttachment(filePath) {
    try {
      const fileExt = path.extname(filePath).toLowerCase();
      
      if (fileExt === '.pdf') {
        const text = await this.processPDF(filePath);
        const images = await this.extractImagesFromPDF(filePath);
        let combinedText = text;

        // Process any images found in the PDF
        for (const image of images) {
          const imageText = await this.processImage(image);
          combinedText += '\n' + imageText;
        }

        return combinedText;
      } else if (['.png', '.jpg', '.jpeg', '.tiff'].includes(fileExt)) {
        return await this.processImage(filePath);
      }
      
      throw new Error('Unsupported file type');
    } catch (error) {
      console.error('OCR processing error:', error);
      throw error;
    }
  }

  async processPDF(filePath) {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  }

  async processImage(imagePath) {
    const { data: { text } } = await tesseract.recognize(
      imagePath,
      'eng',
      { logger: m => console.log(m) }
    );
    return text;
  }

  async extractImagesFromPDF(pdfPath) {
    // Implementation needed for PDF image extraction
    return [];
  }
}

module.exports = new OCRService(); 