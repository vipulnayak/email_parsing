import React, { useState } from 'react';

const InvoiceList = ({ emails }) => {
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const handleInvoiceClick = (invoice) => {
    setSelectedInvoice(selectedInvoice?.id === invoice.id ? null : invoice);
  };

  const formatCurrency = (amount, currency = '₹') => {
    if (amount === undefined || amount === null) return `${currency}0.00`;
    return `${currency}${Number(amount).toFixed(2)}`;
  };

  const renderInvoices = (email) => {
    // Handle both single invoice and multiple invoices
    const invoices = email.invoices || [email.invoice];
    
    return invoices.map((invoice) => {
      if (!invoice) return null; // Skip if invoice is undefined

      return (
        <div key={invoice.id} className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
          <div 
            className="p-4 cursor-pointer hover:bg-gray-50"
            onClick={() => handleInvoiceClick(invoice)}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {invoice.invoiceNumber} - {email.subject}
                </h3>
                <p className="text-sm text-gray-600">{email.sender}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {formatCurrency(invoice.amount || invoice.invoiceAmount, invoice.currency === 'USD' ? '$' : '₹')}
                </p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  invoice.status === 'error' || invoice.invoiceStatus === 'error' ? 'bg-red-100 text-red-800' : 
                  invoice.status === 'pending' || invoice.invoiceStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {invoice.status || invoice.invoiceStatus || 'unknown'}
                </span>
              </div>
            </div>
          </div>

          {/* Invoice Details Section */}
          {selectedInvoice && selectedInvoice.id === invoice.id && (
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-semibold mb-2">Billing Details</h4>
                  <div className="text-sm">
                    <p>{selectedInvoice.billingDetails?.name || 'N/A'}</p>
                    <p>{selectedInvoice.billingDetails?.address || 'N/A'}</p>
                    <p>{selectedInvoice.billingDetails?.city}, {selectedInvoice.billingDetails?.state}</p>
                    <p>{selectedInvoice.billingDetails?.pincode || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Seller Details</h4>
                  <div className="text-sm">
                    <p>{selectedInvoice.sellerDetails?.name || 'N/A'}</p>
                    <p>GSTIN: {selectedInvoice.sellerDetails?.gstin || 'N/A'}</p>
                    <p>{selectedInvoice.sellerDetails?.address || 'N/A'}</p>
                    <p>{selectedInvoice.sellerDetails?.city}, {selectedInvoice.sellerDetails?.state}</p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Items</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">HSN</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Qty</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Amount</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Tax</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedInvoice.items.map((item, index) => (
                          <tr key={index} className="text-sm">
                            <td className="px-4 py-2">{item.description || 'N/A'}</td>
                            <td className="px-4 py-2 text-right">{item.hsn || 'N/A'}</td>
                            <td className="px-4 py-2 text-right">{item.quantity || 0}</td>
                            <td className="px-4 py-2 text-right">{formatCurrency(item.grossAmount)}</td>
                            <td className="px-4 py-2 text-right">{formatCurrency(item.igst || 0)}</td>
                            <td className="px-4 py-2 text-right">{formatCurrency(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr className="font-medium">
                          <td colSpan="5" className="px-4 py-2 text-right">Total Amount:</td>
                          <td className="px-4 py-2 text-right">
                            {formatCurrency(
                              selectedInvoice.items.reduce((sum, item) => sum + (item.total || 0), 0),
                              selectedInvoice.currency === 'USD' ? '$' : '₹'
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }).filter(Boolean); // Remove null values from the map
  };

  return (
    <div className="space-y-4">
      {emails.filter(email => email.hasInvoice).map((email) => (
        <div key={email.id}>
          {renderInvoices(email)}
        </div>
      ))}
    </div>
  );
};

export default InvoiceList; 