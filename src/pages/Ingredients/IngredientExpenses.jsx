import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiCalendar, FiBarChart2 } from 'react-icons/fi';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import UseAxiosSecure from '../../Hook/UseAxioSecure';
import { AuthContext } from '../../providers/AuthProvider';
import useIngredientCategories from '../../Hook/useIngredientCategories';

// Main Component
const IngredientUsageReport = () => {
    // --- Hooks and State Management ---
    const axiosSecure = UseAxiosSecure();
    const { branch } = useContext(AuthContext);
    const { 
        ingredientCategories: categories, 
        loading: categoriesLoading, 
        error: categoriesError 
    } = useIngredientCategories();

    // State for user inputs
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [selectedCategory, setSelectedCategory] = useState('');
    
    // State for API response and UI control
    const [reportData, setReportData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    // **NEW**: State for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10; // You can make this a state if you want a dropdown for items per page

    // --- Helper Functions ---
    const formatDateForAPI = (date) => date.toISOString().split('T')[0];

    // --- Data Fetching (Updated for Pagination) ---
    const handleGenerateReport = async (page = 1) => { // Default to page 1
        setIsLoading(true);
        setError('');
        // We don't reset reportData to null here to allow a smoother page transition
        // But for a new report (page 1), we can reset it if we want.
        if (page === 1) {
            setReportData(null);
        }

        if (!fromDate || !toDate) {
            setError("Please select both a 'From' and 'To' date.");
            setIsLoading(false);
            return;
        }

        try {
            const params = {
                branch,
                fromDate: formatDateForAPI(fromDate),
                toDate: formatDateForAPI(toDate),
                page, // Send the requested page
                limit: ITEMS_PER_PAGE, // Send the items per page
            };
            if (selectedCategory) {
                params.categoryId = selectedCategory;
            }

            const response = await axiosSecure.get(`/recipes/reports/ingredient-usage`, { params });
            setReportData(response.data);
            setCurrentPage(response.data.pagination.currentPage); // Sync current page from response
        } catch (err) {
            console.error("Error fetching ingredient usage report:", err);
            setError(err.response?.data?.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- JSX Rendering ---
    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-base-200">
            {/* Page Header */}
            <motion.div
                className="flex items-center gap-4 mb-6"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            >
                <FiBarChart2 className="text-4xl text-slate-800" />
                <h1 className="text-3xl font-bold text-slate-800">Ingredient Usage Report</h1>
            </motion.div>

            {/* Filter Controls Card */}
            <motion.div
                className="card bg-base-100 shadow-xl mb-8"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            >
                <div className="card-body">
                    <div className="flex flex-wrap items-end gap-4">
                        {/* Date Pickers and Category Select... (no changes here) */}
                        <div className="form-control w-full sm:w-auto flex-grow">
                             <label className="label"><span className="label-text font-semibold">From Date</span></label>
                             <DatePicker selected={fromDate} onChange={(date) => setFromDate(date)} dateFormat="dd-MM-yyyy" className="input input-bordered w-full" maxDate={new Date()} />
                         </div>
                         <div className="form-control w-full sm:w-auto flex-grow">
                             <label className="label"><span className="label-text font-semibold">To Date</span></label>
                             <DatePicker selected={toDate} onChange={(date) => setToDate(date)} dateFormat="dd-MM-yyyy" className="input input-bordered w-full" minDate={fromDate} maxDate={new Date()} />
                         </div>
                         <div className="form-control w-full sm:w-auto flex-grow">
                             <label className="label"><span className="label-text font-semibold">Ingredient Category</span></label>
                             <select
                                 className="select select-bordered w-full"
                                 value={selectedCategory}
                                 onChange={(e) => setSelectedCategory(e.target.value)}
                                 disabled={categoriesLoading}
                             >
                                 <option value="">{categoriesLoading ? "Loading..." : "All Categories"}</option>
                                 {categoriesError && <option disabled>Error loading</option>}
                                 {categories.map(cat => (
                                     <option key={cat._id} value={cat._id}>{cat.categoryName}</option>
                                 ))}
                             </select>
                         </div>
                        <div className="form-control w-full sm:w-auto">
                    <motion.button
    // **MODIFIED**: Always fetch page 1 for a new report
    onClick={() => handleGenerateReport(1)}
    className="btn bg-blue-600 hover:bg-blue-700 text-white w-full"
    disabled={isLoading}
    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
>
    {isLoading ? <span className="loading loading-spinner"></span> : "Generate Report"}
</motion.button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Report Display Area */}
            <AnimatePresence mode="wait">
                {/* ... Loading and Error states are unchanged ... */}
                {isLoading && (
                     <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center h-64 items-center">
                         <span className="loading loading-spinner loading-lg text-primary"></span>
                     </motion.div>
                 )}

                 {error && (
                     <motion.div key="error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="alert alert-error shadow-lg">
                         <div><FiAlertTriangle size={24} /><span><strong>Error:</strong> {error}</span></div>
                     </motion.div>
                 )}

                {reportData && !isLoading && (
                    <motion.div key="report" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        {/* ... Report header and alert are unchanged ... */}
         
                         {reportData.alert && (
                             <div className="alert alert-warning shadow-lg mb-6">
                                 <div><FiAlertTriangle size={24} /><span>{reportData.alert}</span></div>
                             </div>
                         )}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className={`${reportData.productsWithoutRecipe?.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'} card bg-base-100 shadow-xl`}>
                                <div className="card-body">
                                    <h2 className="card-title text-xl font-bold mb-4">Calculated Ingredient Usage</h2>
                                    <div className="overflow-x-auto">
                                        <table className="table table-zebra w-full border border-slate-300">
                                            {/* ... Table head is unchanged ... */}
                                            <thead className="bg-primary text-primary-content">
                                                 <tr>
                                                     <th>Ingredient Name</th>
                                                     <th className='text-right'>Total Quantity Used</th>
                                                     <th>Unit</th>
                                                 </tr>
                                             </thead>
                                            <tbody>
                                                {/* Table body renders paginated data */}
                                                {reportData.ingredientUsage.length > 0 ? (
                                                    reportData.ingredientUsage.map((item, index) => ( // Changed key to index as _id might not exist
                                                        <tr key={`${item.ingredientName}-${index}`}>
                                                            <td className="font-semibold">{item.ingredientName}</td>
                                                            <td className='text-right'>{item.totalQuantity.toFixed(3)}</td>
                                                            <td>{item.unit}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr><td colSpan="3" className="text-center py-8 text-slate-500">No ingredient usage data for the selected criteria.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    {/* **NEW**: Pagination Controls */}
                                    {reportData?.pagination?.totalPages > 1 && (
                                        <div className="flex justify-center items-center gap-4 mt-8">
                                            <button 
                                                className="btn btn-outline btn-primary btn-sm"
                                                onClick={() => handleGenerateReport(currentPage - 1)}
                                                disabled={currentPage === 1 || isLoading}
                                            >
                                                « Previous
                                            </button>
                                            
                                            <span className="font-semibold">
                                                Page {currentPage} of {reportData.pagination.totalPages}
                                            </span>

                                            <button 
                                                className="btn btn-outline btn-primary btn-sm"
                                                onClick={() => handleGenerateReport(currentPage + 1)}
                                                disabled={currentPage === reportData.pagination.totalPages || isLoading}
                                            >
                                                Next »
                                            </button>
                                        </div>
                                    )}

                                </div>
                            </div>

                            {/* ... Products Without Recipe card is unchanged ... */}
                            {reportData.productsWithoutRecipe?.length > 0 && (
                                 <div className="lg:col-span-1 card bg-base-100 shadow-xl">
                                     <div className="card-body">
                                         <h2 className="card-title text-xl font-bold mb-4">Products Without Recipe</h2>
                                         <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                                             <ul className="list-disc list-inside space-y-2 text-slate-700">
                                                 {reportData.productsWithoutRecipe.map((product, index) => ( <li key={index}>{product}</li> ))}
                                             </ul>
                                         </div>
                                     </div>
                                 </div>
                             )}
                        </div>
                    </motion.div>
                )}

                {/* ... Initial state card is unchanged ... */}
                 {!isLoading && !error && !reportData && (
                     <motion.div key="initial" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20 bg-base-100 rounded-xl shadow-lg">
                         <FiCalendar className="mx-auto text-5xl text-slate-400 mb-4" />
                         <h3 className="text-xl font-bold text-slate-600">Ready to Generate a Report</h3>
                         <p className="text-slate-500 mt-2">Select a date range and click 'Generate Report' to view data.</p>
                     </motion.div>
                 )}
            </AnimatePresence>
        </div>
    );
};

export default IngredientUsageReport;