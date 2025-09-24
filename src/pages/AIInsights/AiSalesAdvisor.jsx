import React, { useState, useEffect, useContext, useCallback } from "react";
import { FaExclamationCircle, FaLightbulb } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";

// Integrated with your actual project components and hooks
import Mtitle from "../../components library/Mtitle";
import UseAxiosSecure from '../../Hook/UseAxioSecure';
import { AuthContext } from "../../providers/AuthProvider";
import MtableLoading from "../../components library/MtableLoading"; 

// Component for Displaying an Empty or Error State
const MEmptyState = ({ message, details }) => (
    <div className="text-center py-20 px-6 bg-slate-50 rounded-xl">
        <FaExclamationCircle className="mx-auto text-4xl text-yellow-400 mb-4" />
        <h3 className="text-lg font-semibold text-slate-700">{message}</h3>
        <p className="text-slate-500 text-sm mt-1">{details}</p>
    </div>
);

// Card Component to display each AI forecast item
const ForecastCard = ({ item, index }) => {
    return (
        <motion.div
            className="bg-base-100 p-5 rounded-xl shadow-md border border-slate-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-blue-600">{item.productName}</h3>
                <span className="text-lg font-semibold text-slate-500">Predicted Qty: <span className="text-2xl font-bold text-slate-800">{item.predictedQty}</span></span>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200 flex items-start gap-3">
                <FaLightbulb className="text-yellow-400 text-xl mt-1 flex-shrink-0" />
                <p className="text-slate-600 text-sm">
                    <span className="font-semibold">Reason:</span> {item.reason}
                </p>
            </div>
        </motion.div>
    );
};

const AiSalesAdvisor = () => {
    const axiosSecure = UseAxiosSecure();
    const { branch } = useContext(AuthContext);
    const [forecast, setForecast] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchForecast = useCallback(async () => {
        if (!branch) return;

        setIsLoading(true);
        setError(null);
        try {
            // This API call uses your actual Gemini-powered backend route
            const response = await axiosSecure.get(`/prediction/${branch}/sales-forecast`);
            // The backend sends { forecast: [...] }, so we access the array
            setForecast(response.data.forecast || []);
        } catch (error) {
            console.error('Error fetching AI sales forecast:', error);
            const errorMessage = error.response?.data?.error || "Could not fetch AI forecast. Please try again later.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [axiosSecure, branch]);

    useEffect(() => {
        fetchForecast();
    }, [fetchForecast]);

    const today = moment().format("dddd, MMMM Do YYYY");

    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-base-200">
            <Mtitle 
                title="AI Sales Advisor" 
                rightcontent={<div className="text-slate-500 font-medium">{today}</div>} 
            />
            
            <motion.div 
                className="mt-4 text-slate-600 max-w-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <p>
                    The AI has analyzed sales data from the last four weeks for this specific day ({moment().format("dddd")}) to generate the following sales forecast.
                </p>
            </motion.div>

            <div className="mt-8">
                {isLoading ? (
                    <MtableLoading />
                ) : error ? (
                    <MEmptyState message="An Error Occurred" details={error} />
                ) : !Array.isArray(forecast) || forecast.length === 0 ? (
                    <MEmptyState 
                        message="No Forecast Data Available" 
                        details="The AI could not generate a forecast. This may be due to insufficient historical sales data for this day." 
                    />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <AnimatePresence>
                            {forecast.map((item, index) => (
                                <ForecastCard key={item.productName} item={item} index={index} />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AiSalesAdvisor;