const pdfjs = require('pdfjs-dist');
const tesseract = require('node-tesseract-ocr');
const { Configuration, OpenAIApi } = require('openai');

class PDFDetectionService {
    constructor() {
        // Configure supported document types and their patterns
        this.documentPatterns = {
            invoice: {
                keywords: ['invoice', 'bill to', 'payment due', 'invoice number'],
                dataPoints: {
                    invoiceNumber: /Invoice\s*#?\s*:?\s*([A-Z0-9-]+)/i,
                    date: /Date\s*:?\s*(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})/i,
                    amount: /(?:Total|Amount)\s*:?\s*[$€£]?\s*([\d,]+\.?\d{0,2})/i
                }
            },
            receipt: {
                keywords: ['receipt', 'thank you', 'total', 'paid'],
                dataPoints: {
                    receiptNumber: /Receipt\s*#?\s*:?\s*([A-Z0-9-]+)/i,
                    date: /Date\s*:?\s*(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})/i,
                    total: /Total\s*:?\s*[$€£]?\s*([\d,]+\.?\d{0,2})/i
                }
            }
        };

        // Initialize OpenAI for advanced text analysis
        this.openai = new OpenAIApi(new Configuration({
            apiKey: process.env.OPENAI_API_KEY
        }));
    }

    async processDocument(buffer, fileName) {
        try {
            // 1. Extract text using multiple methods
            const extractedData = await this.extractAllText(buffer);
            
            // 2. Determine document type and confidence
            const classification = await this.classifyDocument(extractedData);
            
            // 3. Extract relevant information based on document type
            const processedData = await this.extractInformation(
                extractedData, 
                classification.documentType
            );

            return {
                documentType: classification.documentType,
                confidence: classification.confidence,
                extractedData: processedData,
                metadata: {
                    fileName,
                    processedAt: new Date(),
                    textQuality: extractedData.textQuality
                }
            };
        } catch (error) {
            console.error('Document processing failed:', error);
            throw new Error(`Document processing failed: ${error.message}`);
        }
    }

    async extractAllText(buffer) {
        const results = {
            pdfText: '',
            ocrText: '',
            textQuality: 'unknown'
        };

        try {
            // Try PDF.js first
            results.pdfText = await this.extractPDFText(buffer);
            
            // If PDF text is too short, try OCR
            if (results.pdfText.length < 100) {
                results.ocrText = await this.performOCR(buffer);
                results.textQuality = 'ocr';
            } else {
                results.textQuality = 'native';
            }

            return results;
        } catch (error) {
            // Fallback to OCR if PDF extraction fails
            results.ocrText = await this.performOCR(buffer);
            results.textQuality = 'ocr-fallback';
            return results;
        }
    }

    async extractPDFText(buffer) {
        const loadingTask = pdfjs.getDocument(buffer);
        const pdf = await loadingTask.promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            fullText += content.items.map(item => item.str).join(' ');
        }

        return fullText;
    }

    async performOCR(buffer) {
        const config = {
            lang: 'eng',
            oem: 1,
            psm: 3,
        };

        return await tesseract.recognize(buffer, config);
    }

    async classifyDocument(extractedData) {
        const combinedText = (extractedData.pdfText + ' ' + extractedData.ocrText).toLowerCase();
        
        // First try pattern matching
        for (const [docType, patterns] of Object.entries(this.documentPatterns)) {
            const matchCount = patterns.keywords.filter(keyword => 
                combinedText.includes(keyword.toLowerCase())
            ).length;
            
            const confidence = matchCount / patterns.keywords.length;
            if (confidence > 0.7) {
                return { documentType: docType, confidence };
            }
        }

        // Fallback to AI classification if pattern matching is inconclusive
        return this.aiClassification(combinedText);
    }

    async extractInformation(extractedData, documentType) {
        const combinedText = extractedData.pdfText + ' ' + extractedData.ocrText;
        const patterns = this.documentPatterns[documentType]?.dataPoints || {};
        const extractedInfo = {};

        // Extract information using regex patterns
        for (const [field, pattern] of Object.entries(patterns)) {
            const match = combinedText.match(pattern);
            if (match) {
                extractedInfo[field] = match[1];
            }
        }

        // Use AI to extract any missing required fields
        if (Object.keys(extractedInfo).length < Object.keys(patterns).length) {
            const aiExtracted = await this.aiExtraction(combinedText, documentType);
            return { ...extractedInfo, ...aiExtracted };
        }

        return extractedInfo;
    }

    async aiClassification(text) {
        try {
            const completion = await this.openai.createCompletion({
                model: "text-davinci-003",
                prompt: `Classify this document as either invoice, receipt, or other:\n\n${text.substring(0, 1000)}`,
                max_tokens: 50,
                temperature: 0.3
            });

            return {
                documentType: completion.data.choices[0].text.trim().toLowerCase(),
                confidence: 0.85
            };
        } catch (error) {
            console.error('AI classification failed:', error);
            return { documentType: 'unknown', confidence: 0 };
        }
    }

    async aiExtraction(text, documentType) {
        try {
            const completion = await this.openai.createCompletion({
                model: "text-davinci-003",
                prompt: `Extract the following information from this ${documentType}:\n${text.substring(0, 1000)}`,
                max_tokens: 200,
                temperature: 0.3
            });

            return JSON.parse(completion.data.choices[0].text);
        } catch (error) {
            console.error('AI extraction failed:', error);
            return {};
        }
    }
}

module.exports = new PDFDetectionService(); 