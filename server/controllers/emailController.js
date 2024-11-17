const EmailService = require('../services/emailService');
const Email = require('../models/Email');

class EmailController {
  async getEmails(req, res) {
    try {
      // Retrieve emails from database with pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const sort = req.query.sort || 'receivedDate:desc';

      const [field, order] = sort.split(':');
      const sortOptions = { [field]: order === 'desc' ? -1 : 1 };

      // First get emails from database
      const emails = await Email.find()
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();

      const total = await Email.countDocuments();

      // If no emails in database or first page, try fetching from Gmail
      if ((emails.length === 0 || page === 1) && !req.query.search) {
        try {
          const emailService = new EmailService();
          await emailService.connect();
          await emailService.fetchEmails();
          
          // Fetch again from database after Gmail sync
          const updatedEmails = await Email.find()
            .sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();

          const updatedTotal = await Email.countDocuments();

          return res.status(200).json({
            success: true,
            data: {
              emails: updatedEmails,
              currentPage: page,
              totalPages: Math.ceil(updatedTotal / limit),
              totalEmails: updatedTotal
            }
          });
        } catch (gmailError) {
          console.error('Gmail fetch error:', gmailError);
          // Continue with existing database results if Gmail fetch fails
        }
      }

      // Return database results
      res.status(200).json({
        success: true,
        data: {
          emails,
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalEmails: total
        }
      });
    } catch (error) {
      console.error('Get emails error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message || 'Error retrieving emails' 
      });
    }
  }
}

module.exports = new EmailController(); 