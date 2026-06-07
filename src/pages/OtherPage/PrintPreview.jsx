import React from "react";
import { useLocation } from "react-router-dom";

const PrintPreview = () => {
  const location = useLocation();
  const { invoiceDetails } = location.state || {}; // Access passed state

  const handlePrint = () => {
    window.print(); // Trigger the browser's print functionality
  };

  return (
    <div className="p-4 min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 transition-colors duration-200">
      <h1 className="text-center text-2xl font-bold mb-4">Invoice</h1>
      <div className="border border-slate-200 dark:border-zinc-800 p-4 rounded shadow bg-white dark:bg-zinc-900">
        <p><strong>Branch:</strong> {invoiceDetails.branch}</p>
        <p><strong>Order Type:</strong> {invoiceDetails.orderType}</p>
        <p><strong>Counter:</strong> {invoiceDetails.counter}</p>
        <p><strong>User:</strong> {invoiceDetails.loginUserName} ({invoiceDetails.loginUserEmail})</p>
        <table className="min-w-full border border-gray-300 dark:border-zinc-700 mt-4">
          <thead>
            <tr className="bg-gray-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
              <th className="border border-gray-300 dark:border-zinc-700 px-2 py-1 text-left font-semibold">Product</th>
              <th className="border border-gray-300 dark:border-zinc-700 px-2 py-1 text-center font-semibold">Qty</th>
              <th className="border border-gray-300 dark:border-zinc-700 px-2 py-1 text-right font-semibold">Price</th>
            </tr>
          </thead>
          <tbody>
            {invoiceDetails.products.map((product, index) => (
              <tr key={index} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                <td className="border border-gray-300 dark:border-zinc-700 px-2 py-1">{product.productName}</td>
                <td className="border border-gray-300 dark:border-zinc-700 px-2 py-1 text-center">{product.qty}</td>
                <td className="border border-gray-300 dark:border-zinc-700 px-2 py-1 text-right">{product.rate} TK</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 space-y-1 text-sm text-slate-700 dark:text-zinc-300">
          <p><strong>Total Qty:</strong> {invoiceDetails.totalQty}</p>
          <p><strong>Discount:</strong> {invoiceDetails.discount} TK</p>
          <p><strong>Total Amount:</strong> <span className="text-blue-600 dark:text-blue-400 font-bold">{invoiceDetails.totalAmount} TK</span></p>
          <p><strong>Total Sale:</strong> {invoiceDetails.totalSale} TK</p>
        </div>
        <button
          onClick={handlePrint}
          className="mt-6 px-5 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-650 dark:hover:bg-blue-750 text-white rounded shadow-md transition duration-200"
        >
          Print
        </button>
      </div>
    </div>
  );
};

export default PrintPreview;
