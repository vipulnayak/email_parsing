const Imap = require('imap');
const { simpleParser } = require('mailparser');
const fs = require('fs').promises;
const path = require('path');
const Email = require('../models/Email');

class EmailService {
  constructor() {
    this.imap = new Imap({
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASSWORD,
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      tls: true,
      tlsOptions: { 
        rejectUnauthorized: false,
        servername: 'imap.gmail.com'
      },
      keepalive: true,
      debug: console.log
    });

    this.imap.on('error', (err) => {
      console.error('IMAP error:', err);
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

  async fetchEmails() {
    try {
      await this.connect();
      
      await new Promise((resolve, reject) => {
        this.imap.openBox('INBOX', false, (err, box) => {
          if (err) {
            console.error('Error opening inbox:', err);
            reject(err);
          } else {
            console.log('Inbox opened successfully, messages:', box.messages.total);
            resolve(box);
          }
        });
      });

      const results = await new Promise((resolve, reject) => {
        const searchCriteria = [
          'ALL',
          ['SINCE', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)]
        ];
        
        this.imap.search(searchCriteria, (err, results) => {
          if (err) {
            console.error('Error searching emails:', err);
            reject(err);
          } else {
            console.log(`Found ${results.length} emails`);
            resolve(results);
          }
        });
      });

      const batchSize = 10;
      for (let i = 0; i < results.length; i += batchSize) {
        const batch = results.slice(i, i + batchSize);
        
        for (const messageId of batch) {
          try {
            const rawEmail = await this.fetchSingleEmail(messageId);
            const email = await simpleParser(rawEmail);
            
            const existingEmail = await Email.findOne({
              $or: [
                { messageId: email.messageId },
                {
                  subject: email.subject,
                  sender: email.from?.text,
                  receivedDate: email.date
                }
              ]
            });

            if (!existingEmail) {
              const attachments = [];
              if (email.attachments && email.attachments.length > 0) {
                for (const attachment of email.attachments) {
                  const processedAttachment = await this.processAttachment(
                    attachment, 
                    messageId
                  );
                  if (processedAttachment) {
                    attachments.push(processedAttachment);
                  }
                }
              }

              const emailData = {
                messageId: email.messageId,
                subject: email.subject || 'No Subject',
                sender: email.from?.text || 'Unknown Sender',
                recipient: email.to?.text || '',
                body: email.text || email.html || '',
                receivedDate: email.date || new Date(),
                attachments,
                hasInvoice: this.detectInvoice(email, attachments)
              };

              await Email.create(emailData);
              console.log(`Saved new email: ${emailData.subject}`);
            }
          } catch (error) {
            console.error(`Error processing email ${messageId}:`, error);
          }
        }
      }

      this.imap.end();
      return true;
    } catch (error) {
      console.error('Error fetching emails:', error);
      if (this.imap) {
        this.imap.end();
      }
      throw error;
    }
  }

  detectInvoice(email, attachments) {
    const invoiceKeywords = [
      'invoice', 'bill', 'payment', 'amount due', 'total',
      'invoice number', 'invoice date', 'due date'
    ];

    const textToCheck = `${email.subject} ${email.text || email.html}`.toLowerCase();
    const hasInvoiceKeywords = invoiceKeywords.some(keyword => 
      textToCheck.includes(keyword)
    );

    const hasInvoiceAttachment = attachments.some(att => 
      att.isInvoice || att.filename.toLowerCase().includes('invoice')
    );

    return hasInvoiceKeywords || hasInvoiceAttachment;
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

      fetch.once('error', (err) => {
        console.error('Fetch error:', err);
        reject(err);
      });

      fetch.once('end', () => {
        resolve(buffer);
      });
    });
  }
}

module.exports = EmailService; 