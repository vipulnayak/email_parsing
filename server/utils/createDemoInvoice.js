const PDFDocument = require('pdfkit');
const fs = require('fs-extra');
const path = require('path');

async function createDemoInvoice() {
  let doc = null;
  let writeStream = null;

  try {
    const uploadsDir = path.join(__dirname, '../uploads');
    await fs.ensureDir(uploadsDir);
    
    const outputPath = path.join(uploadsDir, `demo-invoice-${Date.now()}.pdf`);
    doc = new PDFDocument();
    
    // Create write stream
    writeStream = fs.createWriteStream(outputPath);
    
    // Handle write stream errors
    writeStream.on('error', (error) => {
      console.error('Write stream error:', error);
      throw error;
    });

    doc.pipe(writeStream);

    // Add content to PDF
    doc
      .fontSize(20)
      .text('INVOICE', { align: 'center' })
      .moveDown();

    doc
      .fontSize(12)
      .text('Invoice Number: INV-2024-002')
      .text('Date: 15/02/2024')
      .moveDown();

    doc
      .text('From:')
      .text('Demo Company Ltd.')
      .text('123 Business Street')
      .text('Business City, BC 12345')
      .moveDown();

    doc
      .text('To:')
      .text('Client Name')
      .text('456 Client Avenue')
      .text('Client City, CC 67890')
      .moveDown();

    // Add table header
    doc
      .text('Description', 50, 300)
      .text('Quantity', 200, 300)
      .text('Unit Price', 300, 300)
      .text('Amount', 400, 300)
      .moveDown();

    // Add items
    let y = 330;
    const items = [
      ['Web Development', '1', '$3,000.00', '$3,000.00'],
      ['UI/UX Design', '1', '$2,000.00', '$2,000.00'],
      ['Server Setup', '1', '$1,000.00', '$1,000.00']
    ];

    items.forEach(item => {
      doc
        .text(item[0], 50, y)
        .text(item[1], 200, y)
        .text(item[2], 300, y)
        .text(item[3], 400, y);
      y += 30;
    });

    // Add totals
    doc
      .moveDown(6)
      .text('Subtotal: $6,000.00', { align: 'right' })
      .text('Tax (10%): $600.00', { align: 'right' })
      .text('Total Amount Due: $6,600.00', { align: 'right' })
      .moveDown()
      .text('Due Date: 15/03/2024', { align: 'right' });

    // Return a promise that resolves when the PDF is written
    return new Promise((resolve, reject) => {
      writeStream.on('finish', () => {
        console.log('Demo invoice created at:', outputPath);
        resolve(outputPath);
      });
      writeStream.on('error', reject);
      doc.end();
    });
  } catch (error) {
    console.error('Error creating demo invoice:', error);
    if (doc) doc.end();
    if (writeStream) writeStream.end();
    throw error;
  }
}

module.exports = { createDemoInvoice }; 