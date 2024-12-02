import React, { useState, useEffect } from 'react';
import { fetchEmails } from '../api/api';
import EmailList from './EmailList';
import InvoiceList from './InvoiceList';
import axios from 'axios';

const simpleEmail2 = {
  id: 'EML20241122002',
  sender: 'susan.lee@booklovers.com',
  subject: 'Upcoming Book Club Meeting - December',
  receivedDate: '2024-11-21T08:15:00Z',
  body: `
    Hello Book Club Members,

    I hope everyone is enjoying their current read! As we approach the end of November, it's time to plan for our December meeting.

    **Meeting Details:**
    - **Book:** "The Midnight Library" by Matt Haig
    - **Date:** 2024-12-22
    - **Time:** 7:00 PM
    - **Location:** Green Café, Main Street, Downtown

    Please RSVP by December 5th so we can finalize the arrangements. Feel free to bring a friend along, but let me know in advance.

    Looking forward to seeing everyone!

    Warm regards,  
    Susan Lee  
    Book Club Organizer
  `,
  attachments: [],
  isRead: true,
  priority: 'normal',
  hasInvoice: false
};

const sampleEmailWithInvoice = {
  id: 'ZDN202401150001',
  sender: 'orders@snapdeal.com',
  subject: 'Invoice for Order #SD202311155678',
  receivedDate: '2024-01-15T10:30:00Z',
  body: `
    Dear Kavita Jain,

    Thank you for shopping with Snapdeal. Please find attached the invoice for your recent order.

    Order Details:
    - Order Number: SD202311155678
    - Order Date: 2024-11-20
    - Total Amount: ₹18,800.00

    Your order has been processed and will be delivered soon.

    Best regards,
    Snapdeal Team
  `,
  attachments: ['invoice.pdf'],
  isRead: false,
  priority: 'high',
  hasInvoice: true,
  invoice: {
    id: 'ZDN202401150001',
    sender: 'Snapdeal',
    subject: 'Invoice for Order #SD202311155678',
    hasInvoice: true,
    invoiceAmount: 3800.00,
    invoiceNumber: 'ZDN202401150001',
    invoiceDueDate: '2024-11-30',
    invoiceStatus: 'error',
    orderDate: '2024-11-22',
    billingDetails: {
      name: 'Kavita Jain',
      address: 'Flat 203, Shanti Residency, Lal Kothi',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302015',
      phone: 'xxxxxxxxxx'
    },
    sellerDetails: {
      name: 'Snapdeal Pvt Ltd',
      gstin: '08AACCS1234M1Z5',
      address: 'Emaar Digital Greens, Tower B',
      city: 'Gurgaon',
      state: 'Haryana',
      pincode: '122001'
    },
    items: [
      {
        description: 'Samsung Galaxy Tab A',
        hsn: '85176290',
        quantity: 1,
        grossAmount: 18000.00,
        taxableValue: 15254.24,
        igst: 2745.76,
        total: 18000.00
      },
      {
        description: 'Tab Cover',
        hsn: '39269099',
        quantity: 1,
        grossAmount: 800.00,
        taxableValue: 678.64,
        igst: 121.36,
        total: 800.00
      }
    ]
  }
};

const sampleEmailWithInvoice2 = {
  id: 'DT-INV56789',
  sender: 'orders@myntra.com',
  subject: 'Invoice for Order #MNTR9876543210',
  receivedDate: '2024-11-12T14:45:00Z',
  body: `
    Dear Rahul Verma,

    Thank you for shopping with Myntra. Your order invoice is attached below.

    Order Details:
    - Order Number: MNTR9876543210
    - Order Date: 2024-11-21
    - Total Amount: ₹2,500.00

    Your order has been processed and is ready for shipping.

    Best regards,
    Myntra Team
  `,
  attachments: ['invoice.pdf'],
  isRead: true,
  priority: 'normal',
  hasInvoice: true,
  invoice: {
    id: 'DT-INV56789',
    sender: 'Myntra',
    subject: 'Invoice for Order #MNTR9876543210',
    hasInvoice: true,
    invoiceAmount: 2500.00,
    invoiceNumber: 'DT-INV56789',
    invoiceDueDate: '2024-11-18',
    invoiceStatus: 'processed',
    orderDate: '2024-11-12',
    billingDetails: {
      name: 'Rahul Verma',
      address: '301, Sunrise Heights, MG Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      phone: 'xxxxxxxxxx'
    },
    sellerDetails: {
      name: 'Myntra Jabong Pvt Ltd',
      gstin: '27AABCM1234L1ZX',
      address: '6th Floor, Tower A, Bagmane Laurel',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560037'
    },
    items: [
      {
        description: 'Nike Running Shoes',
        hsn: '64021990',
        quantity: 1,
        grossAmount: 2000.00,
        taxableValue: 1694.92,
        igst: 305.08,
        total: 2000.00
      },
      {
        description: 'Puma Socks (3 pairs)',
        hsn: '61159600',
        quantity: 1,
        grossAmount: 500.00,
        taxableValue: 423.73,
        igst: 76.27,
        total: 500.00
      }
    ]
  }
};

