import React from 'react';
import EmailPreview from './EmailPreview';

const EmailList = ({ emails }) => {
  console.log('Rendering EmailList with emails:', emails); // Debug log
  return (
    <div className="space-y-4">
      {emails && emails.length > 0 ? (
        emails.map((email) => (
          <EmailPreview key={email.id} email={email} />
        ))
      ) : (
        <div className="text-center text-gray-500">No emails found</div>
      )}
    </div>
  );
};

export default EmailList; 