import React, { useState, useEffect, useContext, useCallback } from "react";
import { FaExclamationCircle, FaShoppingCart } from "react-icons/fa";
import { motion } from "framer-motion";
import { ColorRing } from "react-loader-spinner";

import Mtitle from "../../components library/Mtitle";
import UseAxiosSecure from '../../Hook/UseAxioSecure';
import { AuthContext } from "../../providers/AuthProvider";

// Reusable Loading Component
const MLoading = () => (
    <div className="flex justify-center items-center w-full h-full py-28">
        <ColorRing visible={true} height="80" width="80" ariaLabel="color-ring-loading" wrapperClass="color-ring-wrapper" colors={["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"]} />
    </div>
);

// Component for Displaying an Empty or Info State
const MEmptyState = ({ message, details }) => (
    <div className="text-center py-20 px-6 bg-slate-50 rounded-xl">
        <FaExclamationCircle className="mx-auto text-4xl text-yellow-400 mb-4" />
        <h3 className="text-lg font-semibold text-slate-700">{message}</h3>
        <p className="text-slate-500 text-sm mt-1">{details}</p>
    </div>
);

// Card to display each purchase suggestion
const PurchaseCard = ({ item }) => {
    const daysRemaining = item.daysRemaining;
    let borderColor = 'border-slate-300';
    if (daysRemaining < 3) borderColor = 'border-red-500';
    else if (daysRemaining < 5) borderColor = 'border-orange-500';
    else borderColor = 'border-yellow-500';

    return (
        <div className={`bg-base-100 p-5 rounded-xl shadow-md border-l-4 ${borderColor}`}>
            <h3 className="text-xl font-bold text-slate-800">{item.name}</h3>
            <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                <p className="text-slate-500">Current Stock: <span className="font-semibold text-slate-700">{item.currentStock} {item.unit}</span></p>
                <p className={`font-bold ${borderColor.replace('border-', 'text-')}`}>~{item.daysRemaining} days left</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200 bg-slate-50 p-3 rounded-lg">
                <p className="font-semibold text-blue-600">
                    <FaShoppingCart className="inline mr-2" />
                    AI Suggestion: Purchase {item.suggestedPurchaseQty} {item.unit}
                </p>
                <p className="text-xs text-slate-500 mt-1 pl-6">{item.justification}</p>
            </div>
        </div>
    );
};

const AiPurchaseAdvisor = () => {
    const axiosSecure = UseAxiosSecure();
    const { branch } = useContext(AuthContext);
    const [suggestions, setSuggestions] = useState([]);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchSuggestions = useCallback(async () => {
        if (!branch) return;
        setIsLoading(true);
        setError(null);
        setMessage("");
        try {
            const response = await axiosSecure.get(`/prediction/${branch}/purchase-suggestion`);
            setSuggestions(response.data.suggestions || []);
            setMessage(response.data.message || "");
        } catch (error) {
            console.error('Error fetching purchase suggestions:', error);
            setError(error.response?.data?.error || "Could not fetch AI suggestions.");
        } finally {
            setIsLoading(false);
        }
    }, [axiosSecure, branch]);

    useEffect(() => {
        fetchSuggestions();
    }, [fetchSuggestions]);

    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-base-200">
            <Mtitle title="AI Purchase Advisor" />
            <motion.div 
                className="mt-4 text-slate-600 max-w-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <p>The AI has analyzed your sales velocity and current inventory to predict which ingredients need to be reordered soon.</p>
            </motion.div>

            <div className="mt-8">
                {isLoading ? (
                    <MLoading />
                ) : error ? (
                    <MEmptyState message="An Error Occurred" details={error} />
                ) : suggestions.length === 0 ? (
                    <MEmptyState 
                        message="No Urgent Purchases Needed" 
                        details={message || "Your inventory levels appear to be sufficient based on recent sales."}
                    />
                ) : (
                    <motion.div 
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                        initial="hidden"
                        animate="visible"
                        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                    >
                        {suggestions.map((item) => (
                            <motion.div key={item.name} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                                <PurchaseCard item={item} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default AiPurchaseAdvisor;