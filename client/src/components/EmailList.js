import React from 'react';
import './EmailList.css';

const EmailList = ({ emails }) => {
  if (!emails || emails.length === 0) {
    return <div className="no-emails">No emails found</div>;
  }

  return (
    <div className="email-list">
      {emails.map((email) => (
        <div key={email._id || email.id} className={`email-card ${email.hasInvoice ? 'has-invoice' : 'no-invoice'}`}>
          <div className="email-header">
            <div className="email-meta">
              <div className="email-sender">{email.sender}</div>
              <div className="email-date">
                {new Date(email.receivedDate || email.date).toLocaleString()}
              </div>
            </div>
            <div className="invoice-badge">
              {email.hasInvoice ? '📄 Invoice Found' : '❌ No Invoice'}
            </div>
          </div>
          
          <div className="email-subject">{email.subject}</div>
          
          {email.hasInvoice && email.invoiceDetails && (
            <div className="invoice-details">
              <div className="invoice-amount">
                Amount: {email.invoiceDetails.amount || 'Not specified'}
              </div>
              <div className="invoice-due-date">
                Due Date: {email.invoiceDetails.dueDate || 'Not specified'}
              </div>
            </div>
          )}
          
          <div className="email-preview">
            {email.body ? email.body.substring(0, 150) + '...' : 'No preview available'}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmailList; 