const Imap = require('imap');
const { simpleParser } = require('mailparser');
const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const Email = require('../models/Email');

class EmailService {
  constructor() {
    this.imap = new Imap({
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASSWORD,
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      tlsOptions: { 
        rejectUnauthorized: false,
        servername: 'imap.gmail.com'
      }
    });
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.imap.once('ready', () => {
        console.log('Connected to Gmail');
        resolve();
      });

      this.imap.once('error', (err) => {
        console.error('IMAP connection error:', err);
        reject(err);
      });

      this.imap.connect();
    });
  }

  async processAttachment(attachment, messageId) {
    try {
      const uploadsDir = path.join(__dirname, '../uploads');
      await fs.mkdir(uploadsDir, { recursive: true });

      const safeFilename = `${messageId}-${attachment.filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = path.join(uploadsDir, safeFilename);
      await fs.writeFile(filePath, attachment.content);

      let isInvoice = false;
      let invoiceDetails = null;

      // Check filename for invoice-related terms
      isInvoice = /invoice|bill|payment|receipt/i.test(attachment.filename);

      // If it's a PDF, try to extract text and check for invoice content
      if (attachment.contentType === 'application/pdf') {
        try {
          const dataBuffer = await fs.readFile(filePath);
          const pdfData = await pdfParse(dataBuffer);
          const pdfText = pdfData.text.toLowerCase();
          
          // Check PDF content for invoice-related terms
          if (/invoice|bill|payment|amount|due|total/i.test(pdfText)) {
            isInvoice = true;
            
            // Try to extract amount and date
            const amountMatch = pdfText.match(/[\$£€]\s*[\d,]+\.?\d*/);
            const dateMatch = pdfText.match(/\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/);
            
            invoiceDetails = {
              amount: amountMatch ? amountMatch[0] : null,
              dueDate: dateMatch ? dateMatch[0] : null
            };
          }
        } catch (pdfError) {
          console.error('Error processing PDF:', pdfError);
        }
      }
      
      return {
        filename: attachment.filename,
        path: filePath,
        mimeType: attachment.contentType,
        isInvoice,
        invoiceDetails
      };
    } catch (error) {
      console.error('Error processing attachment:', error);
      return null;
    }
  }

  async fetchEmails() {
    try {
      await this.connect();
      
      await new Promise((resolve, reject) => {
        this.imap.openBox('INBOX', false, (err, box) => {
          if (err) reject(err);
          else resolve(box);
        });
      });

      const results = await new Promise((resolve, reject) => {
        this.imap.search(['ALL'], (err, results) => {
          if (err) reject(err);
          else resolve(results.slice(-10));
        });
      });

      console.log(`Processing ${results.length} emails`);

      for (const messageId of results) {
        try {
          const rawEmail = await this.fetchSingleEmail(messageId);
          const email = await simpleParser(rawEmail);

          // Process attachments and check for invoices
          const attachments = [];
          let hasInvoiceInAttachments = false;
          if (email.attachments && email.attachments.length > 0) {
            for (const attachment of email.attachments) {
              const processedAttachment = await this.processAttachment(attachment, messageId);
              if (processedAttachment) {
                attachments.push(processedAttachment);
                if (processedAttachment.isInvoice) {
                  hasInvoiceInAttachments = true;
                }
              }
            }
          }

          // Check email body for invoice-related content
          const bodyText = email.text || email.html || '';
          const hasInvoiceInBody = /invoice|bill|payment|amount|due|total/i.test(bodyText);

          // Extract potential invoice details from body
          let bodyInvoiceDetails = null;
          if (hasInvoiceInBody) {
            const amountMatch = bodyText.match(/[\$£€]\s*[\d,]+\.?\d*/);
            const dateMatch = bodyText.match(/\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/);
            
            if (amountMatch || dateMatch) {
              bodyInvoiceDetails = {
                amount: amountMatch ? amountMatch[0] : null,
                dueDate: dateMatch ? dateMatch[0] : null
              };
            }
          }

          const emailData = {
            messageId: email.messageId,
            subject: email.subject || 'No Subject',
            sender: email.from?.text || 'Unknown Sender',
            recipient: email.to?.text || '',
            body: bodyText,
            receivedDate: email.date || new Date(),
            attachments,
            hasInvoice: hasInvoiceInBody || hasInvoiceInAttachments,
            invoiceDetails: bodyInvoiceDetails || attachments.find(att => att.isInvoice)?.invoiceDetails || null,
            invoiceSource: hasInvoiceInBody ? 'body' : (hasInvoiceInAttachments ? 'attachment' : null)
          };

          const existingEmail = await Email.findOne({ messageId: email.messageId });
          if (!existingEmail) {
            await Email.create(emailData);
            console.log(`Saved email: ${emailData.subject} (Invoice: ${emailData.hasInvoice ? 'Yes' : 'No'})`);
          }
        } catch (error) {
          console.error(`Error processing email ${messageId}:`, error);
        }
      }

      this.imap.end();
      return true;
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  }

  async fetchSingleEmail(messageId) {
    return new Promise((resolve, reject) => {
      const fetch = this.imap.fetch(messageId, { bodies: '' });
      let buffer = '';

      fetch.on('message', (msg) => {
        msg.on('body', (stream) => {
          stream.on('data', (chunk) => {
            buffer += chunk.toString('utf8');
          });
        });
      });

      fetch.once('error', reject);
      fetch.once('end', () => resolve(buffer));
    });
  }
}

module.exports = EmailService; 