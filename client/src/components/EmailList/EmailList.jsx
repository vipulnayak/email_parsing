import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Badge,
  IconButton
} from '@mui/material';
import { PictureAsPdf } from '@mui/icons-material';
import EmailPreview from './EmailPreview';
import './EmailList.css';

const EmailList = () => {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      const response = await axios.get('/api/emails');
      setEmails(response.data);
    } catch (error) {
      console.error('Error fetching emails:', error);
    }
  };

  return (
    <div className="email-list-container">
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Subject</TableCell>
              <TableCell>From</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>PDFs</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {emails.map((email) => (
              <TableRow 
                key={email._id}
                className={selectedEmail?._id === email._id ? 'selected-row' : ''}
              >
                <TableCell>{email.subject}</TableCell>
                <TableCell>{email.from}</TableCell>
                <TableCell>
                  {new Date(email.receivedDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge 
                    badgeContent={email.pdfCount} 
                    color="primary"
                    showZero
                  >
                    <PictureAsPdf />
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className={`status-badge status-${email.status}`}>
                    {email.status}
                  </span>
                </TableCell>
                <TableCell>
                  <IconButton 
                    onClick={() => setSelectedEmail(email)}
                    color="primary"
                  >
                    <PictureAsPdf />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedEmail && (
        <EmailPreview 
          email={selectedEmail} 
          onClose={() => setSelectedEmail(null)}
        />
      )}
    </div>
  );
};

export default EmailList; 