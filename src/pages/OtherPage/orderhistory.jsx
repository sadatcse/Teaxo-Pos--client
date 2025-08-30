import React, { useContext, useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ReactPaginate from "react-paginate";
import UseAxiosSecure from "../../Hook/UseAxioSecure";
import { FaEye, FaCalendarAlt, FaTimes, FaPrint } from "react-icons/fa";
import moment from "moment";
import Preloader from "../../components/Shortarea/Preloader";
import { AuthContext } from "../../providers/AuthProvider";
import useCompanyHook from "../../Hook/useCompanyHook";
import Mtitle from "../../components library/Mtitle";
import ReceiptTemplate from "../../components/Receipt/ReceiptTemplate ";

// RESPONSIVE DYNAMIC FOOTER COMPONENT
const SalesSummaryFooter = ({ data }) => {
    // Helper component for each summary item
    const SummaryItem = ({ label, value, isAmount = true, valueColor = 'text-white' }) => (
        <div>
            <p className="text-sm text-slate-400 capitalize truncate">{label}</p>
            <p className={`text-lg font-semibold ${valueColor}`}>
                {isAmount ? `৳${value.toFixed(2)}` : value}
            </p>
            <div className="h-px bg-slate-700 mt-1"></div>
        </div>
    );

    const grossSales = (data.totalAmount || 0) + (data.totalDiscount || 0);
    const netSales = data.totalAmount || 0;
    const avgPerPerson = data.totalGuestCount > 0 ? netSales / data.totalGuestCount : 0;
    
    // Define a mapping for cleaner labels
    const deliveryProviderLabels = {
        pathao: "Pathao Sale",
        foodi: "Foodi Sale",
        foodpanda: "Foodpanda Sale",
        deliveryBoy: "Delivery Boy Sale"
    };

    return (
        <div className="bg-[#2A3F54] text-white p-4 md:p-6 rounded-lg shadow-lg mt-6">
            {/* Responsive Main "Total Sales" Showcase */}
            <div className="text-center mb-6 border-b border-slate-600 pb-6">
                <p className="text-sm text-slate-400 uppercase tracking-wider">Net Sales</p>
                <p className="text-4xl md:text-5xl font-bold text-green-400 tracking-tight">
                    ৳{netSales.toFixed(2)}
                </p>
            </div>

            {/* A responsive grid for all other details, adapting columns based on screen size */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-6">
                <SummaryItem label="Gross Sales" value={grossSales} />
                <SummaryItem label="Total Discount" value={data.totalDiscount} valueColor="text-red-400" />
                <SummaryItem label="Table Discount" value={data.totalTableDiscount} valueColor="text-red-400" />
                <SummaryItem label="Total VAT" value={data.totalVat} />
                <SummaryItem label="Total SD" value={data.totalSd} />
                <SummaryItem label="Cash Collection" value={data.cashPayments} />
                <SummaryItem label="Card Collection" value={data.cardPayments} />
                <SummaryItem label="Mobile Banking" value={data.mobilePayments} />
                <SummaryItem label="Bank Collection" value={data.bankPayments} /> 
                <SummaryItem label="Total Guest Count" value={data.totalGuestCount} isAmount={false} />
                <SummaryItem label="Avg Per Person" value={avgPerPerson} />
                <SummaryItem label="Complimentary" value={data.totalComplimentaryAmount} />
                
                {data.salesByOrderType && Object.entries(data.salesByOrderType).map(([type, amount]) =>
                    amount > 0 && <SummaryItem key={type} label={`${type} Order`} value={amount} />
                )}

                {/* Dynamically add delivery provider sales */}
                {data.salesByDeliveryProvider && Object.entries(data.salesByDeliveryProvider).map(([provider, amount]) =>
                    amount > 0 && <SummaryItem key={provider} label={deliveryProviderLabels[provider] || provider} value={amount} />
                )}
            </div>
        </div>
    );
};


const OrderHistory = () => {
    const [date, setDate] = useState(new Date());
    const [orderData, setOrderData] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const ordersPerPage = 10;
    const axiosSecure = UseAxiosSecure();
    const { branch } = useContext(AuthContext);
    const { companies } = useCompanyHook();
    const receiptRef = useRef();

    // SHOWCASE STATE - EXPANDED to hold all summary data from API
    const [showcaseData, setShowcaseData] = useState({
        totalOrders: 0, totalQty: 0, totalAmount: 0, totalVat: 0,
        totalSd: 0, totalDiscount: 0, totalComplimentaryAmount: 0,
        cashPayments: 0, cardPayments: 0, mobilePayments: 0, bankPayments: 0, totalTableDiscount: 0,
        totalGuestCount: 0, salesByDeliveryProvider: {},
        salesByOrderType: { dineIn: 0, takeaway: 0, delivery: 0 }
    });

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [printData, setPrintData] = useState(null);

    const fetchOrders = async (selectedDate) => {
        if (!branch) return;
        setIsLoading(true);
        try {
            const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
            const response = await axiosSecure.get(`/invoice/${branch}/date/${formattedDate}`);
            const data = response.data;

            if (data && data.orders) {
                const totalSd = data.orders.reduce((sum, order) => sum + (order.sd || 0), 0);
                const totalGuestCount = data.orders.reduce((sum, order) => sum + (order.guestCount || 1), 0);

                setShowcaseData({
                    totalOrders: data.totalOrders || 0,
                    totalQty: data.totalQty || 0,
                    totalAmount: data.totalAmount || 0,
                    totalTableDiscount: data.totalTableDiscount || 0,
                    totalVat: data.totalVat || 0,
                    totalDiscount: data.totalDiscount || 0,
                    totalComplimentaryAmount: data.totalComplimentaryAmount || 0,
                    cashPayments: data.cashPayments || 0,
                    cardPayments: data.cardPayments || 0,
                    mobilePayments: data.mobilePayments || 0,
                    bankPayments: data.bankPayments || 0,
                    salesByDeliveryProvider: data.salesByDeliveryProvider || {},
                    salesByOrderType: data.salesByOrderType || { dineIn: 0, takeaway: 0, delivery: 0 },
                    totalSd: totalSd,
                    totalGuestCount: totalGuestCount,
                });
                setOrderData(data.orders);
            } else {
                setShowcaseData({
                    totalOrders: 0, totalQty: 0, totalAmount: 0, totalVat: 0, totalSd: 0,
                    totalDiscount: 0, totalComplimentaryAmount: 0, cashPayments: 0,
                    cardPayments: 0, mobilePayments: 0, bankPayments: 0, totalGuestCount: 0, salesByDeliveryProvider: {}, totalTableDiscount: 0,
                    salesByOrderType: { dineIn: 0, takeaway: 0, delivery: 0 }
                });
                setOrderData([]);
            }
        } catch (error) {
            console.error("Error fetching order history:", error);
            setOrderData([]);
            setShowcaseData({
                totalOrders: 0, totalQty: 0, totalAmount: 0, totalVat: 0, totalSd: 0,
                totalDiscount: 0, totalComplimentaryAmount: 0, cashPayments: 0,
                cardPayments: 0, mobilePayments: 0, bankPayments: 0, totalGuestCount: 0, salesByDeliveryProvider: {}, totalTableDiscount: 0,
                salesByOrderType: { dineIn: 0, takeaway: 0, delivery: 0 }
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(date);
    }, [branch, date]);

    const handleDateChange = (newDate) => {
        setDate(newDate);
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

    const currentOrders = orderData.slice(currentPage * ordersPerPage, (currentPage + 1) * ordersPerPage);

    return (
        <div className="p-4 md:p-6 bg-slate-50 min-h-screen font-sans">
            <div className="flex justify-between items-center mb-6">
                <Mtitle title="Daily Order Report" />
            </div>

            <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h3 className="text-xl md:text-2xl font-bold text-slate-800 whitespace-nowrap">
                        Details for {moment(date).format("MMMM Do, YYYY")}
                    </h3>
                    <div className="w-full md:w-auto">
                        <div className="relative">
                            <DatePicker selected={date} onChange={handleDateChange} className="w-full md:w-64 p-2.5 pl-10 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 transition-all" dateFormat="MMMM d, yyyy" />
                            <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-full min-h-[400px]"><Preloader /></div>
                ) : (
                    <>
                        {/* Responsive table with horizontal scroll on small screens */}
                        <div className="overflow-x-auto rounded-lg border border-slate-200">
                            <table className="w-full min-w-[600px] text-left">
                                <thead className="border-b-2 bg-slate-50 text-sm text-slate-600 uppercase tracking-wider">
                                    <tr>
                                        <th className="p-4 font-semibold">#</th>
                                        <th className="p-4 font-semibold whitespace-nowrap">Time</th>
                                        <th className="p-4 font-semibold whitespace-nowrap">Invoice ID</th>
                                        <th className="p-4 font-semibold">Items</th>
                                        <th className="p-4 font-semibold text-right">Amount</th>
                                        <th className="p-4 font-semibold text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {currentOrders.length > 0 ? (
                                        currentOrders.map((order, index) => (
                                            <tr key={order._id} className="hover:bg-slate-50 transition-colors text-sm text-slate-700">
                                                <td className="p-4">{index + 1 + currentPage * ordersPerPage}</td>
                                                <td className="p-4 whitespace-nowrap">{moment(order.dateTime).format('h:mm A')}</td>
                                                <td className="p-4 font-mono text-indigo-600 whitespace-nowrap">{order.invoiceSerial}</td>
                                                <td className="p-4">{order.totalQty}</td>
                                                <td className="p-4 font-bold text-right text-emerald-700">৳{order.totalAmount.toFixed(2)}</td>
                                                <td className="p-4">
                                                    <div className="flex justify-center items-center gap-4">
                                                        <button onClick={() => handleViewDetails(order)} className="text-indigo-600 hover:text-indigo-800 transition-colors" title="View Details">
                                                            <FaEye size={20} />
                                                        </button>
                                                        <button onClick={() => handlePrintOrder(order)} className="text-slate-500 hover:text-slate-800 transition-colors" title="Print Receipt">
                                                            <FaPrint size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="6" className="text-center py-16 text-slate-500">No orders found for this date.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {orderData.length > ordersPerPage && (
                            <div className="mt-8">
                                <ReactPaginate
                                    previousLabel={"< Prev"} nextLabel={"Next >"} pageCount={Math.ceil(orderData.length / ordersPerPage)}
                                    onPageChange={handlePageClick} containerClassName={"flex flex-wrap justify-center items-center gap-2 text-sm"}
                                    pageLinkClassName={"px-4 py-2 rounded-md transition-colors hover:bg-slate-200"}
                                    previousLinkClassName={"px-4 py-2 rounded-md bg-white border border-slate-300 hover:bg-slate-100 transition-colors"}
                                    nextLinkClassName={"px-4 py-2 rounded-md bg-white border border-slate-300 hover:bg-slate-100 transition-colors"}
                                    activeLinkClassName={"bg-indigo-600 text-white hover:bg-indigo-700"}
                                    disabledClassName={"opacity-40 cursor-not-allowed"}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            <SalesSummaryFooter data={showcaseData} />

            {/* MODALS */}
            {showModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl transform transition-all max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-5 border-b bg-slate-50 rounded-t-lg">
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-slate-800">Order Details</h2>
                                <p className="text-sm text-slate-500 font-mono">Invoice: {selectedOrder.invoiceSerial}</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-rose-500 transition-colors"><FaTimes size={24} /></button>
                        </div>
                        <div className="p-6 space-y-6 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm border-b pb-4">
                                <div className="space-y-1.5"><p><strong>Staff:</strong> {selectedOrder.loginUserName}</p><p><strong>Order Type:</strong> <span className="capitalize">{selectedOrder.orderType}</span></p></div>
                                <div className="space-y-1.5"><p><strong>Payment:</strong> <span className="font-semibold">{selectedOrder.paymentMethod}</span></p><p><strong>Counter:</strong> {selectedOrder.counter}</p></div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-700 mb-3">Products</h3>
                                <div className="overflow-x-auto border rounded-lg">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-slate-100 text-slate-600">
                                            <tr>
                                                <th className="p-3 text-left font-semibold">Product Name</th>
                                                <th className="p-3 text-center font-semibold">Qty</th>
                                                <th className="p-3 text-right font-semibold">Rate</th>
                                                <th className="p-3 text-right font-semibold">VAT</th>
                                                <th className="p-3 text-right font-semibold">SD</th>
                                                <th className="p-3 text-right font-semibold">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                            {selectedOrder.products.map((item, index) => (
                                                <tr key={index} className="hover:bg-slate-50">
                                                    <td className="p-3 font-medium text-slate-800">{item.productName}{item.isComplimentary && <span className="ml-1 text-[10px] text-emerald-600 font-bold">(Free)</span>}</td>
                                                    <td className="p-3 text-center text-slate-600">{item.qty}</td>
                                                    <td className="p-3 text-right text-slate-600">{item.isComplimentary ? <span className="line-through text-slate-400">৳{item.rate.toFixed(2)}</span> : `৳${item.rate.toFixed(2)}`}</td>
                                                    <td className="p-3 text-right text-slate-600">{`৳${(item.vat || 0).toFixed(2)}`}</td>
                                                    <td className="p-3 text-right text-slate-600">{`৳${(item.sd || 0).toFixed(2)}`}</td>
                                                    <td className="p-3 text-right font-bold text-slate-800">{item.isComplimentary ? "৳0.00" : `৳${item.subtotal.toFixed(2)}`}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="flex justify-end pt-4 border-t">
                                {/* Responsive totals summary */}
                                <div className="text-sm space-y-2 w-full max-w-xs ml-auto">
                                    <div className="flex justify-between"><span className="text-slate-600">Subtotal:</span><span className="font-medium text-slate-800">৳{(selectedOrder.totalSale - selectedOrder.vat - (selectedOrder.sd || 0)).toFixed(2)}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-600">Total VAT:</span><span className="font-medium text-slate-800">+ ৳{selectedOrder.vat.toFixed(2)}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-600">Total SD:</span><span className="font-medium text-slate-800">+ ৳{(selectedOrder.sd || 0).toFixed(2)}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-600">Discount:</span><span className="font-medium text-rose-500">- ৳{selectedOrder.discount.toFixed(2)}</span></div>
                                    <div className="flex justify-between text-lg font-bold pt-2 border-t mt-2"><span className="text-slate-900">Grand Total:</span><span className="text-indigo-600">৳{selectedOrder.totalAmount.toFixed(2)}</span></div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 border-t rounded-b-lg flex flex-wrap justify-end gap-3">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm bg-slate-200 rounded-md hover:bg-slate-300 transition-colors font-medium">Close</button>
                            <button onClick={() => handlePrintOrder(selectedOrder)} className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium">
                                <FaPrint /> Print Receipt
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isPrintModalOpen && printData && companies[0] && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 relative">
                        <button onClick={() => setIsPrintModalOpen(false)} className="absolute top-3 right-3 text-slate-500 hover:text-slate-800 text-3xl font-bold">&times;</button>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Print Receipt</h2>
                        <p className="text-slate-700 mb-6">Click "Print Now" to generate the receipt for Invoice: <span className="font-semibold">{printData.invoiceSerial}</span>.</p>
                        
                        <div className="hidden">
                            <ReceiptTemplate ref={receiptRef} onPrintComplete={handlePrintComplete} profileData={companies[0]} invoiceData={printData}/>
                        </div>

                        <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-slate-200">
                            <button onClick={() => setIsPrintModalOpen(false)} className="bg-slate-500 text-white py-2 px-5 rounded-md hover:bg-slate-600 transition duration-300 font-semibold">Cancel</button>
                            <button onClick={() => { if (receiptRef.current) { receiptRef.current.printReceipt(); } }} className="bg-indigo-600 text-white py-2 px-5 rounded-md hover:bg-indigo-700 transition duration-300 font-semibold">
                                Print Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderHistory;