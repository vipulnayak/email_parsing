const EmailService = require('../services/emailService');
const config = require('../config/email').email;

// Simple hardcoded sample email with invoice
const sampleInvoiceEmail = {
  from: 'accounts@samplecompany.com',
  subject: 'Invoice for Website Development Project',
  body: `
Dear Client,

Please find below the invoice for the website development project.

==========================================
                INVOICE
==========================================
Invoice #: INV-2024-001
Date: March 1, 2024

From:
Sample Web Development
123 Business Road
Tech City, TC 12345

To:
Client Company Ltd.
456 Client Street
Business Park, BP 67890

------------------------------------------
SERVICES
------------------------------------------
1. Website Development     $3,000
2. UI/UX Design           $1,500
3. Mobile Optimization    $500

------------------------------------------
Subtotal:    $5,000
Tax (10%):   $500
Total:       $5,500
------------------------------------------

Payment Due: March 15, 2024

Please process this payment at your earliest convenience.

Best regards,
Sample Web Development Team
`,
  attachments: [],
  isInvoice: true,
  invoiceDetails: {
    invoiceNumber: 'INV-2024-001',
    date: '2024-03-01',
    dueDate: '2024-03-15',
    amount: '$5,500',
    vendor: 'Sample Web Development'
  }
};

async function sendTestInvoice() {
  try {
    const emailService = new EmailService(config);
    const savedEmail = await emailService.processAndSaveTestEmail(sampleInvoiceEmail);
    console.log('Test invoice email processed successfully:', savedEmail._id);
    return savedEmail;
  } catch (error) {
    console.error('Error sending test invoice:', error);
    throw error;
  }
}

module.exports = { sendTestInvoice }; 