import React from 'react';
import EmailPreview from './EmailPreview';
import './EmailList.css';

const EmailList = ({ emails }) => {
  console.log('Emails in EmailList:', emails);
  return (
    <div className="email-list space-y-4">
      {emails && emails.map((email) => (
        <EmailPreview key={email.id} email={email} />
      ))}
    </div>
  );
};

export default EmailList; 