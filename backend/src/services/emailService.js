const Imap = require('imap');
const simpleParser = require('mailparser').simpleParser;
const pdfParse = require('pdf-parse');
const Email = require('../models/email');

class EmailService {
  constructor() {
    this.imap = new Imap({
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASSWORD,
      host: process.env.EMAIL_HOST,
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false }
    });
  }

  async fetchEmails() {
    return new Promise((resolve, reject) => {
      this.imap.once('ready', () => {
        console.log('IMAP connection established');
        this.imap.openBox('INBOX', false, (err, box) => {
          if (err) {
            console.error('Error opening mailbox:', err);
            reject(err);
            return;
          }
          
          console.log('Mailbox opened successfully');
          
          const fetchStream = this.imap.seq.fetch('1:*', {
            bodies: ['HEADER', 'TEXT'],
            struct: true
          });

          fetchStream.on('message', (msg) => {
            msg.on('body', (stream, info) => {
              simpleParser(stream, async (err, parsed) => {
                if (err) {
                  console.error('Error parsing email:', err);
                  return;
                }

                try {
                  const email = new Email({
                    subject: parsed.subject,
                    sender: parsed.from ? parsed.from.text : 'Unknown',
                    body: parsed.text || parsed.html || 'No content',
                    receivedDate: parsed.date,
                  });

                  if (parsed.attachments && parsed.attachments.length > 0) {
                    for (const attachment of parsed.attachments) {
                      if (attachment.contentType === 'application/pdf') {
                        const pdfText = await this.extractTextFromPDF(attachment.content);
                        email.ocrText = pdfText;
                        email.isInvoice = await this.detectInvoice(pdfText);
                      }
                      email.attachments.push({
                        filename: attachment.filename,
                        content: attachment.content,
                        contentType: attachment.contentType,
                      });
                    }
                  }

                  await email.save();
                  console.log('Email saved:', email.subject);
                } catch (error) {
                  console.error('Error processing email:', error);
                }
              });
            });
          });

          fetchStream.once('error', (err) => {
            console.error('Fetch error:', err);
            reject(err);
          });

          fetchStream.once('end', () => {
            console.log('Done fetching all messages');
            this.imap.end();
            resolve();
          });
        });
      });

      this.imap.once('error', (err) => {
        console.error('IMAP connection error:', err);
        reject(err);
      });

      this.imap.once('end', () => {
        console.log('IMAP connection ended');
      });

      console.log('Attempting to connect to IMAP server');
      this.imap.connect();
    });
  }

  async extractTextFromPDF(pdfBuffer) {
    try {
      const data = await pdfParse(pdfBuffer);
      return data.text;
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      return '';
    }
  }

  async detectInvoice(text) {
    const keywords = ['invoice', 'amount due', 'payment', 'bill'];
    const lowercaseText = text.toLowerCase();
    return keywords.some(keyword => lowercaseText.includes(keyword));
  }
}

module.exports = new EmailService();