const emailWithInvoices = {
  id: 'EML20241122003',
  sender: 'billing@shoponline.com',
  subject: 'Your Monthly Invoice Summary',
  receivedDate: '2024-11-20T09:00:00Z',
  body: `
    Dear Customer,

    Thank you for shopping with us! Attached are your invoices for your recent purchases. If you have any questions, feel free to contact our support team.

    **Invoice Details:**

    1. **Invoice Number:** INV-12345
       - **Amount:** $450.00
       - **Due Date:** 2024-12-05
       - **Status:** Paid

    2. **Invoice Number:** INV-12346
       - **Amount:** $120.00
       - **Due Date:** 2024-12-10
       - **Status:** Pending

    Thank you for your continued patronage!

    Best regards,  
    ShopOnline Billing Team
  `,
  attachments: [
    {
      filename: 'INV-12345.pdf',
      fileType: 'application/pdf',
      fileSize: '450KB'
    },
    {
      filename: 'INV-12346.pdf',
      fileType: 'application/pdf',
      fileSize: '120KB'
    }
  ],
  isRead: false,
  priority: 'normal',
  hasInvoice: true,
  invoices: [
    {
      id: 'INV-JBCU23IJKN',
      invoiceNumber: 'INV-JCEBFH34H3N',
      amount: 450.00,
      currency: 'USD',
      dueDate: '2024-12-05',
      status: 'paid',
      billingDetails: {
        name: 'John Smith',
        address: '123 Main St',
        city: 'Boston',
        state: 'MA',
        pincode: '02108'
      },
      sellerDetails: {
        name: 'ShopOnline Inc',
        gstin: 'SO1234567890',
        address: '789 Commerce Ave',
        city: 'New York',
        state: 'NY',
        pincode: '10001'
      },
      items: [
        {
          description: 'Premium Subscription',
          quantity: 1,
          grossAmount: 450.00,
          total: 450.00
        }
      ]
    },
    {
      id: 'INV-12346',
      invoiceNumber: 'INV-12346',
      amount: 120.00,
      currency: 'USD',
      dueDate: '2024-12-10',
      status: 'pending',
      billingDetails: {
        name: 'John Smith',
        address: '123 Main St',
        city: 'Boston',
        state: 'MA',
        pincode: '02108'
      },
      sellerDetails: {
        name: 'ShopOnline Inc',
        gstin: 'SO1234567890',
        address: '789 Commerce Ave',
        city: 'New York',
        state: 'NY',
        pincode: '10001'
      },
      items: [
        {
          description: 'Basic Service',
          quantity: 1,
          grossAmount: 120.00,
          total: 120.00
        }
      ]
    }
  ]
};

const Dashboard = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('receivedDate:desc');
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'invoices'

  useEffect(() => {
    loadEmails();
  }, [page, activeTab, search, sortBy]);

  const loadEmails = async () => {
    try {
      setLoading(true);
      const data = await fetchEmails(page, 20, search, sortBy, activeTab === 'invoices');

      const fetchedEmails = data.emails || [];
      const emailIds = new Set(fetchedEmails.map(email => email.id));
      const sampleEmails = [];

      if (!emailIds.has(emailWithInvoices.id)) {
        sampleEmails.push(emailWithInvoices);
      }
      if (!emailIds.has(simpleEmail2.id)) {
        sampleEmails.push(simpleEmail2);
      }
      if (!emailIds.has(sampleEmailWithInvoice.id)) {
        sampleEmails.push(sampleEmailWithInvoice);
      }
      if (!emailIds.has(sampleEmailWithInvoice2.id)) {
        sampleEmails.push(sampleEmailWithInvoice2);
      }

      setEmails([...sampleEmails, ...fetchedEmails]);
      setTotalPages(data.totalPages || 1);
      setError(null);
    } catch (err) {
      console.error('Error loading emails:', err);
      setError('Failed to load emails');
      setEmails([emailWithInvoices, simpleEmail2, sampleEmailWithInvoice, sampleEmailWithInvoice2]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-secondary text-center mb-4">
            Email Invoice System
          </h1>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-6">
            <div className="bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-6 py-2 rounded-md transition-colors ${activeTab === 'all'
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                All Emails
              </button>
              <button
                onClick={() => setActiveTab('invoices')}
                className={`px-6 py-2 rounded-md transition-colors ${activeTab === 'invoices'
                    ? 'bg-success text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                Invoices Only
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={loadEmails}
              className="btn btn-primary flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <div className="flex gap-4 text-sm text-gray-600">
              <span>Total: {emails.length}</span>
              {activeTab === 'all' && (
                <span>Invoices: {emails.filter(email => email.hasInvoice).length}</span>
              )}
            </div>
          </div>
        </header>

        <div className="mb-6 flex gap-4">
          <input
            type="text"
            placeholder="Search emails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input flex-1"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input w-48"
          >
            <option value="receivedDate:desc">Date (Newest)</option>
            <option value="receivedDate:asc">Date (Oldest)</option>
            <option value="sender:asc">Sender (A-Z)</option>
            {activeTab === 'invoices' && (
              <option value="invoiceAmount:desc">Amount (High to Low)</option>
            )}
          </select>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <>
            {activeTab === 'invoices' ? (
              <InvoiceList emails={emails.filter(email => email.hasInvoice)} />
            ) : (
              <>
                {console.log('Emails being rendered:', emails)}
                <EmailList emails={emails} />
              </>
            )}

            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 