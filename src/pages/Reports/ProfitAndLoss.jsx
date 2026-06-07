import React, { useState, useEffect, useContext, useCallback } from 'react';
import { FiCalendar, FiTrendingUp, FiShoppingCart, FiDollarSign, FiArrowDown, FiArrowUp } from 'react-icons/fi';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion } from 'framer-motion';
import Mtitle from '../../components library/Mtitle';
import UseAxiosSecure from '../../Hook/UseAxioSecure';
import { AuthContext } from '../../providers/AuthProvider';
import MtableLoading from '../../components library/MtableLoading';

// A small helper component for P&L rows
const ReportRow = ({ label, value, isSubtotal = false, isFinal = false }) => {
    const valueColor = typeof value === 'number' && value < 0 ? 'text-red-500 dark:text-red-400' : 'text-slate-850 dark:text-zinc-150';
    const valueText = typeof value === 'number' ? `${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-';

    return (
        <div className={`flex justify-between py-3 px-4 border-b border-slate-200 dark:border-zinc-800 ${isSubtotal ? 'bg-slate-100 dark:bg-zinc-800/50 font-semibold text-slate-850 dark:text-zinc-200' : ''} ${isFinal ? 'bg-blue-100 dark:bg-blue-950/40 font-extrabold text-blue-900 dark:text-blue-200' : 'text-slate-700 dark:text-zinc-300'}`}>
            <span>{label}</span>
            <span className={isFinal ? 'text-blue-900 dark:text-blue-200' : valueColor}>{valueText}</span>
        </div>
    );
};

const ProfitAndLoss = () => {
    const axiosSecure = UseAxiosSecure();
    const { branch } = useContext(AuthContext);

    const [pnlData, setPnlData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [toDate, setToDate] = useState(new Date());

    const fetchReport = useCallback(async () => {
        if (!branch) return;
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (fromDate) params.append('fromDate', fromDate.toISOString().split('T')[0]);
            if (toDate) params.append('toDate', toDate.toISOString().split('T')[0]);
            const { data } = await axiosSecure.get(`/reports/profit-loss/${branch}`, { params });
            setPnlData(data);
        } catch (error) {
            console.error("Failed to fetch P&L report:", error);
            setPnlData(null);
        } finally {
            setIsLoading(false);
        }
    }, [axiosSecure, branch, fromDate, toDate]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 min-h-screen transition-colors duration-250">
            <Mtitle title="Profit & Loss Report" rightcontent={
                <div className='flex items-center gap-4'>
                    <div className="relative"><FiCalendar className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" /><DatePicker selected={fromDate} onChange={(date) => setFromDate(date)} dateFormat="dd/MM/yyyy" className="input input-bordered w-full pl-10 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-100 focus:outline-none" /></div>
                    <span className="text-slate-500 dark:text-zinc-400">to</span>
                    <div className="relative"><FiCalendar className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" /><DatePicker selected={toDate} onChange={(date) => setToDate(date)} dateFormat="dd/MM/yyyy" className="input input-bordered w-full pl-10 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-100 focus:outline-none" /></div>
                </div>
            } />

            <div className="mt-6 max-w-4xl mx-auto">
                {isLoading ? <MtableLoading /> : !pnlData ? (
                    <p className="text-center text-slate-500 dark:text-zinc-400">Could not load report data.</p>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-xl text-slate-800 dark:text-zinc-150">
                        <div className="card-body p-0">
                            <div className="p-4 border-b border-slate-200 dark:border-zinc-800">
                                <h2 className="card-title text-slate-850 dark:text-zinc-100">Statement of Profit & Loss</h2>
                                <p className="text-sm text-slate-500 dark:text-zinc-400">For the period from {fromDate.toLocaleDateString()} to {toDate.toLocaleDateString()}</p>
                            </div>
                            
                            <div className="text-sm">
                                <div className="p-4 space-y-2">
                                    <h3 className="font-bold text-md text-blue-600 dark:text-blue-400 flex items-center gap-2"><FiTrendingUp /> Revenue</h3>
                                    <ReportRow label="Total Sales Revenue" value={pnlData.totalRevenue} />
                                </div>

                                <div className="p-4 space-y-2">
                                    <h3 className="font-bold text-md text-blue-600 dark:text-blue-400 flex items-center gap-2"><FiShoppingCart /> Cost of Goods Sold (COGS)</h3>
                                    <ReportRow label="Total Purchases" value={pnlData.cogs > 0 ? -pnlData.cogs : 0} />
                                </div>

                                <ReportRow label="Gross Profit" value={pnlData.grossProfit} isSubtotal={true} />

                                <div className="p-4 space-y-2">
                                    <h3 className="font-bold text-md text-blue-600 dark:text-blue-400 flex items-center gap-2"><FiDollarSign /> Operating Expenses</h3>
                                    {pnlData.operatingExpenses.breakdown.map(exp => (
                                        <ReportRow key={exp.category} label={exp.category} value={exp.total > 0 ? -exp.total : 0} />
                                    ))}
                                    <ReportRow label="Total Operating Expenses" value={pnlData.operatingExpenses.total > 0 ? -pnlData.operatingExpenses.total : 0} isSubtotal={true}/>
                                </div>
                                
                                <ReportRow 
                                    label={pnlData.netProfit >= 0 ? "Net Profit" : "Net Loss"} 
                                    value={pnlData.netProfit} 
                                    isFinal={true} 
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ProfitAndLoss;