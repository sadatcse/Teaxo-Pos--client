import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaMoneyBillWave, FaCreditCard, FaUniversity, FaSearch } from "react-icons/fa";
import { FaCcVisa, FaCcAmex } from "react-icons/fa6";
import { RiMastercardFill } from "react-icons/ri";
import { MdOutlineSendToMobile } from "react-icons/md";
import CookingAnimation from "../CookingAnimation";
import Food from "../../assets/Raw-Image/Food.jpg";
// NEW IMPORTS
import UseAxiosSecure from "../../Hook/UseAxioSecure"; 
import { AuthContext } from "../../providers/AuthProvider";

const ProductSelection = ({
    products, 
    categories, 
    selectedCategory, 
    setSelectedCategory, 
    addProduct, 
    loading, // This is initial loading for all products
    isProcessing,
    selectedPaymentMethod,
    selectedSubMethod,
    selectedCardIcon,
    handleMainPaymentButtonClick,
    handleSubPaymentButtonClick
}) => {
    
    // --- Context & Hooks ---
    const { branch } = useContext(AuthContext);
    const axiosSecure = UseAxiosSecure();

    // --- State ---
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // --- Debounced Server-Side Search Effect ---
    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!searchQuery.trim()) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            try {
                // Call the NEW backend route
                const res = await axiosSecure.get(`/product/search-active?branch=${branch}&query=${searchQuery}`);
                setSearchResults(res.data);
            } catch (error) {
                console.error("Search error:", error);
            } finally {
                setIsSearching(false);
            }
        };

        // Debounce: Wait 500ms after user stops typing
        const delayDebounceFn = setTimeout(() => {
            fetchSearchResults();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, branch, axiosSecure]);

    // --- Animation Variants ---
    const rowVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
        exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
    };

    // --- Helpers ---
    const clearSearch = () => {
        setSearchQuery("");
        setSearchResults([]);
    };

    // --- DETERMINE DATA SOURCE ---
    // If query exists, use server results. If not, use client-side filtering by category.
    const displayProducts = searchQuery.trim().length > 0 
        ? searchResults 
        : (products || []).filter(p => p.category === selectedCategory);

    // --- Payment Constants ---
    const cardOptions = [
        { name: "Visa Card", icon: <FaCcVisa /> },
        { name: "Master Card", icon: <RiMastercardFill /> },
        { name: "Amex Card", icon: <FaCcAmex /> },
    ];
    
    const mobileOptions = [
        { name: "Bkash", icon: "BkashLogo" },
        { name: "Nagad", icon: "NagadLogo" },
        { name: "Rocket", icon: "RocketLogo" },
    ];

    return (
        <div className="w-full lg:w-4/6 p-1 sm:p-1 font-inter">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="card bg-base-100 shadow-xl"
            >
                <div className="card-body p-3 sm:p-6">
                    
                    {/* --- SEARCH BAR UI --- */}
                    <div className="mb-2 px-2">
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search active products..."
                                className="input input-bordered w-full pl-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button 
                                    onClick={clearSearch}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    {/* --- Categories (Hidden if searching to reduce clutter, or keep it) --- */}
                    <div className="mb-4">
                        <div className="flex flex-wrap p-2 gap-1 sm:gap-1">
                            {categories.map((category) => (
                                <motion.button
                                    key={category}
                                    onClick={() => {
                                        setSelectedCategory(category);
                                        clearSearch(); // Switch back to category view
                                    }}
                                    className={`btn btn-sm md:btn-md rounded-full shadow-sm transition-colors duration-300 ${
                                        selectedCategory === category && searchQuery === ""
                                        ? "bg-blue-600 hover:bg-blue-700 border-blue-700 text-white" 
                                        : "btn-ghost"
                                    }`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {category}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* --- Header Status --- */}
                    {/* <div className="px-4 mb-2">
                        <h3 className="text-sm font-bold text-gray-500 uppercase flex items-center gap-2">
                            {searchQuery ? (
                                <>
                                    <span>Global Search Results: "{searchQuery}"</span>
                                    {isSearching && <span className="loading loading-spinner loading-xs"></span>}
                                </>
                            ) : (
                                `${selectedCategory} Menu`
                            )}
                        </h3>
                    </div> */}

                    {/* --- Products Table --- */}
                    <div className="h-[55vh] overflow-y-auto custom-scrollbar">
                        {loading && !searchQuery ? (
                             // Initial Page Load
                            <div className="flex justify-center items-center h-full">
                                <CookingAnimation />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="table table-pin-rows table-zebra min-w-full">
                                    <thead>
                                        <tr>
                                            <th className="bg-base-300 p-2 sm:p-4 rounded-tl-lg">Picture</th>
                                            <th className="bg-base-300 p-2 sm:p-4">Product</th>
                                            <th className="bg-base-300 p-2 sm:p-4">Rate</th>
                                            <th className="bg-base-300 p-2 sm:p-4 text-center rounded-tr-lg">Action</th>
                                        </tr>
                                    </thead>
                                    
                                    <tbody>
                                        <AnimatePresence mode="popLayout">
                                            {displayProducts.length > 0 ? (
                                                displayProducts.map((product) => (
                                                    <motion.tr
                                                        key={product._id}
                                                        layout
                                                        variants={rowVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                        exit="exit"
                                                        className="hover"
                                                    >
                                                        <td className="p-2 sm:px-4">
                                                            <div className="avatar">
                                                                <div className="mask mask-squircle w-12 h-12 sm:w-14 sm:h-14">
                                                                    <img
                                                                        src={product.photo || Food}
                                                                        alt={product.productName}
                                                                        onError={(e) => {
                                                                            e.target.onerror = null;
                                                                            e.target.src = "https://placehold.co/64x64/E0E0E0/666666?text=No+Img";
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="font-bold text-sm sm:text-base text-base-content">
                                                            {product.productName}
                                                            {/* Show Category Badge if Searching */}
                                                            {searchQuery && (
                                                                <span className="badge badge-ghost badge-xs ml-2 font-normal text-gray-400">
                                                                    {product.category}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="font-semibold text-sm sm:text-base">{product.price} TK</td>
                                                        <td className="text-center p-2 sm:px-4">
                                                            <motion.button
                                                                onClick={() => addProduct(product)}
                                                                className="btn btn-sm rounded-full flex items-center gap-2 bg-blue-500 hover:bg-blue-700 text-white border-none"
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                            >
                                                                <FaPlus />
                                                                <span className="hidden sm:inline">Add</span>
                                                            </motion.button>
                                                        </td>
                                                    </motion.tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="text-center py-8 text-gray-500">
                                                        {isSearching 
                                                            ? "Searching..." 
                                                            : `No products found matching "${searchQuery}"`
                                                        }
                                                    </td>
                                                </tr>
                                            )}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* --- PAYMENT METHOD SECTION (Unchanged) --- */}
                    <div className="divider mt-2 mb-2">Payment Options</div>
                    <div className="p-2 rounded-xl">
                        <div className="flex justify-center flex-wrap gap-3">
                            {["Cash", "Card", "Mobile", "Bank"].map((method) => (
                                <button key={method} onClick={() => handleMainPaymentButtonClick(method)} className={`btn btn-md min-w-[110px] ${selectedPaymentMethod === method || (selectedSubMethod && cardOptions.some(o => o.name === selectedSubMethod) && method === 'Card') || (selectedSubMethod && mobileOptions.some(o => o.name === selectedSubMethod) && method === 'Mobile') || (selectedPaymentMethod === 'Bank' && method === 'Bank') ? "bg-blue-500 hover:bg-blue-600 text-white border-blue-600" : "btn-ghost"}`} disabled={isProcessing}>
                                    {method === "Cash" && <FaMoneyBillWave />}
                                    {method === "Card" && (selectedCardIcon || <FaCreditCard />)}
                                    {method === "Mobile" && <MdOutlineSendToMobile />}
                                    {method === "Bank" && <FaUniversity />}
                                    {method}
                                </button>
                            ))}
                        </div>
                        {selectedPaymentMethod === 'Card' && (<div className="mt-4 flex flex-wrap justify-center gap-3">{cardOptions.map((card) => (<button key={card.name} onClick={() => handleSubPaymentButtonClick(card.name, card.icon)} className={`btn btn-sm ${selectedSubMethod === card.name ? "bg-blue-500 hover:bg-blue-600 text-white" : "btn-ghost"}`} disabled={isProcessing}>{card.icon}<span>{card.name}</span></button>))}</div>)}
                        {selectedPaymentMethod === 'Mobile' && (<div className="mt-4 flex flex-wrap justify-center gap-3">{mobileOptions.map((mobile) => (<button key={mobile.name} onClick={() => handleSubPaymentButtonClick(mobile.name)} className={`btn btn-sm ${selectedSubMethod === mobile.name ? "bg-blue-500 hover:bg-blue-600 text-white" : "btn-ghost"}`} disabled={isProcessing}><span>{mobile.name}</span></button>))}</div>)}
                    </div>

                </div>
            </motion.div>
        </div>
    );
};

export default ProductSelection;