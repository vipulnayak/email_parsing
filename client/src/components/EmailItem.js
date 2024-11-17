import React, { useState } from 'react';
import { FaFileInvoice, FaEnvelope, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import '../styles/EmailItem.css';

function EmailItem({ email }) {
  const [expanded, setExpanded] = useState(false);
  const hasInvoice = email?.isInvoice;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (!email) return null;

  return (
    <div className={`email-item ${hasInvoice ? 'has-invoice' : ''}`}>
      <div className="email-header" onClick={() => setExpanded(!expanded)}>
        <div className="email-summary">
          <div className="email-icons">
            {hasInvoice ? <FaFileInvoice className="invoice-icon" /> : <FaEnvelope />}
            {expanded ? <FaChevronUp /> : <FaChevronDown />}
          </div>
          <div className="email-basic-info">
            <h3>{email.subject}</h3>
            <p className="email-meta">
              From: {email.sender} | {formatDate(email.receivedDate)}
            </p>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="email-content">
          <div className="email-body">
            {email.body}
          </div>
          
          {email.attachments && email.attachments.length > 0 && (
            <div className="attachments">
              <h4>Attachments:</h4>
              {email.attachments.map((attachment, index) => (
                <div key={index} className="attachment-item">
                  <span>{attachment.filename}</span>
                  {attachment.isInvoice && <FaFileInvoice className="invoice-icon" />}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EmailItem; 