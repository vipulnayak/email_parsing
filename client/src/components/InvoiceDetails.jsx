import React, { useState } from 'react';

const InvoiceDetails = ({ email }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Format date and time
  const emailDate = "18 Nov, 17:51";

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      {/* Email Header Section */}
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold">
                {email.sender.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-800">{email.sender}</h3>
                <span className="text-sm text-gray-500">{emailDate}</span>
              </div>
              <p className="text-sm text-gray-600">to me</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-800">₹{email.invoiceAmount.toFixed(2)}</p>
            <p className="text-sm text-gray-500">Order Date: {email.orderDate}</p>
          </div>
        </div>
        
        <div className="mt-2 flex justify-between items-center">
          <p className="text-sm text-gray-600 line-clamp-1">
            Tax Invoice for Order ID: {email.id}
          </p>
          <span className={`px-3 py-1 rounded-full text-xs ${
            email.invoiceStatus === 'paid' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {email.invoiceStatus.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Expandable Invoice Details Section */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-semibold mb-2">Billing Details</h4>
              <div className="text-sm text-gray-600">
                <p>{email.billingDetails.name}</p>
                <p>{email.billingDetails.address}</p>
                <p>{email.billingDetails.city}, {email.billingDetails.state}</p>
                <p>{email.billingDetails.pincode}</p>
                <p>Phone: {email.billingDetails.phone}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Seller Details</h4>
              <div className="text-sm text-gray-600">
                <p>{email.sellerDetails.name}</p>
                <p>GSTIN: {email.sellerDetails.gstin}</p>
                <p>{email.sellerDetails.address}</p>
                <p>{email.sellerDetails.city}, {email.sellerDetails.state}</p>
                <p>{email.sellerDetails.pincode}</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Items</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-2">Description</th>
                    <th className="text-right p-2">Qty</th>
                    <th className="text-right p-2">Gross Amount</th>
                    <th className="text-right p-2">Taxable Value</th>
                    <th className="text-right p-2">Tax</th>
                    <th className="text-right p-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {email.items.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">
                        <div>
                          {item.description}
                          {item.sac && <div className="text-xs text-gray-500">SAC: {item.sac}</div>}
                          {item.hsn && <div className="text-xs text-gray-500">HSN: {item.hsn}</div>}
                        </div>
                      </td>
                      <td className="text-right p-2">{item.quantity}</td>
                      <td className="text-right p-2">₹{item.grossAmount.toFixed(2)}</td>
                      <td className="text-right p-2">₹{item.taxableValue.toFixed(2)}</td>
                      <td className="text-right p-2">
                        {item.cgst ? (
                          <div>
                            <div>CGST: ₹{item.cgst.toFixed(2)}</div>
                            <div>SGST: ₹{item.sgst.toFixed(2)}</div>
                          </div>
                        ) : item.igst ? (
                          <div>IGST: ₹{item.igst.toFixed(2)}</div>
                        ) : '-'}
                      </td>
                      <td className="text-right p-2">₹{item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="border-t font-semibold">
                    <td colSpan="5" className="p-2 text-right">Grand Total:</td>
                    <td className="p-2 text-right">₹{email.invoiceAmount.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            <p>* Keep this invoice and manufacturer box for warranty purposes.</p>
            <p>E. & O.E. page 1 of 1</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetails; 