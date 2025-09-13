import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import {
    FiTrash2, FiSearch, FiRefreshCw, FiX, FiClock, FiUser, FiTag, FiTruck, FiMapPin, FiPhone, FiGrid,
    FiEye, FiEdit, FiCheckCircle, FiPrinter, FiChevronLeft, FiChevronRight
} from "react-icons/fi";
import Swal from "sweetalert2";
import Mtitle from "../../components library/Mtitle";
import UseAxiosSecure from "../../Hook/UseAxioSecure";
import { AuthContext } from "../../providers/AuthProvider";
import useCompanyHook from "../../Hook/useCompanyHook";
import ReceiptTemplate from "../../components/Receipt/ReceiptTemplate ";
import CookingAnimation from "../../components/CookingAnimation";
import { useNavigate } from "react-router-dom";
import QRCodeGenerator from "../../components/QRCodeGenerator";

// Define items per page as a constant
const ITEMS_PER_PAGE = 10;

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
    const [discountDisplay, setDiscountDisplay] = useState(0);

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

    // Reset current page to 1 whenever filters are changed
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
            
            // Set state from the new API response structure
            setOrders(response.data.invoices);
            setTotalPages(response.data.totalPages);

        } catch (error) {
            console.error("Error fetching pending orders:", error);
            Swal.fire("Error!", "Failed to fetch pending orders. Please try again.", "error");
        } finally {
            setIsLoading(false);
        }
    }, [axiosSecure, branch, debouncedSearchTerm, filters.orderType, currentPage]); // Add currentPage to dependency array

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
        setDiscountDisplay(order.discount || 0);
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
            setIsModalOpen(false); // Close the view modal when opening the print modal
        }
    };

    const handleQRCodeClick = (order) => {
        setSelectedOrderForQR(order);
        setIsQrModalOpen(true);
        setIsModalOpen(false); // Close the view modal when opening the QR modal
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
                <CookingAnimation />
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
                    
                    {isLoading ? <CookingAnimation /> : (
                        <>
                            <section className="overflow-x-auto border border-gray-200 shadow-sm rounded-lg p-4 bg-white">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-blue-600">
                                        <tr>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider rounded-tl-lg">Order ID</th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Date</th>
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
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{order.invoiceSerial}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{new Date(order.dateTime).toLocaleString()}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{order.loginUserName}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{order.totalAmount?.toFixed(2)} Taka</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{order.orderType}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{order.tableName || order.deliveryProvider || 'N/A'}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end space-x-2">
                                                            <button onClick={() => handleViewOrder(order)} title="View Order" className="p-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"><FiEye size={16} /></button>
                                                            <button onClick={() => handleEditClick(order._id)} title="Edit Order" className="p-2 rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors duration-200"><FiEdit size={16} /></button>
                                                            <button onClick={() => handleCompleteClick(order._id)} title="Complete Order" className="p-2 rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"><FiCheckCircle size={16} /></button>
                                                            {user?.role === "admin" && (
                                                                <button onClick={() => handleRemove(order._id)} title="Delete Order" className="p-2 rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200">
                                                                    <FiTrash2 size={16} />
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

                            {/* Pagination Controls UI */}
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
                    
                    {isModalOpen && viewOrder && companies[0] && (
                        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
                            <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-4xl p-8 relative flex flex-col max-h-[90vh]">
                                {/* Header */}
                                <div className="flex-shrink-0 flex justify-between items-start pb-4 border-b border-slate-200">
                                    <div>
                                        <h2 className="text-3xl font-bold text-slate-800">{companies[0].name}</h2>
                                        <p className="text-sm text-slate-500 mt-1">Order Details</p>
                                    </div>
                                    <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors">
                                        <FiX size={24} />
                                    </button>
                                </div>

                                {/* Order Info */}
                                <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-3 gap-6 my-6 text-sm">
                                    <div className="flex items-start gap-3"><FiTag className="text-blue-500 mt-1" size={18} /><div><p className="font-semibold text-slate-700">Order ID</p><p className="text-slate-500">{viewOrder.invoiceSerial}</p></div></div>
                                    <div className="flex items-start gap-3"><FiClock className="text-blue-500 mt-1" size={18} /><div><p className="font-semibold text-slate-700">Date & Time</p><p className="text-slate-500">{new Date(viewOrder.dateTime).toLocaleString()}</p></div></div>
                                    <div className="flex items-start gap-3"><FiUser className="text-blue-500 mt-1" size={18} /><div><p className="font-semibold text-slate-700">Served By</p><p className="text-slate-500">{viewOrder.loginUserName}</p></div></div>
                                    {viewOrder.orderType === "dine-in" && (<div className="flex items-start gap-3"><FiMapPin className="text-blue-500 mt-1" size={18} /><div><p className="font-semibold text-slate-700">Table Name</p><p className="text-slate-500">{viewOrder.tableName}</p></div></div>)}
                                    {viewOrder.orderType === "delivery" && (<><div className="flex items-start gap-3"><FiTruck className="text-blue-500 mt-1" size={18} /><div><p className="font-semibold text-slate-700">Delivery via</p><p className="text-slate-500">{viewOrder.deliveryProvider}</p></div></div><div className="flex items-start gap-3"><FiUser className="text-blue-500 mt-1" size={18} /><div><p className="font-semibold text-slate-700">Customer Name</p><p className="text-slate-500">{viewOrder.customerName || 'N/A'}</p></div></div><div className="flex items-start gap-3"><FiPhone className="text-blue-500 mt-1" size={18} /><div><p className="font-semibold text-slate-700">Customer Mobile</p><p className="text-slate-500">{viewOrder.customerMobile || 'N/A'}</p></div></div></>)}
                                </div>
                                
                                {/* Scrolling Content */}
                                <div className="bg-white rounded-lg p-6 border border-slate-200 flex-grow overflow-y-auto">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full">
                                            <thead className="border-b border-slate-200"><tr><th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th><th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Qty</th><th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Rate</th><th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Subtotal</th></tr></thead>
                                            <tbody className="divide-y divide-slate-100">{viewOrder.products.map((product, index) => (<tr key={index}><td className="px-4 py-4 whitespace-nowrap text-sm text-slate-800 font-medium">{product.productName}</td><td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 text-center">{product.qty}</td><td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 text-right">{product.rate?.toFixed(2)}</td><td className="px-4 py-4 whitespace-nowrap text-sm text-slate-800 font-medium text-right">{product.subtotal?.toFixed(2)}</td></tr>))}</tbody>
                                        </table>
                                    </div>
                                    <div className="mt-6 pt-6 border-t border-slate-200 w-full max-w-xs ml-auto text-sm"><div className="flex justify-between items-center text-slate-600"><p>Subtotal</p><p className="font-medium">{viewOrder.totalSale?.toFixed(2)} Taka</p></div><div className="flex justify-between items-center text-slate-600 mt-2"><p>Discount</p><p className="font-medium">-{discountDisplay?.toFixed(2)} Taka</p></div>{viewOrder.vat > 0 && (<div className="flex justify-between items-center text-slate-600 mt-2"><p>VAT</p><p className="font-medium">{viewOrder.vat?.toFixed(2)} Taka</p></div>)}{viewOrder.sd > 0 && (<div className="flex justify-between items-center text-slate-600 mt-2"><p>SD</p><p className="font-medium">{viewOrder.sd?.toFixed(2)} Taka</p></div>)}<div className="flex justify-between items-center text-slate-800 font-bold text-lg mt-4 pt-4 border-t border-slate-200"><p>Grand Total</p><p className="text-blue-600">{viewOrder.totalAmount?.toFixed(2)} Taka</p></div></div>
                                </div>
                                
                                {/* Modal Footer with Actions */}
                                <div className="flex-shrink-0 mt-8 pt-6 border-t border-slate-200 flex justify-end gap-4">
                                    <button onClick={() => handleQRCodeClick(viewOrder)} className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 transition-colors duration-200">
                                        <FiGrid />
                                        <span>Generate QR</span>
                                    </button>
                                    <button onClick={() => handlePrintOrder(viewOrder._id)} className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200">
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