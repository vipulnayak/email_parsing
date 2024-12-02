import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Grid, IconButton } from '@mui/material';
import { Visibility, Download } from '@mui/icons-material';
import './EmailPreview.css';

const EmailPreview = ({ email }) => {
  const [previews, setPreviews] = useState([]);
  const [pdfCount, setPdfCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreviews = async () => {
      try {
        const response = await axios.get(`/api/emails/${email._id}/previews`);
        setPreviews(response.data.previews);
        setPdfCount(response.data.pdfCount);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching previews:', error);
        setLoading(false);
      }
    };

    fetchPreviews();
  }, [email._id]);

  const handleDownload = (url, fileName) => {
    window.open(url, '_blank');
  };

  return (
    <Card className="email-preview-card">
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Email Attachments ({pdfCount} PDFs)
        </Typography>
        
        {loading ? (
          <Typography>Loading previews...</Typography>
        ) : (
          <Grid container spacing={2}>
            {previews.map((preview, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card className="preview-item">
                  <img 
                    src={preview.previewUrl} 
                    alt={`Preview of ${preview.fileName}`}
                    className="pdf-preview-image"
                  />
                  <div className="preview-actions">
                    <IconButton 
                      onClick={() => window.open(preview.previewUrl, '_blank')}
                      title="View PDF"
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDownload(preview.originalPdfUrl, preview.fileName)}
                      title="Download PDF"
                    >
                      <Download />
                    </IconButton>
                  </div>
                  <Typography variant="caption" className="preview-filename">
                    {preview.fileName}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailPreview; 