import React from 'react';

const Summary = ({ summary }) => {
  // If summary itself is missing, we can't proceed.
  if (!summary) return null;

  // ✅ FIX: Add default empty objects ({}) to every nested property.
  // This prevents the app from crashing if, for example, `summary.totalSales` is undefined.
  const {
    totalSales = {},
    taxesAndDiscounts = {},
    complimentaryItems = {},
    salesByOrderType = {},
    salesByPaymentMethod = {},
  } = summary;

  // ✅ FIX: Provide default values (like 0) for each metric.
  const { totalAmount = 0, averageOrderValue = 0, totalQty = 0 } = totalSales;
  const {
    totalVat = 0,
    totalSd = 0,
    totalDiscount = 0,
    totalDiscountedInvoices = 0,
    totalTableDiscount = 0,
    totalTableDiscountedInvoices = 0,
  } = taxesAndDiscounts;
  const { totalComplimentaryAmount = 0, totalComplimentaryItems = 0 } = complimentaryItems;

  const { dineIn = {}, takeaway = {}, delivery = {} } = salesByOrderType;
  const { cash = {}, card = {}, mobile = {}, bank = {} } = salesByPaymentMethod;

  const grossSales = totalAmount + totalDiscount;

  // A reusable component for a single data card
  const DataCard = ({ title, value, color, isVisible = true }) => {
    if (!isVisible) return null;
    return (
      <div className={`p-4 rounded-lg shadow-sm flex flex-col items-center justify-center text-center ${color}`}>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-xl md:text-2xl font-bold mt-1 text-gray-800">
          {value}
        </p>
      </div>
    );
  };

  // A reusable component for nested data cards
  const NestedCard = ({ title, children, total, invoiceCount, color, isVisible = true }) => {
    if (!isVisible) return null;
    return (
      <div className={`p-4 rounded-lg shadow-sm ${color}`}>
        <div className="flex flex-col items-center justify-center mb-2 border-b border-gray-300 pb-2">
          <p className="text-sm font-semibold text-gray-700">{title}</p>
          <div className="text-center mt-1">
            <p className="text-lg font-bold">৳{(total || 0).toFixed(2)}</p>
            <p className="text-xs text-gray-500">{invoiceCount || 0} Invoices</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 pl-4">
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl mt-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-200">
        Sales Summary
      </h2>

      {/* Main Financials Section */}
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Financial Totals</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        <DataCard title="Gross Sales" value={`৳${grossSales.toFixed(2)}`} color="bg-blue-100" isVisible={grossSales > 0} />
        <DataCard title="Net Sales" value={`৳${totalAmount.toFixed(2)}`} color="bg-green-100" isVisible={totalAmount > 0} />
        <DataCard title="Total Discount" value={`৳${totalDiscount.toFixed(2)}`} color="bg-orange-100" isVisible={totalDiscount > 0} />
        <DataCard title="Total VAT" value={`৳${totalVat.toFixed(2)}`} color="bg-yellow-100" isVisible={totalVat > 0} />
        <DataCard title="Total SD" value={`৳${totalSd.toFixed(2)}`} color="bg-red-100" isVisible={totalSd > 0} />
        <DataCard title="Table Discount" value={`৳${totalTableDiscount.toFixed(2)}`} color="bg-rose-100" isVisible={totalTableDiscount > 0} />
        <DataCard title="Total Items Sold" value={totalQty} color="bg-lime-100" isVisible={totalQty > 0} />
        <DataCard title="Avg. Order Value" value={`৳${averageOrderValue.toFixed(2)}`} color="bg-teal-100" isVisible={averageOrderValue > 0} />
        <DataCard title="Complimentary Items" value={totalComplimentaryItems} color="bg-purple-100" isVisible={totalComplimentaryItems > 0} />
        <DataCard title="Complimentary Amount" value={`৳${totalComplimentaryAmount.toFixed(2)}`} color="bg-indigo-100" isVisible={totalComplimentaryAmount > 0} />
        <DataCard title="Discounted Invoices" value={totalDiscountedInvoices} color="bg-fuchsia-100" isVisible={totalDiscountedInvoices > 0} />
        <DataCard title="Table Discount Invoices" value={totalTableDiscountedInvoices} color="bg-blue-200" isVisible={totalTableDiscountedInvoices > 0} />
      </div>

      {/* Sales by Order Type Section */}
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Sales by Order Type</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DataCard title="Dine-in Sales" value={`৳${(dineIn.totalAmount || 0).toFixed(2)}`} color="bg-cyan-100" isVisible={dineIn.totalAmount > 0} />
        <DataCard title="Takeaway Sales" value={`৳${(takeaway.totalAmount || 0).toFixed(2)}`} color="bg-sky-100" isVisible={takeaway.totalAmount > 0} />
        <DataCard title="Delivery Sales" value={`৳${(delivery.totalAmount || 0).toFixed(2)}`} color="bg-pink-100" isVisible={delivery.totalAmount > 0} />
      </div>

      {/* Sales by Payment Method Section */}
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Sales by Payment Method</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DataCard title="Cash Collection" value={`৳${(cash.totalAmount || 0).toFixed(2)}`} color="bg-gray-100" isVisible={cash.totalAmount > 0} />
        <NestedCard title="Card Collection" total={card.totalAmount} invoiceCount={card.invoiceCount} color="bg-gray-100" isVisible={card.totalAmount > 0}>
          {/* ✅ FIX: Use optional chaining (?.) and fallbacks to safely access deeply nested values */}
          <DataCard title="Visa Card" value={`৳${(card.visaCard?.totalAmount || 0).toFixed(2)}`} color="bg-white" isVisible={card.visaCard?.totalAmount > 0} />
          <DataCard title="Master Card" value={`৳${(card.masterCard?.totalAmount || 0).toFixed(2)}`} color="bg-white" isVisible={card.masterCard?.totalAmount > 0} />
          <DataCard title="Amex Card" value={`৳${(card.amexCard?.totalAmount || 0).toFixed(2)}`} color="bg-white" isVisible={card.amexCard?.totalAmount > 0} />
        </NestedCard>
        <NestedCard title="Mobile Banking" total={mobile.totalAmount} invoiceCount={mobile.invoiceCount} color="bg-gray-100" isVisible={mobile.totalAmount > 0}>
          <DataCard title="Bkash" value={`৳${(mobile.bkash?.totalAmount || 0).toFixed(2)}`} color="bg-white" isVisible={mobile.bkash?.totalAmount > 0} />
          <DataCard title="Nagad" value={`৳${(mobile.nagad?.totalAmount || 0).toFixed(2)}`} color="bg-white" isVisible={mobile.nagad?.totalAmount > 0} />
          <DataCard title="Rocket" value={`৳${(mobile.rocket?.totalAmount || 0).toFixed(2)}`} color="bg-white" isVisible={mobile.rocket?.totalAmount > 0} />
        </NestedCard>
        <DataCard title="Bank Collection" value={`৳${(bank.totalAmount || 0).toFixed(2)}`} color="bg-gray-100" isVisible={bank.totalAmount > 0} />
      </div>

      {/* Delivery Provider Section (Conditionally Rendered) */}
      {(delivery.invoiceCount || 0) > 0 && (
        <>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Delivery Provider Sales</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {Object.keys(delivery.providers || {}).map((providerKey) => {
              const provider = delivery.providers[providerKey];
              return (
                <DataCard
                  key={providerKey}
                  title={providerKey.charAt(0).toUpperCase() + providerKey.slice(1)}
                  value={`৳${(provider.totalAmount || 0).toFixed(2)}`}
                  color="bg-gray-50"
                  isVisible={provider.totalAmount > 0}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Summary;