import React, { useState, useEffect, useContext, useCallback } from "react";
import { FaExclamationCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { ColorRing } from "react-loader-spinner";
import moment from "moment";

// Integrated with your actual project components and hooks
import Mtitle from "../../components library/Mtitle";
import UseAxiosSecure from '../../Hook/UseAxioSecure';
import { AuthContext } from "../../providers/AuthProvider";

// Reusable Loading Component
const MLoading = () => (
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

// Component for Displaying an Empty or Error State
const MEmptyState = ({ message, details }) => (
    <div className="text-center py-20 px-6 bg-slate-50 rounded-xl">
        <FaExclamationCircle className="mx-auto text-4xl text-yellow-400 mb-4" />
        <h3 className="text-lg font-semibold text-slate-700">{message}</h3>
        <p className="text-slate-500 text-sm mt-1">{details}</p>
    </div>
);

// Card Component to display each predicted item
const PredictionCard = ({ item, index }) => {
    const colors = [
        "from-blue-500 to-indigo-600",
        "from-green-500 to-emerald-600",
        "from-purple-500 to-violet-600",
        "from-orange-500 to-amber-600",
        "from-rose-500 to-pink-600",
    ];

    return (
        <motion.div
            className={`p-5 rounded-xl shadow-lg text-white bg-gradient-to-br ${colors[index % colors.length]}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold">{item.productName}</h3>
                <span className="text-3xl font-bold">{`#${index + 1}`}</span>
            </div>
            <p className="mt-4 text-lg">
                Predicted Quantity: <span className="font-extrabold text-2xl">{item.predictedQty}</span>
            </p>
        </motion.div>
    );
};

const DailySalesForecast = () => {
    const axiosSecure = UseAxiosSecure();
    const { branch } = useContext(AuthContext);
    const [predictions, setPredictions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchPredictions = useCallback(async () => {
        if (!branch) return;

        setIsLoading(true);
        setError(null);
        try {
            const response = await axiosSecure.get(`/prediction/${branch}/sales`);
            setPredictions(response.data);
        } catch (error) {
            console.error('Error fetching sales predictions:', error);
            const errorMessage = error.response?.data?.error || "Could not fetch sales predictions. Please try again later.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [axiosSecure, branch]);

    useEffect(() => {
        fetchPredictions();
    }, [fetchPredictions]);

    const today = moment().format("dddd, MMMM Do YYYY");

    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-base-200">
            <Mtitle 
                title="Today's Sales Forecast" 
                rightcontent={<div className="text-slate-500 font-medium">{today}</div>} 
            />
            
            <motion.div 
                className="mt-4 text-slate-600 max-w-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <p>
                    This forecast predicts the top 5 best-selling items for today based on sales performance from the past 90 days on this specific day of the week.
                </p>
            </motion.div>

            <div className="mt-8">
                {isLoading ? (
                    <MLoading />
                ) : error ? (
                    <MEmptyState message="An Error Occurred" details={error} />
                ) : predictions.length === 0 ? (
                    <MEmptyState 
                        message="No Prediction Data Available" 
                        details="There isn't enough historical sales data for this day of the week to generate a forecast." 
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        <AnimatePresence>
                            {predictions.map((item, index) => (
                                <PredictionCard key={item.productName} item={item} index={index} />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DailySalesForecast;