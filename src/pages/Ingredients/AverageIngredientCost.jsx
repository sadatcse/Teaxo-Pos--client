import React, { useState, useEffect, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiArrowUp, FiArrowDown, FiMinus, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { ColorRing } from 'react-loader-spinner';
import UseAxiosSecure from '../../Hook/UseAxioSecure';
import { AuthContext } from '../../providers/AuthProvider';
import useIngredientCategories from '../../Hook/useIngredientCategories';
import Mtitle from '../../components library/Mtitle';

const MtableLoading = () => (
    <div className="flex justify-center items-center w-full h-full py-28">
        <ColorRing
            visible={true}
            height="80"
            width="80"
            ariaLabel="color-ring-loading"
            wrapperClass="color-ring-wrapper"
            colors={["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"]}
        />
    </div>
);

const AverageIngredientCost = () => {
    const axiosSecure = UseAxiosSecure();
    const { branch } = useContext(AuthContext);
    const [analysisData, setAnalysisData] = useState([]);
    const [period, setPeriod] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const { ingredientCategories: categories, loading: categoriesLoading, error: categoriesError } = useIngredientCategories();
    const [filters, setFilters] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        category: '',
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
    });

    const fetchAnalysis = useCallback(async () => {
        if (!branch) return;
        setIsLoading(true);
        try {
            const response = await axiosSecure.get(`/purchase/analysis/${branch}`, {
                params: {
                    year: filters.year,
                    month: filters.month,
                    category: filters.category,
                    page: pagination.currentPage,
                    limit: pagination.pageSize,
                },
            });
            setAnalysisData(response.data.analysis || []);
            setPeriod(response.data.period || {});
            setPagination(response.data.pagination || { currentPage: 1, totalPages: 1, pageSize: 10 });
        } catch (error) {
            console.error('Error fetching ingredient cost analysis:', error);
            setAnalysisData([]);
        } finally {
            setIsLoading(false);
        }
    }, [axiosSecure, branch, filters, pagination.currentPage, pagination.pageSize]);

    useEffect(() => {
        fetchAnalysis();
    }, [fetchAnalysis]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: name === 'category' ? value : parseInt(value),
        }));
        setPagination(p => ({ ...p, currentPage: 1 }));
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(p => ({ ...p, currentPage: newPage }));
        }
    };

    const generateYearOptions = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = currentYear; i >= currentYear - 5; i--) { years.push(i); }
        return years;
    };

    const renderChangePercentage = (change) => {
        if (typeof change !== 'number' || !isFinite(change)) {
            return <span className="flex items-center gap-1 text-slate-500"><FiMinus /> N/A</span>;
        }
        if (change === 0) {
            return <span className="flex items-center gap-1 text-slate-500"><FiMinus /> 0.00%</span>;
        }
        const isPositive = change > 0;
        const color = isPositive ? 'text-green-600' : 'text-red-600';
        const icon = isPositive ? <FiArrowUp /> : <FiArrowDown />;
        if (change === 100 && isPositive) {
            return <span className="flex items-center gap-1 font-semibold text-green-600">{icon} New</span>;
        }
        if (change === -100) {
            return <span className="flex items-center gap-1 font-semibold text-orange-600">{icon} Not Purchased</span>;
        }
        return (<span className={`flex items-center gap-1 font-semibold ${color}`}>{icon} {Math.abs(change).toFixed(2)}%</span>);
    };
    
    const filterClass = "border border-gray-300 rounded-xl p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150";

    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-base-200">
            <Mtitle title="Ingredient Cost Analysis" rightcontent={
                <div className="flex items-center gap-2 flex-wrap justify-end">
                    <FiFilter className="text-slate-500" />
                    <select name="category" value={filters.category} onChange={handleFilterChange} className={filterClass} disabled={categoriesLoading}>
                        <option value="">{categoriesLoading ? "Loading..." : "All Categories"}</option>
                        {categoriesError && <option disabled>Error</option>}
                        {!categoriesLoading && !categoriesError && categories.map(cat => (<option key={cat._id} value={cat._id}>{cat.categoryName}</option>))}
                    </select>
                    <select name="month" value={filters.month} onChange={handleFilterChange} className={filterClass}>
                        {Array.from({ length: 12 }, (_, i) => (<option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>))}
                    </select>
                    <select name="year" value={filters.year} onChange={handleFilterChange} className={filterClass}>
                        {generateYearOptions().map(year => (<option key={year} value={year}>{year}</option>))}
                    </select>
                </div>
            } />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="card bg-base-100 shadow-xl mt-6">
                <div className="card-body p-4 sm:p-6">
                    <div className="mb-4">
       
           
                    </div>

                    {isLoading ? <MtableLoading /> : (
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead className="bg-blue-600 text-white uppercase text-xs font-medium tracking-wider">
                                    <tr>
                                        <th className="p-3 rounded-tl-lg">Ingredient</th>
                                        <th className="p-3 text-right">Avg. Unit Price</th>
                                        <th className="p-3 text-center">Price Change (MoM)</th>
                                        <th className="p-3 text-right">Total Qty</th>
                                        <th className="p-3 rounded-tr-lg text-right">Total Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {analysisData.length === 0 ? (
                                            <tr><td colSpan="5" className="text-center py-12 text-slate-700"><div className="flex flex-col items-center gap-4"><FiX size={48} className="text-slate-400" /><span className="font-semibold">No data found for the selected period/filter.</span></div></td></tr>
                                        ) : (
                                            analysisData.map((item) => (
                                                <motion.tr key={item.ingredientId} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-blue-50 border-b border-slate-200 text-sm">
                                                    <td className="p-3 font-semibold text-slate-700">{item.ingredientName} <span className="text-xs text-slate-500">({item.unit})</span></td>
                                                    <td className="p-3 font-bold text-slate-800 text-right">৳{item.averageUnitPrice.toFixed(2)}</td>
                                                    <td className="p-3 text-center">{renderChangePercentage(item.comparison.change.unitPriceChangePercent)}</td>
                                                    <td className="p-3 text-slate-700 text-right">{item.totalQuantity.toFixed(2)}</td>
                                                    <td className="p-3 text-slate-700 text-right">৳{item.totalAmount.toFixed(2)}</td>
                                                </motion.tr>
                                            ))
                                        )}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    )}
                    
                    {!isLoading && pagination.totalPages > 1 && (
                        <div className="flex justify-center items-center mt-6">
                            <div className="join">
                                <button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={pagination.currentPage === 1} className="join-item btn btn-sm"><FiChevronLeft /></button>
                                <button className="join-item btn btn-sm btn-active">Page {pagination.currentPage} of {pagination.totalPages}</button>
                                <button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={pagination.currentPage === pagination.totalPages} className="join-item btn btn-sm"><FiChevronRight /></button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default AverageIngredientCost;