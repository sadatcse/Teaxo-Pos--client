import { useState, useEffect, useContext, useRef, useCallback } from "react";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  FaFilter,
  FaSearch,
  FaEye,
  FaPrint,
  FaTimesCircle,
  FaUser,
  FaCalendarAlt,
  FaHashtag,
  FaMoneyBillWave,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
  FaQrcode,
} from "react-icons/fa";

import Mtitle from "../../components library/Mtitle";
import UseAxiosSecure from "../../Hook/UseAxioSecure";
import { AuthContext } from "../../providers/AuthProvider";
import useCompanyHook from "../../Hook/useCompanyHook";
import ReceiptTemplate from "../../components/Receipt/ReceiptTemplate ";
import MtableLoading from "../../components library/MtableLoading"; // Changed import
import QRCodeGenerator from "../../components/QRCodeGenerator";
import useActionPermissions from "../../Hook/useActionPermissions";

// Custom hook for debouncing input
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

const OrdersHistory = () => {
  const axiosSecure = UseAxiosSecure();
  const { companies, loading: companyLoading } = useCompanyHook();
  const receiptRef = useRef();
  const { user, branch } = useContext(AuthContext);
    const { canPerform, loading: permissionsLoading } = useActionPermissions();

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({
    totalDocs: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const itemsPerPage = 15;

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  // Removed paymentStatus from filters state
  const [filters, setFilters] = useState({
    orderType: "",
    orderStatus: "",
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

const fetchOrders = useCallback(async (pageToFetch) => {
    if (!branch) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);
      
      // --- FIX: Format as YYYY-MM-DD to prevent UTC shift during transit ---
      const formatDate = (date) => {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      };

      if (startDate) params.append("startDate", formatDate(startDate));
      if (endDate) params.append("endDate", formatDate(endDate));
      
      if (filters.orderType) params.append("orderType", filters.orderType);
      if (filters.orderStatus) params.append("orderStatus", filters.orderStatus);

      params.append("page", pageToFetch);
      params.append("limit", itemsPerPage);

      const response = await axiosSecure.get(`/invoice/${branch}/filter?${params.toString()}`);
      
      setOrders(response.data.data);
      setPaginationInfo(response.data.pagination);

    } catch (error) {
      console.error("Error fetching orders:", error);
      Swal.fire("Error!", "Failed to fetch orders.", "error");
    }
    setIsLoading(false);
  }, [axiosSecure, branch, debouncedSearchTerm, startDate, endDate, filters, itemsPerPage]);

  useEffect(() => {
    fetchOrders(currentPage);
  }, [fetchOrders, currentPage]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm, startDate, endDate, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    // Removed paymentStatus from filter reset
    setFilters({ orderType: "", orderStatus: "" });
    setSearchTerm("");
    setDateRange([null, null]);
    setIsFilterOpen(false);
    setCurrentPage(1);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handlePrintOrder = () => {
    setIsViewModalOpen(false);
    setIsPrintModalOpen(true);
  };

  const handleQRCodeClick = () => {
    setIsViewModalOpen(false);
    setIsQrModalOpen(true);
  };

  const handlePrintComplete = () => {
    setIsPrintModalOpen(false);
    if (receiptRef.current) {
      receiptRef.current.printReceipt();
    }
  };

  const handleDeleteOrder = (orderId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axiosSecure.delete(`/invoice/delete/${orderId}`);
          if (response.status === 200) {
            Swal.fire('Deleted!', response.data.message || 'The order has been deleted.', 'success');
            fetchOrders(currentPage); 
          } else {
            Swal.fire('Error!', response.data.message || 'Failed to delete the order.', 'error');
          }
        } catch (error) {
          console.error("Error deleting order:", error);
          const errorMessage = error.response?.data?.message || 'An error occurred.';
          Swal.fire('Error!', errorMessage, 'error');
        }
      }
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700 dark:bg-green-950/45 dark:text-green-400';
      case 'unpaid': return 'bg-red-100 text-red-700 dark:bg-red-950/45 dark:text-red-400';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/45 dark:text-yellow-400';
      case 'completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-950/45 dark:text-blue-400';
      case 'cancelled': return 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-400';
      case 'cooking': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/45 dark:text-indigo-400';
      case 'served': return 'bg-purple-100 text-purple-700 dark:bg-purple-950/45 dark:text-purple-400';
      default: return 'bg-gray-100 dark:bg-zinc-800';
    }
  };

  return (
    <div className="p-4 md:p-6 min-h-screen bg-gray-50 dark:bg-zinc-950">
      <Mtitle title="Orders History" />

      <div className="mb-4 p-4 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-slate-100 dark:border-zinc-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="w-full">
            <DatePicker
              selectsRange={true}
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => setDateRange(update)}
              isClearable={true}
              placeholderText="Pick a date range"
              className="w-full p-2 bg-white dark:bg-zinc-850 text-gray-700 dark:text-zinc-150 border border-slate-200 dark:border-zinc-700 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative w-full">
            <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search Invoice ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 pl-10 bg-white dark:bg-zinc-850 text-gray-700 dark:text-zinc-150 border border-slate-200 dark:border-zinc-700 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="relative w-full">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-full flex items-center justify-center gap-2 p-2 border border-slate-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-850 text-gray-750 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
            >
              <FaFilter className="text-gray-600 dark:text-zinc-400" />
              <span>Filter by column</span>
            </button>
            {isFilterOpen && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-lg shadow-xl z-20 p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-zinc-350">Order Type</label>
                    <select
                      name="orderType"
                      value={filters.orderType}
                      onChange={handleFilterChange}
                      className="mt-1 block w-full p-2 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-150 border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">All</option>
                      <option value="dine-in">Dine-In</option>
                      <option value="takeaway">Takeaway</option>
                      <option value="delivery">Delivery</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-zinc-350">Order Status</label>
                    <select
                      name="orderStatus"
                      value={filters.orderStatus}
                      onChange={handleFilterChange}
                      className="mt-1 block w-full p-2 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-150 border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">All</option>
                      <option value="pending">Pending</option>
                      <option value="cooking">Cooking</option>
                      <option value="served">Served</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <button onClick={clearFilters} className="w-full p-2 mt-2 text-sm text-gray-600 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-800 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-750">
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm rounded-lg">
        <section className="overflow-x-auto">
          {isLoading ? (
            <MtableLoading />
          ) : (
            <table className="table w-full">
              <thead className="bg-blue-600 dark:bg-zinc-800">
                <tr className="text-sm font-semibold text-white dark:text-zinc-200 uppercase tracking-wider text-left">
                  <th className="p-3">Date</th>
                  <th className="p-3">Invoice ID</th>
                  <th className="p-3">Order Type</th>
                  <th className="p-3">Final Price</th>
                  <th className="p-3">Order Status</th>
                  <th className="p-3">Server</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-10 text-gray-500 dark:text-zinc-400">No orders found for the selected criteria.</td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/40 border-t border-slate-100 dark:border-zinc-850">
                      <td className="p-3 text-sm text-gray-800 dark:text-zinc-300">{new Date(order.dateTime).toLocaleString()}</td>
                      <td className="p-3 text-sm font-mono text-gray-600 dark:text-zinc-400">{order.invoiceSerial}</td>
                      <td className="p-3 text-sm text-gray-700 dark:text-zinc-400 capitalize">{order.orderType.replace('-', ' ')}</td>
                      <td className="p-3 text-sm font-medium text-gray-900 dark:text-zinc-200">{order.totalAmount.toFixed(2)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusClass(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="p-3 text-sm text-gray-700 dark:text-zinc-450">{order.loginUserName}</td>
                      <td className="p-3">
                                         <div className="flex justify-center items-center gap-3">
                                                {canPerform("Orders History", "view") && (
                                                    <button onClick={() => handleViewOrder(order)} className="text-blue-600 dark:text-blue-450 hover:text-blue-800 dark:hover:text-blue-300 transition" title="View Order"><FaEye size={18} /></button>
                                                )}
                                                {canPerform("Orders History", "delete") && (
                                                    <button onClick={() => handleDeleteOrder(order._id)} className="text-red-600 dark:text-red-450 hover:text-red-800 dark:hover:text-red-300 transition" title="Delete Order"><FaTrash size={16} /></button>
                                                )}
                                            </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </section>

        {paginationInfo && paginationInfo.totalPages > 1 && !isLoading && (
          <div className="flex items-center justify-between p-4 border-t dark:border-zinc-800">
            <span className="text-sm text-gray-600 dark:text-zinc-400">
              Page{" "}
              <strong className="font-semibold text-gray-800 dark:text-zinc-300">{currentPage}</strong> of{" "}
              <strong className="font-semibold text-gray-800 dark:text-zinc-300">{paginationInfo.totalPages}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!paginationInfo.hasPrevPage}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-zinc-300 bg-white dark:bg-zinc-850 border border-slate-200 dark:border-zinc-800 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-805 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaChevronLeft size={12} />
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!paginationInfo.hasNextPage}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-zinc-300 bg-white dark:bg-zinc-850 border border-slate-200 dark:border-zinc-800 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-805 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <FaChevronRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>

       {isViewModalOpen && selectedOrder && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
                <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl shadow-xl w-full max-w-3xl transform transition-all duration-300 scale-95 hover:scale-100 max-h-[90vh] flex flex-col">
                    <div className="flex justify-between items-center p-5 border-b dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 rounded-t-2xl sticky top-0 z-10">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-zinc-100">Order Details</h2>
                            <p className="text-sm text-gray-500 dark:text-zinc-455">Invoice ID: {selectedOrder.invoiceSerial}</p>
                        </div>
                        <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-transform transform hover:rotate-90">
                            <FaTimesCircle size={28} />
                        </button>
                    </div>

                    <div className="overflow-y-auto flex-grow">
                        {companyLoading ? <MtableLoading /> : (
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                  <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-zinc-800 rounded-lg"><FaCalendarAlt className="text-blue-500 flex-shrink-0" size={20} /><div className="min-w-0"><p className="font-semibold text-gray-700 dark:text-zinc-300">Order Date</p><p className="text-gray-600 dark:text-zinc-400 truncate">{new Date(selectedOrder.dateTime).toLocaleString()}</p></div></div>
                                  <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-zinc-800 rounded-lg"><FaUser className="text-green-500 flex-shrink-0" size={20} /><div className="min-w-0"><p className="font-semibold text-gray-700 dark:text-zinc-300">Server</p><p className="text-gray-600 dark:text-zinc-400 truncate">{selectedOrder.loginUserName}</p></div></div>
                                  <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-zinc-800 rounded-lg"><FaHashtag className="text-purple-500 flex-shrink-0" size={20} /><div className="min-w-0"><p className="font-semibold text-gray-700 dark:text-zinc-300">Order Type</p><p className="text-gray-600 dark:text-zinc-400 capitalize truncate">{selectedOrder.orderType.replace('-', ' ')}</p></div></div>
                                  <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-zinc-800 rounded-lg"><FaMoneyBillWave className="text-yellow-500 flex-shrink-0" size={20} /><div className="min-w-0"><p className="font-semibold text-gray-700 dark:text-zinc-300">Order Status</p><span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${getStatusClass(selectedOrder.orderStatus)}`}>{selectedOrder.orderStatus}</span></div></div>
                                </div>
                                <div className="border border-slate-100 dark:border-zinc-800 rounded-lg p-4 bg-gray-50/50 dark:bg-zinc-900/30"><h4 className="font-semibold text-gray-750 dark:text-zinc-200 mb-2">Additional Info</h4><div className="text-sm space-y-1 text-gray-600 dark:text-zinc-400">{selectedOrder.tableName && (<p><strong>Table:</strong> {selectedOrder.tableName}</p>)}{selectedOrder.deliveryProvider && (<p><strong>Delivery Via:</strong> {selectedOrder.deliveryProvider}</p>)}{selectedOrder.customerName && (<p><strong>Customer:</strong> {selectedOrder.customerName}</p>)}{selectedOrder.customerMobile && (<p><strong>Mobile:</strong> {selectedOrder.customerMobile}</p>)}<p><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p></div></div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-zinc-200 mb-2">Itemized List</h3>
                                    <div className="overflow-x-auto border border-slate-150 dark:border-zinc-800 rounded-lg"><table className="min-w-full text-sm"><thead className="bg-gray-100 dark:bg-zinc-800"><tr><th className="p-3 text-left font-medium text-gray-600 dark:text-zinc-350">#</th><th className="p-3 text-left font-medium text-gray-600 dark:text-zinc-350">Product Name</th><th className="p-3 text-center font-medium text-gray-600 dark:text-zinc-350">Qty</th><th className="p-3 text-right font-medium text-gray-600 dark:text-zinc-350">Rate</th><th className="p-3 text-right font-medium text-gray-600 dark:text-zinc-350">Subtotal</th></tr></thead><tbody>{selectedOrder.products.map((item, index) => (<tr key={index} className="border-t border-slate-100 dark:border-zinc-850 hover:bg-gray-50 dark:hover:bg-zinc-850/30"><td className="p-3 text-gray-500 dark:text-zinc-500">{index + 1}</td><td className="p-3 font-medium text-gray-800 dark:text-zinc-300">{item.productName}</td><td className="p-3 text-center text-gray-600 dark:text-zinc-400">{item.qty}</td><td className="p-3 text-right text-gray-600 dark:text-zinc-400">{item.rate.toFixed(2)}</td><td className="p-3 text-right font-semibold text-gray-800 dark:text-zinc-200">{item.subtotal.toFixed(2)}</td></tr>))}</tbody></table></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div></div><div className="text-sm border border-slate-150 dark:border-zinc-800 rounded-lg p-4 space-y-2 bg-gray-50/50 dark:bg-zinc-900/30"><div className="flex justify-between"><span className="text-gray-600 dark:text-zinc-400">Subtotal:</span><span className="font-medium text-gray-800 dark:text-zinc-200">{selectedOrder.totalSale.toFixed(2)}</span></div><div className="flex justify-between"><span className="text-gray-600 dark:text-zinc-400">VAT (+):</span><span className="font-medium text-gray-800 dark:text-zinc-200">{selectedOrder.vat.toFixed(2)}</span></div><div className="flex justify-between"><span className="text-gray-600 dark:text-zinc-400">Discount (-):</span><span className="font-medium text-red-500 dark:text-red-400">{selectedOrder.discount.toFixed(2)}</span></div><div className="flex justify-between text-base font-bold pt-2 border-t dark:border-zinc-800 mt-2"><span className="text-gray-900 dark:text-zinc-100">Grand Total:</span><span className="text-blue-600 dark:text-blue-400">{selectedOrder.totalAmount.toFixed(2)}</span></div></div></div>
                            </div>
                        )}
                    </div>
                    <div className="p-5 border-t dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 rounded-b-2xl sticky bottom-0 z-10 flex justify-end gap-4">
                        {/* Conditionally render QR Code button */}
                        {selectedOrder.orderStatus !== 'completed' && (
                            <button onClick={handleQRCodeClick} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-700 transition">
                                <FaQrcode />
                                QR Code
                            </button>
                        )}
                        <button onClick={handlePrintOrder} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition">
                            <FaPrint />
                            Print
                        </button>
                    </div>
                </div>
            </div>
        )}

      {isPrintModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-150 mb-4">Print Receipt</h2>
            <p className="text-gray-700 dark:text-zinc-400">Ready to print receipt for Invoice #{selectedOrder.invoiceSerial}.</p>
            <div className="flex justify-end gap-4 mt-6">
              <button onClick={() => setIsPrintModalOpen(false)} className="bg-gray-300 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 py-2 px-4 rounded hover:bg-gray-400 dark:hover:bg-zinc-700 transition">
                Cancel
              </button>
              <button onClick={handlePrintComplete} className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
                Print Now
              </button>
              <div className="hidden">
                <ReceiptTemplate
                  ref={receiptRef}
                  profileData={companies[0]}
                  invoiceData={selectedOrder}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {isQrModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-100 dark:bg-zinc-900 border border-zinc-800 p-4 rounded-3xl shadow-2xl w-full max-w-xs relative flex flex-col items-center">
                <button onClick={() => setIsQrModalOpen(false)} className="absolute -top-2 -right-2 bg-white dark:bg-zinc-800 p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-zinc-700 shadow-md transition-all border-none" aria-label="Close QR Code modal">
                    <FaTimesCircle size={24} />
                </button>
                <div className="bg-white p-2 rounded-2xl">
                    <QRCodeGenerator type="invoice" id={selectedOrder._id} />
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default OrdersHistory;