import React, { useState, useEffect, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiArrowUp, FiArrowDown, FiMinus, FiX } from 'react-icons/fi';
import UseAxiosSecure from '../../Hook/UseAxioSecure';
import { AuthContext } from '../../providers/AuthProvider';
import Mpagination from "../../components library/Mpagination"; // Assuming this is your custom pagination

const AverageIngredientCost = () => {
    const axiosSecure = UseAxiosSecure();
    const { branch } = useContext(AuthContext); // Assuming 'branch' provides the 'teaxo' part
    const [analysisData, setAnalysisData] = useState([]);
    const [period, setPeriod] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
    });

    // Helper function to generate year options
    const generateYearOptions = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        // Corrected the loop condition from 'current year' to 'currentYear'
        for (let i = currentYear; i >= currentYear - 5; i--) {
            years.push(i);
        }
        return years;
    };

    const fetchAnalysis = useCallback(async () => {
        if (!branch) return; // Don't fetch if branch is not yet available
        setIsLoading(true);
        try {
            const response = await axiosSecure.get(`/purchase/analysis/${branch}`, {
                params: {
                    year: filters.year,
                    month: filters.month,
                    // page and limit would be handled by your Mpagination component
                },
            });
            setAnalysisData(response.data.analysis || []);
            setPeriod(response.data.period || {});
        } catch (error) {
            console.error('Error fetching ingredient cost analysis:', error);
            setAnalysisData([]); // Clear data on error
        } finally {
            setIsLoading(false);
        }
    }, [axiosSecure, branch, filters]);

    useEffect(() => {
        fetchAnalysis();
    }, [fetchAnalysis]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: parseInt(value),
        }));
    };

    const renderChangePercentage = (change) => {
        if (typeof change !== 'number' || !isFinite(change) || change === 0) {
            return <span className="flex items-center gap-1 text-slate-500"><FiMinus /> 0.00%</span>;
        }
        const isPositive = change > 0;
        const color = isPositive ? 'text-success' : 'text-error';
        const icon = isPositive ? <FiArrowUp /> : <FiArrowDown />;
        
        // Handle cases where previous month data was 0, resulting in 100% change, indicating a new item
        if (change === 100 && isPositive) {
            return <span className={`flex items-center gap-1 font-semibold text-success`}>{icon} New</span>
        }

        return (
            <span className={`flex items-center gap-1 font-semibold ${color}`}>
                {icon} {Math.abs(change).toFixed(2)}%
            </span>
        );
    };

    // Placeholder for pagination as Mpagination is a custom component
    // In a real scenario, you'd pass data and setters to Mpagination
    const paginatedData = analysisData; // Replace with Mpagination logic

    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-base-200">
            <motion.h1 
                className="text-3xl font-bold text-slate-800 mb-6"
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ duration: 0.5 }}
            >
                Ingredient Cost Analysis
            </motion.h1>

            <motion.div 
                className="card bg-base-100 shadow-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <div className="card-body">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 p-4 bg-base-200 rounded-lg">
                        <div className="card-title text-slate-700">
                            Showing data for: <span className="text-primary">{period.month}/{period.year}</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <FiFilter className="text-slate-500"/>
                            <select name="month" value={filters.month} onChange={handleFilterChange} className="select select-bordered select-sm">
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                                ))}
                            </select>
                            <select name="year" value={filters.year} onChange={handleFilterChange} className="select select-bordered select-sm">
                                {generateYearOptions().map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-96"><span className="loading loading-spinner loading-lg text-primary"></span></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table table-zebra w-full border border-slate-300">
                                <thead className="bg-blue-600">
                                    <tr>
                                        <th className="text-white border-r">Ingredient</th>
                                        <th className="text-white border-r">Unit</th>
                                        <th className="text-white border-r text-right">Total Qty</th>
                                        <th className="text-white border-r text-right">Total Amount</th>
                                        <th className="text-white border-r text-right">Avg. Unit Price</th>
                                        <th className="text-white text-center">Price Change</th>
                                    </tr>
                                </thead>
                                <AnimatePresence>
                                    <tbody>
                                        {paginatedData.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center py-12 text-slate-500">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <FiX size={48} className="text-slate-400" />
                                                        <span className="font-semibold">No analysis data found for this period.</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedData.map((item) => (
                                                <motion.tr 
                                                    key={item.ingredientId}
                                                    layout
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <td className="font-semibold text-slate-700 border-r">{item.ingredientName}</td>
                                                    <td className="text-slate-600 border-r">{item.unit}</td>
                                                    <td className="text-slate-600 border-r text-right">{item.totalQuantity.toFixed(2)}</td>
                                                    <td className="text-slate-600 border-r text-right">৳{item.totalAmount.toFixed(2)}</td>
                                                    <td className="font-bold text-slate-800 border-r text-right">৳{item.averageUnitPrice.toFixed(2)}</td>
                                                    <td className="text-center">{renderChangePercentage(item.comparison.change.unitPriceChangePercent)}</td>
                                                </motion.tr>
                                            ))
                                        )}
                                    </tbody>
                                </AnimatePresence>
                            </table>
                        </div>
                    )}
                    {/* {paginationControls}  Assuming your Mpagination component provides this */}
                </div>
            </motion.div>
        </div>
    );
};

export default AverageIngredientCost;