const Invoice = require('../models/Invoice');

class InvoiceController {
  async getInvoices(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const invoices = await Invoice.find()
        .populate('emailId')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const count = await Invoice.countDocuments();

      res.json({
        invoices,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getInvoiceById(req, res) {
    try {
      const invoice = await Invoice.findById(req.params.id)
        .populate('emailId');
      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new InvoiceController(); 