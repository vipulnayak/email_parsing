const EmailService = require('../services/emailService');
const Email = require('../models/Email');
const path = require('path');
const mongoose = require('mongoose');

class EmailController {
  constructor() {
    // Bind methods to instance
    this.getEmails = this.getEmails.bind(this);
    this.getEmail = this.getEmail.bind(this);
    this.getAttachment = this.getAttachment.bind(this);
    this.fetchEmailsInBackground = this.fetchEmailsInBackground.bind(this);
  }

  async getEmails(req, res) {
    try {
      // Check MongoDB connection
      if (mongoose.connection.readyState !== 1) {
        throw new Error('Database connection not ready');
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Get emails from database first
      const [emails, total] = await Promise.all([
        Email.find()
          .sort({ receivedDate: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .select('subject sender recipient receivedDate body attachments messageId')
          .exec(),
        Email.countDocuments()
      ]);

      // Log success
      console.log(`Retrieved ${emails.length} emails from database`);

      // Return response
      const response = {
        success: true,
        data: {
          emails: emails.map(email => ({
            ...email,
            body: email.body || '',
            attachments: email.attachments || []
          })),
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalEmails: total,
          hasMore: skip + emails.length < total
        }
      };

      res.status(200).json(response);

      // Fetch new emails in background only on first page
      if (page === 1) {
        // Use setTimeout to ensure response is sent first
        setTimeout(() => {
          this.fetchEmailsInBackground().catch(err => 
            console.error('Background fetch error:', err)
          );
        }, 0);
      }
    } catch (error) {
      console.error('Get emails error:', error);
      // Only send error response if headers haven't been sent
      if (!res.headersSent) {
        res.status(500).json({ 
          success: false,
          error: error.message || 'Failed to retrieve emails'
        });
      }
    }
  }

  async getEmail(req, res) {
    try {
      const email = await Email.findById(req.params.id)
        .lean()
        .select('subject sender recipient receivedDate body attachments messageId');

      if (!email) {
        return res.status(404).json({
          success: false,
          error: 'Email not found'
        });
      }

      res.json({
        success: true,
        data: {
          ...email,
          body: email.body || '',
          attachments: email.attachments || []
        }
      });
    } catch (error) {
      console.error('Get email error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve email'
      });
    }
  }

  async getAttachment(req, res) {
    try {
      const { emailId, filename } = req.params;
      const email = await Email.findOne({ messageId: emailId })
        .select('attachments');
      
      if (!email) {
        return res.status(404).json({
          success: false,
          error: 'Email not found'
        });
      }

      const attachment = email.attachments?.find(a => a.filename === filename);
      if (!attachment) {
        return res.status(404).json({
          success: false,
          error: 'Attachment not found'
        });
      }

      res.download(attachment.path);
    } catch (error) {
      console.error('Get attachment error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retrieve attachment'
      });
    }
  }

  async fetchEmailsInBackground() {
    try {
      const emailService = new EmailService();
      await emailService.connect();
      await emailService.fetchEmails();
    } catch (error) {
      console.error('Background email fetch error:', error);
    }
  }
}

// Export a singleton instance
module.exports = new EmailController(); 