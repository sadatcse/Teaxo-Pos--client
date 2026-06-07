import React, { useState, useEffect, useContext, useCallback } from 'react';
import { FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion } from 'framer-motion';
import Mtitle from '../../components library/Mtitle';
import UseAxiosSecure from '../../Hook/UseAxioSecure';
import { AuthContext } from '../../providers/AuthProvider';
import MtableLoading from '../../components library/MtableLoading';
import useIngredientCategories from '../../Hook/useIngredientCategories'; // <-- Import your existing hook

const StockSalesCompare = () => {
    const axiosSecure = UseAxiosSecure();
    const { branch } = useContext(AuthContext);
    const { ingredientCategories, loading: categoriesLoading } = useIngredientCategories(); // <-- Use the hook

    // State
    const [reportData, setReportData] = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [toDate, setToDate] = useState(new Date());
    const [selectedCategory, setSelectedCategory] = useState(''); // <-- New state for the filter

    const fetchReport = useCallback(async () => {
        if (!branch) return;
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage,
                fromDate: fromDate.toISOString().split('T')[0],
                toDate: toDate.toISOString().split('T')[0],
            });
            // Add categoryId to params if selected
            if (selectedCategory) {
                params.append('categoryId', selectedCategory);
            }
            const { data } = await axiosSecure.get(`/reports/stock-sales-comparison/${branch}`, { params });
            setReportData(data.data || []);
            setPaginationInfo(data.pagination || {});
        } catch (error) {
            console.error("Failed to fetch stock comparison report:", error);
            setReportData([]);
            setPaginationInfo({});
        } finally {
            setIsLoading(false);
        }
    }, [axiosSecure, branch, fromDate, toDate, currentPage, selectedCategory]); // Add dependency

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    // Reset page to 1 when filters change
    useEffect(() => {
        if (currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [fromDate, toDate, selectedCategory]);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= paginationInfo.totalPages) {
            setCurrentPage(newPage);
        }
    };

    const getVarianceClass = (variance) => {
        if (variance < 0) return 'text-red-600 dark:text-red-400 font-bold';
        if (variance > 0) return 'text-green-600 dark:text-green-400 font-bold';
        return 'text-slate-700 dark:text-zinc-300';
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 min-h-screen font-sans transition-colors duration-250">
            <Mtitle title="Stock & Sales Comparison" rightcontent={
                <div className='flex items-center gap-4 flex-wrap'>
                    {/* --- Ingredient Category Dropdown --- */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="select select-bordered w-full md:w-auto bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-805 text-slate-800 dark:text-zinc-100 focus:outline-none"
                        disabled={categoriesLoading}
                    >
                        <option value="" className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100">{categoriesLoading ? 'Loading...' : 'All Categories'}</option>
                        {ingredientCategories.map(cat => (
                            <option key={cat._id} value={cat._id} className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100">{cat.categoryName}</option>
                        ))}
                    </select>

                    <div className="relative"><FiCalendar className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" /><DatePicker selected={fromDate} onChange={(date) => setFromDate(date)} dateFormat="dd/MM/yyyy" className="input input-bordered w-full pl-10 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-100 focus:outline-none" /></div>
                    <span className="text-slate-500 dark:text-zinc-400">to</span>
                    <div className="relative"><FiCalendar className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" /><DatePicker selected={toDate} onChange={(date) => setToDate(date)} dateFormat="dd/MM/yyyy" className="input input-bordered w-full pl-10 bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-100 focus:outline-none" /></div>
                </div>
            } />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-xl mt-6 text-slate-800 dark:text-zinc-100">
                <div className="card-body p-4 sm:p-6">
                    {isLoading ? <MtableLoading /> : (
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead className='bg-blue-600 text-white uppercase text-xs border-b border-blue-700'>
                                    <tr>
                                        <th className="p-3 rounded-tl-lg">Ingredient</th>
                                        <th className="p-3 text-right">Opening Stock</th>
                                        <th className="p-3 text-right">Stock In (Purchased)</th>
                                        <th className="p-3 text-right">Stock Out (Sold)</th>
                                        <th className="p-3 text-right">Closing (System)</th>
                                        <th className="p-3 text-right">Physical (Actual)</th>
                                        <th className="p-3 text-right rounded-tr-lg">Variance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/80">
                                    {reportData.length === 0 ? (
                                        <tr><td colSpan="7" className="text-center py-10 text-slate-500 dark:text-zinc-400">No data available for the selected filters.</td></tr>
                                    ) : (
                                        reportData.map(item => (
                                            <tr key={item.ingredientId} className="hover:bg-blue-50 dark:hover:bg-zinc-800/40 border-b border-slate-200 dark:border-zinc-800 text-sm">
                                                <td className="p-3 font-semibold text-slate-800 dark:text-zinc-200">{item.name} <span className="text-slate-500 dark:text-zinc-400">({item.unit})</span></td>
                                                <td className="p-3 text-right text-slate-700 dark:text-zinc-300">{item.openingStock.toFixed(2)}</td>
                                                <td className="p-3 text-right text-green-600 dark:text-green-400">+{item.stockIn.toFixed(2)}</td>
                                                <td className="p-3 text-right text-red-600 dark:text-red-400">-{item.stockOut.toFixed(2)}</td>
                                                <td className="p-3 text-right font-bold text-slate-800 dark:text-zinc-150">{item.systemClosingStock.toFixed(2)}</td>
                                                <td className="p-3 text-right font-bold text-blue-600 dark:text-blue-400">{item.physicalStock.toFixed(2)}</td>
                                                <td className={`p-3 text-right ${getVarianceClass(item.variance)}`}>{item.variance.toFixed(2)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            {paginationInfo && paginationInfo.totalItems > 0 && (
                                <div className="p-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-slate-700 dark:text-zinc-300">
                                    <span className="text-sm text-slate-705 dark:text-zinc-350">Showing {((currentPage - 1) * paginationInfo.limit) + 1} - {Math.min(currentPage * paginationInfo.limit, paginationInfo.totalItems)} of {paginationInfo.totalItems} ingredients</span>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="btn btn-sm btn-outline bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-750 disabled:opacity-50"><FiChevronLeft /></button>
                                        <span className="font-semibold">Page {currentPage} of {paginationInfo.totalPages}</span>
                                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === paginationInfo.totalPages} className="btn btn-sm btn-outline bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-750 disabled:opacity-50"><FiChevronRight /></button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default StockSalesCompare;