
import { FaPlus, FaMinus, FaTrash, FaSearch } from "react-icons/fa";


// OrderSummary Component
const OrderSummary = ({
  customer, mobile, setMobile, handleCustomerSearch, isCustomerModalOpen, setCustomerModalOpen,
  orderType, handleOrderTypeChange, TableName, deliveryProvider,
  addedProducts, incrementQuantity, decrementQuantity, removeProduct,
  invoiceSummary, setInvoiceSummary, subtotal, vat, payable, paid, change,
  printInvoice, handleKitchenClick, resetOrder, isProcessing, selectedPaymentMethod,
  handlePaymentMethodSelect,
}) => {

  const handlePaymentButtonClick = (method) => {
    handlePaymentMethodSelect(method);

  };


  return (
    <div className="w-full lg:w-2/6 p-4"> {/* Added padding for overall component */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6"> {/* Increased padding, rounded corners, and shadow */}
        {/* This grid layout ensures responsiveness for mobile input and order type specific fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6"> {/* Used grid for better responsiveness */}
          <div className="flex flex-col">
            <label htmlFor="mobileInput" className="block text-sm font-semibold text-gray-700 mb-2">Enter Mobile Number:</label>
            <div className="flex gap-1"> {/* Increased gap */}
              <input
                id="mobileInput"
                type="text"
                className="flex-grow border border-gray-300 px-1 py-2.5 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" // Slightly more padding
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
                  <button
                className="px-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 ease-in-out shadow-md" // Darker blue, more padding, larger shadow
                onClick={handleCustomerSearch}
              >
                <FaSearch className="text-lg" /> {/* Replaced "Search" text with FaSearch icon */}
              </button>
            </div>
          </div>
          {orderType === 'dine-in' && (
            <div className="flex flex-col">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Selected Table:</label>
              <div className="px-1 py-2.5  border border-gray-300 rounded-lg bg-gray-100 font-bold text-center text-gray-800 h-10 flex items-center justify-center"> {/* Centered text vertically */}
                {TableName || 'N/A'}
              </div>
            </div>
          )}
          {orderType === 'delivery' && (
            <div className="flex flex-col">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Provider:</label>
              <div className="px-1 py-2.5 border border-gray-300 rounded-lg bg-gray-100 font-bold text-center text-gray-800 h-10 flex items-center justify-center"> {/* Centered text vertically */}
                {deliveryProvider || 'N/A'}
              </div>
            </div>
          )}
        </div>

        {customer && (
          <div className="mb-6 p-4 border border-blue-300 rounded-lg bg-blue-50 text-blue-800 shadow-sm"> {/* Refined colors and shadow */}
            <p className="font-semibold text-base">Customer Name: <span className="font-normal">{customer.name}</span></p>
            <p className="font-semibold text-base">Customer Mobile: <span className="font-normal">{customer.mobile}</span></p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6"> {/* Increased padding, rounded corners, and shadow */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 pb-4 border-b border-gray-200"> {/* Adjusted alignment */}
          <h2 className="text-2xl font-bold text-gray-800 mb-3 sm:mb-0">Invoice Summary</h2>
          <select
            value={orderType || ''}
            onChange={(e) => handleOrderTypeChange(e.target.value)}
            className="border border-gray-300 px-4 py-2 rounded-lg text-gray-700 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" // More padding, rounded
          >
            <option value="dine-in">Dine-in</option>
            <option value="takeaway">Takeaway</option>
            <option value="delivery">Delivery</option>
          </select>
        </div>

        {/* Added Products Table */}
        <div className="overflow-x-auto max-h-80 mb-6 border border-gray-200 rounded-lg shadow-inner custom-scrollbar"> {/* Increased max-height, rounded, inner shadow */}
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100 sticky top-0"> {/* Sticky header */}
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th> {/* Increased padding, darker text */}
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {addedProducts.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-6 text-center text-gray-500 italic">No products added yet.</td> {/* Increased padding, italicized */}
                </tr>
              ) : (
                addedProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors duration-150"> {/* Hover effect */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{product.productName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => decrementQuantity(product._id)}
                          className="p-1.5 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400" // Added focus styles
                        >
                          <FaMinus className="text-gray-600 text-xs" />
                        </button>
                        <span className="font-semibold text-base">{product.quantity}</span> {/* Larger font size */}
                        <button
                          onClick={() => incrementQuantity(product._id)}
                          className="p-1.5 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400" // Added focus styles
                        >
                          <FaPlus className="text-gray-600 text-xs" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 text-right font-medium">{product.price * product.quantity} TK</td> {/* Added font-medium */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                      <button
                        onClick={() => removeProduct(product._id)}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400" // Added focus styles
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Invoice Summary Details */}
        <div className="mt-4">
          <table className="w-full border-collapse">
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="px-4 py-2.5 text-gray-700 text-base">Sub Total (TK):</td> {/* Increased padding, larger text */}
                <td className="px-4 py-2.5 text-right font-semibold text-gray-900 text-base">{subtotal}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="px-4 py-2.5 text-gray-700 text-base">VAT (TK):</td>
                <td className="px-4 py-2.5 text-right font-semibold text-gray-900 text-base">{vat}</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="px-4 py-2.5 text-gray-700 text-base">Discount (TK):</td>
                <td className="px-4 py-2.5 text-right">
                  <input
                    type="number"
                    className="border border-gray-300 px-3 py-1.5 w-28 text-right rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" // Larger input
                    value={invoiceSummary.discount}
                    onChange={(e) => setInvoiceSummary({ ...invoiceSummary, discount: parseFloat(e.target.value) || 0 })}
                  />
                </td>
              </tr>
              <tr className="border-b border-gray-200 bg-blue-50">
                <td className="px-4 py-3 font-bold text-blue-800 text-lg">Total Amount (TK):</td> {/* Larger text, more padding */}
                <td className="px-4 py-3 text-right font-bold text-blue-800 text-xl">{payable}</td> {/* Larger text */}
              </tr>
              <tr className="border-b border-gray-200">
                <td className="px-4 py-2.5 text-gray-700 text-base">Paid Amount (TK):</td>
                <td className="px-4 py-2.5 text-right">
                  <input
                    type="number"
                    className="border border-gray-300 px-3 py-1.5 w-28 text-right rounded-md focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" // Larger input
                    value={invoiceSummary.paid}
                    onChange={(e) => setInvoiceSummary({ ...invoiceSummary, paid: parseFloat(e.target.value) || 0 })}
                  />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 text-gray-700 text-base">Change Amount (TK):</td>
                <td className="px-4 py-2.5 text-right font-semibold text-gray-900 text-base">{change}</td>
              </tr>
            </tbody>
          </table>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow-inner mt-6"> {/* Added margin top, shadow */}
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Payment Method</h3> {/* Larger margin bottom */}
            <div className="flex flex-wrap justify-center gap-3"> {/* Used flex-wrap and gap for better spacing on small screens */}
              <button
                onClick={() => handlePaymentButtonClick("Cash")}
                className={`flex-1 min-w-[100px] py-3 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105
                  ${selectedPaymentMethod === "Cash" ? "bg-blue-600 text-white shadow-lg" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`} // Added transform and hover scale
                disabled={isProcessing}
              >
                Cash
              </button>
              <button
                onClick={() => handlePaymentButtonClick("Card")}
                className={`flex-1 min-w-[100px] py-3 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105
                  ${selectedPaymentMethod === "Card" ? "bg-blue-600 text-white shadow-lg" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                disabled={isProcessing}
              >
                Card
              </button>
              <button
                onClick={() => handlePaymentButtonClick("Mobile")}
                className={`flex-1 min-w-[100px] py-3 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105
                  ${selectedPaymentMethod === "Mobile" ? "bg-blue-600 text-white shadow-lg" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                disabled={isProcessing}
              >
                Mobile
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6"> {/* Used grid for better responsiveness */}
            <button
              onClick={() => printInvoice(false)}
              className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 ease-in-out shadow-md text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-green-400"
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Save"}
            </button>
            <button
              onClick={() => printInvoice(true)}
              className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 ease-in-out shadow-md text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Print"}
            </button>
            <button
              onClick={handleKitchenClick}
              className="px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-200 ease-in-out shadow-md text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400"
              disabled={isProcessing}
            >
              Kitchen
            </button>
            <button
              onClick={resetOrder}
              className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 ease-in-out shadow-md text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-red-400"
              disabled={isProcessing}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
