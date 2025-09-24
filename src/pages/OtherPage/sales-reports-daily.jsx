import React, { useState, useEffect, useContext, useCallback } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiCalendar } from "react-icons/fi";
import UseAxiosSecure from "../../Hook/UseAxioSecure";
import { AuthContext } from "../../providers/AuthProvider";
import Mtitle from "../../components library/Mtitle";
import MtableLoading from "../../components library/MtableLoading"; 

const SalesReportsDaily = () => {
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { branch } = useContext(AuthContext);
    const axiosSecure = UseAxiosSecure();

    const handleSearch = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const startDate = moment(fromDate).format("YYYY-MM-DD");
            const endDate = moment(toDate).format("YYYY-MM-DD");

            const response = await axiosSecure.get(`/invoice/${branch}/date-range`, { params: { startDate, endDate } });
            
            const transformedData = response.data.map((item, index) => ({
                id: index + 1,
                date: item.date,
                order: item.orderCount,
                quantity: item.totalQty,
                grandAmount: item.totalSubtotal,
                vat: item.totalVat,
                sd: item.totalSd,
                discount: item.totalDiscount,
                totalAmount: item.totalAmount,
            }));
            setData(transformedData);
        } catch (err) {
            setError("Failed to fetch data. Please try again.");
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [axiosSecure, branch, fromDate, toDate]);

    useEffect(() => {
        handleSearch();
    }, []);

    const handleQuickRange = (range) => {
        const today = moment();
        let start;
        let end = moment();

        switch (range) {
            case 'today':
                start = moment();
                break;
            case '7days':
                start = moment().subtract(6, 'days');
                break;
            case '30days':
                start = moment().subtract(29, 'days');
                break;
            case 'thisMonth':
                start = moment().startOf('month');
                end = moment().endOf('month');
                break;
            case 'lastMonth':
                start = moment().subtract(1, 'month').startOf('month');
                end = moment().subtract(1, 'month').endOf('month');
                break;
            default:
                return;
        }
        setFromDate(start.toDate());
        setToDate(end.toDate());
    };

    const totals = data.reduce((acc, item) => ({
        quantity: acc.quantity + item.quantity,
        grandAmount: acc.grandAmount + item.grandAmount,
        vat: acc.vat + item.vat,
        sd: acc.sd + item.sd,
        discount: acc.discount + item.discount,
        totalAmount: acc.totalAmount + item.totalAmount,
    }), { quantity: 0, grandAmount: 0, vat: 0, sd: 0, discount: 0, totalAmount: 0 });

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-base-200 min-h-screen">
            <Mtitle title="Daily Sales Report" />
            
            <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-xl border border-slate-200"
            >
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                        {/* From Date */}
                        <div className="flex flex-col">
                            <label className="mb-2 text-sm font-semibold text-slate-700">From</label>
                            <div className="relative">
                                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <DatePicker
                                    selected={fromDate}
                                    onChange={(date) => setFromDate(date)}
                                    className="w-full pl-10 pr-3 py-2 text-sm border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    dateFormat="dd/MM/yyyy"
                                />
                            </div>
                        </div>

                        {/* To Date */}
                        <div className="flex flex-col">
                            <label className="mb-2 text-sm font-semibold text-slate-700">To</label>
                            <div className="relative">
                                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <DatePicker
                                    selected={toDate}
                                    onChange={(date) => setToDate(date)}
                                    className="w-full pl-10 pr-3 py-2 text-sm border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    dateFormat="dd/MM/yyyy"
                                />
                            </div>
                        </div>

                        {/* Quick Range */}
                        <div className="flex flex-col">
                            <label className="mb-2 text-sm font-semibold text-slate-700">Quick Range</label>
                            <select
                                onChange={(e) => handleQuickRange(e.target.value)}
                                className="w-full py-2 px-3 text-sm border border-slate-300 rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            >
                                <option value="">Select Range</option>
                                <option value="today">Today</option>
                                <option value="7days">Last 7 Days</option>
                                <option value="30days">Last 30 Days</option>
                                <option value="thisMonth">This Month</option>
                                <option value="lastMonth">Last Month</option>
                            </select>
                        </div>

                        {/* Search Button */}
                        <motion.button
                            onClick={handleSearch}
                            disabled={loading}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="flex items-center justify-center gap-2 h-11 rounded-lg bg-blue-600 text-white text-sm font-semibold shadow-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
                        >
                            {loading ? (
                                <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                                <>
                                    <FiSearch className="w-5 h-5" />
                                    <span>Search</span>
                                </>
                            )}
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="card bg-base-100 shadow-xl mt-6">
                <div className="card-body p-4 sm:p-6">
                    <h3 className="text-xl font-semibold text-blue-600 mb-4">
                        Report from {moment(fromDate).format("DD/MM/YYYY")} to {moment(toDate).format("DD/MM/YYYY")}
                    </h3>
                    {loading ? <MtableLoading /> : error ? <div className="text-center py-12 text-red-500">{error}</div> : (
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead className="bg-blue-600 text-white uppercase text-xs">
                                    <tr>
                                        {["SL.No", "Date", "Order", "Quantity", "Grand Amount", "Vat", "SD", "Discount", "Total Amount"].map((h, i) => (
                                            <th key={h} className={`p-3 ${i === 0 && 'rounded-tl-lg'} ${i === 8 && 'rounded-tr-lg'} ${['Grand Amount', 'Vat', 'SD', 'Discount', 'Total Amount'].includes(h) ? 'text-right' : ''}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {data.length > 0 ? (
                                            data.map((item) => (
                                                <motion.tr key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-blue-50 border-b border-slate-200 text-sm text-slate-700">
                                                    <td className="p-3">{item.id}</td>
                                                    <td className="p-3">{moment(item.date).format("DD-MM-YYYY")}</td>
                                                    <td className="p-3 text-center">{item.order}</td>
                                                    <td className="p-3 text-center">{item.quantity}</td>
                                                    <td className="p-3 text-right">{item.grandAmount.toFixed(2)}</td>
                                                    <td className="p-3 text-right">{item.vat.toFixed(2)}</td>
                                                    <td className="p-3 text-right">{item.sd.toFixed(2)}</td>
                                                    <td className="p-3 text-right">{item.discount.toFixed(2)}</td>
                                                    <td className="p-3 text-right font-bold">{item.totalAmount.toFixed(2)}</td>
                                                </motion.tr>
                                            ))
                                        ) : (
                                            <tr><td className="p-3 text-center" colSpan="9">No data available for the selected date range.</td></tr>
                                        )}
                                    </AnimatePresence>
                                </tbody>
                                {data.length > 0 && (
                                    <tfoot className="font-bold bg-slate-100 text-slate-800">
                                        <tr>
                                            <td className="p-3 rounded-bl-lg" colSpan={3}>Total</td>
                                            <td className="p-3 text-center">{totals.quantity}</td>
                                            <td className="p-3 text-right">{totals.grandAmount.toFixed(2)}</td>
                                            <td className="p-3 text-right">{totals.vat.toFixed(2)}</td>
                                            <td className="p-3 text-right">{totals.sd.toFixed(2)}</td>
                                            <td className="p-3 text-right">{totals.discount.toFixed(2)}</td>
                                            <td className="p-3 text-right text-blue-600 rounded-br-lg">{totals.totalAmount.toFixed(2)}</td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default SalesReportsDaily;