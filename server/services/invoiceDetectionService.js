class InvoiceDetectionService {
  constructor() {
    this.invoiceKeywords = [
      'invoice',
      'bill',
      'receipt',
      'amount',
      'payment',
      'tax',
      'total',
      'due',
      'balance',
      'price',
      'charge',
      'statement',
      'account',
      'transaction',
      'paid',
      'payable',
      'cost',
      'fee',
      'billing',
      'purchase',
      'order',
      'subtotal',
      'gst',
      'vat',
      'sales tax',
      'amount due',
      'payment due',
      'invoice number',
      'invoice date',
      'total amount',
      'tax amount',
      'due date',
      'bank transfer',
      'credit card',
      'payment method',
      'reference number',
      'customer id',
      'po number'
    ];

    this.amountPatterns = [
      /\$\s*\d+(?:,\d{3})*(?:\.\d{2})?/,  // USD format
      /₹\s*\d+(?:,\d{3})*(?:\.\d{2})?/,   // INR format
      /\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:USD|INR|EUR|GBP)/,  // Amount with currency code
      /total:?\s*\d+(?:,\d{3})*(?:\.\d{2})?/i,  // Total amount
      /amount:?\s*\d+(?:,\d{3})*(?:\.\d{2})?/i,  // Amount
      /balance:?\s*\d+(?:,\d{3})*(?:\.\d{2})?/i  // Balance
    ];
  }

  async detectInvoice(text) {
    if (!text) return false;
    
    const normalizedText = text.toLowerCase();
    
    // Check for keyword matches
    const keywordMatches = this.invoiceKeywords.filter(keyword => 
      normalizedText.includes(keyword.toLowerCase())
    );

    // Check for amount patterns
    const hasAmount = this.amountPatterns.some(pattern => 
      pattern.test(text)
    );

    // Log detection results
    console.log('Invoice Detection Results:', {
      keywordMatches: keywordMatches.length,
      keywords: keywordMatches,
      hasAmount: hasAmount
    });

    // Consider it an invoice if:
    // 1. Has at least 2 keywords AND an amount pattern, OR
    // 2. Has at least 4 keywords
    return (keywordMatches.length >= 2 && hasAmount) || keywordMatches.length >= 4;
  }

  extractInvoiceDetails(text) {
    const details = {
      amount: null,
      date: null,
      invoiceNumber: null
    };

    // Extract amount
    for (const pattern of this.amountPatterns) {
      const match = text.match(pattern);
      if (match) {
        details.amount = match[0];
        break;
      }
    }

    // Extract date (common formats)
    const datePattern = /\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/;
    const dateMatch = text.match(datePattern);
    if (dateMatch) {
      details.date = dateMatch[0];
    }

    // Extract invoice number
    const invoiceNumberPattern = /(?:invoice|bill|receipt)(?:\s+(?:no|number|#):?\s*)([A-Z0-9-]+)/i;
    const invoiceMatch = text.match(invoiceNumberPattern);
    if (invoiceMatch) {
      details.invoiceNumber = invoiceMatch[1];
    }

    return details;
  }
}

module.exports = new InvoiceDetectionService(); 