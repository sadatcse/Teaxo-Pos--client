import React, { useState, useEffect, useContext, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ReactPaginate from "react-paginate";
import { FaCalendarAlt, FaTimes, FaPrint, FaEye, FaUndo, FaFilter, FaSearch } from "react-icons/fa";
import { MdPictureAsPdf, MdGridOn } from "react-icons/md";
import moment from "moment";
import { motion, AnimatePresence } from "framer-motion";

import UseAxiosSecure from "../../Hook/UseAxioSecure";
import { AuthContext } from "../../providers/AuthProvider";
import useCompanyHook from "../../Hook/useCompanyHook";
import useCustomerTableSearch from "../../Hook/useCustomerTableSearch";

import Mtitle from "../../components library/Mtitle";
import Summary from "../../components library/Summary";
import Preloader from "../../components/Shortarea/Preloader";
import ReceiptTemplate from "../../components/Receipt/ReceiptTemplate ";
import CustomReportPrint from "../../components/Receipt/CustomReportPrint";
import { generatePdf } from "../../components/utils/generateCustomPdfReport";
import { generateExcel } from "../../components/utils/generateCustomExcelReport";

const CustomOrder = () => {
    const { branch } = useContext(AuthContext);
    const { companies } = useCompanyHook();
    const { tables, users } = useCustomerTableSearch();
    const axiosSecure = UseAxiosSecure();

    const receiptRef = useRef();
    const customReportPrintRef = useRef();

    const [summary, setSummary] = useState(null);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const ordersPerPage = 10;

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
    const [isSummaryPrintModalOpen, setIsSummaryPrintModalOpen] = useState(false);
    const [printData, setPrintData] = useState(null);

    const orderTypeOptions = ["all", "dine-in", "takeaway", "delivery"];
    const orderStatusOptions = ["all", "pending", "completed", "cancelled"];
    const paymentMethodOptions = ["all", "Cash", "Visa Card", "Master Card", "Amex Card", "Bkash", "Nagad", "Rocket", "Bank"];
    const deliveryProviderOptions = ["all", "Pathao", "Foodi", "Foodpanda", "DeliveryBoy"];

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    const handleDateChange = (date, name) => {
        setFilters({ ...filters, [name]: date });
    };
    
    const buildQueryParams = (fetchAll = false) => {
        const { startDate, endDate, ...otherFilters } = filters;
        const formattedStartDate = moment(startDate).format("YYYY-MM-DD");
        const formattedEndDate = moment(endDate).format("YYYY-MM-DD");

        const queryParams = new URLSearchParams({
            startDate: formattedStartDate,
            endDate: formattedEndDate,
        });

        if (fetchAll) {
            queryParams.append("fetchAll", "true");
        } else {
            queryParams.append("page", currentPage + 1);
            queryParams.append("limit", ordersPerPage);
        }

        Object.entries(otherFilters).forEach(([key, value]) => {
            if (value && value !== "all") {
                queryParams.append(key, value);
            }
        });
        
        return queryParams;
    };


    const fetchFilteredOrders = async () => {
        if (!branch) return;
        setIsLoading(true);
        try {
            const queryParams = buildQueryParams();
            const response = await axiosSecure.get(`/invoice/${branch}/filtered-search?${queryParams.toString()}`);
            setOrders(response.data.invoices);
            setTotalPages(response.data.pagination.totalPages);
            setSummary(response.data.summary);
        } catch (error) {
            console.error("Error fetching filtered orders:", error);
            setOrders([]);
            setTotalPages(0);
            setSummary(null);
        } finally {
            setIsLoading(false);
        }
    };

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
        setCurrentPage(0);
    };

    useEffect(() => {
        if(branch) {
            fetchFilteredOrders();
        }
    }, [branch, currentPage]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(0);
        fetchFilteredOrders();
    };

    const handlePageClick = (selectedPage) => {
        setCurrentPage(selectedPage.selected);
    };

    const fetchAllDataForExport = async () => {
        if (!branch) return null;
        setIsExporting(true);
        try {
            const queryParams = buildQueryParams(true);
            const response = await axiosSecure.get(`/invoice/${branch}/filtered-search?${queryParams.toString()}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching all data for export:", error);
            alert("Failed to fetch data for export. Please try again.");
            return null;
        } finally {
            setIsExporting(false);
        }
    };
    
    const handleViewDetails = (order) => { setSelectedOrder(order); setShowModal(true); };
    const handlePrintOrder = (order) => { setPrintData(order); setIsPrintModalOpen(true); };
    const handlePrintComplete = () => { setIsPrintModalOpen(false); setPrintData(null); };
    const handleSummaryPrintComplete = () => setIsSummaryPrintModalOpen(false);

    const handlePrintSummary = () => {
        if (summary && orders.length > 0) {
            setIsSummaryPrintModalOpen(true);
        } else {
            alert("No data available to print.");
        }
    };

    const handleExportPdf = async () => {
        const exportData = await fetchAllDataForExport();
        if (exportData && exportData.invoices.length > 0) {
            const reportData = { invoices: exportData.invoices, summary: exportData.summary, company: companies[0], filters };
            generatePdf(reportData);
        } else if (exportData) {
            alert("No data available to export for the selected filters.");
        }
    };

    const handleExportExcel = async () => {
        const exportData = await fetchAllDataForExport();
        if (exportData && exportData.invoices.length > 0) {
            const reportData = { invoices: exportData.invoices, summary: exportData.summary, company: companies[0], filters };
            generateExcel(reportData);
        } else if (exportData) {
            alert("No data available to export for the selected filters.");
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-base-200 min-h-screen">
            <Mtitle title="Custom Order Report" rightcontent={
                <div className="flex items-center gap-2">
                    <motion.button disabled={isExporting} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handlePrintSummary} className="btn btn-ghost btn-circle text-blue-600 hover:bg-blue-100" title="Print POS Summary"><FaPrint className="text-xl" /></motion.button>
                    <motion.button disabled={isExporting} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleExportPdf} className="btn btn-ghost btn-circle text-blue-600 hover:bg-blue-100" title="Export as PDF">{isExporting ? <span className="loading loading-spinner"></span> : <MdPictureAsPdf className="text-xl" />}</motion.button>
                    <motion.button disabled={isExporting} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleExportExcel} className="btn btn-ghost btn-circle text-blue-600 hover:bg-blue-100" title="Export as Excel">{isExporting ? <span className="loading loading-spinner"></span> : <MdGridOn className="text-xl" />}</motion.button>
                </div>
            } />


<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  className="card bg-base-100 shadow-xl mt-6"
>
  <div className="card-body p-4 sm:p-6 lg:p-8">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 border-b border-slate-200 pb-4">
      <h2 className="text-xl font-semibold text-blue-600">Advanced Filters</h2>
    </div>
    <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
      {/* Row 1 */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold text-slate-700">From Date</span>
        </label>
        <DatePicker
          selected={filters.startDate}
          onChange={(date) => handleDateChange(date, "startDate")}
          className="input input-bordered w-full"
          dateFormat="MMMM d, yyyy"
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold text-slate-700">To Date</span>
        </label>
        <DatePicker
          selected={filters.endDate}
          onChange={(date) => handleDateChange(date, "endDate")}
          className="input input-bordered w-full"
          dateFormat="MMMM d, yyyy"
        />
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold text-slate-700">Order Type</span>
        </label>
        <select
          name="orderType"
          value={filters.orderType}
          onChange={handleFilterChange}
          className="select select-bordered capitalize"
        >
          {orderTypeOptions.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold text-slate-700">Order Status</span>
        </label>
        <select
          name="orderStatus"
          value={filters.orderStatus}
          onChange={handleFilterChange}
          className="select select-bordered capitalize"
        >
          {orderStatusOptions.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>
      
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold text-slate-700">Table Name</span>
        </label>
        <select
          name="tableName"
          value={filters.tableName}
          onChange={handleFilterChange}
          className="select select-bordered"
          disabled={filters.orderType !== 'dine-in'}
        >
          <option value="all">All Tables</option>
          {tables.map((t) => (
            <option key={t._id} value={t.tableName}>{t.tableName}</option>
          ))}
        </select>
      </div>

      {/* Row 2 */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold text-slate-700">Delivery Provider</span>
        </label>
        <select
          name="deliveryProvider"
          value={filters.deliveryProvider}
          onChange={handleFilterChange}
          className="select select-bordered"
          disabled={filters.orderType !== 'delivery'}
        >
          {deliveryProviderOptions.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold text-slate-700">Payment Method</span>
        </label>
        <select
          name="paymentMethod"
          value={filters.paymentMethod}
          onChange={handleFilterChange}
          className="select select-bordered"
        >
          {paymentMethodOptions.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold text-slate-700">User</span>
        </label>
        <select
          name="loginUserName"
          value={filters.loginUserName}
          onChange={handleFilterChange}
          className="select select-bordered"
        >
          <option value="all">All Users</option>
          {users.map((u) => (
            <option key={u._id} value={u.name}>{u.name}</option>
          ))}
        </select>
      </div>
      
      <div className="form-control">
        <label className="label">
          <span className="label-text font-semibold text-slate-700">Search</span>
        </label>
        <input
          type="text"
          name="searchQuery"
          value={filters.searchQuery}
          onChange={handleFilterChange}
          placeholder="Invoice ID..."
          className="input input-bordered w-full"
        />
      </div>

      <div className="flex items-end gap-2">
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={resetFilters}
            className="btn btn-ghost btn-square"
            title="Reset Filters"
        >
            <FaUndo />
        </motion.button>
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="btn bg-blue-600 hover:bg-blue-700 text-white btn-square"
            title="Apply Filters"
        >
            <FaFilter />
        </motion.button>
      </div>
    </form>
  </div>
</motion.div>

             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="card bg-base-100 shadow-xl mt-6">
                <div className="card-body p-4 sm:p-6 lg:p-8">
                     <h3 className="text-xl font-semibold text-blue-600 mb-4">Filtered Orders</h3>
                     {isLoading ? <div className="flex justify-center p-20"><Preloader /></div> : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="table w-full">
                                    <thead><tr className="bg-blue-600 text-white uppercase text-xs tracking-wider">
                                        <th className="rounded-tl-lg">#</th><th>Time</th><th>Invoice ID</th><th>Order Type</th><th>Status</th><th className="text-right">Amount</th><th className="text-center rounded-tr-lg">Action</th>
                                    </tr></thead>
                                    <tbody>
                                        <AnimatePresence>
                                            {orders.length > 0 ? ( orders.map((order, index) => (
                                                <motion.tr key={order._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover text-sm">
                                                    <td>{(currentPage * ordersPerPage) + index + 1}</td>
                                                    <td>{moment(order.dateTime).format("h:mm A")}</td>
                                                    <td className="font-mono">{order.invoiceSerial}</td>
                                                    <td className="capitalize">{order.orderType}</td>
                                                    <td className="capitalize">{order.orderStatus}</td>
                                                    <td className="text-right font-bold text-green-600">৳{order.totalAmount.toFixed(2)}</td>
                                                    <td><div className="flex justify-center items-center gap-2">
                                                        <button onClick={() => handleViewDetails(order)} className="btn btn-circle btn-sm bg-blue-600 hover:bg-blue-700 text-white" title="View"><FaEye /></button>
                                                        <button onClick={() => handlePrintOrder(order)} className="btn btn-circle btn-sm btn-ghost text-blue-600" title="Print"><FaPrint /></button>
                                                    </div></td>
                                                </motion.tr>
                                            ))) : ( <tr><td colSpan="7" className="text-center py-16 text-slate-500">No orders found for the selected filters.</td></tr> )}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                            {totalPages > 1 && (
                                <div className="mt-8 flex justify-center">
                                     <ReactPaginate
                                        previousLabel={"< Prev"} nextLabel={"Next >"} pageCount={totalPages} forcePage={currentPage} onPageChange={handlePageClick}
                                        containerClassName={"join"} pageLinkClassName={"join-item btn btn-sm"}
                                        previousLinkClassName={"join-item btn btn-sm"} nextLinkClassName={"join-item btn btn-sm"}
                                        activeLinkClassName={"btn-active"} disabledClassName={"btn-disabled"}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </motion.div>
            
            {!isLoading && summary && <Summary summary={summary} />}
            
   <AnimatePresence>
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
                {isPrintModalOpen && printData && ( 
                     <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-base-100 p-6 rounded-xl shadow-xl w-full max-w-md">
                            <h2 className="text-xl font-semibold text-blue-600 mb-4">Print Receipt</h2><p className="text-slate-700 mb-6">Click "Print Now" for Invoice: <span className="font-semibold">{printData.invoiceSerial}</span>.</p><div className="hidden"><ReceiptTemplate ref={receiptRef} onPrintComplete={handlePrintComplete} profileData={companies[0]} invoiceData={printData} /></div>
                            <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-slate-200"><button onClick={handlePrintComplete} className="btn rounded-xl">Cancel</button><button onClick={() => { if (receiptRef.current) { receiptRef.current.printReceipt(); } }} className="btn bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-md">Print Now</button></div>
                        </motion.div>
                    </div>
                )}
                
                {isSummaryPrintModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-base-100 p-6 rounded-xl shadow-xl w-full max-w-md">
                             <h2 className="text-xl font-semibold text-blue-600 mb-4">Print Custom Report Summary</h2>
                             <p className="text-slate-700 mb-6">Click "Print Now" to generate the summary for the selected date range.</p>
                             <div className="hidden"><CustomReportPrint ref={customReportPrintRef} profileData={companies[0]} summaryData={summary} filters={filters} /></div>
                             <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-slate-200"><button onClick={handleSummaryPrintComplete} className="btn rounded-xl">Cancel</button><button onClick={() => customReportPrintRef.current.printReceipt()} className="btn bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-md">Print Now</button></div>
                         </motion.div>
                     </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomOrder;