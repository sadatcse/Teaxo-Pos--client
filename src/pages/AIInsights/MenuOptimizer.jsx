import React, { useState, useEffect, useContext, useCallback } from "react";
import { FaExclamationCircle, FaLightbulb, FaWrench, FaStar } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";


// Integrated with your actual project components
import Mtitle from "../../components library/Mtitle";
import UseAxiosSecure from '../../Hook/UseAxioSecure';
import { AuthContext } from "../../providers/AuthProvider";
import MtableLoading from "../../components library/MtableLoading"; 

// Component for Displaying an Empty or Error State
const MEmptyState = ({ message, details }) => (
    <div className="text-center py-20 px-6 bg-slate-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-xl">
        <FaExclamationCircle className="mx-auto text-4xl text-yellow-400 mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 dark:text-zinc-200">{message}</h3>
        <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">{details}</p>
    </div>
);

// Card for Combo Suggestion
const ComboSuggestionCard = ({ suggestion }) => (
    <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-emerald-950/20 dark:to-green-950/40 p-6 rounded-xl shadow-md border border-emerald-200 dark:border-emerald-900/50">
        <div className="flex items-center gap-3 mb-4">
            <FaStar className="text-2xl text-yellow-400" />
            <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-400 font-bold">AI Combo Suggestion</h3>
        </div>
        <div className="space-y-3 text-slate-700 dark:text-zinc-300">
            <p><span className="font-semibold text-slate-800 dark:text-zinc-200">Suggested Name:</span> {suggestion.name || 'N/A'}</p>
            <p>
                <span className="font-semibold text-slate-800 dark:text-zinc-200">Items:</span> 
                {/* CORRECTED: Map the array to get the 'productName' from each object */}
                {Array.isArray(suggestion.items) ? suggestion.items.map(item => item.productName || item._id).join(', ') : suggestion.items || 'N/A'}
            </p>
            <p><span className="font-semibold text-slate-800 dark:text-zinc-200">Suggested Price:</span> ৳{suggestion.price || '0.00'}</p>
            <p><span className="font-semibold text-slate-800 dark:text-zinc-200">Reasoning:</span> {suggestion.reason || 'No reason provided.'}</p>
        </div>
    </div>
);

// Card for Item Improvement
const ItemImprovementCard = ({ suggestion }) => (
    <div className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-amber-950/20 dark:to-orange-950/40 p-6 rounded-xl shadow-md border border-amber-200 dark:border-amber-900/50">
        <div className="flex items-center gap-3 mb-4">
            <FaWrench className="text-2xl text-orange-500" />
            <h3 className="text-xl font-bold text-orange-850 dark:text-amber-400 font-bold">Item Improvement Opportunity</h3>
        </div>
        <div className="space-y-3 text-slate-700 dark:text-zinc-300">
            <p><span className="font-semibold text-slate-800 dark:text-zinc-200">Underperforming Item:</span> {suggestion.name || 'N/A'}</p>
            <p><span className="font-semibold text-slate-800 dark:text-zinc-200">Suggestion:</span> {suggestion.suggestion || 'No suggestion provided.'}</p>
        </div>
    </div>
);

const MenuOptimizer = () => {
    const axiosSecure = UseAxiosSecure();
    const { branch } = useContext(AuthContext);
    const [suggestion, setSuggestion] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchSuggestion = useCallback(async () => {
        if (!branch) return;

        setIsLoading(true);
        setError(null);
        try {
            const response = await axiosSecure.get(`/prediction/${branch}/menu-suggestion`);
            setSuggestion(response.data.suggestion || null);
        } catch (error) {
            console.error('Error fetching menu suggestion:', error);
            const errorMessage = error.response?.data?.error || "Could not fetch AI suggestions. Please try again.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [axiosSecure, branch]);

    useEffect(() => {
        fetchSuggestion();
    }, [fetchSuggestion]);

    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-base-200 dark:bg-zinc-950 dark:text-zinc-100">
            <Mtitle title="AI Menu Optimizer" />
            
            <motion.div 
                className="mt-4 text-slate-600 dark:text-zinc-350 max-w-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <p>
                    Leverage AI to enhance your menu. Based on the last 30 days of sales, the AI has identified a potential new combo deal and an opportunity to improve an underperforming item.
                </p>
            </motion.div>

            <div className="mt-8">
                {isLoading ? (
                    <MtableLoading />
                ) : error ? (
                    <MEmptyState message="An Error Occurred" details={error} />
                ) : !suggestion ? (
                    <MEmptyState 
                        message="No Suggestions Available" 
                        details="There isn't enough sales data to generate a meaningful menu suggestion at this time." 
                    />
                ) : (
                    <motion.div 
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            visible: { transition: { staggerChildren: 0.2 } }
                        }}
                    >
                        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                            {suggestion.comboSuggestion && <ComboSuggestionCard suggestion={suggestion.comboSuggestion} />}
                        </motion.div>
                        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                            {suggestion.itemImprovement && <ItemImprovementCard suggestion={suggestion.itemImprovement} />}
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default MenuOptimizer;