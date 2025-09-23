import React, { useState, useEffect, useContext, useCallback } from 'react';
import { FiCalendar, FiTrendingUp, FiCheckCircle, FiAlertCircle, FiBookOpen } from 'react-icons/fi';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import Mtitle from '../../components library/Mtitle';
import UseAxiosSecure from '../../Hook/UseAxioSecure';
import { AuthContext } from '../../providers/AuthProvider';
import MtableLoading from '../../components library/MtableLoading';
import { Link } from 'react-router-dom'; 


// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ExpenseSummary = () => {
    const axiosSecure = UseAxiosSecure();
    const { branch } = useContext(AuthContext);

    // State for all summary data
    const [summaryData, setSummaryData] = useState([]);
    const [totals, setTotals] = useState({ totalExpense: 0, totalPaid: 0 });
    const [vendorDues, setVendorDues] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [toDate, setToDate] = useState(new Date());

    const fetchSummary = useCallback(async () => {
        if (!branch) return;
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (fromDate) params.append('fromDate', fromDate.toISOString().split('T')[0]);
            if (toDate) params.append('toDate', toDate.toISOString().split('T')[0]);

            const { data } = await axiosSecure.get(`/expense/summary/${branch}`, { params });
            setSummaryData(data.summary || []);
            setTotals(data.totals || { totalExpense: 0, totalPaid: 0 });
            setVendorDues(data.vendorDues || []);
        } catch (error) {
            console.error("Failed to fetch expense summary:", error);
        } finally {
            setIsLoading(false);
        }
    }, [axiosSecure, branch, fromDate, toDate]);

    useEffect(() => {
        const handler = setTimeout(() => { fetchSummary(); }, 500);
        return () => clearTimeout(handler);
    }, [fetchSummary]);

    const totalDue = totals.totalExpense - totals.totalPaid;

    // Chart.js data and options
    const chartData = {
        labels: summaryData.map(item => item.category),
        datasets: [{
            label: 'Total Expense by Category',
            data: summaryData.map(item => item.totalAmount),
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
        }],
    };
    const chartOptions = { responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Expense Distribution' } } };

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-base-200 min-h-screen">
            <Mtitle title="Expense Summary" rightcontent={
                <div className='flex items-center gap-4'>
                    <div className="relative"><FiCalendar className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" /><DatePicker selected={fromDate} onChange={(date) => setFromDate(date)} dateFormat="dd/MM/yyyy" className="input input-bordered w-full pl-10" /></div>
                    <span className="text-slate-500">to</span>
                    <div className="relative"><FiCalendar className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" /><DatePicker selected={toDate} onChange={(date) => setToDate(date)} dateFormat="dd/MM/yyyy" className="input input-bordered w-full pl-10" /></div>
                </div>
            } />

            {isLoading ? <MtableLoading /> : (
                <>
                    {/* Summary Cards */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        <div className="stat bg-base-100 shadow-lg rounded-xl"><div className="stat-figure text-red-500"><FiTrendingUp className="text-3xl" /></div><div className="stat-title">Total Expense</div><div className="stat-value text-red-500">{totals.totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2 })} BDT</div></div>
                        <div className="stat bg-base-100 shadow-lg rounded-xl"><div className="stat-figure text-green-500"><FiCheckCircle className="text-3xl" /></div><div className="stat-title">Total Paid</div><div className="stat-value text-green-500">{totals.totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })} BDT</div></div>
                        <div className="stat bg-base-100 shadow-lg rounded-xl"><div className="stat-figure text-yellow-500"><FiAlertCircle className="text-3xl" /></div><div className="stat-title">Total Due</div><div className="stat-value text-yellow-500">{totalDue.toLocaleString(undefined, { minimumFractionDigits: 2 })} BDT</div></div>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                        {/* Left Side: Category Breakdown & Chart */}
                        <div className="lg:col-span-2 space-y-8">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card bg-base-100 shadow-xl"><div className="p-4">
                                <h2 className="text-xl font-semibold mb-4 text-slate-700">Category Breakdown</h2>
                                <div className="overflow-x-auto"><table className="table w-full">
                                    <thead className='bg-blue-600 text-white uppercase text-xs'><tr><th className="p-3 rounded-tl-lg">Category</th><th className="p-3 text-center">Transactions</th><th className="p-3 text-right">Total Amount</th><th className="p-3 text-right rounded-tr-lg">Paid Amount</th></tr></thead>
                                    <tbody>{summaryData.length === 0 ? (<tr><td colSpan="4" className="text-center py-10 text-slate-700">No data for this period.</td></tr>) : (summaryData.map((item) => (<tr key={item.category} className="hover:bg-blue-50 border-b text-sm"><td className="p-3 font-semibold">{item.category}</td><td className="p-3 text-center">{item.count}</td><td className="p-3 text-right font-medium">{item.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td><td className="p-3 text-right">{item.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr>)))}</tbody>
                                </table></div>
                            </div></motion.div>
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card bg-base-100 shadow-xl"><div className="p-4"><Bar options={chartOptions} data={chartData} /></div></motion.div>
                        </div>

                        {/* Right Side: Vendor Dues */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="card bg-base-100 shadow-xl"><div className="p-4">
                            <h2 className="text-xl font-semibold mb-4 text-slate-700">Top Vendor Dues</h2>
                            <div className="space-y-3">
                                {vendorDues.length === 0 ? <p className="text-center text-slate-500 py-8">No outstanding vendor dues for this period.</p> :
                                    vendorDues.map((vendor, index) => (
                                        <div key={vendor.vendorId || index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                            <span className="font-semibold text-slate-600">{vendor.vendorName}</span>
                                            <span className="font-bold text-yellow-600">{vendor.totalDue.toLocaleString(undefined, { minimumFractionDigits: 2 })} BDT</span>
                                                <Link to={`/dashboard/vendor-ledger/${vendor.vendorId}`} title="View Ledger">
                                                        <FiBookOpen className="text-blue-500 hover:text-blue-700 cursor-pointer transition-colors" />
                                                    </Link>
                                        </div>
                                    ))
                                }
                            </div>
                        </div></motion.div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ExpenseSummary;