import { useState, useEffect, useContext, useRef, useCallback } from "react";
import {
    FiTrash2, FiSearch, FiRefreshCw, FiX, FiGrid,
    FiEye, FiEdit, FiCheckCircle, FiPrinter, FiChevronLeft, FiChevronRight
} from "react-icons/fi";
import { FaCalendarAlt, FaUser as FaUserAlt, FaHashtag, FaMoneyBillWave, FaTimesCircle } from "react-icons/fa";
import Swal from "sweetalert2";
import Mtitle from "../../components library/Mtitle";
import UseAxiosSecure from "../../Hook/UseAxioSecure";
import { AuthContext } from "../../providers/AuthProvider";
import useCompanyHook from "../../Hook/useCompanyHook";
import ReceiptTemplate from "../../components/Receipt/ReceiptTemplate ";
import MtableLoading from "../../components library/MtableLoading";
import { useNavigate } from "react-router-dom";
import QRCodeGenerator from "../../components/QRCodeGenerator";

// Define items per page as a constant
const ITEMS_PER_PAGE = 10;

// Helper function for status badge styling
const getStatusClass = (status) => {
    switch (status) {
        case 'completed':
            return 'bg-green-100 text-green-700';
        case 'pending':
            return 'bg-yellow-100 text-yellow-700';
        case 'cancelled':
            return 'bg-red-100 text-red-700';
        default:
            return 'bg-gray-100 text-gray-700';
    }
};


