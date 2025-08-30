import React, { useState } from 'react';
import {
    FaPlus, FaMinus, FaTrash, FaSearch, FaUser, FaMobileAlt, FaUtensils,
    FaTruck, FaMoneyBillWave, FaCreditCard, FaSave,
    FaPrint, FaRedo, FaGift,
} from "react-icons/fa";
import { FaCcVisa, FaCcAmex } from "react-icons/fa6";
import { RiMastercardFill } from "react-icons/ri";
import { MdOutlineSendToMobile } from "react-icons/md";
import { FaUniversity } from "react-icons/fa"; 

const OrderSummary = ({
    customer, mobile, setMobile, handleCustomerSearch,
    orderType, handleOrderTypeChange, TableName, deliveryProvider,
    addedProducts, incrementQuantity, decrementQuantity, removeProduct,
    invoiceSummary, setInvoiceSummary, subtotal, vat, sd, payable, paid, change,
    printInvoice, handleKitchenClick, resetOrder, isProcessing, selectedPaymentMethod,
    handlePaymentMethodSelect, toggleComplimentaryStatus,
}) => {
    const [activeTab, setActiveTab] = useState('invoiceDetails');
    const [selectedSubMethod, setSelectedSubMethod] = useState('');
    const [selectedCardIcon, setSelectedCardIcon] = useState(null);

    const handleMainPaymentButtonClick = (method) => {
        if (selectedPaymentMethod === method) {
            handlePaymentMethodSelect('');
            setSelectedSubMethod('');
            setSelectedCardIcon(null);
        } else {
            handlePaymentMethodSelect(method);
            setSelectedSubMethod('');
            if (method !== 'Card') {
                setSelectedCardIcon(null);
            }
        }
    };

    const handleSubPaymentButtonClick = (subMethod, iconComponent = null) => {
        setSelectedSubMethod(subMethod);
        handlePaymentMethodSelect(subMethod);
        if (subMethod.includes("Card")) {
            setSelectedCardIcon(iconComponent);
        } else {
            setSelectedCardIcon(null);
        }
    };

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
    const bankOptions = [
        { name: "Bank", icon: <FaUniversity /> },
    ];

    return (
        <div className="w-full lg:w-2/6 p-1 md:p-6 font-inter">
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

                        <div className="overflow-x-auto max-h-96 mb-4 md:mb-6 border border-gray-200 rounded-xl shadow-inner custom-scrollbar">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100 sticky top-0 shadow-sm">
                                    <tr>
                                        <th className="px-4 py-2 md:px-6 md:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Product</th>
                                        <th className="px-4 py-2 md:px-6 md:py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Quantity</th>
                                        <th className="px-4 py-2 md:px-6 md:py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Price</th>
                                        <th className="px-4 py-2 md:px-6 md:py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {addedProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-4 py-6 md:px-6 md:py-8 text-center text-gray-500 italic text-sm md:text-base">
                                                No products added yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        addedProducts.map((product) => (
                                            <tr key={product._id} className="hover:bg-blue-50 transition-colors duration-200">
                                                <td className="px-4 py-3 md:px-6 md:py-4 text-xs md:text-sm font-medium text-gray-900">
                                                    {product.productName}
                                                    {product.isComplimentary && (
                                                        <span className="ml-2 px-2 py-1 text-[10px] font-bold text-white bg-green-500 rounded-full">
                                                            FREE
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 md:px-6 md:py-4 text-xs md:text-sm text-gray-700">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button onClick={() => decrementQuantity(product._id)} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                                                            <FaMinus className="text-xs" />
                                                        </button>
                                                        <span className="font-extrabold text-sm text-gray-900">{product.quantity}</span>
                                                        <button onClick={() => incrementQuantity(product._id)} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
                                                            <FaPlus className="text-xs" />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 md:px-6 md:py-4 text-xs md:text-sm text-right font-bold">
                                                    {product.isComplimentary ? '0.00' : (product.price * product.quantity).toFixed(2)} TK
                                                </td>
                                                <td className="px-4 py-3 md:px-6 md:py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button onClick={() => toggleComplimentaryStatus(product._id)} className={`p-2.5 rounded-full text-white ${product.isComplimentary ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-400 hover:bg-gray-500'}`}>
                                                            <FaGift className="text-xs" />
                                                        </button>
                                                        <button onClick={() => removeProduct(product._id)} className="p-2.5 bg-red-600 text-white rounded-full hover:bg-red-700">
                                                            <FaTrash className="text-xs" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6">
                            <table className="w-full border-collapse">
                                <tbody>
                                    <tr className="border-b border-gray-200">
                                        <td className="px-4 py-2 text-sm text-gray-700">Sub Total (TK):</td>
                                        <td className="px-4 py-2 text-right font-bold">{subtotal.toFixed(2)}</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="px-4 py-2 text-sm text-gray-700">VAT (TK):</td>
                                        <td className="px-4 py-2 text-right font-bold">{vat.toFixed(2)}</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="px-4 py-2 text-sm text-gray-700">SD (TK):</td>
                                        <td className="px-4 py-2 text-right font-bold">{sd.toFixed(2)}</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="px-4 py-2 text-sm text-gray-700">Discount (TK):</td>
                                        <td className="px-4 py-2 text-right">
                                            <input
                                                type="number"
                                                className="border border-gray-300 px-3 py-1.5 w-28 text-right rounded-lg"
                                                value={invoiceSummary.discount}
                                                onChange={(e) => setInvoiceSummary({ ...invoiceSummary, discount: parseFloat(e.target.value) || 0 })}
                                                min="0"
                                            />
                                        </td>
                                    </tr>
                                    <tr className="border-b border-blue-300 bg-blue-50">
                                        <td className="px-4 py-3 font-extrabold text-blue-800">Total Payable (TK):</td>
                                        <td className="px-4 py-3 text-right font-extrabold text-blue-800">{payable.toFixed(2)}</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <td className="px-4 py-2 text-sm text-gray-700">Paid Amount (TK):</td>
                                        <td className="px-4 py-2 text-right">
                                            <input
                                                type="number"
                                                className="border border-gray-300 px-3 py-1.5 w-28 text-right rounded-lg"
                                                value={invoiceSummary.paid}
                                                onChange={(e) => setInvoiceSummary({ ...invoiceSummary, paid: parseFloat(e.target.value) || 0 })}
                                                min="0"
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="px-4 py-2 text-sm text-gray-700">Change (TK):</td>
                                        <td className="px-4 py-2 text-right font-bold">{change.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <div className="mt-6 p-4  rounded-xl">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">Payment Method</h3>
                                <div className="flex justify-center gap-3"> {/* Changed from flex-wrap to a simple flex with justify-center */}
                                    {["Cash", "Card", "Mobile", "Bank"].map((method) => (
                                        <button
                                            key={method}
                                            onClick={() => handleMainPaymentButtonClick(method)}
                                            className={`min-w-[100px] px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm
                                                ${selectedPaymentMethod === method || (selectedPaymentMethod && cardOptions.map(o => o.name).includes(selectedPaymentMethod) && method === 'Card') || (selectedPaymentMethod && mobileOptions.map(o => o.name).includes(selectedPaymentMethod) && method === 'Mobile') || (selectedPaymentMethod === 'Bank' && method === 'Bank') ? "bg-blue-600 text-white shadow-lg" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                                            disabled={isProcessing}
                                        >
                                            {method === "Cash" && <FaMoneyBillWave />}
                                            {method === "Card" && (selectedCardIcon || <FaCreditCard />)}
                                            {method === "Mobile" && <MdOutlineSendToMobile />}
                                            {method === "Bank" && <FaUniversity />}
                                            {method}
                                        </button>
                                    ))}
                                </div>
                                {selectedPaymentMethod === 'Card' && (
                                    <div className="mt-4 flex flex-wrap justify-center gap-3">
                                        {cardOptions.map((card) => (
                                            <button
                                                key={card.name}
                                                onClick={() => handleSubPaymentButtonClick(card.name, card.icon)}
                                                className={`px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-2 text-sm
                                                    ${selectedSubMethod === card.name ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                                                disabled={isProcessing}
                                            >
                                                {card.icon}
                                                <span>{card.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {selectedPaymentMethod === 'Mobile' && (
                                    <div className="mt-4 flex flex-wrap justify-center gap-3">
                                        {mobileOptions.map((mobile) => (
                                            <button
                                                key={mobile.name}
                                                onClick={() => handleSubPaymentButtonClick(mobile.name)}
                                                className={`px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-2 text-sm
                                                    ${selectedSubMethod === mobile.name ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                                                disabled={isProcessing}
                                            >
                                                <span>{mobile.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <button
                                    onClick={() => printInvoice(false)}
                                    className="bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-bold flex items-center justify-center gap-2"
                                    disabled={isProcessing}
                                >
                                    <FaSave /> {isProcessing ? "Saving..." : "Save"}
                                </button>
                                <button
                                    onClick={() => printInvoice(true)}
                                    className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold flex items-center justify-center gap-2"
                                    disabled={isProcessing}
                                >
                                    <FaPrint /> {isProcessing ? "Printing..." : "Print"}
                                </button>
                                <button
                                    onClick={handleKitchenClick}
                                    className=" bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 font-bold flex items-center justify-center gap-2"
                                    disabled={isProcessing}
                                >
                                    <FaUtensils /> Kitchen
                                </button>
                                <button
                                    onClick={resetOrder}
                                    className=" bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-bold flex items-center justify-center gap-2"
                                    disabled={isProcessing}
                                >
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
                                <select
                                    id="orderTypeSelect"
                                    value={orderType || ''}
                                    onChange={(e) => handleOrderTypeChange(e.target.value)}
                                    className="border border-gray-300 px-4 py-2 md:px-5 md:py-3 rounded-xl text-sm md:text-base text-gray-700 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm w-full"
                                >
                                    <option value="dine-in">Dine-in</option>
                                    <option value="takeaway">Takeaway</option>
                                    <option value="delivery">Delivery</option>
                                </select>
                            </div>

                            {(orderType === 'dine-in' || orderType === 'delivery') && (
                                <div className="min-w-[160px] w-full md:w-auto">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        {orderType === 'dine-in' ? (
                                            <><FaUtensils className="text-green-500" /> Selected Table:</>
                                        ) : (
                                            <><FaTruck className="text-purple-500" /> Provider:</>
                                        )}
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
                                <input
                                    id="mobileInput"
                                    type="text"
                                    className="flex-grow border border-gray-300 px-3 py-2 md:px-4 md:py-3 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm md:text-base"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    placeholder="e.g., 01712345678"
                                />
                                <button
                                    className="px-4 py-2 md:px-5 md:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-300 ease-in-out shadow-lg transform hover:scale-105 flex items-center justify-center"
                                    onClick={handleCustomerSearch}
                                    aria-label="Search Customer"
                                >
                                    <FaSearch className="text-base md:text-lg" />
                                </button>
                            </div>
                        </div>
                        {customer && (
                            <div className="mb-4 md:mb-6 p-4 border border-blue-400 rounded-xl bg-blue-50 text-blue-800 shadow-md">
                                <p className="font-semibold text-sm md:text-base flex items-center gap-2">
                                    <FaUser className="text-blue-600" /> Name: <span className="font-normal">{customer.name}</span>
                                </p>
                                <p className="font-semibold text-sm md:text-base flex items-center gap-2">
                                    <FaMobileAlt className="text-blue-600" /> Mobile: <span className="font-normal">{customer.mobile}</span>
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderSummary;