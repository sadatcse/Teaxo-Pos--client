import React, { useState, useEffect, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiArrowUp, FiArrowDown, FiMinus, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaUtensils, FaCalculator, FaListAlt, FaFileInvoiceDollar, FaExclamationTriangle } from 'react-icons/fa';
import { MdFoodBank } from "react-icons/md";
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

const InlineSpinner = () => <span className="loading loading-spinner text-blue-600"></span>;

const MenuCosting = () => {
    const axiosSecure = UseAxiosSecure();
    const { branch } = useContext(AuthContext);

    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [costingDetails, setCostingDetails] = useState(null);

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [loadingCosting, setLoadingCosting] = useState(false);

    useEffect(() => {
        if (branch) {
            setLoadingCategories(true);
            axiosSecure.get(`/category/${branch}/active`)
                .then(res => setCategories(res.data))
                .catch(err => console.error("Error fetching categories:", err))
                .finally(() => setLoadingCategories(false));
        }
    }, [branch, axiosSecure]);

    useEffect(() => {
        if (selectedCategory) {
            setLoadingProducts(true);
            setProducts([]);
            setSelectedProduct(null);
            setCostingDetails(null);
            
            axiosSecure.get(`/product/branch/${branch}/category/${selectedCategory}/get-all`)
                .then(res => setProducts(res.data))
                .catch(err => console.error("Error fetching products:", err))
                .finally(() => setLoadingProducts(false));
        }
    }, [selectedCategory, branch, axiosSecure]);

    useEffect(() => {
        if (selectedProduct) {
            setLoadingCosting(true);
            setCostingDetails(null);
            
            axiosSecure.get(`/recipes/dynamic/${selectedProduct._id}`)
                .then(res => setCostingDetails(res.data))
                .catch(err => {
                    console.error("Error fetching costing details:", err);
                    setCostingDetails({ 
                        error: "Failed to Calculate Cost",
                        suggestion: "Please check that this product has a valid recipe, all its ingredients are defined, and there are purchase records available to calculate the average cost."
                    });
                })
                .finally(() => setLoadingCosting(false));
        }
    }, [selectedProduct, axiosSecure]);
    
    const handleCategoryClick = (category) => setSelectedCategory(category.categoryName);
    const handleProductClick = (product) => setSelectedProduct(product);

    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-base-200">
            <Mtitle title="Menu Costing Analysis" />

            <motion.div 
                className="card bg-base-100 shadow-xl mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="card-body p-4 sm:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-4 flex flex-col gap-6">
                            <div>
                                <h2 className="text-xl font-semibold text-blue-600 mb-4 flex items-center gap-3">
                                    <MdFoodBank className="text-2xl"/> 
                                    <span>Select a Category</span>
                                </h2>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                    <AnimatePresence>
                                        {loadingCategories ? (
                                            <div className="text-center p-4"><InlineSpinner /></div>
                                        ) : (
                                            categories.map(cat => (
                                                <motion.div key={cat._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                                                    <button 
                                                        onClick={() => handleCategoryClick(cat)}
                                                        className={`btn btn-block justify-start rounded-xl ${selectedCategory === cat.categoryName ? 'bg-blue-600 text-white hover:bg-blue-700' : 'btn-ghost'}`}
                                                    >
                                                        {cat.categoryName}
                                                    </button>
                                                </motion.div>
                                            ))
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div className="divider lg:hidden"></div>

                            <div>
                               <h2 className="text-xl font-semibold text-blue-600 mb-4 flex items-center gap-3">
                                    <FaUtensils className="text-2xl"/> 
                                    <span>Choose a Product</span>
                                </h2>
                                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                                    <AnimatePresence>
                                        {loadingProducts && <div className="text-center p-4"><InlineSpinner /></div>}
                                        {!selectedCategory && !loadingProducts && <p className="text-sm text-slate-700 p-4 text-center">Select a category to see products.</p>}
                                        {selectedCategory && !loadingProducts && products.length === 0 && <p className="text-sm text-slate-700 p-4 text-center">No products found here.</p>}
                                        {products.map(prod => (
                                            <motion.div key={prod._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                                                <button
                                                    onClick={() => handleProductClick(prod)}
                                                    className={`btn btn-block justify-start rounded-xl ${selectedProduct?._id === prod._id ? 'bg-blue-600 text-white hover:bg-blue-700' : 'btn-ghost'}`}
                                                >
                                                    {prod.productName}
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-8 bg-base-200 rounded-2xl p-4 sm:p-6 min-h-[600px] flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                {loadingCosting && (
                                    <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full text-center">
                                        <MtableLoading />
                                        <p className="-mt-16 text-slate-700 font-semibold">Calculating Costs...</p>
                                    </motion.div>
                                )}

                                {!selectedProduct && !loadingCosting && (
                                    <motion.div key="placeholder" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center justify-center h-full text-center text-slate-700">
                                        <FaFileInvoiceDollar className="text-7xl text-blue-200 mb-4" />
                                        <h3 className="text-2xl font-bold">Cost Analysis</h3>
                                        <p className="max-w-xs mx-auto mt-2 text-sm">Select a product to view its detailed cost breakdown and profitability report.</p>
                                    </motion.div>
                                )}

                                {costingDetails && !loadingCosting && (
                                    costingDetails.error ? (
                                        <motion.div key="error" initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col items-center justify-center h-full w-full max-w-md mx-auto p-8 bg-base-100 rounded-2xl shadow-xl border border-red-500/20 text-center">
                                            <FaExclamationTriangle className="text-5xl text-red-500 mb-5" />
                                            <h3 className="text-2xl font-bold text-slate-700 mb-3">{costingDetails.error}</h3>
                                            <p className="text-slate-700 leading-relaxed text-sm">{costingDetails.suggestion}</p>
                                        </motion.div>
                                    ) : (
                                        <motion.div key="details" className='w-full' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                            <h2 className="text-3xl font-bold text-slate-700 border-b-2 border-slate-200 pb-4 mb-6">{costingDetails.productName}</h2>
                                            <div className='mb-8'>
                                                <h3 className='text-xl font-semibold text-blue-600 mb-4 flex items-center gap-3'><FaCalculator /> Cost & Price Summary</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <motion.div whileHover={{ scale: 1.05 }} className="stat bg-base-100 rounded-2xl shadow"><div className="stat-title text-slate-700">Selling Price</div><div className="stat-value text-blue-600">৳{costingDetails.originalPrice.toFixed(2)}</div></motion.div>
                                                    <motion.div whileHover={{ scale: 1.05 }} className="stat bg-base-100 rounded-2xl shadow"><div className="stat-title text-slate-700">Ingredient Cost</div><div className="stat-value text-red-600">৳{costingDetails.calculationDetails.totalIngredientCost.toFixed(2)}</div></motion.div>
                                                    <motion.div whileHover={{ scale: 1.05 }} className="stat bg-base-100 rounded-2xl shadow"><div className="stat-title text-slate-700">Suggested Price</div><div className="stat-value text-green-600">৳{costingDetails.calculationDetails.finalSuggestedPrice.toFixed(2)}</div><div className="stat-desc text-slate-700">{costingDetails.calculationDetails.profitMargin} profit</div></motion.div>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className='text-xl font-semibold text-blue-600 mb-4 flex items-center gap-3'><FaListAlt /> Ingredient Breakdown</h3>
                                                <div className="overflow-x-auto rounded-lg max-h-64 border border-slate-200">
                                                    <table className="table w-full table-pin-header">
                                                        <thead className='bg-blue-600 text-white'><tr><th className='rounded-tl-lg'>Ingredient Name</th><th>Quantity</th><th>Avg. Unit Cost</th><th className='rounded-tr-lg text-right'>Total Cost</th></tr></thead>
                                                        <tbody>
                                                            <AnimatePresence>
                                                                {costingDetails.ingredientBreakdown.map((ing, index) => (
                                                                    <motion.tr key={ing.id} className='hover:bg-blue-50 text-sm text-slate-700' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
                                                                        <td className="font-medium">{ing.name}</td><td>{ing.quantity} {ing.unit}</td><td>৳{ing.avgUnitCost.toFixed(2)} / {ing.unit}</td><td className="text-right font-semibold">৳{ing.totalCost.toFixed(2)}</td>
                                                                    </motion.tr>
                                                                ))}
                                                            </AnimatePresence>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default MenuCosting;