const PendingOrders = () => {
    const axiosSecure = UseAxiosSecure();
    const { companies, loading: companiesLoading } = useCompanyHook();
    const receiptRef = useRef();
    const { user, branch } = useContext(AuthContext);
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viewOrder, setViewOrder] = useState(null);


    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [printData, setPrintData] = useState(null);

    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [selectedOrderForQR, setSelectedOrderForQR] = useState(null);

    const [filters, setFilters] = useState({
        searchTerm: '',
        orderType: ''
    });
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    // State for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(filters.searchTerm);
        }, 500);
        return () => {
            clearTimeout(timerId);
        };
    }, [filters.searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, filters.orderType]);

    const fetchPendingOrders = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = {
                searchTerm: debouncedSearchTerm,
                orderType: filters.orderType,
                page: currentPage,
                limit: ITEMS_PER_PAGE,
            };

            Object.keys(params).forEach(key => {
                if (!params[key]) {
                    delete params[key];
                }
            });

            const response = await axiosSecure.get(`/invoice/${branch}/status/pending`, { params });
            setOrders(response.data.invoices);
            setTotalPages(response.data.totalPages);

        } catch (error) {
            console.error("Error fetching pending orders:", error);
            Swal.fire("Error!", "Failed to fetch pending orders. Please try again.", "error");
        } finally {
            setIsLoading(false);
        }
    }, [axiosSecure, branch, debouncedSearchTerm, filters.orderType, currentPage]);

    useEffect(() => {
        if (branch) {
            fetchPendingOrders();
        }
    }, [fetchPendingOrders, branch]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
    };

    const resetFilters = () => {
        setFilters({
            searchTerm: '',
            orderType: ''
        });
    };

    const handleOrderUpdate = async (id, status) => {
        try {
            setIsLoading(true);
            await axiosSecure.put(`/invoice/update/${id}`, { orderStatus: status });
            fetchPendingOrders();
            Swal.fire("Success!", `Order has been updated to ${status}.`, "success");
        } catch (error) {
            console.error("Error updating order status:", error);
            Swal.fire("Error!", "Failed to update order status. Please try again.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCompleteClick = (id) => {
        Swal.fire({
            title: 'Confirm Payment',
            text: "Is the payment for this order cleared?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, payment is clear!',
            cancelButtonText: 'No, not yet'
        }).then((result) => {
            if (result.isConfirmed) {
                handleOrderUpdate(id, "completed");
            }
        });
    };

    const handleViewOrder = (order) => {
        setViewOrder(order);
      
        setIsModalOpen(true);
    };

    const handleRemove = async (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    setIsLoading(true);
                    await axiosSecure.delete(`/invoice/delete/${id}`);
                    fetchPendingOrders();
                    Swal.fire("Deleted!", "The order has been deleted.", "success");
                } catch (error) {
                    console.error("Error deleting order:", error);
                    Swal.fire("Error!", "Failed to delete order.", "error");
                } finally {
                    setIsLoading(false);
                }
            }
        });
    };

    const handleEditClick = (orderId) => {
        navigate(`/dashboard/edit-order/${orderId}`);
    };

    const handlePrintOrder = (id) => {
        const orderToPrint = orders.find((order) => order._id === id);
        if (orderToPrint) {
            setPrintData(orderToPrint);
            setIsPrintModalOpen(true);
            setIsModalOpen(false); // Close the view modal if it's open
        }
    };

    const handleQRCodeClick = (order) => {
        setSelectedOrderForQR(order);
        setIsQrModalOpen(true);
        setIsModalOpen(false);
    };

    useEffect(() => {
        if (isPrintModalOpen && printData && receiptRef.current) {
            const timer = setTimeout(() => {
                receiptRef.current.printReceipt();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isPrintModalOpen, printData]);

    const handlePrintComplete = () => {
        setIsPrintModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-inter">
            {companiesLoading ? (
                <MtableLoading data={null} />
            ) : (
                <>
                    <Mtitle title="Pending Orders" />

                    <section className="my-6 p-4 bg-white border border-gray-200 shadow-sm rounded-lg">
                        <div className="flex flex-col md:flex-row md:items-end md:gap-3 space-y-4 md:space-y-0">
                            <div className="w-full md:flex-1">
                                <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiSearch className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="searchTerm"
                                        id="searchTerm"
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Order ID, name, mobile..."
                                        value={filters.searchTerm}
                                        onChange={handleFilterChange}
                                    />
                                </div>
                            </div>
                            <div className="w-full md:w-48">
                                <label htmlFor="orderType" className="block text-sm font-medium text-gray-700 mb-1">Order Type</label>
                                <select id="orderType" name="orderType" className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value={filters.orderType} onChange={handleFilterChange}>
                                    <option value="">All Types</option>
                                    <option value="dine-in">Dine-In</option>
                                    <option value="takeaway">Takeaway</option>
                                    <option value="delivery">Delivery</option>
                                </select>
                            </div>
                            <button
                                onClick={resetFilters}
                                className="inline-flex items-center justify-center p-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 h-[42px] w-[42px]"
                                title="Reset Filters"
                            >
                                <FiRefreshCw className="h-5 w-5" />
                            </button>
                        </div>
                    </section>
                    
                    {isLoading ? <MtableLoading data={null} /> : (
                        <>
                            <section className="overflow-x-auto border border-gray-200 shadow-sm rounded-lg p-4 bg-white">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-blue-600">
                                        <tr>
                                            {/* <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider rounded-tl-lg">Order ID</th> */}
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date & Time</th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">User</th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Total</th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Order Type</th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Delivery To</th>
                                            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-white uppercase tracking-wider rounded-tr-lg">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {orders.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                    No pending orders match the current filters.
                                                </td>
                                            </tr>
                                        ) : (
                                            orders.map((order) => (
                                                <tr key={order._id} className="hover:bg-gray-50 transition-colors duration-200">
                                                    {/* <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{order.invoiceSerial}</td> */}
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{new Date(order.dateTime).toLocaleString()}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{order.loginUserName}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{order.totalAmount?.toFixed(2)} Taka</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{order.orderType}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{order.tableName || order.deliveryProvider || 'N/A'}</td>
                                                    
                                                    {/* MODIFIED ACTION BUTTONS SECTION */}
                                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end items-center flex-wrap gap-2">
                                                            <button
                                                                onClick={() => handleViewOrder(order)}
                                                                title="View Order"
                                                                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-white text-xs font-semibold bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                                                            >
                                                                <FiEye size={14} />
                                                                <span>View</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleEditClick(order._id)}
                                                                title="Edit Order"
                                                                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-white text-xs font-semibold bg-yellow-600 hover:bg-yellow-700 transition-colors duration-200"
                                                            >
                                                                <FiEdit size={14} />
                                                                <span>Edit</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handlePrintOrder(order._id)}
                                                                title="Print Order"
                                                                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-white text-xs font-semibold bg-gray-600 hover:bg-gray-700 transition-colors duration-200"
                                                            >
                                                                <FiPrinter size={14} />
                                                                <span>Print</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleCompleteClick(order._id)}
                                                                title="Complete Order"
                                                                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-white text-xs font-semibold bg-green-600 hover:bg-green-700 transition-colors duration-200"
                                                            >
                                                                <FiCheckCircle size={14} />
                                                                <span>Complete</span>
                                                            </button>
                                                            {user?.role === "admin" && (
                                                                <button
                                                                    onClick={() => handleRemove(order._id)}
                                                                    title="Delete Order"
                                                                    className="flex items-center gap-2 px-3 py-1.5 rounded-md text-white text-xs font-semibold bg-red-600 hover:bg-red-700 transition-colors duration-200"
                                                                >
                                                                    <FiTrash2 size={14} />
                                                                    <span>Delete</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </section>

                            {totalPages > 1 && (
                                <div className="mt-6 flex justify-between items-center px-4 py-2">
                                    <div className="text-sm text-gray-700">
                                        Page <span className="font-bold">{currentPage}</span> of <span className="font-bold">{totalPages}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => prev - 1)}
                                            disabled={currentPage === 1}
                                            className="inline-flex items-center justify-center p-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors"
                                            title="Previous Page"
                                        >
                                            <FiChevronLeft className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(prev => prev + 1)}
                                            disabled={currentPage === totalPages}
                                            className="inline-flex items-center justify-center p-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors"
                                            title="Next Page"
                                        >
                                            <FiChevronRight className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    
                    {isModalOpen && viewOrder && (
                        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
                          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl transform transition-all duration-300 scale-95 hover:scale-100 max-h-[90vh] flex flex-col">
                            <div className="flex justify-between items-center p-5 border-b bg-gray-50 rounded-t-2xl sticky top-0 z-10 flex-shrink-0">
                              <div>
                                <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
                                <p className="text-sm text-gray-500">Invoice ID: {viewOrder.invoiceSerial}</p>
                              </div>
                              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-transform transform hover:rotate-90">
                                <FaTimesCircle size={28} />
                              </button>
                            </div>

                            <div className="overflow-y-auto">
                                {companiesLoading ? <MtableLoading data={null}/> : (
                                <div className="p-6 space-y-6">
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                  <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                                    <FaCalendarAlt className="text-blue-500 flex-shrink-0" size={20} />
                                    <div>
                                    <p className="font-semibold text-gray-700">Order Date</p>
                                    <p className="text-gray-600">{new Date(viewOrder.dateTime).toLocaleString()}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                                    <FaUserAlt className="text-green-500 flex-shrink-0" size={20} />
                                    <div>
                                    <p className="font-semibold text-gray-700">Server</p>
                                    <p className="text-gray-600">{viewOrder.loginUserName}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                                    <FaHashtag className="text-purple-500 flex-shrink-0" size={20} />
                                    <div>
                                    <p className="font-semibold text-gray-700">Order Type</p>
                                    <p className="text-gray-600 capitalize">{viewOrder.orderType.replace('-', ' ')}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
                                    <FaMoneyBillWave className="text-yellow-500 flex-shrink-0" size={20} />
                                    <div>
                                    <p className="font-semibold text-gray-700">Order Status</p>
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${getStatusClass(viewOrder.orderStatus)}`}>
                                        {viewOrder.orderStatus}
                                    </span>
                                    </div>
                                  </div>
                                  </div>
                                  <div className="border rounded-lg p-4 bg-gray-50/50">
                                  <h4 className="font-semibold text-gray-700 mb-2">Additional Info</h4>
                                  <div className="text-sm space-y-1 text-gray-600">
                                    {viewOrder.tableName && (<p><strong>Table:</strong> {viewOrder.tableName}</p>)}
                                    {viewOrder.deliveryProvider && (<p><strong>Delivery Via:</strong> {viewOrder.deliveryProvider}</p>)}
                                    {viewOrder.customerName && (<p><strong>Customer:</strong> {viewOrder.customerName}</p>)}
                                    {viewOrder.customerMobile && (<p><strong>Mobile:</strong> {viewOrder.customerMobile}</p>)}
                                    <p><strong>Payment Method:</strong> {viewOrder.paymentMethod}</p>
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
                                        {viewOrder.products.map((item, index) => (
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
                                            <span className="font-medium text-gray-800">{viewOrder.totalSale.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">VAT (+):</span>
                                            <span className="font-medium text-gray-800">{viewOrder.vat.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Discount (-):</span>
                                            <span className="font-medium text-red-500">{viewOrder.discount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-base font-bold pt-2 border-t mt-2">
                                            <span className="text-gray-900">Grand Total:</span>
                                            <span className="text-blue-600">{viewOrder.totalAmount.toFixed(2)}</span>
                                        </div>
                                    </div>
                                  </div>
                                </div>
                                )}
                            </div>

                            <div className="flex-shrink-0 p-5 border-t bg-gray-50 rounded-b-2xl flex justify-end gap-4">
                                <button
                                    onClick={() => handleQRCodeClick(viewOrder)}
                                    className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 transition-colors"
                                >
                                    <FiGrid />
                                    <span>Generate QR</span>
                                </button>
                                <button
                                    onClick={() => handlePrintOrder(viewOrder._id)}
                                    className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                    <FiPrinter />
                                    <span>Print Receipt</span>
                                </button>
                            </div>

                          </div>
                        </div>
                    )}


                    {isPrintModalOpen && printData && companies[0] && (
                        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm md:max-w-md p-6 relative">
                                <button onClick={() => setIsPrintModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-3xl font-bold transition-colors duration-200">&times;</button>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Print Receipt</h2>
                                <p className="text-gray-700 mb-6">Click "Print Now" to generate and print the receipt for Order ID: <span className="font-semibold">{printData.invoiceSerial}</span>.</p>
                                <div className="hidden"><ReceiptTemplate ref={receiptRef} onPrintComplete={handlePrintComplete} profileData={companies[0]} invoiceData={printData}/></div>
                                <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gray-200">
                                    <button onClick={() => { if (receiptRef.current) { receiptRef.current.printReceipt(); } }} className="bg-blue-600 text-white py-2.5 px-6 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out shadow-md font-semibold text-base">Print Now</button>
                                    <button onClick={() => setIsPrintModalOpen(false)} className="bg-gray-500 text-white py-2.5 px-6 rounded-md hover:bg-gray-600 transition duration-300 ease-in-out shadow-md font-semibold text-base">Close</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {isQrModalOpen && selectedOrderForQR && (
                        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                            <div className="bg-gray-100 p-4 rounded-3xl shadow-2xl w-full max-w-xs relative">
                                <button onClick={() => setIsQrModalOpen(false)} className="absolute -top-2 -right-2 bg-white p-2 rounded-full text-red-500 hover:bg-red-100 shadow-md transition-all" aria-label="Close QR Code modal">
                                    <FiX size={20} />
                                </button>
                                <QRCodeGenerator type="invoice" id={selectedOrderForQR._id} />
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PendingOrders;