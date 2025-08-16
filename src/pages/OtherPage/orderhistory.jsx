import React, { useContext, useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ReactPaginate from "react-paginate";
import * as XLSX from "xlsx";
import UseAxiosSecure from "../../Hook/UseAxioSecure";
import { FaEye, FaCalendarAlt, FaBoxOpen, FaChartLine, FaFileInvoiceDollar, FaTimes, FaTags, FaPercentage, FaMoneyBill, FaCreditCard, FaMobileAlt, FaFileExcel, FaPrint, FaGift } from "react-icons/fa";
import { FaCcVisa, FaCcAmex } from "react-icons/fa6";
import { RiMastercardFill } from "react-icons/ri";
import { MdOutlineSendToMobile } from "react-icons/md";
import moment from "moment";
import Preloader from "../../components/Shortarea/Preloader";
import { AuthContext } from "../../providers/AuthProvider";
import useCompanyHook from "../../Hook/useCompanyHook";
import Mtitle from "../../components library/Mtitle";

// Individual POS Receipt (The only print component remaining)
const IndividualReceipt = React.forwardRef(({ profileData, invoiceData }, ref) => {
    if (!profileData || !invoiceData) return null;

    const getPaymentIcon = (method) => {
        switch (method) {
            case 'Cash':
                return <FaMoneyBill className="inline-block mr-1" />;
            case 'Visa Card':
                return <FaCcVisa className="inline-block mr-1" />;
            case 'Master Card':
                return <RiMastercardFill className="inline-block mr-1" />;
            case 'Amex Card':
                return <FaCcAmex className="inline-block mr-1" />;
            case 'Bkash':
                return <MdOutlineSendToMobile className="inline-block mr-1" />;
            case 'Nagad':
                return <MdOutlineSendToMobile className="inline-block mr-1" />;
            case 'Rocket':
                return <MdOutlineSendToMobile className="inline-block mr-1" />;
            default:
                return null;
        }
    };

    return (
        <div ref={ref} className="p-2 bg-white text-black" style={{ width: '80mm', fontFamily: 'monospace' }}>
            <div className="text-center mb-2">
                <h2 className="text-xl font-bold">{profileData.name}</h2>
                <p className="text-xs">{profileData.address}</p>
                <p className="text-xs">Contact: {profileData.phone}</p>
                {profileData.binNumber && <p className="text-xs">BIN: {profileData.binNumber}</p>}
            </div>
            <hr className="border-dashed border-black my-2" />
            <div className="text-xs text-center">
                {invoiceData.orderType === "dine-in" && <p className="text-sm font-bold">Table: {invoiceData.tableName}</p>}
                <p>Invoice: {invoiceData.invoiceSerial}</p>
                <p>Date: {moment(invoiceData.dateTime).format("DD-MMM-YYYY h:mm A")}</p>
                <p>Served By: {invoiceData.loginUserName}</p>
                <p className="mt-1">
                    <strong>Paid by:</strong> {getPaymentIcon(invoiceData.paymentMethod)} {invoiceData.paymentMethod}
                </p>
            </div>
            <hr className="border-dashed border-black my-2" />
            <table className="w-full text-xs">
                <thead>
                    <tr>
                        <th className="text-left">Item</th>
                        <th className="text-center">Qty</th>
                        <th className="text-right">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {invoiceData.products.map((item, index) => (
                        <tr key={index}>
                            <td>
                                {item.productName}
                                {item.isComplimentary && <span className="ml-1 text-[10px] text-green-600 font-bold">(Free)</span>}
                            </td>
                            <td className="text-center">{item.qty}</td>
                            <td className="text-right">
                                {item.isComplimentary ? (
                                    <>
                                        <span className="line-through text-gray-500 mr-1">৳{(item.rate * item.qty).toFixed(2)}</span>
                                        ৳0.00
                                    </>
                                ) : (
                                    `৳${item.subtotal.toFixed(2)}`
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <hr className="border-dashed border-black my-2" />
            <div className="text-xs text-right space-y-1">
                <p>Subtotal: ৳{invoiceData.totalSale.toFixed(2)}</p>
                {invoiceData.vat > 0 && <p>VAT: ৳{invoiceData.vat.toFixed(2)}</p>}
                {invoiceData.discount > 0 && <p>Discount: -৳{invoiceData.discount.toFixed(2)}</p>}
                <p className="font-bold text-sm">Total: ৳{invoiceData.totalAmount.toFixed(2)}</p>
            </div>
            <hr className="border-dashed border-black my-2" />
            <div className="text-center">
                <p className="font-bold capitalize text-sm">{invoiceData.orderType}</p>
                <p className="text-xs mt-2">Thank you!</p>
            </div>
        </div>
    );
});

const OrderHistory = () => {
    const [date, setDate] = useState(new Date());
    const [orderData, setOrderData] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const ordersPerPage = 10;
    const axiosSecure = UseAxiosSecure();
    const { branch } = useContext(AuthContext);
    const { companies } = useCompanyHook();
    const companyInfo = companies[0];

    // Reference for the individual receipt for printing
    const individualReceiptRef = useRef();

    const [showcaseData, setShowcaseData] = useState({
        totalOrders: 0, totalQuantity: 0, totalAmount: 0, totalVat: 0,
        totalDiscount: 0, totalComplimentary: 0,
        cashPayments: 0,
        cardPayments: 0,
        mobilePayments: 0,
        visaPayments: 0,
        mastercardPayments: 0,
        amexPayments: 0,
        bkashPayments: 0,
        nagadPayments: 0,
        rocketPayments: 0,
    });
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const fetchOrders = async (selectedDate) => {
        if (!branch) return;
        setIsLoading(true);
        try {
            const formattedDate = moment(selectedDate).format('YYYY-MM-DD');
            const response = await axiosSecure.get(`/invoice/${branch}/date/${formattedDate}`);
            const data = response.data;
            if (data && data.orders) {
                const calculatedPayments = {
                    cashPayments: 0, cardPayments: 0, mobilePayments: 0,
                    visaPayments: 0, mastercardPayments: 0, amexPayments: 0,
                    bkashPayments: 0, nagadPayments: 0, rocketPayments: 0
                };
                let totalComplimentary = 0;
                data.orders.forEach(order => {
                    totalComplimentary += order.products.filter(p => p.isComplimentary).reduce((sum, item) => sum + (item.rate * item.qty), 0);
                    switch (order.paymentMethod) {
                        case 'Cash':
                            calculatedPayments.cashPayments += order.totalAmount;
                            break;
                        case 'Visa Card':
                            calculatedPayments.cardPayments += order.totalAmount;
                            calculatedPayments.visaPayments += order.totalAmount;
                            break;
                        case 'Master Card':
                            calculatedPayments.cardPayments += order.totalAmount;
                            calculatedPayments.mastercardPayments += order.totalAmount;
                            break;
                        case 'Amex Card':
                            calculatedPayments.cardPayments += order.totalAmount;
                            calculatedPayments.amexPayments += order.totalAmount;
                            break;
                        case 'Bkash':
                            calculatedPayments.mobilePayments += order.totalAmount;
                            calculatedPayments.bkashPayments += order.totalAmount;
                            break;
                        case 'Nagad':
                            calculatedPayments.mobilePayments += order.totalAmount;
                            calculatedPayments.nagadPayments += order.totalAmount;
                            break;
                        case 'Rocket':
                            calculatedPayments.mobilePayments += order.totalAmount;
                            calculatedPayments.rocketPayments += order.totalAmount;
                            break;
                        default:
                            break;
                    }
                });

                setShowcaseData({
                    totalOrders: data.totalOrders || 0,
                    totalQuantity: data.totalQty || 0,
                    totalAmount: data.totalAmount || 0,
                    totalVat: data.totalVat || 0,
                    totalDiscount: data.totalDiscount || 0,
                    totalComplimentary: totalComplimentary,
                    ...calculatedPayments
                });
                setOrderData(data.orders);
            } else {
                setShowcaseData({
                    totalOrders: 0, totalQuantity: 0, totalAmount: 0, totalVat: 0, totalDiscount: 0,
                    totalComplimentary: 0, cashPayments: 0, cardPayments: 0, mobilePayments: 0,
                    visaPayments: 0, mastercardPayments: 0, amexPayments: 0,
                    bkashPayments: 0, nagadPayments: 0, rocketPayments: 0
                });
                setOrderData([]);
            }
        } catch (error) {
            console.error("Error fetching order history:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchOrders(date); }, [branch]);

    const handleDateChange = (newDate) => { setDate(newDate); fetchOrders(newDate); };
    const handlePageClick = (selectedPage) => { setCurrentPage(selectedPage.selected); };
    const handleViewDetails = (order) => { setSelectedOrder(order); setShowModal(true); };

    const handleExcelDownload = () => {
        const summaryData = [
            { Category: "Total Orders", Value: showcaseData.totalOrders },
            { Category: "Total Items Sold", Value: showcaseData.totalQuantity },
            { Category: "Total Revenue (৳)", Value: showcaseData.totalAmount.toFixed(2) },
            { Category: "Total VAT (৳)", Value: showcaseData.totalVat.toFixed(2) },
            { Category: "Total Discount (৳)", Value: showcaseData.totalDiscount.toFixed(2) },
            { Category: "Total Complimentary (৳)", Value: showcaseData.totalComplimentary.toFixed(2) },
            { Category: "Cash Payments (৳)", Value: showcaseData.cashPayments.toFixed(2) },
            { Category: "Card Payments (৳)", Value: showcaseData.cardPayments.toFixed(2) },
            { Category: "Visa Card Payments (৳)", Value: showcaseData.visaPayments.toFixed(2) },
            { Category: "Master Card Payments (৳)", Value: showcaseData.mastercardPayments.toFixed(2) },
            { Category: "Amex Card Payments (৳)", Value: showcaseData.amexPayments.toFixed(2) },
            { Category: "Mobile Payments (৳)", Value: showcaseData.mobilePayments.toFixed(2) },
            { Category: "bKash Payments (৳)", Value: showcaseData.bkashPayments.toFixed(2) },
            { Category: "Nagad Payments (৳)", Value: showcaseData.nagadPayments.toFixed(2) },
            { Category: "Rocket Payments (৳)", Value: showcaseData.rocketPayments.toFixed(2) },
        ];
        const ordersListData = orderData.map((order, index) => ({
            '#': index + 1,
            'Time': moment(order.dateTime).format('h:mm A'),
            'Invoice ID': order.invoiceSerial,
            'Items': order.totalQty,
            'Payment Method': order.paymentMethod,
            'Amount (৳)': order.totalAmount.toFixed(2),
        }));

        const summarySheet = XLSX.utils.json_to_sheet(summaryData);
        const ordersSheet = XLSX.utils.json_to_sheet(ordersListData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, summarySheet, "Daily Summary");
        XLSX.utils.book_append_sheet(workbook, ordersSheet, "Order Details");
        XLSX.writeFile(workbook, `Daily_Report_${moment(date).format('YYYY-MM-DD')}.xlsx`);
    };

    // A single, reusable function for all print actions
    const handlePrint = (printType) => {
        alert(`You are attempting to print a "${printType}" report. The printing functionality has been disabled for this version.`);
    };

    const currentOrders = orderData.slice(currentPage * ordersPerPage, (currentPage + 1) * ordersPerPage);
    
    // New styled SummaryCard component
    const SummaryCard = ({ icon, title, value, color }) => (
        <div className={`bg-white p-4 rounded-xl shadow-lg transform transition-transform hover:scale-105 border-l-8 border-${color}-500 flex items-center gap-4`}>
            <div className={`p-3 rounded-full bg-${color}-100 text-${color}-600`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
    
    // New styled PaymentSummaryCard component
    const PaymentSummaryCard = ({ title, data }) => (
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-8 border-gray-500">
            <h3 className="text-xl font-bold text-gray-700 mb-4">{title}</h3>
            <div className="space-y-3">
                {data.cashPayments > 0 && (
                    <div className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-3 text-gray-600 font-semibold"><FaMoneyBill className="text-lg text-green-500" /> Cash</span>
                        <span className="font-bold text-gray-800">৳{data.cashPayments.toFixed(2)}</span>
                    </div>
                )}
                {data.cardPayments > 0 && (
                    <>
                        <div className="flex justify-between items-center text-sm">
                            <span className="flex items-center gap-3 text-gray-600 font-semibold"><FaCreditCard className="text-lg text-blue-500" /> Card</span>
                            <span className="font-bold text-gray-800">৳{data.cardPayments.toFixed(2)}</span>
                        </div>
                        <div className="ml-6 space-y-2 text-xs">
                            {data.visaPayments > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-2 text-gray-500"><FaCcVisa /> Visa Card</span>
                                    <span className="font-medium text-gray-700">৳{data.visaPayments.toFixed(2)}</span>
                                </div>
                            )}
                            {data.mastercardPayments > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-2 text-gray-500"><RiMastercardFill /> Master Card</span>
                                    <span className="font-medium text-gray-700">৳{data.mastercardPayments.toFixed(2)}</span>
                                </div>
                            )}
                            {data.amexPayments > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-2 text-gray-500"><FaCcAmex /> Amex Card</span>
                                    <span className="font-medium text-gray-700">৳{data.amexPayments.toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                    </>
                )}
                {data.mobilePayments > 0 && (
                    <>
                        <div className="flex justify-between items-center text-sm">
                            <span className="flex items-center gap-3 text-gray-600 font-semibold"><FaMobileAlt className="text-lg text-purple-500" /> Mobile</span>
                            <span className="font-bold text-gray-800">৳{data.mobilePayments.toFixed(2)}</span>
                        </div>
                        <div className="ml-6 space-y-2 text-xs">
                            {data.bkashPayments > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-2 text-gray-500"><MdOutlineSendToMobile /> bKash</span>
                                    <span className="font-medium text-gray-700">৳{data.bkashPayments.toFixed(2)}</span>
                                </div>
                            )}
                            {data.nagadPayments > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-2 text-gray-500"><MdOutlineSendToMobile /> Nagad</span>
                                    <span className="font-medium text-gray-700">৳{data.nagadPayments.toFixed(2)}</span>
                                </div>
                            )}
                            {data.rocketPayments > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="flex items-center gap-2 text-gray-500"><MdOutlineSendToMobile /> Rocket</span>
                                    <span className="font-medium text-gray-700">৳{data.rocketPayments.toFixed(2)}</span>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <div className="p-4 md:p-6 bg-gray-100 min-h-screen font-sans">
            <div className="flex justify-between items-center mb-6">
                 <Mtitle title="Daily Order Report" />
             
                <div className="flex items-center gap-3">
                    <button onClick={handleExcelDownload} className="flex items-center gap-2 p-3 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors" title="Download Excel">
                        <FaFileExcel />
                        <span className="hidden md:inline">Excel</span>
                    </button>
                    <button onClick={() => handlePrint("A4")} className="flex items-center gap-2 p-3 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors" title="Print A4 Report">
                        <FaPrint />
                        <span className="hidden md:inline">A4</span>
                    </button>
                    <button onClick={() => handlePrint("POS")} className="flex items-center gap-2 p-3 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors" title="Print POS Summary">
                        <FaPrint />
                        <span className="hidden md:inline">POS</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-lg border-l-8 border-blue-600">
                        <label className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2"><FaCalendarAlt /> Select Report Date</label>
                        <DatePicker selected={date} onChange={handleDateChange} className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition-all" dateFormat="MMMM d, yyyy" />
                    </div>

                    <SummaryCard icon={<FaFileInvoiceDollar size={24} />} title="Total Orders" value={showcaseData.totalOrders} color="blue" />
                    <SummaryCard icon={<FaBoxOpen size={24} />} title="Total Items Sold" value={showcaseData.totalQuantity} color="purple" />
                    <SummaryCard icon={<FaChartLine size={24} />} title="Total Revenue" value={`৳${showcaseData.totalAmount.toFixed(2)}`} color="green" />
                    <SummaryCard icon={<FaPercentage size={24} />} title="Total VAT" value={`৳${showcaseData.totalVat.toFixed(2)}`} color="yellow" />
                    <SummaryCard icon={<FaTags size={24} />} title="Total Discount" value={`৳${showcaseData.totalDiscount.toFixed(2)}`} color="red" />
                    <SummaryCard icon={<FaGift size={24} />} title="Total Complimentary" value={`৳${showcaseData.totalComplimentary.toFixed(2)}`} color="pink" />
                    <PaymentSummaryCard title="Payment Methods" data={showcaseData} />
                </div>

                <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-lg border">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">Order Details for {moment(date).format("MMMM Do, YYYY")}</h3>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full min-h-[400px]"><Preloader /></div>
                    ) : (
                        <>
                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                <table className="w-full text-left">
                                    <thead className="border-b-2 bg-gray-50 text-sm text-gray-600">
                                        <tr>
                                            <th className="p-4 font-semibold">#</th>
                                            <th className="p-4 font-semibold">Time</th>
                                            <th className="p-4 font-semibold">Invoice ID</th>
                                            <th className="p-4 font-semibold">Items</th>
                                            <th className="p-4 font-semibold text-right">Amount</th>
                                            <th className="p-4 font-semibold text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {currentOrders.length > 0 ? (
                                            currentOrders.map((order, index) => (
                                                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="p-4">{index + 1 + currentPage * ordersPerPage}</td>
                                                    <td className="p-4">{moment(order.dateTime).format('h:mm A')}</td>
                                                    <td className="p-4 font-mono text-sm text-blue-600">{order.invoiceSerial}</td>
                                                    <td className="p-4">{order.totalQty}</td>
                                                    <td className="p-4 font-bold text-right text-green-700">৳{order.totalAmount.toFixed(2)}</td>
                                                    <td className="p-4 text-center">
                                                        <button onClick={() => handleViewDetails(order)} className="text-blue-600 hover:text-blue-800 transition-colors" title="View Details">
                                                            <FaEye size={20} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="6" className="text-center py-16 text-gray-500">No orders found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {orderData.length > ordersPerPage && (
                                <div className="mt-8">
                                    <ReactPaginate
                                        previousLabel={"< Prev"} nextLabel={"Next >"} pageCount={Math.ceil(orderData.length / ordersPerPage)}
                                        onPageChange={handlePageClick} containerClassName={"flex justify-center items-center gap-4 text-sm"}
                                        pageLinkClassName={"px-4 py-2 rounded-lg transition-colors hover:bg-gray-200"}
                                        previousLinkClassName={"px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 transition-colors"}
                                        nextLinkClassName={"px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-100 transition-colors"}
                                        activeLinkClassName={"bg-blue-600 text-white hover:bg-blue-700"}
                                        disabledClassName={"opacity-40 cursor-not-allowed"}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <div className="hidden">
                {/* The individual receipt component is still here for the 'Print Receipt' button in the modal */}
                <IndividualReceipt ref={individualReceiptRef} profileData={companyInfo} invoiceData={selectedOrder} />
            </div>

            {showModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl transform transition-all max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b bg-gray-50 rounded-t-2xl sticky top-0 z-10">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
                                <p className="text-sm text-gray-500 font-mono">Invoice: {selectedOrder.invoiceSerial}</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500 transition-colors"><FaTimes size={24} /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm border-b pb-4">
                                <div className="space-y-1">
                                    <p><strong>Staff:</strong> {selectedOrder.loginUserName}</p>
                                    <p><strong>Order Type:</strong> <span className="capitalize">{selectedOrder.orderType}</span></p>
                                    <p><strong>Payment Method:</strong> <span className="font-semibold">{selectedOrder.paymentMethod}</span></p>
                                </div>
                                <div className="space-y-1">
                                    <p><strong>Status:</strong> <span className="capitalize font-bold text-blue-600">{selectedOrder.orderStatus}</span></p>
                                    <p><strong>Counter:</strong> {selectedOrder.counter}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-700 mb-4">Products</h3>
                                <div className="overflow-x-auto border rounded-lg">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="p-3 text-left font-medium text-gray-600">Product Name</th>
                                                <th className="p-3 text-center font-medium text-gray-600">Qty</th>
                                                <th className="p-3 text-right font-medium text-gray-600">Rate</th>
                                                <th className="p-3 text-right font-medium text-gray-600">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {selectedOrder.products.map((item, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="p-3 font-medium text-gray-800">
                                                        {item.productName}
                                                        {item.isComplimentary && <span className="ml-1 text-[10px] text-green-600 font-bold">(Free)</span>}
                                                    </td>
                                                    <td className="p-3 text-center text-gray-600">{item.qty}</td>
                                                    <td className="p-3 text-right text-gray-600">
                                                        {item.isComplimentary ? (
                                                            <span className="line-through text-gray-400">৳{item.rate.toFixed(2)}</span>
                                                        ) : (
                                                            `৳${item.rate.toFixed(2)}`
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-right font-bold text-gray-800">
                                                        {item.isComplimentary ? "৳0.00" : `৳${item.subtotal.toFixed(2)}`}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <div className="text-sm space-y-2 w-full md:w-1/2">
                                    <div className="flex justify-between"><span className="text-gray-600">VAT:</span><span className="font-medium text-gray-800">৳{selectedOrder.vat.toFixed(2)}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-600">Discount:</span><span className="font-medium text-red-500">- ৳{selectedOrder.discount.toFixed(2)}</span></div>
                                    <div className="flex justify-between text-lg font-bold pt-2 border-t mt-2"><span className="text-gray-900">Grand Total:</span><span className="text-blue-600">৳{selectedOrder.totalAmount.toFixed(2)}</span></div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 border-t rounded-b-2xl flex justify-end gap-3">
                            <button onClick={() => setShowModal(false)} className="p-3 text-sm bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-medium">Close</button>
                            <button onClick={() => handlePrint("Individual Receipt")} className="flex items-center gap-2 p-3 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                                <FaPrint /> Print Receipt
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderHistory;