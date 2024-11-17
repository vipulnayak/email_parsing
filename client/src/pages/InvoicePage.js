import React from 'react';
import EmailItem from '../components/EmailItem';
import '../styles/InvoicePage.css';

function InvoicePage() {
  return (
    <div className="invoice-page">
      <h1>Invoice Example</h1>
      <div className="invoice-container">
        <EmailItem />
      </div>
    </div>
  );
}

export default InvoicePage; 