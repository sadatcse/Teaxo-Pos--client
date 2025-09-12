import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiInfo, FiCalendar, FiBarChart2 } from 'react-icons/fi';

// --- CHANGES START HERE ---
// 1. Import DatePicker and its CSS
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// --- CHANGES END HERE ---

import UseAxiosSecure from '../../Hook/UseAxioSecure';
import { AuthContext } from '../../providers/AuthProvider';

const IngredientExpenses = () => {
    const axiosSecure = UseAxiosSecure();
    const { branch } = useContext(AuthContext);

    // --- CHANGES START HERE ---
    // 2. Use Date objects for state, not strings
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    // --- CHANGES END HERE ---

    const [reportData, setReportData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    // 3. Helper function to format the date for the API call (YYYY-MM-DD)
    const formatDateForAPI = (date) => {
        // Gets the year, month, and day
        const year = date.getFullYear();
        // Pads month with a 0 if it's a single digit (e.g., 9 -> 09)
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    };

    const handleGenerateReport = async () => {
        setIsLoading(true);
        setError('');
        setReportData(null);

        if (!fromDate || !toDate) {
            setError("Please select both a 'From' and 'To' date.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await axiosSecure.get(`/recipes/reports/ingredient-usage`, {
                params: {
                    branch,
                    // 4. Use the helper function to format dates before sending
                    fromDate: formatDateForAPI(fromDate),
                    toDate: formatDateForAPI(toDate),
                }
            });
            setReportData(response.data);
        } catch (err) {
            console.error("Error fetching ingredient usage report:", err);
            setError(err.response?.data?.message || "An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-base-200">
            {/* Page Header */}
            <motion.div
                className="flex items-center gap-4 mb-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
            >
                <FiBarChart2 className="text-4xl text-slate-800" />
                <h1 className="text-3xl font-bold text-slate-800">
                    Ingredient Usage Report
                </h1>
            </motion.div>

            {/* Controls Card */}
            <motion.div
                className="card bg-base-100 shadow-xl mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                <div className="card-body flex-col sm:flex-row items-center gap-4">
                    {/* --- CHANGES START HERE --- */}
                    {/* 5. Replace <input> with <DatePicker> component */}
                    <div className="form-control w-full sm:w-auto flex-grow">
                        <label className="label"><span className="label-text font-semibold">From Date</span></label>
                        <DatePicker
                            selected={fromDate}
                            onChange={(date) => setFromDate(date)}
                            dateFormat="dd-MM-yyyy"
                            className="input input-bordered w-full"
                        />
                    </div>
                    <div className="form-control w-full sm:w-auto flex-grow">
                        <label className="label"><span className="label-text font-semibold">To Date</span></label>
                        <DatePicker
                            selected={toDate}
                            onChange={(date) => setToDate(date)}
                            dateFormat="dd-MM-yyyy"
                            className="input input-bordered w-full"
                        />
                    </div>
                    {/* --- CHANGES END HERE --- */}
                    <div className="form-control w-full sm:w-auto mt-4 sm:mt-0">
                        <label className="label sm:invisible"><span className="label-text">.</span></label>
                        <motion.button
                            onClick={handleGenerateReport}
                            className="btn bg-[#1A77F2] text-white border-[#005fd8] hover:bg-[#005fd8] w-full"
                            disabled={isLoading}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isLoading ? <span className="loading loading-spinner"></span> : "Generate Report"}
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* The rest of the component remains the same... */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center items-center h-64">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                    </motion.div>
                )}

                {error && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="alert alert-error shadow-lg">
                        <div>
                            <FiAlertTriangle size={24} />
                            <span><strong>Error:</strong> {error}</span>
                        </div>
                    </motion.div>
                )}

                {reportData && !isLoading && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        {reportData.alert && (
                            <div className="alert alert-warning shadow-lg mb-6">
                                <div>
                                    <FiAlertTriangle size={24} />
                                    <span>{reportData.alert}</span>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className={`${
                                reportData.productsWithoutRecipe?.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'
                            } card bg-base-100 shadow-xl transition-all duration-300`}>
                                <div className="card-body">
                                    <h2 className="card-title text-xl font-bold mb-4">Calculated Ingredient Usage</h2>
                                    <div className="overflow-x-auto">
                                        <table className="table table-zebra w-full border border-slate-300">
                                            <thead className="bg-blue-600 text-white">
                                                <tr>
                                                    <th>Ingredient Name</th>
                                                    <th>Total Quantity</th>
                                                    <th>Unit</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportData.ingredientUsage.length > 0 ? (
                                                    reportData.ingredientUsage.map((item, index) => (
                                                        <tr key={index}>
                                                            <td className="font-semibold">{item.ingredientName}</td>
                                                            <td>{item.totalQuantity.toFixed(2)}</td>
                                                            <td>{item.unit}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="3" className="text-center py-8 text-slate-500">
                                                            No ingredient usage data for this period.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {reportData.productsWithoutRecipe?.length > 0 && (
                                <div className="lg:col-span-1 card bg-base-100 shadow-xl">
                                    <div className="card-body">
                                        <h2 className="card-title text-xl font-bold mb-4">Products Without Recipe</h2>
                                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                                            <ul className="list-disc list-inside space-y-2 text-slate-700">
                                                {reportData.productsWithoutRecipe.map((product, index) => (
                                                    <li key={index}>{product}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isLoading && !error && !reportData && (
                 <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="text-center py-20 bg-base-100 rounded-xl shadow-lg"
                >
                    <FiCalendar className="mx-auto text-5xl text-slate-400 mb-4" />
                    <h3 className="text-xl font-bold text-slate-600">Ready to Generate a Report</h3>
                    <p className="text-slate-500 mt-2">Select a date range and click 'Generate Report' to view data.</p>
                </motion.div>
            )}
        </div>
    );
};

export default IngredientExpenses;