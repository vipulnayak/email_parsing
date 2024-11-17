const Imap = require('imap');
const { simpleParser } = require('mailparser');
const fs = require('fs').promises;
const path = require('path');
const Email = require('../models/Email');
const { processAttachment } = require('./ocrService');
const { detectInvoice } = require('./invoiceDetectionService');

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
      },
      authTimeout: 30000,
      connTimeout: 30000
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
      await new Promise((resolve, reject) => {
        this.imap.openBox('INBOX', false, (err, box) => {
          if (err) reject(err);
          else resolve(box);
        });
      });

      // Get recent emails first (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const results = await new Promise((resolve, reject) => {
        this.imap.search([['SINCE', sevenDaysAgo]], (err, results) => {
          if (err) reject(err);
          else resolve(results.slice(-50)); // Get last 50 recent emails
        });
      });

      if (!results.length) {
        console.log('No new emails found');
        return [];
      }

      // Process emails in smaller batches
      const batchSize = 5;
      const batches = [];
      for (let i = 0; i < results.length; i += batchSize) {
        batches.push(results.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        await Promise.all(batch.map(async (result) => {
          try {
            const message = await this.fetchSingleEmail(result);
            if (message && message.messageId) {
              const existingEmail = await Email.findOne({ messageId: message.messageId });
              if (!existingEmail) {
                await Email.create(message);
              }
            }
          } catch (error) {
            console.error(`Error processing email ${result}:`, error);
          }
        }));
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
      
      fetch.on('message', (msg) => {
        let buffer = '';
        
        msg.on('body', (stream) => {
          stream.on('data', (chunk) => {
            buffer += chunk.toString('utf8');
          });
        });

        msg.once('end', async () => {
          try {
            const parsed = await simpleParser(buffer);
            resolve({
              messageId: parsed.messageId,
              subject: parsed.subject || 'No Subject',
              sender: parsed.from?.text || 'Unknown Sender',
              recipient: parsed.to?.text || '',
              body: parsed.text || parsed.html || '',
              receivedDate: parsed.date || new Date()
            });
          } catch (error) {
            console.error('Error parsing email:', error);
            resolve(null);
          }
        });
      });

      fetch.once('error', reject);
    });
  }
}

module.exports = EmailService; 