const Imap = require('imap');
const { simpleParser } = require('mailparser');
const pdfParse = require('pdf-parse');
const tesseract = require('tesseract.js');
const tf = require('@tensorflow/tfjs');
const use = require('@tensorflow-models/universal-sentence-encoder');

const Email = require('../models/email');

class EmailService {
  constructor() {
    this.imap = new Imap({
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASSWORD,
      host: process.env.EMAIL_HOST,
      port: 993,
      tls: true,
    });
    this.model = null;
  }

  async loadModel() {
    this.model = await use.load();
  }

  async fetchEmails() {
    if (!this.model) {
      await this.loadModel();
    }

    return new Promise((resolve, reject) => {
      this.imap.once('ready', () => {
        this.imap.openBox('INBOX', false, (err, box) => {
          if (err) reject(err);
          const fetchStream = this.imap.seq.fetch('1:*', { bodies: ['HEADER', 'TEXT'], struct: true });
          fetchStream.on('message', (msg) => {
            msg.on('body', async (stream, info) => {
              try {
                const parsed = await simpleParser(stream);
                const email = new Email({
                  subject: parsed.subject,
                  sender: parsed.from.text,
                  body: parsed.text,
                  receivedDate: parsed.date,
                });
                if (parsed.attachments && parsed.attachments.length > 0) {
                  for (const attachment of parsed.attachments) {
                    if (attachment.contentType === 'application/pdf') {
                      const pdfText = await this.extractTextFromPDF(attachment.content);
                      email.ocrText = pdfText;
                      email.isInvoice = await this.detectInvoice(pdfText, attachment.filename);
                    }
                    email.attachments.push({
                      filename: attachment.filename,
                      content: attachment.content,
                      contentType: attachment.contentType,
                    });
                  }
                }
                await email.save();
              } catch (error) {
                console.error('Error processing email:', error);
              }
            });
          });
          fetchStream.once('error', (err) => reject(err));
          fetchStream.once('end', () => {
            this.imap.end();
            resolve();
          });
        });
      });
      this.imap.once('error', (err) => reject(err));
      this.imap.connect();
    });
  }

  async extractTextFromPDF(pdfBuffer) {
    const data = await pdfParse(pdfBuffer);
    return data.text;
  }

  async detectInvoice(text, filename) {
    const keywords = ['invoice', 'amount due', 'payment', 'bill', 'invoice number', 'invoice date'];
    const lowercaseText = text.toLowerCase();
    const keywordMatch = keywords.some(keyword => lowercaseText.includes(keyword));
    
    if (keywordMatch || filename.toLowerCase().includes('invoice')) {
      return true;
    }

    // Use the pre-trained model for classification
    const embeddings = await this.model.embed([text]);
    const invoiceEmbedding = await this.model.embed(['This is an invoice for payment']);
    const similarity = tf.matMul(embeddings, invoiceEmbedding, false, true);
    const score = await similarity.data();

    return score[0] > 0.5; // Adjust this threshold as needed
  }
}

module.exports = new EmailService();