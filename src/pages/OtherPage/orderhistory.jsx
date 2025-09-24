import React, { useContext, useState, useEffect, useRef, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import UseAxiosSecure from "../../Hook/UseAxioSecure";
import { MdVisibility, MdPrint, MdClose, MdCalendarToday, MdChevronLeft, MdChevronRight, MdRestaurantMenu, MdPictureAsPdf, MdGridOn } from "react-icons/md";
import { FaMoneyBillWave, FaPercent, FaClipboardList, FaUserFriends, FaWalking, FaMotorcycle, FaWallet, FaCreditCard, FaMobileAlt, FaBuilding, FaGift, FaShoppingBag } from 'react-icons/fa';
import moment from "moment";
import { AuthContext } from "../../providers/AuthProvider";
import useCompanyHook from "../../Hook/useCompanyHook";
import Mtitle from "../../components library/Mtitle";
import ReceiptTemplate from "../../components/Receipt/ReceiptTemplate ";
import DailySummaryPrint from "../../components/Receipt/DailySummaryPrint"; 
import { generatePdf } from "./../../components/utils/generatePdfReport"; 
import { generateExcel } from "./../../components/utils/generateExcelReport"; 
import { motion, AnimatePresence } from "framer-motion";
import MtableLoading from "../../components library/MtableLoading"; 

const SalesSummaryFooter = ({ data }) => {
    // ... (Your existing SalesSummaryFooter component code remains unchanged)
    const iconMap = {
        "Gross Sales": <FaMoneyBillWave className="text-2xl text-blue-600" />,
        "Total Discount": <FaPercent className="text-2xl text-red-500" />,
        "Table Discount": <FaPercent className="text-2xl text-red-500" />,
        "Total VAT": <FaPercent className="text-2xl text-purple-500" />,
        "Total SD": <FaPercent className="text-2xl text-orange-500" />,
        "Cash Collection": <FaWallet className="text-2xl text-green-600" />,
        "Card Collection": <FaCreditCard className="text-2xl text-indigo-600" />,
        "Mobile Banking": <FaMobileAlt className="text-2xl text-teal-600" />,
        "Bank Collection": <FaBuilding className="text-2xl text-slate-500" />,
        "Total Guest Count": <FaUserFriends className="text-2xl text-yellow-600" />,
        "Avg Per Person": <FaUserFriends className="text-2xl text-cyan-600" />,
        "Complimentary": <FaGift className="text-2xl text-pink-500" />,
        "Dine In Order": <MdRestaurantMenu className="text-2xl text-amber-600" />,
        "Takeaway Order": <FaWalking className="text-2xl text-lime-600" />,
        "Delivery Order": <FaMotorcycle className="text-2xl text-rose-600" />,
        "Pathao Sale": <FaMotorcycle className="text-2xl text-blue-500" />,
        "Foodi Sale": <FaShoppingBag className="text-2xl text-blue-500" />,
        "Foodpanda Sale": <FaShoppingBag className="text-2xl text-blue-500" />,
        "Delivery Boy Sale": <FaMotorcycle className="text-2xl text-blue-500" />,
    };

    const SummaryItem = ({ label, value, isAmount = true, valueColor }) => (
        <motion.div 
            whileHover={{ scale: 1.03, boxShadow: "0 8px 16px rgba(0,0,0,0.1)" }}
            transition={{ type: "spring", stiffness: 300 }}
            className="flex items-center gap-4 bg-base-100 p-4 rounded-xl shadow-sm border border-slate-100"
        >
            <div className="flex-shrink-0">{iconMap[label] || <FaClipboardList className="text-2xl text-slate-400" />}</div>
            <div>
                <p className="text-xs text-slate-500 uppercase font-medium truncate">{label}</p>
                <p className={`text-xl font-bold ${valueColor || 'text-blue-600'}`}>
                    {isAmount ? `৳${value.toFixed(2)}` : value}
                </p>
            </div>
        </motion.div>
    );

    const grossSales = (data.totalAmount || 0) + (data.totalDiscount || 0);
    const netSales = data.totalAmount || 0;
    const avgPerPerson = data.totalGuestCount > 0 ? netSales / data.totalGuestCount : 0;
    
    const deliveryProviderLabels = {
        pathao: "Pathao Sale", foodi: "Foodi Sale",
        foodpanda: "Foodpanda Sale", deliveryBoy: "Delivery Boy Sale"
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="card bg-base-100 shadow-xl mt-6">
            <div className="card-body p-4 sm:p-6 lg:p-8">
                <div className="text-center mb-8 border-b border-slate-200 pb-6">
                    <p className="text-sm text-slate-700 uppercase tracking-widest font-semibold mb-2">Total Net Sales</p>
                    <p className="text-5xl md:text-6xl font-extrabold text-blue-700 tracking-tight leading-none">
                        ৳{netSales.toFixed(2)}
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <SummaryItem label="Gross Sales" value={grossSales} />
                    <SummaryItem label="Total Discount" value={data.totalDiscount} valueColor="text-red-600" />
                    <SummaryItem label="Table Discount" value={data.totalTableDiscount} valueColor="text-red-600" />
                    <SummaryItem label="Total VAT" value={data.totalVat} valueColor="text-purple-600" />
                    <SummaryItem label="Total SD" value={data.totalSd} valueColor="text-orange-600" />
                    <SummaryItem label="Cash Collection" value={data.cashPayments} valueColor="text-green-600" />
                    <SummaryItem label="Card Collection" value={data.cardPayments} valueColor="text-indigo-600" />
                    <SummaryItem label="Mobile Banking" value={data.mobilePayments} valueColor="text-teal-600" />
                    <SummaryItem label="Bank Collection" value={data.bankPayments} valueColor="text-slate-600" />
                    <SummaryItem label="Total Guest Count" value={data.totalGuestCount} isAmount={false} valueColor="text-yellow-600" />
                    <SummaryItem label="Avg Per Person" value={avgPerPerson} valueColor="text-cyan-600" />
                    <SummaryItem label="Complimentary" value={data.totalComplimentaryAmount} valueColor="text-pink-600" />
                    {data.salesByOrderType && Object.entries(data.salesByOrderType).map(([type, amount]) => amount > 0 && <SummaryItem key={type} label={`${type.replace('-', ' ')} Order`} value={amount} valueColor={type === 'dine-in' ? 'text-amber-600' : type === 'takeaway' ? 'text-lime-600' : 'text-rose-600'} />)}
                    {data.salesByDeliveryProvider && Object.entries(data.salesByDeliveryProvider).map(([provider, amount]) => amount > 0 && <SummaryItem key={provider} label={deliveryProviderLabels[provider] || provider} value={amount} valueColor="text-violet-600" />)}
                </div>
            </div>
        </motion.div>
    );
};

const OrderHistory = () => {
    const [date, setDate] = useState(new Date());
    const [orderData, setOrderData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const ordersPerPage = 10;
    const axiosSecure = UseAxiosSecure();
    const { branch } = useContext(AuthContext);
    const { companies } = useCompanyHook();
    const receiptRef = useRef();
    const summaryReceiptRef = useRef();

    const [showcaseData, setShowcaseData] = useState({ totalOrders: 0, totalQty: 0, totalAmount: 0, totalVat: 0, totalSd: 0, totalDiscount: 0, totalComplimentaryAmount: 0, cashPayments: 0, cardPayments: 0, mobilePayments: 0, bankPayments: 0, totalTableDiscount: 0, totalGuestCount: 0, salesByDeliveryProvider: {}, salesByOrderType: { dineIn: 0, takeaway: 0, delivery: 0 } });
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [isSummaryPrintModalOpen, setIsSummaryPrintModalOpen] = useState(false);
    const [printData, setPrintData] = useState(null);

    const fetchOrders = useCallback(async (selectedDate) => {
        if (!branch) return;
        setIsLoading(true);
        try {
            const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
            const response = await axiosSecure.get(`/invoice/${branch}/date/${formattedDate}`);
            const data = response.data;
            if (data && data.orders) {
                const totalSd = data.orders.reduce((sum, order) => sum + (order.sd || 0), 0);
                const totalGuestCount = data.orders.reduce((sum, order) => sum + (order.guestCount || 1), 0);
                setShowcaseData({ totalOrders: data.totalOrders || 0, totalQty: data.totalQty || 0, totalAmount: data.totalAmount || 0, totalTableDiscount: data.totalTableDiscount || 0, totalVat: data.totalVat || 0, totalDiscount: data.totalDiscount || 0, totalComplimentaryAmount: data.totalComplimentaryAmount || 0, cashPayments: data.cashPayments || 0, cardPayments: data.cardPayments || 0, mobilePayments: data.mobilePayments || 0, bankPayments: data.bankPayments || 0, salesByDeliveryProvider: data.salesByDeliveryProvider || {}, salesByOrderType: data.salesByOrderType || { dineIn: 0, takeaway: 0, delivery: 0 }, totalSd: totalSd, totalGuestCount: totalGuestCount });
                setOrderData(data.orders);
            } else {
                setShowcaseData({ totalOrders: 0, totalQty: 0, totalAmount: 0, totalVat: 0, totalSd: 0, totalDiscount: 0, totalComplimentaryAmount: 0, cashPayments: 0, cardPayments: 0, mobilePayments: 0, bankPayments: 0, totalGuestCount: 0, salesByDeliveryProvider: {}, totalTableDiscount: 0, salesByOrderType: { dineIn: 0, takeaway: 0, delivery: 0 } });
                setOrderData([]);
            }
        } catch (error) {
            console.error("Error fetching order history:", error);
            setOrderData([]);
            setShowcaseData({ totalOrders: 0, totalQty: 0, totalAmount: 0, totalVat: 0, totalSd: 0, totalDiscount: 0, totalComplimentaryAmount: 0, cashPayments: 0, cardPayments: 0, mobilePayments: 0, bankPayments: 0, totalGuestCount: 0, salesByDeliveryProvider: {}, totalTableDiscount: 0, salesByOrderType: { dineIn: 0, takeaway: 0, delivery: 0 } });
        } finally { setIsLoading(false); }
    }, [axiosSecure, branch]);
    
    useEffect(() => { fetchOrders(date); }, [branch, date, fetchOrders]);
    
    const handleDateChange = (newDate) => { setDate(newDate); setCurrentPage(1); };
    const handleViewDetails = (order) => { setSelectedOrder(order); setShowModal(true); };
    const handlePrintOrder = (order) => { setPrintData(order); setShowModal(false); setIsPrintModalOpen(true); };
    const handlePrintComplete = () => { setIsPrintModalOpen(false); setPrintData(null); };
    const handlePrintSummary = () => { setIsSummaryPrintModalOpen(true); };
    const handleSummaryPrintComplete = () => { setIsSummaryPrintModalOpen(false); };

    const handleExportPdf = () => {
        const reportData = { orders: orderData, summary: showcaseData, company: companies[0], date };
        generatePdf(reportData);
    };

    const handleExportExcel = () => {
        const reportData = { orders: orderData, summary: showcaseData, company: companies[0], date };
        generateExcel(reportData);
    };

    const pageCount = Math.ceil(orderData.length / ordersPerPage);
    const currentOrders = orderData.slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage);

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-base-200 min-h-screen">
            <Mtitle title="Daily Order Report" rightcontent={
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <DatePicker selected={date} onChange={handleDateChange} className="border border-slate-200 rounded-xl p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 pl-10" dateFormat="MMMM d, yyyy" />
                        <MdCalendarToday className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handlePrintSummary} className="btn btn-ghost btn-circle text-blue-600 hover:bg-blue-100" title="Print POS Summary"><MdPrint className="text-xl" /></motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleExportPdf} className="btn btn-ghost btn-circle text-blue-600 hover:bg-blue-100" title="Export as PDF"><MdPictureAsPdf className="text-xl" /></motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleExportExcel} className="btn btn-ghost btn-circle text-blue-600 hover:bg-blue-100" title="Export as Excel"><MdGridOn className="text-xl" /></motion.button>
                </div>
            } />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="card bg-base-100 shadow-xl mt-6">
                <div className="card-body p-4 sm:p-6 lg:p-8">
                    <h3 className="text-xl font-semibold text-blue-600 mb-4">Details for {moment(date).format("MMMM Do, YYYY")}</h3>
                    {isLoading ? <MtableLoading /> : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="table w-full">
                                    <thead><tr className="bg-blue-600 text-white uppercase text-xs tracking-wider"><th className="p-3 rounded-tl-lg">#</th><th className="p-3">Time</th><th className="p-3">Invoice ID</th><th className="p-3">Items</th><th className="p-3 text-right">Amount</th><th className="p-3 text-center rounded-tr-lg">Action</th></tr></thead>
                                    <tbody>
                                        <AnimatePresence>
                                            {currentOrders.length > 0 ? (
                                                currentOrders.map((order, index) => (
                                                    <motion.tr key={order._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-blue-50 border-b border-slate-200 text-sm text-slate-700">
                                                        <td className="p-3">{(currentPage - 1) * ordersPerPage + index + 1}</td>
                                                        <td className="p-3 whitespace-nowrap">{moment(order.dateTime).format('h:mm A')}</td>
                                                        <td className="p-3 font-mono text-blue-600 whitespace-nowrap">{order.invoiceSerial}</td>
                                                        <td className="p-3">{order.totalQty}</td>
                                                        <td className="p-3 font-bold text-right text-green-600">৳{order.totalAmount.toFixed(2)}</td>
                                                        <td className="p-3"><div className="flex justify-center items-center gap-2"><motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleViewDetails(order)} className="btn btn-circle btn-sm bg-blue-600 hover:bg-blue-700 text-white" title="View Details"><MdVisibility /></motion.button><motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handlePrintOrder(order)} className="btn btn-ghost btn-circle btn-sm text-blue-600 hover:bg-blue-100" title="Print Receipt"><MdPrint /></motion.button></div></td>
                                                    </motion.tr>
                                                ))
                                            ) : (<tr><td colSpan="6" className="text-center py-16 text-slate-700">No orders found for this date.</td></tr>)}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                            {orderData.length > ordersPerPage && (
                                <div className="mt-8 flex justify-center">
                                    <div className="join">
                                        <button onClick={() => setCurrentPage(c => Math.max(1, c - 1))} disabled={currentPage === 1} className="join-item btn btn-sm"><MdChevronLeft /></button>
                                        <button className="join-item btn btn-sm">Page {currentPage} of {pageCount}</button>
                                        <button onClick={() => setCurrentPage(c => Math.min(pageCount, c + 1))} disabled={currentPage === pageCount} className="join-item btn btn-sm"><MdChevronRight /></button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </motion.div>
            
            {!isLoading && <SalesSummaryFooter data={showcaseData} />}

            <AnimatePresence>
                {showModal && selectedOrder && (
                     <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-base-100 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                            <div className="flex justify-between items-center p-5 border-b border-slate-200"><h2 className="text-xl font-semibold text-blue-600">Order Details: {selectedOrder.invoiceSerial}</h2><motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShowModal(false)} className="btn btn-sm btn-circle btn-ghost"><MdClose /></motion.button></div>
                            <div className="p-6 space-y-6 overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm border-b border-slate-200 pb-4"><div className="space-y-1.5"><p><strong>Staff:</strong> {selectedOrder.loginUserName}</p><p><strong>Order Type:</strong> <span className="capitalize">{selectedOrder.orderType.replace('-', ' ')}</span></p></div><div className="space-y-1.5"><p><strong>Payment:</strong> <span className="font-semibold">{selectedOrder.paymentMethod}</span></p><p><strong>Counter:</strong> {selectedOrder.counter}</p></div></div>
                                <div><h3 className="text-xl font-semibold text-blue-600 mb-3">Products</h3><div className="overflow-x-auto border border-slate-200 rounded-lg"><table className="min-w-full text-sm"><thead className="bg-slate-100 text-slate-700"><tr><th className="p-3 text-left font-semibold">Product</th><th className="p-3 text-center font-semibold">Qty</th><th className="p-3 text-right font-semibold">Rate</th><th className="p-3 text-right font-semibold">VAT</th><th className="p-3 text-right font-semibold">SD</th><th className="p-3 text-right font-semibold">Subtotal</th></tr></thead><tbody className="divide-y divide-slate-200">{selectedOrder.products.map((item, index) => (<tr key={index} className="hover:bg-blue-50"><td className="p-3 font-medium text-slate-700">{item.productName}{item.isComplimentary && <span className="ml-1 text-[10px] text-green-600 font-bold">(Free)</span>}</td><td className="p-3 text-center text-slate-700">{item.qty}</td><td className="p-3 text-right text-slate-700">{item.isComplimentary ? <span className="line-through text-slate-400">৳{item.rate.toFixed(2)}</span> : `৳${item.rate.toFixed(2)}`}</td><td className="p-3 text-right text-slate-700">{`৳${(item.vat || 0).toFixed(2)}`}</td><td className="p-3 text-right text-slate-700">{`৳${(item.sd || 0).toFixed(2)}`}</td><td className="p-3 text-right font-bold text-slate-700">{item.isComplimentary ? "৳0.00" : `৳${item.subtotal.toFixed(2)}`}</td></tr>))}</tbody></table></div></div>
                                <div className="flex justify-end pt-4 border-t border-slate-200"><div className="text-sm space-y-2 w-full max-w-xs ml-auto"><div className="flex justify-between"><span className="text-slate-700">Subtotal:</span><span className="font-medium text-slate-700">৳{(selectedOrder.totalSale - selectedOrder.vat - (selectedOrder.sd || 0)).toFixed(2)}</span></div><div className="flex justify-between"><span className="text-slate-700">Total VAT:</span><span className="font-medium text-slate-700">+ ৳{selectedOrder.vat.toFixed(2)}</span></div><div className="flex justify-between"><span className="text-slate-700">Total SD:</span><span className="font-medium text-slate-700">+ ৳{(selectedOrder.sd || 0).toFixed(2)}</span></div><div className="flex justify-between"><span className="text-slate-700">Discount:</span><span className="font-medium text-red-600">- ৳{selectedOrder.discount.toFixed(2)}</span></div><div className="flex justify-between text-lg font-bold pt-2 border-t mt-2"><span className="text-slate-700">Grand Total:</span><span className="font-bold text-lg text-blue-600">৳{selectedOrder.totalAmount.toFixed(2)}</span></div></div></div>
                            </div>
                            <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-lg flex flex-wrap justify-end gap-3"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowModal(false)} className="btn btn-ghost rounded-xl">Close</motion.button><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handlePrintOrder(selectedOrder)} className="btn bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-md flex items-center gap-2"><MdPrint /> Print Receipt</motion.button></div>
                        </motion.div>
                    </div>
                )}
                {isPrintModalOpen && printData && companies[0] && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-base-100 p-6 rounded-xl shadow-xl w-full max-w-md">
                            <h2 className="text-xl font-semibold text-blue-600 mb-4">Print Receipt</h2><p className="text-slate-700 mb-6">Click "Print Now" to generate the receipt for Invoice: <span className="font-semibold">{printData.invoiceSerial}</span>.</p><div className="hidden"><ReceiptTemplate ref={receiptRef} onPrintComplete={handlePrintComplete} profileData={companies[0]} invoiceData={printData} /></div>
                            <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-slate-200"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsPrintModalOpen(false)} className="btn rounded-xl">Cancel</motion.button><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { if (receiptRef.current) { receiptRef.current.printReceipt(); } }} className="btn bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-md">Print Now</motion.button></div>
                        </motion.div>
                    </div>
                )}
                {isSummaryPrintModalOpen && companies[0] && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-base-100 p-6 rounded-xl shadow-xl w-full max-w-md">
                            <h2 className="text-xl font-semibold text-blue-600 mb-4">Print Daily Summary</h2><p className="text-slate-700 mb-6">Click "Print Now" to generate the summary report for <span className="font-semibold">{moment(date).format("MMMM Do, YYYY")}</span>.</p><div className="hidden"><DailySummaryPrint ref={summaryReceiptRef} profileData={companies[0]} summaryData={showcaseData} reportDate={date} /></div>
                            <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-slate-200"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSummaryPrintComplete} className="btn rounded-xl">Cancel</motion.button><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { if (summaryReceiptRef.current) { summaryReceiptRef.current.printReceipt(); } }} className="btn bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-md">Print Now</motion.button></div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OrderHistory;