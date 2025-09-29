import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import Swal from 'sweetalert2';
import {
    FaPlus, FaMinus, FaTrash, FaSearch, FaUser, FaMobileAlt, FaUtensils,
    FaTruck, FaSave, FaPrint, FaRedo, FaGift, FaClock
} from "react-icons/fa";
import { FaCcVisa, FaCcAmex } from "react-icons/fa6";
import { RiMastercardFill } from "react-icons/ri";

const OrderSummary = ({
    user, customDateTime, setCustomDateTime,
    customer, mobile, setMobile, handleCustomerSearch,
    orderType, handleOrderTypeChange, TableName, deliveryProvider,
    addedProducts, incrementQuantity, decrementQuantity, removeProduct,
    invoiceSummary, setInvoiceSummary, subtotal, vat, sd, payable, paid, change,
    printInvoice, handleKitchenClick, resetOrder, isProcessing, toggleComplimentaryStatus,
    // --- Incoming Payment State for Validation ---
    selectedPaymentMethod,
    selectedSubMethod
}) => {
    const [activeTab, setActiveTab] = useState('invoiceDetails');

    // --- Kept for Validation Logic ---
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

    const validateOrder = () => {
        if (addedProducts.length === 0) {
            Swal.fire({ icon: 'error', title: 'No Products Added', text: 'Please add at least one product to the invoice.' });
            return false;
        }
        if (orderType === 'dine-in' && !TableName) {
            Swal.fire({ icon: 'error', title: 'No Table Selected', text: 'Please select a table for this dine-in order.' });
            return false;
        }
        if (orderType === 'delivery' && !deliveryProvider) {
            Swal.fire({ icon: 'error', title: 'No Delivery Provider', text: 'Please select a delivery provider for this order.' });
            return false;
        }
        // Validation logic now uses props `selectedPaymentMethod` and `selectedSubMethod`
        if (selectedPaymentMethod === 'Card' && !cardOptions.some(o => o.name === selectedSubMethod)) {
            Swal.fire({ icon: 'error', title: 'Card Type Not Selected', text: 'Please select a specific card type.' });
            return false;
        }
        if (selectedPaymentMethod === 'Mobile' && !mobileOptions.some(o => o.name === selectedSubMethod)) {
            Swal.fire({ icon: 'error', title: 'Mobile Payment Not Selected', text: 'Please select a specific mobile payment option.' });
            return false;
        }
        return true;
    };

    const handleFinalizeOrder = (actionCallback, withPrint) => {
        if (!validateOrder()) {
            return; // Stop if validation fails
        }
        actionCallback(withPrint);
    };


    return (
        <div className="w-full lg:w-2/6 p-1 md:p-2 font-inter">
            <div className="bg-white rounded-2xl shadow-xl p-1 md:p-8 mb-6 border border-gray-100">
                <div className="flex border-b border-gray-200 mb-4">
                    <button
                        className={`flex-1 py-3 text-center text-sm md:text-base font-semibold rounded-tl-xl rounded-tr-xl transition-colors duration-300
                            ${activeTab === 'invoiceDetails' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        onClick={() => setActiveTab('invoiceDetails')}
                    >
                        Invoice Details
                    </button>
                    <button
                        className={`flex-1 py-3 text-center text-sm md:text-base font-semibold rounded-tl-xl rounded-tr-xl transition-colors duration-300
                            ${activeTab === 'customerInfo' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        onClick={() => setActiveTab('customerInfo')}
                    >
                        Other Info
                    </button>
                </div>

                {activeTab === 'invoiceDetails' && (
                    <div>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-start mb-4 md:mb-6 gap-4 border-b border-gray-200 pb-4">
                            <div className="flex-1">
                                <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-3">Invoice Summary</h2>
                            </div>
                        </div>

{/* Redesigned Product List Section */}
<div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
    <AnimatePresence>
        {addedProducts.length === 0 ? (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-10 px-4"
            >
                <p className="text-gray-500 italic">Your order is empty.</p>
                <p className="text-gray-400 text-sm mt-1">Add products to get started!</p>
            </motion.div>
        ) : (
            addedProducts.map((product) => (
                <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="flex items-center p-3 rounded-xl bg-white shadow-sm"
                >
                    {/* Product Name & Badges */}
                    <div className="flex-grow">
                        <p className="font-bold text-gray-800 text-sm md:text-base">
                            {product.productName}
                        </p>
                        {product.isComplimentary && (
                            <div className="mt-1">
                                <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                    FREE
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Quantity Controls & Price */}
                    <div className="flex items-center gap-4">
                        {!product.isComplimentary && (
                             <div className="flex items-center justify-center gap-2 bg-slate-100 rounded-full p-1">
                                <button
                                    onClick={() => decrementQuantity(product._id)}
                                    className="w-7 h-7 flex items-center justify-center bg-white rounded-full text-slate-600 hover:bg-slate-200 transition-colors"
                                >
                                    <FaMinus className="text-xs" />
                                </button>
                                <span className="font-extrabold text-sm text-gray-900 w-5 text-center">{product.quantity}</span>
                                <button
                                    onClick={() => incrementQuantity(product._id)}
                                    className="w-7 h-7 flex items-center justify-center bg-white rounded-full text-slate-600 hover:bg-slate-200 transition-colors"
                                >
                                    <FaPlus className="text-xs" />
                                </button>
                            </div>
                        )}
                        <p className="w-20 text-right font-bold text-sm md:text-base text-gray-800">
                           {product.isComplimentary ? '0.00' : (product.price * product.quantity).toFixed(2)} TK
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 ml-4">
                        <button
                            onClick={() => toggleComplimentaryStatus(product._id)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-white transition-colors ${
                                product.isComplimentary ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-slate-300 hover:bg-slate-400'
                            }`}
                            title="Toggle Complimentary"
                        >
                            <FaGift className="text-sm" />
                        </button>
                        <button 
                            onClick={() => removeProduct(product._id)} 
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors" 
                            title="Remove Item"
                        >
                            <FaTrash className="text-sm" />
                        </button>
                    </div>
                </motion.div>
            ))
        )}
    </AnimatePresence>
</div>

                        <div className="mt-6">
                            <table className="w-full border-collapse">
                                <tbody>
                                    <tr className="border-b border-gray-200"><td className="px-4 py-2 text-sm text-gray-700">Sub Total (TK):</td><td className="px-4 py-2 text-right font-bold">{subtotal.toFixed(2)}</td></tr>
                                    <tr className="border-b border-gray-200"><td className="px-4 py-2 text-sm text-gray-700">VAT (TK):</td><td className="px-4 py-2 text-right font-bold">{vat.toFixed(2)}</td></tr>
                                    <tr className="border-b border-gray-200"><td className="px-4 py-2 text-sm text-gray-700">SD (TK):</td><td className="px-4 py-2 text-right font-bold">{sd.toFixed(2)}</td></tr>
                                    <tr className="border-b border-gray-200"><td className="px-4 py-2 text-sm text-gray-700">Discount (TK):</td><td className="px-4 py-2 text-right"><input type="number" className="border border-gray-300 px-3 py-1.5 w-28 text-right rounded-lg" value={invoiceSummary.discount} onChange={(e) => setInvoiceSummary({ ...invoiceSummary, discount: parseFloat(e.target.value) || 0 })} min="0"/></td></tr>
                                    <tr className="border-b border-blue-300 bg-blue-50"><td className="px-4 py-3 font-extrabold text-blue-800">Total Payable (TK):</td><td className="px-4 py-3 text-right font-extrabold text-blue-800">{payable.toFixed(2)}</td></tr>
                                    <tr className="border-b border-gray-200"><td className="px-4 py-2 text-sm text-gray-700">Paid Amount (TK):</td><td className="px-4 py-2 text-right"><input type="number" className="border border-gray-300 px-3 py-1.5 w-28 text-right rounded-lg" value={invoiceSummary.paid} onChange={(e) => setInvoiceSummary({ ...invoiceSummary, paid: parseFloat(e.target.value) || 0 })} min="0"/></td></tr>
                                    <tr><td className="px-4 py-2 text-sm text-gray-700">Change (TK):</td><td className="px-4 py-2 text-right font-bold">{change.toFixed(2)}</td></tr>
                                </tbody>
                            </table>
                            
                            {/* --- PAYMENT UI REMOVED FROM HERE --- */}

                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <button onClick={() => handleFinalizeOrder(() => printInvoice(false))} className="bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-bold flex items-center justify-center gap-2" disabled={isProcessing}>
                                    <FaSave /> {isProcessing ? "Saving..." : "Save"}
                                </button>
                                <button onClick={() => handleFinalizeOrder(() => printInvoice(true))} className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold flex items-center justify-center gap-2" disabled={isProcessing}>
                                    <FaPrint /> {isProcessing ? "Printing..." : "Print"}
                                </button>
                                <button onClick={() => handleFinalizeOrder(handleKitchenClick)} className=" bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 font-bold flex items-center justify-center gap-2" disabled={isProcessing}>
                                    <FaUtensils /> Kitchen
                                </button>
                                <button onClick={resetOrder} className=" bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-bold flex items-center justify-center gap-2" disabled={isProcessing}>
                                    <FaRedo /> Reset
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'customerInfo' && (
                    <div>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-start mb-4 md:mb-6 gap-4">
                            <div className="flex-1 w-full">
                                <label htmlFor="orderTypeSelect" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <FaUtensils className="text-green-500" /> Select Order Type:
                                </label>
                                <select id="orderTypeSelect" value={orderType || ''} onChange={(e) => handleOrderTypeChange(e.target.value)} className="border border-gray-300 px-4 py-2 md:px-5 md:py-3 rounded-xl text-sm md:text-base text-gray-700 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm w-full">
                                    <option value="dine-in">Dine-in</option>
                                    <option value="takeaway">Takeaway</option>
                                    <option value="delivery">Delivery</option>
                                </select>
                            </div>

                            {(orderType === 'dine-in' || orderType === 'delivery') && (
                                <div className="min-w-[160px] w-full md:w-auto">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        {orderType === 'dine-in' ? (<><FaUtensils className="text-green-500" /> Selected Table:</>) : (<><FaTruck className="text-purple-500" /> Provider:</>)}
                                    </label>
                                    <div className="px-4 py-2 border border-gray-300 rounded-xl bg-gray-100 font-bold text-center text-gray-800 h-10 md:h-12 flex items-center justify-center text-sm md:text-base">
                                        {orderType === 'dine-in' ? (TableName || 'N/A') : (deliveryProvider || 'N/A')}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col mb-2 md:mb-4">
                            <label htmlFor="mobileInput" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <FaMobileAlt className="text-base text-blue-500" /> Customer Mobile:
                            </label>
                            <div className="flex gap-2 md:gap-3">
                                <input id="mobileInput" type="text" className="flex-grow border border-gray-300 px-3 py-2 md:px-4 md:py-3 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm md:text-base" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="e.g., 01712345678"/>
                                <button className="px-4 py-2 md:px-5 md:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-300 ease-in-out shadow-lg transform hover:scale-105 flex items-center justify-center" onClick={handleCustomerSearch} aria-label="Search Customer">
                                    <FaSearch className="text-base md:text-lg" />
                                </button>
                            </div>
                        </div>
                        {customer && (
                            <div className="mb-4 md:mb-6 p-4 border border-blue-400 rounded-xl bg-blue-50 text-blue-800 shadow-md">
                                <p className="font-semibold text-sm md:text-base flex items-center gap-2"><FaUser className="text-blue-600" /> Name: <span className="font-normal">{customer.name}</span></p>
                                <p className="font-semibold text-sm md:text-base flex items-center gap-2"><FaMobileAlt className="text-blue-600" /> Mobile: <span className="font-normal">{customer.mobile}</span></p>
                            </div>
                        )}
                        {user && user.role === 'admin' && (
                            <div className="mb-4">
                                <label htmlFor="dateTimeInput" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <FaClock className="text-base text-purple-500" /> Custom Order Date & Time :
                                </label>
                                <input
                                    id="dateTimeInput"
                                    type="datetime-local"
                                    className="w-full border border-gray-300 px-3 py-2 md:px-4 md:py-3 rounded-xl focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-sm md:text-base"
                                    value={customDateTime}
                                    onChange={(e) => setCustomDateTime(e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderSummary;