const Email = require('../models/email');
const emailService = require('../services/emailService');

exports.fetchEmails = async (req, res) => {
  try {
    await emailService.fetchEmails();
    res.status(200).json({ message: 'Emails fetched and processed successfully' });
  } catch (error) {
    console.error('Error in fetchEmails controller:', error);
    res.status(500).json({ error: 'Failed to fetch emails', details: error.message });
  }
};

exports.getEmails = async (req, res) => {
  try {
    const emails = await Email.find().sort({ receivedDate: -1 }).limit(50);
    res.status(200).json(emails);
  } catch (error) {
    console.error('Error in getEmails controller:', error);
    res.status(500).json({ error: 'Failed to retrieve emails', details: error.message });
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
    console.error('Error in getEmailById controller:', error);
    res.status(500).json({ error: 'Failed to retrieve email', details: error.message });
  }
};