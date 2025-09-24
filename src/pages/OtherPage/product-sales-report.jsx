import React, { useState, useEffect, useCallback, useContext, useMemo } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import UseAxiosSecure from "../../Hook/UseAxioSecure";
import moment from "moment";
import { AuthContext } from './../../providers/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';

import { FiSearch, FiCalendar } from "react-icons/fi";
import { MdPictureAsPdf, MdGridOn } from "react-icons/md";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

import Mtitle from "../../components library/Mtitle";
import useCompanyHook from "../../Hook/useCompanyHook"; // Import hook for company data
import { generateProductSalePdf } from "../../components/utils/generateProductSalePdf"; // New PDF utility
import { generateProductSaleExcel } from "../../components/utils/generateProductSaleExcel"; // New Excel utility
import MtableLoading from "../../components library/MtableLoading"; 

const ProductSalesReport = () => {
    const [categories, setCategories] = useState([]);
    const [category, setCategory] = useState("All");
    const [products, setProducts] = useState([]);
    const [product, setProduct] = useState("All");
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [displays, setDisplays] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isExporting, setIsExporting] = useState(false); // State for export loading
    const { branch } = useContext(AuthContext);
    const { companies } = useCompanyHook(); // Get company data for reports
    const axiosSecure = UseAxiosSecure();
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    const fetchCategories = useCallback(async () => {
        if (!branch) return;
        try {
            const response = await axiosSecure.get(`/category/${branch}/get-all`);
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }, [axiosSecure, branch]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const fetchProducts = useCallback(async () => {
        if (!branch) return;
        try {
            const endpoint =
                category === "All"
                    ? `/product/branch/${branch}/category/all/get-all`
                    : `/product/branch/${branch}/category/${category}/get-all`;
            const response = await axiosSecure.get(endpoint);
            setProducts(response.data);
            setProduct("All");
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    }, [axiosSecure, branch, category]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleSearch = async () => {
        setIsLoading(true);
        const formattedStartDate = moment(startDate).format("YYYY-MM-DD");
        const formattedEndDate = moment(endDate).format("YYYY-MM-DD");

        try {
            const response = await axiosSecure.get(
                `/invoice/${branch}/sales?category=${category}&product=${product}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`
            );
            setDisplays(response.data);
        } catch (error) {
            console.error("Error fetching sales data:", error);
            setDisplays([]);
        } finally {
            setIsLoading(false);
        }
    };

    // This function fetches all data for exporting without being tied to component state updates
    const fetchAllDataForExport = async () => {
        setIsExporting(true);
        const formattedStartDate = moment(startDate).format("YYYY-MM-DD");
        const formattedEndDate = moment(endDate).format("YYYY-MM-DD");

        try {
            const response = await axiosSecure.get(
                `/invoice/${branch}/sales?category=${category}&product=${product}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`
            );
            return response.data; // Return the data directly
        } catch (error) {
            console.error("Error fetching all data for export:", error);
            alert("Failed to fetch data for export. Please try again.");
            return null;
        } finally {
            setIsExporting(false);
        }
    };

    const handleExportPdf = async () => {
        const exportData = await fetchAllDataForExport();
        if (exportData && exportData.length > 0) {
            const reportData = {
                data: exportData,
                company: companies[0],
                filters: { startDate, endDate, category, product }
            };
            generateProductSalePdf(reportData);
        } else {
            alert("No data available to export for the selected filters.");
        }
    };

    const handleExportExcel = async () => {
        const exportData = await fetchAllDataForExport();
        if (exportData && exportData.length > 0) {
            const reportData = {
                data: exportData,
                company: companies[0],
                filters: { startDate, endDate, category, product }
            };
            generateProductSaleExcel(reportData);
        } else {
            alert("No data available to export for the selected filters.");
        }
    };

    const sortedDisplays = useMemo(() => {
        let sortableItems = [...displays];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [displays, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (name) => {
        if (sortConfig.key !== name) {
            return <FaSort className="inline-block ml-1 text-slate-400" />;
        }
        return sortConfig.direction === 'ascending' ? (
            <FaSortUp className="inline-block ml-1" />
        ) : (
            <FaSortDown className="inline-block ml-1" />
        );
    };

    const totalQuantity = displays.reduce((sum, item) => sum + item.qty, 0);

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-base-200 min-h-screen">
            <Mtitle title="Product Sales Report" rightcontent={
                <div className="flex items-center gap-2">
                    <motion.button
                        disabled={isExporting}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleExportPdf}
                        className="btn btn-ghost btn-circle text-blue-600 hover:bg-blue-100"
                        title="Export as PDF"
                    >
                        {isExporting ? <span className="loading loading-spinner"></span> : <MdPictureAsPdf className="text-xl" />}
                    </motion.button>
                    <motion.button
                        disabled={isExporting}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleExportExcel}
                        className="btn btn-ghost btn-circle text-blue-600 hover:bg-blue-100"
                        title="Export as Excel"
                    >
                        {isExporting ? <span className="loading loading-spinner"></span> : <MdGridOn className="text-xl" />}
                    </motion.button>
                </div>
            } />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="card bg-base-100 shadow-xl mb-6"
            >
                <div className="card-body p-4 sm:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                        <div className="form-control"><label className="label"><span className="label-text text-slate-700">Category</span></label><select value={category} onChange={(e) => setCategory(e.target.value)} className="select select-bordered w-full"><option value="All">All Categories</option>{categories.map((cat) => (<option key={cat._id} value={cat.categoryName}>{cat.categoryName}</option>))}</select></div>
                        <div className="form-control"><label className="label"><span className="label-text text-slate-700">Product</span></label><select value={product} onChange={(e) => setProduct(e.target.value)} className="select select-bordered w-full"><option value="All">All Products</option>{products.map((prod) => (<option key={prod._id} value={prod.productName}>{prod.productName}</option>))}</select></div>
                        <div className="form-control relative"><label className="label"><span className="label-text text-slate-700">From Date</span></label><DatePicker selected={startDate} onChange={(date) => setStartDate(date)} className="input input-bordered w-full pl-10" dateFormat="dd/MM/yyyy" /><FiCalendar className="absolute left-3 bottom-3 text-slate-400" /></div>
                        <div className="form-control relative"><label className="label"><span className="label-text text-slate-700">To Date</span></label><DatePicker selected={endDate} onChange={(date) => setEndDate(date)} className="input input-bordered w-full pl-10" dateFormat="dd/MM/yyyy" /><FiCalendar className="absolute left-3 bottom-3 text-slate-400" /></div>
                        <motion.button onClick={handleSearch} className="btn bg-blue-600 hover:bg-blue-700 text-white w-full" disabled={isLoading} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>{isLoading ? <span className="loading loading-spinner"></span> : <><FiSearch /> Search</>}</motion.button>
                    </div>
                </div>
            </motion.div>
            
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="card bg-base-100 shadow-xl"
            >
                <div className="card-body p-4 sm:p-6">
                    {isLoading ? (
                        <MtableLoading />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead className="bg-blue-600 text-white uppercase text-xs">
                                    <tr>
                                        <th className="p-3 rounded-tl-lg">SL.No</th>
                                        <th className="p-3">
                                            <button onClick={() => requestSort('productName')} className="flex items-center gap-1">
                                                Product {getSortIcon('productName')}
                                            </button>
                                        </th>
                                        <th className="p-3 text-right">
                                            <button onClick={() => requestSort('rate')} className="flex items-center gap-1 ml-auto">
                                                Rate {getSortIcon('rate')}
                                            </button>
                                        </th>
                                        <th className="p-3 text-center rounded-tr-lg">
                                            <button onClick={() => requestSort('qty')} className="flex items-center gap-1 mx-auto">
                                                Total QTY {getSortIcon('qty')}
                                            </button>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {sortedDisplays.length > 0 ? (
                                            sortedDisplays.map((prod, index) => (
                                                <motion.tr key={prod.productName + index} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-blue-50 border-b border-slate-200 text-sm text-slate-700">
                                                    <td className="p-3 text-center">{index + 1}</td>
                                                    <td className="p-3">{prod.productName}</td>
                                                    <td className="p-3 text-right">৳{prod.rate.toFixed(2)}</td>
                                                    <td className="p-3 text-center font-bold">{prod.qty}</td>
                                                </motion.tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center py-16 text-slate-500">
                                                    No sales data found for the selected criteria.
                                                </td>
                                            </tr>
                                        )}
                                    </AnimatePresence>
                                </tbody>
                                {displays.length > 0 && (
                                     <tfoot className="font-bold bg-slate-100 text-slate-800">
                                         <tr>
                                             <td className="p-3 rounded-bl-lg" colSpan="3">Grand Total</td>
                                             <td className="p-3 text-center text-blue-600 rounded-br-lg">{totalQuantity}</td>
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

export default ProductSalesReport;