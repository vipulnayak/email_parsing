const EmailService = require('../services/emailService');
const Email = require('../models/Email');

const emailService = new EmailService();

exports.getEmails = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const sort = req.query.sort || 'receivedDate:desc';
    const showOnlyInvoices = req.query.invoicesOnly === 'true';

    const [sortField, sortOrder] = sort.split(':');
    const sortOptions = { [sortField]: sortOrder === 'desc' ? -1 : 1 };

    let query = {};
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { sender: { $regex: search, $options: 'i' } }
      ];
    }

    if (showOnlyInvoices) {
      query.hasInvoice = true;
    }

    const emails = await Email.find(query)
      .select({
        subject: 1,
        sender: 1,
        receivedDate: 1,
        hasInvoice: 1,
        invoiceDetails: 1,
        invoiceSource: 1
      })
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Email.countDocuments(query);

    const processedEmails = emails.map(email => ({
      id: email._id,
      subject: email.subject,
      sender: email.sender,
      date: email.receivedDate,
      hasInvoice: email.hasInvoice,
      invoiceDetails: email.hasInvoice ? {
        amount: email.invoiceDetails?.amount || 'Not specified',
        dueDate: email.invoiceDetails?.dueDate || 'Not specified',
        source: email.invoiceSource || 'Unknown'
      } : null
    }));

    res.json({
      emails: processedEmails,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalEmails: total
    });
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
};

exports.fetchNewEmails = async (req, res) => {
  try {
    await emailService.fetchEmails();
    res.json({ message: 'Emails fetched successfully' });
  } catch (error) {
    console.error('Error fetching new emails:', error);
    res.status(500).json({ error: 'Failed to fetch new emails' });
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