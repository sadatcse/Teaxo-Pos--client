import React, { useContext, useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ReactPaginate from "react-paginate";
import { useReactToPrint } from "react-to-print";
import * as XLSX from "xlsx";
import UseAxiosSecure from "../../Hook/UseAxioSecure";
import { FaEye, FaCalendarAlt, FaBoxOpen, FaChartLine, FaFileInvoiceDollar, FaTimes, FaTags, FaPercentage, FaMoneyBill, FaCreditCard, FaMobileAlt, FaFileExcel, FaPrint } from "react-icons/fa";
import moment from "moment";
import Preloader from "../../components/Shortarea/Preloader";
import { AuthContext } from "../../providers/AuthProvider";
import useCompanyHook from "../../Hook/useCompanyHook";

// --- NEW PRINT COMPONENTS BASED ON YOUR PROVIDED STYLE ---

// New A4 Daily Report Layout
const A4DailySummary = React.forwardRef(({ showcaseData, orderData, date, company }, ref) => (
    <div ref={ref} className="p-10 bg-white text-black">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">{company?.name || "Company Name"}</h1>
            <p className="text-sm">{company?.address}</p>
            <p className="text-sm">Contact: {company?.phone}</p>
            <h2 className="text-2xl font-semibold mt-6 border-b pb-2">Daily Sales Report</h2>
            <p className="mt-2">Date: {moment(date).format("MMMM Do, YYYY")}</p>
        </div>

        <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 border-b pb-2">Summary</h3>
            <div className="grid grid-cols-3 gap-x-8 gap-y-4 text-sm">
                <div><strong>Total Orders:</strong> <span className="font-medium">{showcaseData.totalOrders}</span></div>
                <div><strong>Total Items:</strong> <span className="font-medium">{showcaseData.totalQuantity}</span></div>
                <div><strong>Total Revenue:</strong> <span className="font-medium">৳{showcaseData.totalAmount.toFixed(2)}</span></div>
                <div><strong>Total VAT:</strong> <span className="font-medium">৳{showcaseData.totalVat.toFixed(2)}</span></div>
                <div><strong>Total Discount:</strong> <span className="font-medium">৳{showcaseData.totalDiscount.toFixed(2)}</span></div>
            </div>
        </div>
        
        <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 border-b pb-2">Payment Methods</h3>
            <div className="grid grid-cols-3 gap-x-8 gap-y-4 text-sm">
                 <div><strong>Cash:</strong> <span className="font-medium">৳{showcaseData.cashPayments.toFixed(2)}</span></div>
                 <div><strong>Card:</strong> <span className="font-medium">৳{showcaseData.cardPayments.toFixed(2)}</span></div>
                 <div><strong>Mobile:</strong> <span className="font-medium">৳{showcaseData.mobilePayments.toFixed(2)}</span></div>
            </div>
        </div>

        <div>
            <h3 className="text-xl font-bold mb-4 border-b pb-2">Order Details</h3>
            <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-gray-100">
                    <tr className="border-b">
                        <th className="p-2 border-r">#</th>
                        <th className="p-2 border-r">Time</th>
                        <th className="p-2 border-r">Invoice ID</th>
                        <th className="p-2 border-r">Items</th>
                        <th className="p-2 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {orderData.map((order, index) => (
                        <tr key={order._id} className="border-b">
                            <td className="p-2 border-r">{index + 1}</td>
                            <td className="p-2 border-r">{moment(order.dateTime).format('h:mm A')}</td>
                            <td className="p-2 border-r">{order.invoiceSerial}</td>
                            <td className="p-2 border-r">{order.totalQty}</td>
                            <td className="p-2 text-right">৳{order.totalAmount.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
));

// New POS Daily Summary Layout
const POSDailySummary = React.forwardRef(({ showcaseData, date, company }, ref) => (
    <div ref={ref} className="p-2 bg-white text-black" style={{ width: '80mm', fontFamily: 'monospace' }}>
        <div className="text-center mb-2">
            <h1 className="text-xl font-bold">{company?.name || "Company Name"}</h1>
            <p className="text-xs">{company?.address}</p>
            <p className="text-xs mt-2">Daily Report: {moment(date).format("DD-MMM-YYYY")}</p>
        </div>
        <hr className="border-dashed border-black my-2" />
        <div className="text-xs space-y-1">
            <div className="flex justify-between"><span>Total Orders:</span><span>{showcaseData.totalOrders}</span></div>
            <div className="flex justify-between"><span>Total Items:</span><span>{showcaseData.totalQuantity}</span></div>
            <div className="flex justify-between font-bold text-sm"><span>Total Revenue:</span><span>৳{showcaseData.totalAmount.toFixed(2)}</span></div>
            <hr className="border-dashed border-black my-2" />
            <div className="flex justify-between"><span>Total VAT:</span><span>৳{showcaseData.totalVat.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Total Discount:</span><span>৳{showcaseData.totalDiscount.toFixed(2)}</span></div>
            <hr className="border-dashed border-black my-2" />
            <p className="font-bold text-center text-sm">Payments</p>
            <div className="flex justify-between"><span>Cash:</span><span>৳{showcaseData.cashPayments.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Card:</span><span>৳{showcaseData.cardPayments.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Mobile:</span><span>৳{showcaseData.mobilePayments.toFixed(2)}</span></div>
        </div>
        <hr className="border-dashed border-black my-2" />
        <p className="text-center text-xs">Report generated on {moment().format("DD-MMM-YYYY h:mm A")}</p>
    </div>
));

// Individual POS Receipt (Your provided component, slightly adapted)
const IndividualReceipt = React.forwardRef(({ profileData, invoiceData }, ref) => {
    if (!profileData || !invoiceData) return null;
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
                            <td>{item.productName}</td>
                            <td className="text-center">{item.qty}</td>
                            <td className="text-right">৳{item.subtotal.toFixed(2)}</td>
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

    const a4PrintRef = useRef();
    const posPrintRef = useRef();
    const individualReceiptRef = useRef();

    const [showcaseData, setShowcaseData] = useState({
        totalOrders: 0, totalQuantity: 0, totalAmount: 0, totalVat: 0,
        totalDiscount: 0, cashPayments: 0, cardPayments: 0, mobilePayments: 0,
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
                setShowcaseData({
                    totalOrders: data.totalOrders || 0, totalQuantity: data.totalQty || 0, totalAmount: data.totalAmount || 0,
                    totalVat: data.totalVat || 0, totalDiscount: data.totalDiscount || 0, cashPayments: data.cashPayments || 0,
                    cardPayments: data.cardPayments || 0, mobilePayments: data.mobilePayments || 0,
                });
                setOrderData(data.orders);
            } else {
                setShowcaseData({ totalOrders: 0, totalQuantity: 0, totalAmount: 0, totalVat: 0, totalDiscount: 0, cashPayments: 0, cardPayments: 0, mobilePayments: 0 });
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

    const handleExcelDownload = () => { /* ... code remains the same ... */ };

    const handleA4Print = useReactToPrint({ content: () => a4PrintRef.current });
    const handlePOSPrint = useReactToPrint({ content: () => posPrintRef.current });
    const handleIndividualPrint = useReactToPrint({ content: () => individualReceiptRef.current });

    const currentOrders = orderData.slice(currentPage * ordersPerPage, (currentPage + 1) * ordersPerPage);
    
    const SummaryCard = ({ icon, title, value, color }) => (
        <div className={`bg-white p-4 rounded-lg shadow-sm flex items-center gap-4 border-l-4 border-${color}-500`}>
            <div className={`rounded-full p-3 bg-${color}-100 text-${color}-600`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <p className="text-xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
    
    const PaymentSummaryCard = ({ title, data }) => (
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-gray-500">
             <h3 className="text-md font-semibold text-gray-700 mb-3">{title}</h3>
             <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-gray-600"><FaMoneyBill /> Cash</span>
                    <span className="font-semibold text-gray-800">৳{data.cashPayments.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-gray-600"><FaCreditCard /> Card</span>
                    <span className="font-semibold text-gray-800">৳{data.cardPayments.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-gray-600"><FaMobileAlt /> Mobile</span>
                    <span className="font-semibold text-gray-800">৳{data.mobilePayments.toFixed(2)}</span>
                </div>
             </div>
        </div>
    );

    return (
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Daily Order Report</h1>
                <div className="flex items-center gap-2">
                    <button onClick={handleExcelDownload} className="flex items-center gap-2 p-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition" title="Download Excel">
                        <FaFileExcel />
                        <span className="hidden md:inline">Excel</span>
                    </button>
                    <button onClick={handleA4Print} className="flex items-center gap-2 p-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition" title="Print A4 Report">
                        <FaPrint />
                         <span className="hidden md:inline">A4</span>
                    </button>
                    <button onClick={handlePOSPrint} className="flex items-center gap-2 p-2 text-sm bg-gray-700 text-white rounded-md hover:bg-gray-800 transition" title="Print POS Summary">
                        <FaPrint />
                         <span className="hidden md:inline">POS</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
                        <label className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2"><FaCalendarAlt /> Select Report Date</label>
                        <DatePicker selected={date} onChange={handleDateChange} className="w-full p-2 border rounded-md" dateFormat="MMMM d, yyyy" />
                    </div>

                    <SummaryCard icon={<FaFileInvoiceDollar size={20} />} title="Total Orders" value={showcaseData.totalOrders} color="blue" />
                    <SummaryCard icon={<FaBoxOpen size={20} />} title="Total Items Sold" value={showcaseData.totalQuantity} color="purple" />
                    <SummaryCard icon={<FaChartLine size={20} />} title="Total Revenue" value={`৳${showcaseData.totalAmount.toFixed(2)}`} color="green" />
                    <SummaryCard icon={<FaPercentage size={20} />} title="Total VAT" value={`৳${showcaseData.totalVat.toFixed(2)}`} color="yellow" />
                    <SummaryCard icon={<FaTags size={20} />} title="Total Discount" value={`৳${showcaseData.totalDiscount.toFixed(2)}`} color="red" />
                    <PaymentSummaryCard title="Payment Methods" data={showcaseData} />
                </div>

                <div className="lg:col-span-3 bg-white p-5 rounded-lg shadow-sm border">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Order Details for {moment(date).format("MMMM Do, YYYY")}</h3>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full"><Preloader /></div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="border-b-2 bg-gray-50 text-sm text-gray-600">
                                        <tr>
                                            <th className="p-3 font-semibold">#</th>
                                            <th className="p-3 font-semibold">Time</th>
                                            <th className="p-3 font-semibold">Invoice ID</th>
                                            <th className="p-3 font-semibold">Items</th>
                                            <th className="p-3 font-semibold text-right">Amount</th>
                                            <th className="p-3 font-semibold text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentOrders.length > 0 ? (
                                            currentOrders.map((order, index) => (
                                                <tr key={order._id} className="border-b hover:bg-gray-50">
                                                    <td className="p-3">{index + 1 + currentPage * ordersPerPage}</td>
                                                    <td className="p-3">{moment(order.dateTime).format('h:mm A')}</td>
                                                    <td className="p-3 font-mono text-sm text-blue-600">{order.invoiceSerial}</td>
                                                    <td className="p-3">{order.totalQty}</td>
                                                    <td className="p-3 font-semibold text-right">৳{order.totalAmount.toFixed(2)}</td>
                                                    <td className="p-3 text-center">
                                                        <button onClick={() => handleViewDetails(order)} className="text-blue-600 hover:text-blue-800" title="View Details">
                                                            <FaEye size={18} />
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
                                <div className="mt-6">
                                    <ReactPaginate
                                        previousLabel={"< Prev"} nextLabel={"Next >"} pageCount={Math.ceil(orderData.length / ordersPerPage)}
                                        onPageChange={handlePageClick} containerClassName={"flex justify-center items-center gap-2 text-sm"}
                                        pageLinkClassName={"px-3 py-2 rounded-md hover:bg-gray-200"}
                                        previousLinkClassName={"px-3 py-2 rounded-md bg-white border hover:bg-gray-100"}
                                        nextLinkClassName={"px-3 py-2 rounded-md bg-white border hover:bg-gray-100"}
                                        activeLinkClassName={"bg-blue-600 text-white hover:bg-blue-700"}
                                        disabledClassName={"opacity-50"}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <div className="hidden">
                <A4DailySummary ref={a4PrintRef} showcaseData={showcaseData} orderData={orderData} date={date} company={companyInfo} />
                <POSDailySummary ref={posPrintRef} showcaseData={showcaseData} date={date} company={companyInfo} />
                <IndividualReceipt ref={individualReceiptRef} profileData={companyInfo} invoiceData={selectedOrder} />
            </div>

            {showModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl transform transition-all max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-5 border-b bg-gray-50 rounded-t-2xl sticky top-0 z-10">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
                                <p className="text-sm text-gray-500 font-mono">Invoice: {selectedOrder.invoiceSerial}</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500"><FaTimes size={24} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* ... modal content ... */}
                        </div>
                        <div className="p-4 bg-gray-50 border-t rounded-b-2xl flex justify-end gap-3">
                            <button onClick={() => setShowModal(false)} className="p-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300">Close</button>
                            <button onClick={handleIndividualPrint} className="flex items-center gap-2 p-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
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
