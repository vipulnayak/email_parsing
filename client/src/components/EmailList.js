import React from 'react';

const EmailList = ({ emails }) => {
  if (!emails || emails.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg">
        <p className="text-gray-500">No emails found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {emails.map((email) => (
        <div 
          key={email._id || email.id} 
          className={`card border-l-4 ${
            email.hasInvoice ? 'border-l-success' : 'border-l-gray-300'
          }`}
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="font-semibold text-secondary">
                {email.sender}
              </div>
              <div className="text-sm text-gray-500">
                {new Date(email.receivedDate || email.date).toLocaleString()}
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm ${
              email.hasInvoice 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {email.hasInvoice ? '📄 Invoice Found' : '❌ No Invoice'}
            </div>
          </div>
          
          <div className="text-lg mb-3">{email.subject}</div>
          
          {email.hasInvoice && email.invoiceDetails && (
            <div className="bg-gray-50 rounded-md p-4 mb-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600">Amount:</span>{' '}
                  <span className="font-medium">
                    {email.invoiceDetails.amount || 'Not specified'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Due Date:</span>{' '}
                  <span className="font-medium">
                    {email.invoiceDetails.dueDate || 'Not specified'}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div className="text-gray-600 text-sm border-t pt-3">
            {email.body ? email.body.substring(0, 150) + '...' : 'No preview available'}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmailList; 