const Email = require('../models/email');
const emailService = require('../services/emailService');

exports.fetchEmails = async (req, res) => {
  try {
    await emailService.fetchEmails();
    res.status(200).json({ message: 'Emails fetched and processed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching emails' });
  }
};

exports.getEmails = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const emails = await Email.find()
      .sort({ receivedDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Email.countDocuments();

    res.status(200).json({
      emails,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalEmails: total
    });
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving emails' });
  }
};

exports.getEmailById = async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }
    res.status(200).json(email);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving email' });
  }
};

exports.searchEmails = async (req, res) => {
  try {
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const emails = await Email.find({
      $or: [
        { subject: { $regex: query, $options: 'i' } },
        { sender: { $regex: query, $options: 'i' } }
      ]
    })
      .sort({ receivedDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Email.countDocuments({
      $or: [
        { subject: { $regex: query, $options: 'i' } },
        { sender: { $regex: query, $options: 'i' } }
      ]
    });

    res.status(200).json({
      emails,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalEmails: total
    });
  } catch (error) {
    res.status(500).json({ error: 'Error searching emails' });
  }
};