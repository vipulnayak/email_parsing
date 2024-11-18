const EmailService = require('../services/emailService');
const Email = require('../models/Email');

const emailService = new EmailService();

exports.fetchNewEmails = async (req, res) => {
  try {
    console.log('Starting email fetch...');
    const newEmailsCount = await emailService.fetchEmails();
    console.log('Email fetch completed');
    res.json({ 
      message: 'Emails fetched successfully',
      newEmails: newEmailsCount
    });
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
};

exports.getEmails = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const sort = req.query.sort || 'receivedDate:desc';

    const [sortField, sortOrder] = sort.split(':');
    const sortOptions = { [sortField]: sortOrder === 'desc' ? -1 : 1 };

    let query = {};
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { sender: { $regex: search, $options: 'i' } }
      ];
    }

    const emails = await Email.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Email.countDocuments(query);

    res.json({
      emails,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalEmails: total
    });
  } catch (error) {
    console.error('Error getting emails:', error);
    res.status(500).json({ error: 'Failed to get emails' });
  }
};

exports.getEmail = async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }
    res.json(email);
  } catch (error) {
    console.error('Error fetching email:', error);
    res.status(500).json({ error: 'Failed to fetch email' });
  }
};

exports.getAttachment = async (req, res) => {
  try {
    const email = await Email.findOne({ 
      'attachments.filename': req.params.filename 
    });
    
    if (!email) {
      return res.status(404).json({ error: 'Attachment not found' });
    }

    const attachment = email.attachments.find(a => a.filename === req.params.filename);
    res.download(attachment.path);
  } catch (error) {
    console.error('Error downloading attachment:', error);
    res.status(500).json({ error: 'Failed to download attachment' });
  }
}; 