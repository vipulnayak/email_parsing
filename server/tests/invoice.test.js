const InvoiceDetectionService = require('../services/invoiceDetectionService');
const OCRService = require('../services/ocrService');
const path = require('path');

describe('Invoice Detection Tests', () => {
  test('should detect invoice keywords', async () => {
    const text = 'INVOICE\nInvoice Number: INV-001\nAmount Due: $500.00';
    const result = await InvoiceDetectionService.detectInvoice(text);
    expect(result).toBe(true);
  });

  test('should extract invoice details', () => {
    const text = `
      Invoice Number: INV-2024-001
      Date: 02/15/2024
      Amount Due: $1,234.56
    `;
    const details = InvoiceDetectionService.extractInvoiceDetails(text);
    expect(details.invoiceNumber).toBe('INV-2024-001');
    expect(details.amount).toBe('$1,234.56');
    expect(details.date).toBe('02/15/2024');
  });
});

describe('OCR Service Tests', () => {
  test('should process PDF file', async () => {
    const pdfPath = path.join(__dirname, 'fixtures/sample-invoice.pdf');
    const text = await OCRService.processPDF(pdfPath);
    expect(text).toContain('Invoice');
  });

  test('should process image file', async () => {
    const imagePath = path.join(__dirname, 'fixtures/sample-invoice.png');
    const text = await OCRService.processImage(imagePath);
    expect(text).toBeTruthy();
  });
});

describe('Invoice Structure Analysis', () => {
  test('should extract header information', () => {
    const text = `
      INVOICE
      From: ABC Company
      Bill To: XYZ Corp
      Date: 01/15/2024
    `;
    const header = InvoiceDetectionService.extractHeader(text);
    expect(header.businessInfo).toBe('ABC Company');
    expect(header.customerInfo).toBe('XYZ Corp');
    expect(header.dates).toBe('01/15/2024');
  });

  test('should extract line items', () => {
    const text = `
      1 Web Development 40 $100.00 $4000.00
      2 Design Services 20 $80.00 $1600.00
    `;
    const items = InvoiceDetectionService.extractLineItems(text);
    expect(items).toHaveLength(2);
    expect(items[0].total).toBe(4000.00);
  });

  test('should calculate confidence score', () => {
    const sections = {
      header: { businessInfo: 'ABC Corp' },
      items: [{ description: 'Service', total: 100 }],
      totals: { total: 100 },
      footer: {}
    };
    const confidence = InvoiceDetectionService.calculateConfidence(sections);
    expect(confidence).toBeGreaterThan(0.7);
  });
}); 