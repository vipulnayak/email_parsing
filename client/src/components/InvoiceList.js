import React from 'react';

const InvoiceList = ({ emails }) => {
  if (!emails || emails.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg">
        <p className="text-gray-500">No invoices found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {emails.map((email) => (
        <div 
          key={email._id || email.id} 
          className="card border-t-4 border-t-success hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              Invoice
            </div>
            <div className="text-sm text-gray-500">
              {new Date(email.receivedDate || email.date).toLocaleDateString()}
            </div>
          </div>

          <div className="mb-3">
            <div className="font-medium text-gray-600">From:</div>
            <div className="text-secondary">{email.sender}</div>
          </div>

          <div className="mb-4">
            <div className="font-medium text-gray-600">Subject:</div>
            <div className="text-secondary">{email.subject}</div>
          </div>

          <div className="bg-gray-50 rounded-md p-4">
            <h3 className="font-semibold text-secondary mb-2">Invoice Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium text-success">
                  {email.invoiceDetails?.amount || 'Not specified'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Due Date:</span>
                <span className="font-medium">
                  {email.invoiceDetails?.dueDate || 'Not specified'}
                </span>
              </div>
              {email.invoiceDetails?.invoiceNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Invoice #:</span>
                  <span className="font-medium">
                    {email.invoiceDetails.invoiceNumber}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <button className="text-primary hover:text-blue-700 text-sm font-medium">
              View Full Email →
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InvoiceList; 