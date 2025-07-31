import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaFilter, FaSearch, FaEye, FaPrint, FaTimesCircle } from "react-icons/fa";

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
      
      // Only append dates if they are selected
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
    setFilters(prev => ({ ...prev, [name]: value }));
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

  const getStatusClass = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'unpaid': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="p-4 md:p-6 min-h-screen bg-gray-50">
      <Mtitle title="Orders History" />
        
      {/* Filter and Search Controls */}
      <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Date Range Picker */}
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
            {/* Search Input */}
            <div className="relative w-full">
                <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search Token or Invoice Number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 pl-10 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
            </div>
            {/* Filter Button */}
            <div className="relative w-full">
                <button 
                    onClick={() => setIsFilterOpen(!isFilterOpen)} 
                    className="w-full flex items-center justify-center gap-2 p-2 border rounded-md bg-white hover:bg-gray-100 transition"
                >
                    <FaFilter className="text-gray-600"/>
                    <span>Filter by column</span>
                </button>
                {/* Filter Dropdown Panel */}
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
              <tr className="text-sm font-semibold text-gray-600 text-left">
                <th className="p-3">Date</th>
            
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
                    
                    <td className="p-3 text-sm text-gray-700 capitalize">{order.orderType.replace('-', ' ')}</td>

                    <td className="p-3 text-sm font-medium text-gray-900">{order.totalAmount.toFixed(2)}</td>
                    <td className="p-3">
                         <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusClass(order.orderStatus)}`}>
                            {order.orderStatus}
                         </span>
                    </td>
                    <td className="p-3 text-sm text-gray-700">{order.loginUserName}</td>
                    <td className="p-3">
                        <div className="flex justify-center items-center gap-2">
                             <button onClick={() => handleViewOrder(order)} className="text-blue-600 hover:text-blue-800 transition"><FaEye size={18} /></button>
                             <button onClick={() => handlePrintOrder(order)} className="text-green-600 hover:text-green-800 transition"><FaPrint size={18}/></button>
                        </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </section>

      {/* View Order Modal */}
      {isViewModalOpen && selectedOrder && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative">
             <button onClick={() => setIsViewModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
               <FaTimesCircle size={24}/>
             </button>
             {companyLoading ? <CookingAnimation/> : (
               <div>
                     <div className="text-center mb-4">
                       <h2 className="text-2xl font-bold text-gray-800">{companies[0]?.name}</h2>
                       <p className="text-sm text-gray-600">{companies[0]?.address}</p>
                    </div>
                    {/* ... Rest of your view modal content from your original code */}
                    <p><strong>Order ID:</strong> {selectedOrder.invoiceSerial}</p>
                    <p><strong>Order Type:</strong> {selectedOrder.orderType}</p>
                    {/* You can build out the full details here */}
               </div>
             )}
           </div>
         </div>
      )}

       {/* Print Modal */}
      {isPrintModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Print Receipt</h2>
            <p>Ready to print receipt for Token #{selectedOrder.token}.</p>
            <div className="flex justify-end gap-4 mt-6">
              <button onClick={() => setIsPrintModalOpen(false)} className="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400 transition">
                Cancel
              </button>
              {/* This button triggers the print */}
              <button onClick={handlePrintComplete} className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
                Print Now
              </button>
              {/* Hidden component that handles the print logic */}
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