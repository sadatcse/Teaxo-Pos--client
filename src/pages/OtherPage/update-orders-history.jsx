import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
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
  FaTrash, // Import the trash icon
} from "react-icons/fa";

import Mtitle from "../../components library/Mtitle";
import UseAxiosSecure from "../../Hook/UseAxioSecure";
import { AuthContext } from "../../providers/AuthProvider";
import useCompanyHook from "../../Hook/useCompanyHook";
import ReceiptTemplate from "../../components/Receipt/ReceiptTemplate ";
import CookingAnimation from "../../components/CookingAnimation";

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

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // State for modals
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // State for filters
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [filters, setFilters] = useState({
    orderType: "",
    paymentStatus: "",
    orderStatus: "",
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms delay

  const fetchOrders = useCallback(async () => {
    if (!branch) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);
      if (startDate) params.append("startDate", startDate.toISOString());
      if (endDate) params.append("endDate", endDate.toISOString());
      if (filters.orderType) params.append("orderType", filters.orderType);
      if (filters.paymentStatus) params.append("paymentStatus", filters.paymentStatus);
      if (filters.orderStatus) params.append("orderStatus", filters.orderStatus);

      const response = await axiosSecure.get(`/invoice/${branch}/filter?${params.toString()}`);
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      Swal.fire("Error!", "Failed to fetch orders.", "error");
    }
    setIsLoading(false);
  }, [axiosSecure, branch, debouncedSearchTerm, startDate, endDate, filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ orderType: "", paymentStatus: "", orderStatus: "" });
    setSearchTerm("");
    setDateRange([null, null]);
    setIsFilterOpen(false);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handlePrintOrder = (order) => {
    setSelectedOrder(order);
    setIsPrintModalOpen(true);
  };

  const handlePrintComplete = () => {
    setIsPrintModalOpen(false);
    if (receiptRef.current) {
      receiptRef.current.printReceipt();
    }
  };

  // --- NEW: Delete Handler ---
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

        // FIX: Check the HTTP status code for success instead of a 'success' property.
        if (response.status === 200) {
          Swal.fire(
            'Deleted!',
            response.data.message || 'The order has been successfully deleted.', // Use the message from the backend
            'success'
          );
          // This will now run correctly, instantly updating the UI
          setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
        } else {
          // This handles non-200 responses that aren't network errors
          Swal.fire('Error!', response.data.message || 'Failed to delete the order.', 'error');
        }
      } catch (error) {
        console.error("Error deleting order:", error);
        // This catches network errors or other exceptions
        const errorMessage = error.response?.data?.message || 'An error occurred while deleting the order.';
        Swal.fire('Error!', errorMessage, 'error');
      }
    }
  });
};

  const getStatusClass = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'unpaid': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      case 'cooking': return 'bg-indigo-100 text-indigo-700';
      case 'served': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="p-4 md:p-6 min-h-screen bg-gray-50">
      <Mtitle title="Orders History" />

      {/* Filter and Search Controls */}
      <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="w-full">
            <DatePicker
              selectsRange={true}
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => setDateRange(update)}
              isClearable={true}
              placeholderText="Pick a date range"
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative w-full">
            <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Invoice ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 pl-10 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative w-full">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-full flex items-center justify-center gap-2 p-2 border rounded-md bg-white hover:bg-gray-100 transition"
            >
              <FaFilter className="text-gray-600" />
              <span>Filter by column</span>
            </button>
            {isFilterOpen && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-white border rounded-lg shadow-xl z-20 p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order Type</label>
                    <select name="orderType" value={filters.orderType} onChange={handleFilterChange} className="w-full p-2 border rounded-md">
                      <option value="">All</option>
                      <option value="dine-in">Dine In</option>
                      <option value="takeaway">Takeaway</option>
                      <option value="delivery">Delivery</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
                    <select name="orderStatus" value={filters.orderStatus} onChange={handleFilterChange} className="w-full p-2 border rounded-md">
                      <option value="">All</option>
                      <option value="pending">Pending</option>
                      <option value="cooking">Cooking</option>
                      <option value="served">Served</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <button onClick={clearFilters} className="w-full p-2 mt-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200">
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <section className="overflow-x-auto bg-white border shadow-sm rounded-lg">
        {isLoading ? (
          <CookingAnimation />
        ) : (
          <table className="table w-full">
            <thead className="bg-blue-600">
              <tr className="text-sm font-semibold text-white uppercase tracking-wider text-left">
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
                  <td colSpan="8" className="text-center py-10 text-gray-500">No orders found.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 border-t">
                    <td className="p-3 text-sm text-gray-800">{new Date(order.dateTime).toLocaleString()}</td>
                    <td className="p-3 text-sm font-mono text-gray-600">{order.invoiceSerial}</td>
                    <td className="p-3 text-sm text-gray-700 capitalize">{order.orderType.replace('-', ' ')}</td>
                    <td className="p-3 text-sm font-medium text-gray-900">{order.totalAmount.toFixed(2)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusClass(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-700">{order.loginUserName}</td>
                    <td className="p-3">
                      <div className="flex justify-center items-center gap-3">
                        <button onClick={() => handleViewOrder(order)} className="text-blue-600 hover:text-blue-800 transition" title="View Order"><FaEye size={18} /></button>
                        <button onClick={() => handlePrintOrder(order)} className="text-green-600 hover:text-green-800 transition" title="Print Receipt"><FaPrint size={18} /></button>
                        {/* --- Conditionally render Delete Button for Admins --- */}
                        {user && user.role === 'admin' && (
                          <button onClick={() => handleDeleteOrder(order._id)} className="text-red-600 hover:text-red-800 transition" title="Delete Order"><FaTrash size={16} /></button>
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

      {/* View Order Modal (No changes here) */}
      {isViewModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl transform transition-all duration-300 scale-95 hover:scale-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b bg-gray-50 rounded-t-2xl sticky top-0 z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
                <p className="text-sm text-gray-500">Invoice ID: {selectedOrder.invoiceSerial}</p>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-transform transform hover:rotate-90">
                <FaTimesCircle size={28} />
              </button>
            </div>
            {companyLoading ? <CookingAnimation /> : (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                    <FaCalendarAlt className="text-blue-500 flex-shrink-0" size={20} />
                    <div>
                      <p className="font-semibold text-gray-700">Order Date</p>
                      <p className="text-gray-600">{new Date(selectedOrder.dateTime).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                    <FaUser className="text-green-500 flex-shrink-0" size={20} />
                    <div>
                      <p className="font-semibold text-gray-700">Server</p>
                      <p className="text-gray-600">{selectedOrder.loginUserName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                    <FaHashtag className="text-purple-500 flex-shrink-0" size={20} />
                    <div>
                      <p className="font-semibold text-gray-700">Order Type</p>
                      <p className="text-gray-600 capitalize">{selectedOrder.orderType.replace('-', ' ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                    <FaMoneyBillWave className="text-yellow-500 flex-shrink-0" size={20} />
                    <div>
                      <p className="font-semibold text-gray-700">Order Status</p>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${getStatusClass(selectedOrder.orderStatus)}`}>
                        {selectedOrder.orderStatus}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="border rounded-lg p-4 bg-gray-50/50">
                   <h4 className="font-semibold text-gray-700 mb-2">Additional Info</h4>
                   <div className="text-sm space-y-1 text-gray-600">
                    {selectedOrder.tableName && (<p><strong>Table:</strong> {selectedOrder.tableName}</p>)}
                    {selectedOrder.deliveryProvider && (<p><strong>Delivery Via:</strong> {selectedOrder.deliveryProvider}</p>)}
                    {selectedOrder.customerName && (<p><strong>Customer:</strong> {selectedOrder.customerName}</p>)}
                    {selectedOrder.customerMobile && (<p><strong>Mobile:</strong> {selectedOrder.customerMobile}</p>)}
                    <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p>
                   </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Itemized List</h3>
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-3 text-left font-medium text-gray-600">#</th>
                          <th className="p-3 text-left font-medium text-gray-600">Product Name</th>
                          <th className="p-3 text-center font-medium text-gray-600">Qty</th>
                          <th className="p-3 text-right font-medium text-gray-600">Rate</th>
                          <th className="p-3 text-right font-medium text-gray-600">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.products.map((item, index) => (
                          <tr key={index} className="border-t hover:bg-gray-50">
                            <td className="p-3 text-gray-500">{index + 1}</td>
                            <td className="p-3 font-medium text-gray-800">{item.productName}</td>
                            <td className="p-3 text-center text-gray-600">{item.qty}</td>
                            <td className="p-3 text-right text-gray-600">{item.rate.toFixed(2)}</td>
                            <td className="p-3 text-right font-semibold text-gray-800">{item.subtotal.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div></div>
                    <div className="text-sm border rounded-lg p-4 space-y-2 bg-gray-50/50">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-medium text-gray-800">{selectedOrder.totalSale.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">VAT (+):</span>
                            <span className="font-medium text-gray-800">{selectedOrder.vat.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Discount (-):</span>
                            <span className="font-medium text-red-500">{selectedOrder.discount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold pt-2 border-t mt-2">
                            <span className="text-gray-900">Grand Total:</span>
                            <span className="text-blue-600">{selectedOrder.totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Print Modal (No changes here) */}
      {isPrintModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Print Receipt</h2>
            <p>Ready to print receipt for Invoice #{selectedOrder.invoiceSerial}.</p>
            <div className="flex justify-end gap-4 mt-6">
              <button onClick={() => setIsPrintModalOpen(false)} className="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400 transition">
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
    </div>
  );
};

export default OrdersHistory;
