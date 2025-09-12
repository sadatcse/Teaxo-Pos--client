import React, { useState, useEffect, useContext } from 'react';
import UseAxiosSecure from '../../Hook/UseAxioSecure';
import { AuthContext } from '../../providers/AuthProvider';
import { FaUtensils, FaCalculator, FaListAlt, FaFileInvoiceDollar, FaExclamationTriangle } from 'react-icons/fa';
import { MdFoodBank } from "react-icons/md";
import Mtitle from '../../components library/Mtitle';
import { motion, AnimatePresence } from 'framer-motion';

const MenuCosting = () => {
    const axiosSecure = UseAxiosSecure();
    const { branch } = useContext(AuthContext);

    // State for data
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [costingDetails, setCostingDetails] = useState(null);

    // State for UI control
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [loadingCosting, setLoadingCosting] = useState(false);

    // 1. Fetch all active categories on component mount
    useEffect(() => {
        if (branch) {
            setLoadingCategories(true);
            axiosSecure.get(`/category/${branch}/active`)
                .then(res => {
                    setCategories(res.data);
                })
                .catch(err => console.error("Error fetching categories:", err))
                .finally(() => setLoadingCategories(false));
        }
    }, [branch, axiosSecure]);

    // 2. Fetch products when a category is selected
    useEffect(() => {
        if (selectedCategory) {
            setLoadingProducts(true);
            setProducts([]); // Clear previous products
            setSelectedProduct(null); // Clear selected product
            setCostingDetails(null); // Clear costing details
            
            axiosSecure.get(`/product/branch/${branch}/category/${selectedCategory}/get-all`)
                .then(res => {
                    setProducts(res.data);
                })
                .catch(err => console.error("Error fetching products:", err))
                .finally(() => setLoadingProducts(false));
        }
    }, [selectedCategory, branch, axiosSecure]);

    // 3. Fetch costing details when a product is selected
    useEffect(() => {
        if (selectedProduct) {
            setLoadingCosting(true);
            setCostingDetails(null); // Clear previous details
            
            axiosSecure.get(`/recipes/dynamic/${selectedProduct._id}`)
                .then(res => {
                    setCostingDetails(res.data);
                })
                .catch(err => {
                    console.error("Error fetching costing details:", err);
                    // Set a more descriptive error object
                    setCostingDetails({ 
                        error: "Failed to Calculate Cost",
                        suggestion: "Please check that this product has a valid recipe, all its ingredients are defined, and there are purchase records available to calculate the average cost."
                    });
                })
                .finally(() => setLoadingCosting(false));
        }
    }, [selectedProduct, axiosSecure]);
    
    // Handlers for clicks
    const handleCategoryClick = (category) => {
        setSelectedCategory(category.categoryName);
    };

    const handleProductClick = (product) => {
        setSelectedProduct(product);
    };


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
                        {/* Left Side: Categories & Products */}
                        <div className="lg:col-span-4 flex flex-col gap-6">
                            {/* Categories Card */}
                            <div>
                                <h2 className="text-xl font-semibold text-slate-700 mb-4 flex items-center gap-3">
                                    <MdFoodBank className="text-blue-600 text-2xl"/> 
                                    <span>Select a Category</span>
                                </h2>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                    <AnimatePresence>
                                        {loadingCategories ? (
                                            <div className="text-center p-4"><span className="loading loading-spinner text-blue-600"></span></div>
                                        ) : (
                                            categories.map(cat => (
                                                <motion.div
                                                    key={cat._id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <button 
                                                        onClick={() => handleCategoryClick(cat)}
                                                        className={`btn btn-block justify-start rounded-full ${selectedCategory === cat.categoryName ? 'btn-primary text-white' : 'btn-ghost'}`}
                                                    >
                                                        {cat.categoryName}
                                                    </button>
                                                </motion.div>
                                            ))
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div className="divider"></div>

                            {/* Products Card */}
                            <div>
                               <h2 className="text-xl font-semibold text-slate-700 mb-4 flex items-center gap-3">
                                    <FaUtensils className="text-blue-600 text-2xl"/> 
                                    <span>Choose a Product</span>
                                </h2>
                                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                                    <AnimatePresence>
                                        {loadingProducts && <div className="text-center p-4"><span className="loading loading-spinner text-blue-600"></span></div>}
                                        {!selectedCategory && !loadingProducts && <p className="text-sm text-slate-500 p-4 text-center">Select a category to see products.</p>}
                                        {selectedCategory && !loadingProducts && products.length === 0 && <p className="text-sm text-slate-500 p-4 text-center">No products found here.</p>}
                                        {products.map(prod => (
                                            <motion.div
                                                key={prod._id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.3 }}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <button
                                                    onClick={() => handleProductClick(prod)}
                                                    className={`btn btn-block justify-start rounded-full ${selectedProduct?._id === prod._id ? 'bg-blue-600 text-white' : 'btn-ghost'}`}
                                                >
                                                    {prod.productName}
                                                </button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Costing Details */}
                        <div className="lg:col-span-8 bg-base-200 rounded-2xl p-4 sm:p-6 min-h-[600px] flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                {/* LOADER */}
                                {loadingCosting && (
                                    <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full text-center">
                                        <span className="loading loading-dots loading-lg text-blue-600"></span>
                                        <p className="mt-4 text-slate-600 font-semibold">Calculating Costs...</p>
                                    </motion.div>
                                )}

                                {/* INITIAL PLACEHOLDER */}
                                {!selectedProduct && !loadingCosting && (
                                    <motion.div key="placeholder" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                                        <FaFileInvoiceDollar className="text-7xl text-blue-200 mb-4" />
                                        <h3 className="text-2xl font-bold text-slate-700">Cost Analysis</h3>
                                        <p className="max-w-xs mx-auto mt-2">Select a product from the left panel to view its detailed cost breakdown and profitability report.</p>
                                    </motion.div>
                                )}

                                {/* DATA OR ERROR DISPLAY */}
                                {costingDetails && !loadingCosting && (
                                    costingDetails.error ? (
                                        // BEAUTIFUL ERROR MESSAGE DISPLAY
                                        <motion.div
                                            key="error"
                                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.4, ease: "easeOut" }}
                                            className="flex flex-col items-center justify-center h-full w-full max-w-md mx-auto p-8 bg-base-100 rounded-2xl shadow-xl border border-error/20 text-center"
                                        >
                                            <FaExclamationTriangle className="text-5xl text-error mb-5" />
                                            <h3 className="text-2xl font-bold text-slate-700 mb-3">
                                                {costingDetails.error}
                                            </h3>
                                            <p className="text-slate-500 leading-relaxed">
                                                {costingDetails.suggestion}
                                            </p>
                                        </motion.div>
                                    ) : (
                                        // SUCCESSFUL DATA DISPLAY
                                        <motion.div key="details" className='w-full' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                            <h2 className="text-3xl font-bold text-slate-800 border-b-2 border-slate-200 pb-4 mb-6">{costingDetails.productName}</h2>
                                            
                                            {/* Calculation Summary */}
                                            <div className='mb-8'>
                                                <h3 className='text-xl font-semibold text-slate-700 mb-4 flex items-center gap-3'><FaCalculator className="text-blue-600"/> Cost & Price Summary</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <motion.div whileHover={{ scale: 1.05 }} className="stat bg-base-100 rounded-2xl shadow">
                                                        <div className="stat-title">Original Price</div>
                                                        <div className="stat-value text-blue-600">৳{costingDetails.originalPrice.toFixed(2)}</div>
                                                        <div className="stat-desc text-slate-500">Current selling price</div>
                                                    </motion.div>
                                                    <motion.div whileHover={{ scale: 1.05 }} className="stat bg-base-100 rounded-2xl shadow">
                                                        <div className="stat-title">Ingredient Cost</div>
                                                        <div className="stat-value text-error">৳{costingDetails.calculationDetails.totalIngredientCost.toFixed(2)}</div>
                                                        <div className="stat-desc text-slate-500">Cost of all materials</div>
                                                    </motion.div>
                                                    <motion.div whileHover={{ scale: 1.05 }} className="stat bg-base-100 rounded-2xl shadow">
                                                        <div className="stat-title">Suggested Price</div>
                                                        <div className="stat-value text-success">৳{costingDetails.calculationDetails.finalSuggestedPrice.toFixed(2)}</div>
                                                        <div className="stat-desc text-slate-500">Based on {costingDetails.calculationDetails.profitMargin} profit</div>
                                                    </motion.div>
                                                </div>
                                            </div>
                                            
                                            {/* Ingredient Breakdown Table */}
                                            <div>
                                                <h3 className='text-xl font-semibold text-slate-700 mb-4 flex items-center gap-3'><FaListAlt className="text-blue-600"/> Ingredient Breakdown</h3>
                                                <div className="overflow-x-auto rounded-lg max-h-64">
                                                    <table className="table w-full table-pin-header">
                                                        <thead>
                                                            <tr className='bg-blue-600 text-white rounded-t-lg'>
                                                                <th className='rounded-tl-lg border border-slate-300'>Ingredient Name</th>
                                                                <th className='border border-slate-300'>Quantity</th>
                                                                <th className='border border-slate-300'>Avg. Unit Cost</th>
                                                                <th className='rounded-tr-lg border border-slate-300 text-right'>Total Cost</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <AnimatePresence>
                                                            {costingDetails.ingredientBreakdown.map((ing, index) => (
                                                                <motion.tr 
                                                                    key={ing.id}
                                                                    className='hover'
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0 }}
                                                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                                                >
                                                                    <td className="font-medium border border-slate-300">{ing.name}</td>
                                                                    <td className='border border-slate-300'>{ing.quantity} {ing.unit}</td>
                                                                    <td className='border border-slate-300'>৳{ing.avgUnitCost.toFixed(2)} / {ing.unit}</td>
                                                                    <td className="text-right font-semibold border border-slate-300">৳{ing.totalCost.toFixed(2)}</td>
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