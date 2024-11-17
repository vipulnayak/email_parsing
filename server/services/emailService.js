const Imap = require('imap');
const { simpleParser } = require('mailparser');
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
      },
      authTimeout: 30000,
      connTimeout: 30000
    });

    this.imap.once('error', (err) => {
      console.error('IMAP error:', err);
    });
  }

  async connect() {
    return new Promise((resolve, reject) => {
      try {
        this.imap.once('ready', () => {
          console.log('Connected to Gmail');
          resolve();
        });

        this.imap.once('error', (err) => {
          console.error('IMAP connection error:', err);
          reject(err);
        });

        this.imap.connect();
      } catch (error) {
        console.error('Connection error:', error);
        reject(error);
      }
    });
  }

  async fetchEmails() {
    try {
      // Open Gmail inbox
      await new Promise((resolve, reject) => {
        this.imap.openBox('INBOX', false, (err, box) => {
          if (err) {
            console.error('Error opening inbox:', err);
            reject(err);
          } else {
            console.log('Opened Gmail inbox successfully');
            resolve(box);
          }
        });
      });

      // Get the last 50 emails
      const results = await new Promise((resolve, reject) => {
        this.imap.search(['ALL'], (err, results) => {
          if (err) reject(err);
          else resolve(results.slice(-50)); // Get last 50 emails
        });
      });

      if (!results.length) {
        console.log('No emails found');
        return [];
      }

      console.log(`Found ${results.length} emails`);

      // Fetch email contents
      const messages = await new Promise((resolve, reject) => {
        const fetch = this.imap.fetch(results, { bodies: '' });
        const messages = [];

        fetch.on('message', (msg) => {
          let buffer = '';
          msg.on('body', (stream) => {
            stream.on('data', (chunk) => {
              buffer += chunk.toString('utf8');
            });
          });
          msg.once('end', () => {
            messages.push(buffer);
          });
        });

        fetch.once('error', reject);
        fetch.once('end', () => resolve(messages));
      });

      // Process and save emails
      for (const message of messages) {
        try {
          const parsed = await simpleParser(message);
          
          if (parsed.messageId && parsed.subject && parsed.from) {
            const emailData = {
              messageId: parsed.messageId,
              subject: parsed.subject,
              sender: parsed.from.text,
              recipient: parsed.to?.text || '',
              body: parsed.text || '',
              receivedDate: parsed.date
            };

            // Check if email already exists
            const existingEmail = await Email.findOne({ messageId: emailData.messageId });
            if (!existingEmail) {
              await Email.create(emailData);
              console.log(`Saved email: ${emailData.subject}`);
            }
          }
        } catch (error) {
          console.error('Error processing email:', error);
          // Continue with next email
        }
      }

      this.imap.end();
      return true;
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  }
}

module.exports = EmailService; 