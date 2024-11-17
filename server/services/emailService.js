const Imap = require('imap');
const { simpleParser } = require('mailparser');
const fs = require('fs').promises;
const path = require('path');
const PDFParser = require('pdf2json');
const Email = require('../models/Email');
const nodemailer = require('nodemailer');

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

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
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

      if (attachment.contentType === 'application/pdf') {
        try {
          const pdfParser = new PDFParser();
          
          const pdfText = await new Promise((resolve, reject) => {
            pdfParser.on('pdfParser_dataReady', (pdfData) => {
              const text = pdfParser.getRawTextContent().toLowerCase();
              resolve(text);
            });
            
            pdfParser.on('pdfParser_dataError', reject);
            pdfParser.loadPDF(filePath);
          });

          // Enhanced invoice detection
          const invoiceKeywords = [
            'invoice', 'bill', 'payment', 'amount due', 'total',
            'invoice number', 'invoice date', 'due date'
          ];

          const hasInvoiceKeywords = invoiceKeywords.some(keyword => 
            pdfText.includes(keyword)
          );

          if (hasInvoiceKeywords) {
            isInvoice = true;
            
            // Enhanced extraction patterns
            const amountPattern = /(?:total|amount|due|balance).*?[\$£€]?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i;
            const datePattern = /(?:due|date).*?(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})/i;
            const invoiceNumberPattern = /(?:invoice|bill|ref).*?(?:#|no|number)?[:\s]*([A-Z0-9-]{4,})/i;

            const amountMatch = pdfText.match(amountPattern);
            const dateMatch = pdfText.match(datePattern);
            const invoiceNumberMatch = pdfText.match(invoiceNumberPattern);
            
            invoiceDetails = {
              amount: amountMatch ? amountMatch[1] : null,
              dueDate: dateMatch ? dateMatch[1] : null,
              invoiceNumber: invoiceNumberMatch ? invoiceNumberMatch[1] : null
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

            if (emailData.hasInvoice) {
              await this.transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: process.env.ADMIN_EMAIL,
                subject: 'New Invoice Detected',
                html: `
                  <h2>New Invoice Found</h2>
                  <p>Email: ${emailData.subject}</p>
                  <p>From: ${emailData.sender}</p>
                  <p>Amount: ${emailData.invoiceDetails?.amount || 'Not specified'}</p>
                  <p>Due Date: ${emailData.invoiceDetails?.dueDate || 'Not specified'}</p>
                `
              });
            }
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