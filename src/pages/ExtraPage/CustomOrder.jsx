import React, { useState, useEffect, useContext, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ReactPaginate from "react-paginate";
import { FaCalendarAlt, FaSearch } from "react-icons/fa";
import moment from "moment";
import Preloader from "../../components/Shortarea/Preloader";
import UseAxiosSecure from "../../Hook/UseAxioSecure";
import { AuthContext } from "../../providers/AuthProvider";
import Mtitle from "../../components library/Mtitle";
import { FaTimes, FaPrint, FaEye } from "react-icons/fa";
import useCompanyHook from "../../Hook/useCompanyHook";
import ReceiptTemplate from "../../components/Receipt/ReceiptTemplate ";
 import Summary from "../../components library/Summary";
const CustomOrder = () => {
  const { branch } = useContext(AuthContext);
  const { companies } = useCompanyHook();
  const axiosSecure = UseAxiosSecure();
  const receiptRef = useRef();
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const ordersPerPage = 10;

  // Filter states
  const [filters, setFilters] = useState({
    startDate: new Date(),
    endDate: new Date(),
    orderType: "all",
    orderStatus: "all",
    tableName: "all",
    deliveryProvider: "all",
    paymentMethod: "all",
    loginUserName: "all",
    searchQuery: "",
  });

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printData, setPrintData] = useState(null);

  // Hardcoded options for filters as requested
  const orderTypeOptions = ["all", "dine-in", "takeaway", "delivery"];
  const orderStatusOptions = ["all", "pending", "completed", "cancelled"];
  const paymentMethodOptions = ["all", "Cash", "Visa Card", "Master Card", "Amex Card", "Bkash", "Nagad", "Rocket", "Bank"];
  const deliveryProviderOptions = ["all", "Pathao", "Foodi", "Foodpanda", "DeliveryBoy"];
  const tableNameOptions = ["all", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
  const loginUserOptions = ["all", "Sadat", "Babu", "sakil"];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleDateChange = (date, name) => {
    setFilters({ ...filters, [name]: date });
  };

  const fetchFilteredOrders = async () => {
    if (!branch) return;
    setIsLoading(true);
    try {
      const {
        startDate,
        endDate,
        orderType,
        orderStatus,
        tableName,
        deliveryProvider,
        paymentMethod,
        loginUserName,
        searchQuery,
      } = filters;

      const formattedStartDate = moment(startDate).format("YYYY-MM-DD");
      const formattedEndDate = moment(endDate).format("YYYY-MM-DD");

      const queryParams = new URLSearchParams({
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        page: currentPage + 1,
        limit: ordersPerPage,
      });

      if (orderType !== "all") queryParams.append("orderType", orderType);
      if (orderStatus !== "all") queryParams.append("orderStatus", orderStatus);
      if (tableName !== "all") queryParams.append("tableName", tableName);
      if (deliveryProvider !== "all") queryParams.append("deliveryProvider", deliveryProvider);
      if (paymentMethod !== "all") queryParams.append("paymentMethod", paymentMethod);
      if (loginUserName !== "all") queryParams.append("loginUserName", loginUserName);
      if (searchQuery) queryParams.append("searchQuery", searchQuery);

      const response = await axiosSecure.get(`/invoice/${branch}/filtered-search?${queryParams.toString()}`);
      
      setOrders(response.data.invoices);
      setTotalPages(response.data.pagination.totalPages);
      setTotalInvoices(response.data.pagination.total);
      setSummary(response.data.summary);
    } catch (error) {
      console.error("Error fetching filtered orders:", error);
      setOrders([]);
      setTotalPages(0);
      setTotalInvoices(0);
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  // NEW: Function to reset all filters to their initial state
  const resetFilters = () => {
    setFilters({
      startDate: new Date(),
      endDate: new Date(),
      orderType: "all",
      orderStatus: "all",
      tableName: "all",
      deliveryProvider: "all",
      paymentMethod: "all",
      loginUserName: "all",
      searchQuery: "",
    });
    setCurrentPage(0); // Reset pagination to the first page
  };

  useEffect(() => {
    fetchFilteredOrders();
  }, [branch, currentPage, filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0); // Reset to page 1 on new search
    // The useEffect hook will be triggered by the filter state change
  };

  const handlePageClick = (selectedPage) => {
    setCurrentPage(selectedPage.selected);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handlePrintOrder = (order) => {
    setPrintData(order);
    setIsPrintModalOpen(true);
  };

  const handlePrintComplete = () => {
    setIsPrintModalOpen(false);
    setPrintData(null);
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6 font-sans">
      <Mtitle title="Custom Order Report" />
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 border-b border-gray-200 pb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Advanced Filters</h2>
          <button
            type="button"
            onClick={resetFilters} // <-- Add onClick handler
            className="mt-3 md:mt-0 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Reset Filters
          </button>
        </div>

        <form
          onSubmit={handleSearch}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* From Date */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2 text-gray-700">
              From Date
            </label>
            <div className="relative">
              <DatePicker
                selected={filters.startDate}
                onChange={(date) => handleDateChange(date, "startDate")}
                className="w-full p-3 pl-12 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                dateFormat="MMMM d, yyyy"
              />
              <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* To Date */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2 text-gray-700">To Date</label>
            <div className="relative">
              <DatePicker
                selected={filters.endDate}
                onChange={(date) => handleDateChange(date, "endDate")}
                className="w-full p-3 pl-12 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                dateFormat="MMMM d, yyyy"
              />
              <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Order Type */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2 text-gray-700">Order Type</label>
            <select
              name="orderType"
              value={filters.orderType}
              onChange={handleFilterChange}
              className="w-full p-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all capitalize"
            >
              {orderTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Order Status */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2 text-gray-700">Order Status</label>
            <select
              name="orderStatus"
              value={filters.orderStatus}
              onChange={handleFilterChange}
              className="w-full p-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all capitalize"
            >
              {orderStatusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Table Name */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2 text-gray-700">Table Name</label>
            <select
              name="tableName"
              value={filters.tableName}
              onChange={handleFilterChange}
              className="w-full p-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              disabled={filters.orderType !== "dine-in"}
            >
              {tableNameOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "All" : `Table ${option}`}
                </option>
              ))}
            </select>
          </div>

          {/* Delivery Provider */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2 text-gray-700">
              Delivery Provider
            </label>
            <select
              name="deliveryProvider"
              value={filters.deliveryProvider}
              onChange={handleFilterChange}
              className="w-full p-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              disabled={filters.orderType !== "delivery"}
            >
              {deliveryProviderOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2 text-gray-700">
              Payment Method
            </label>
            <select
              name="paymentMethod"
              value={filters.paymentMethod}
              onChange={handleFilterChange}
              className="w-full p-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              {paymentMethodOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* User */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold mb-2 text-gray-700">User</label>
            <select
              name="loginUserName"
              value={filters.loginUserName}
              onChange={handleFilterChange}
              className="w-full p-3 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              {loginUserOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col">
            <label className="text-sm font-semibold mb-2 text-gray-700">Search</label>
            <div className="relative">
              <input
                type="text"
                name="searchQuery"
                value={filters.searchQuery}
                onChange={handleFilterChange}
                placeholder="Invoice ID, Amount, Staff, Table..."
                className="w-full p-3 pl-12 border border-gray-300 rounded-xl text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Submit */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1 flex items-end">
            <button
              type="submit"
              className="w-full px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </form>
      </div>
<div>
          <div className="bg-white p-6 rounded-xl shadow-lg mt-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-200">
          Filtered Orders
        </h2>
        {isLoading ? (
          <div className="flex justify-center items-center h-full min-h-[400px]">
            <Preloader />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full min-w-[800px] text-left">
                <thead className="bg-gray-50 text-sm text-gray-600 uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-4 font-semibold">#</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Time</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Invoice ID</th>
                    <th className="p-4 font-semibold">Order Type</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Total Amount</th>
                    <th className="p-4 font-semibold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.length > 0 ? (
                    orders.map((order, index) => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors text-sm text-gray-700">
                        <td className="p-4">{(currentPage * ordersPerPage) + index + 1}</td>
                        <td className="p-4 whitespace-nowrap">{moment(order.dateTime).format("h:mm A")}</td>
                        <td className="p-4 font-mono text-blue-600 whitespace-nowrap">{order.invoiceSerial}</td>
                        <td className="p-4 capitalize">{order.orderType}</td>
                        <td className="p-4 capitalize">{order.orderStatus}</td>
                        <td className="p-4 font-bold text-right text-green-600">৳{order.totalAmount.toFixed(2)}</td>
                        <td className="p-4">
                          <div className="flex justify-center items-center gap-4">
                            <button
                              onClick={() => handleViewDetails(order)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              title="View Details"
                            >
                              <FaEye size={20} />
                            </button>
                            <button
                              onClick={() => handlePrintOrder(order)}
                              className="text-gray-500 hover:text-gray-800 transition-colors"
                              title="Print Receipt"
                            >
                              <FaPrint size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-16 text-gray-500">
                        No orders found for the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <ReactPaginate
                  previousLabel={"< Prev"}
                  nextLabel={"Next >"}
                  pageCount={totalPages}
                  forcePage={currentPage}
                  onPageChange={handlePageClick}
                  containerClassName={"flex flex-wrap justify-center items-center gap-2 text-sm font-medium"}
                  pageLinkClassName={"px-4 py-2 rounded-lg transition-colors bg-white border border-gray-300 hover:bg-gray-100 text-gray-700"}
                  previousLinkClassName={"px-4 py-2 rounded-lg bg-gray-50 border border-gray-300 hover:bg-gray-100 transition-colors text-gray-700"}
                  nextLinkClassName={"px-4 py-2 rounded-lg bg-gray-50 border border-gray-300 hover:bg-gray-100 transition-colors text-gray-700"}
                  activeLinkClassName={"!bg-blue-600 !text-white !border-blue-600 hover:!bg-blue-700"}
                  disabledClassName={"opacity-50 cursor-not-allowed"}
                />
              </div>
            )}
          </>
        )}
      </div>
        {summary && <Summary summary={summary} />}
</div>


      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl transform transition-all max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b bg-gray-50 rounded-t-lg">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Order Details</h2>
                <p className="text-sm text-gray-500 font-mono">Invoice: {selectedOrder.invoiceSerial}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-rose-500 transition-colors">
                <FaTimes size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm border-b pb-4">
                <div className="space-y-1.5">
                  <p>
                    <strong>Staff:</strong> {selectedOrder.loginUserName}
                  </p>
                  <p>
                    <strong>Order Type:</strong> <span className="capitalize">{selectedOrder.orderType}</span>
                  </p>
                  {selectedOrder.tableName && (
                    <p>
                      <strong>Table Name:</strong> {selectedOrder.tableName}
                    </p>
                  )}
                  {selectedOrder.deliveryProvider && (
                    <p>
                      <strong>Delivery Provider:</strong> {selectedOrder.deliveryProvider}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <p>
                    <strong>Payment:</strong> <span className="font-semibold">{selectedOrder.paymentMethod}</span>
                  </p>
                  <p>
                    <strong>Counter:</strong> {selectedOrder.counter}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-3">Products</h3>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 text-gray-600">
                      <tr>
                        <th className="p-3 text-left font-semibold">Product Name</th>
                        <th className="p-3 text-center font-semibold">Qty</th>
                        <th className="p-3 text-right font-semibold">Rate</th>
                        <th className="p-3 text-right font-semibold">VAT</th>
                        <th className="p-3 text-right font-semibold">SD</th>
                        <th className="p-3 text-right font-semibold">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrder.products.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="p-3 font-medium text-gray-800">
                            {item.productName}
                            {item.isComplimentary && <span className="ml-1 text-[10px] text-emerald-600 font-bold">(Free)</span>}
                          </td>
                          <td className="p-3 text-center text-gray-600">{item.qty}</td>
                          <td className="p-3 text-right text-gray-600">
                            {item.isComplimentary ? <span className="line-through text-gray-400">৳{item.rate.toFixed(2)}</span> : `৳${item.rate.toFixed(2)}`}
                          </td>
                          <td className="p-3 text-right text-gray-600">{`৳${(item.vat || 0).toFixed(2)}`}</td>
                          <td className="p-3 text-right text-gray-600">{`৳${(item.sd || 0).toFixed(2)}`}</td>
                          <td className="p-3 text-right font-bold text-gray-800">
                            {item.isComplimentary ? "৳0.00" : `৳${item.subtotal.toFixed(2)}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <div className="text-sm space-y-2 w-full max-w-xs ml-auto">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium text-gray-800">
                      ৳{(selectedOrder.totalSale - selectedOrder.vat - (selectedOrder.sd || 0)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total VAT:</span>
                    <span className="font-medium text-gray-800">+ ৳{selectedOrder.vat.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total SD:</span>
                    <span className="font-medium text-gray-800">+ ৳{(selectedOrder.sd || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-medium text-rose-500">- ৳{selectedOrder.discount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t mt-2 border-gray-200">
                    <span className="text-gray-900">Grand Total:</span>
                    <span className="text-blue-600">৳{selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t rounded-b-lg flex flex-wrap justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm bg-gray-200 rounded-md hover:bg-gray-300 transition-colors font-medium text-gray-700">
                Close
              </button>
              <button
                onClick={() => handlePrintOrder(selectedOrder)}
                className="flex items-center gap-2 px-5 py-2.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                <FaPrint /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {isPrintModalOpen && printData && companies[0] && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 relative">
            <button onClick={() => setIsPrintModalOpen(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-3xl font-bold">&times;</button>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Print Receipt</h2>
            <p className="text-gray-700 mb-6">
              Click "Print Now" to generate the receipt for Invoice: <span className="font-semibold">{printData.invoiceSerial}</span>.
            </p>
            <div className="hidden">
              <ReceiptTemplate ref={receiptRef} onPrintComplete={handlePrintComplete} profileData={companies[0]} invoiceData={printData} />
            </div>
            <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gray-200">
              <button onClick={() => setIsPrintModalOpen(false)} className="bg-gray-500 text-white py-2 px-5 rounded-md hover:bg-gray-600 transition duration-300 font-semibold">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (receiptRef.current) {
                    receiptRef.current.printReceipt();
                  }
                }}
                className="bg-blue-600 text-white py-2 px-5 rounded-md hover:bg-blue-700 transition duration-300 font-semibold"
              >
                Print Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomOrder;