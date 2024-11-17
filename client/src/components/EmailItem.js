import React, { useState } from 'react';
import { FaFileInvoice, FaEnvelope, FaChevronDown, FaChevronUp, FaFile } from 'react-icons/fa';
import '../styles/EmailItem.css';

function EmailItem({ email }) {
  const [expanded, setExpanded] = useState(false);
  const hasInvoice = email.attachments?.some(att => att.isInvoice);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleDownload = async (attachment) => {
    try {
      window.open(`http://localhost:5000/api/emails/attachments/${email.messageId}/${attachment.filename}`, '_blank');
    } catch (error) {
      console.error('Error downloading attachment:', error);
    }
  };

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
            <div className="attachments-section">
              <h4>Attachments:</h4>
              <div className="attachments-list">
                {email.attachments.map((attachment, index) => (
                  <div 
                    key={index} 
                    className={`attachment ${attachment.isInvoice ? 'invoice' : ''}`}
                    onClick={() => handleDownload(attachment)}
                  >
                    <FaFile className="file-icon" />
                    <span className="attachment-name">{attachment.filename}</span>
                    {attachment.isInvoice && (
                      <span className="invoice-badge">Invoice</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EmailItem; 