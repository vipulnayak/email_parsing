import React from 'react';
import '../styles/EmailItem.css';

const EmailItem = ({ email }) => {
  return (
    <div className={`email-item ${email.hasInvoice ? 'has-invoice' : ''}`}>
      <div className="email-header">
        <span className="email-sender">{email.sender}</span>
        <span className="email-date">
          {new Date(email.date).toLocaleDateString()}
        </span>
      </div>
      <div className="email-subject">{email.subject}</div>
      <div className="invoice-status">
        {email.hasInvoice ? (
          <div className="invoice-details">
            <span className="invoice-badge">Invoice Found</span>
            {email.invoiceDetails && (
              <div className="invoice-info">
                {email.invoiceDetails.amount && (
                  <span>Amount: {email.invoiceDetails.amount}</span>
                )}
                {email.invoiceDetails.dueDate && (
                  <span>Due Date: {email.invoiceDetails.dueDate}</span>
                )}
              </div>
            )}
          </div>
        ) : (
          <span className="no-invoice-badge">No Invoice</span>
        )}
      </div>
    </div>
  );
};

export default EmailItem; 