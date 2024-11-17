import React from 'react';
import EmailItem from './EmailItem';
import '../styles/EmailList.css';

function EmailList({ emails }) {
  if (!emails || emails.length === 0) {
    return <div className="no-emails">No emails found</div>;
  }

  // Group emails by date
  const groupedEmails = emails.reduce((groups, email) => {
    const date = new Date(email.receivedDate);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let dateString;
    if (date.toDateString() === today.toDateString()) {
      dateString = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateString = 'Yesterday';
    } else {
      dateString = date.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    if (!groups[dateString]) {
      groups[dateString] = [];
    }
    groups[dateString].push(email);
    return groups;
  }, {});

  return (
    <div className="email-list">
      {Object.entries(groupedEmails).map(([date, dateEmails]) => (
        <div key={date} className="email-group">
          <div className="date-header">{date}</div>
          {dateEmails.map(email => (
            <EmailItem 
              key={email._id} 
              email={email}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default EmailList; 