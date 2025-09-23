import React, { useState, useEffect, useContext, useCallback } from "react";
import { FaExclamationCircle, FaSmile, FaMeh, FaFrown, FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import { motion } from "framer-motion";
import { ColorRing } from "react-loader-spinner";

// Integrated with your actual project components
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

// Component to visually represent the overall sentiment
const SentimentScore = ({ sentiment }) => {
    const sentimentStyles = {
        "positive": {
            icon: <FaSmile className="text-green-500" />,
            textColor: "text-green-600",
            bgColor: "bg-green-100",
        },
        "mixed": {
            icon: <FaMeh className="text-yellow-500" />,
            textColor: "text-yellow-600",
            bgColor: "bg-yellow-100",
        },
        "negative": {
            icon: <FaFrown className="text-red-500" />,
            textColor: "text-red-600",
            bgColor: "bg-red-100",
        },
    };

    // Find a style that matches the sentiment text, case-insensitively
    const styleKey = Object.keys(sentimentStyles).find(key => 
        sentiment?.toLowerCase().includes(key)
    ) || 'mixed';
    
    const { icon, textColor, bgColor } = sentimentStyles[styleKey];

    return (
        <motion.div 
            className={`flex items-center justify-center gap-4 p-4 rounded-xl shadow-md ${bgColor}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="text-4xl">{icon}</div>
            <div>
                <p className="text-sm text-slate-500">Overall Sentiment</p>
                <p className={`text-2xl font-bold ${textColor}`}>{sentiment}</p>
            </div>
        </motion.div>
    );
};

// Reusable card for displaying lists of insights
const InsightCard = ({ title, points, icon, colorClass }) => (
    <div className={`bg-base-100 p-6 rounded-xl shadow-md border-t-4 ${colorClass}`}>
        <div className="flex items-center gap-3 mb-4">
            <div className="text-2xl">{icon}</div>
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        </div>
        <ul className="space-y-3 list-disc list-inside text-slate-600">
            {points.map((point, index) => (
                <li key={index}>{point}</li>
            ))}
        </ul>
    </div>
);


const ReviewInsights = () => {
    const axiosSecure = UseAxiosSecure();
    const { branch } = useContext(AuthContext);
    const [summary, setSummary] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchSummary = useCallback(async () => {
        if (!branch) return;
        setIsLoading(true);
        setError(null);
        try {
            const response = await axiosSecure.get(`/prediction/${branch}/review-summary`);
            setSummary(response.data.summary || null);
        } catch (error) {
            console.error('Error fetching review summary:', error);
            const errorMessage = error.response?.data?.error || "Could not fetch AI summary. Please try again.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [axiosSecure, branch]);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-base-200">
            <Mtitle title="AI Review Insights" />

            <motion.div 
                className="mt-4 text-slate-600 max-w-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <p>
                    Here's a summary of the last 20 customer reviews, analyzed by AI to identify key themes and overall sentiment.
                </p>
            </motion.div>

            <div className="mt-8">
                {isLoading ? (
                    <MLoading />
                ) : error ? (
                    <MEmptyState message="An Error Occurred" details={error} />
                ) : !summary ? (
                    <MEmptyState 
                        message="No Review Data Available" 
                        details="There are not enough recent reviews to generate an AI-powered summary." 
                    />
                ) : (
                    <div className="space-y-8">
                        {summary.overallSentiment && <SentimentScore sentiment={summary.overallSentiment} />}

                        <motion.div 
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                visible: { transition: { staggerChildren: 0.2 } }
                            }}
                        >
                            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                                {summary.topPositives && summary.topPositives.length > 0 && (
                                    <InsightCard 
                                        title="Top Positives"
                                        points={summary.topPositives}
                                        icon={<FaThumbsUp className="text-green-500" />}
                                        colorClass="border-green-500"
                                    />
                                )}
                            </motion.div>
                            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                                {summary.topNegatives && summary.topNegatives.length > 0 && (
                                    <InsightCard 
                                        title="Improvement Areas"
                                        points={summary.topNegatives}
                                        icon={<FaThumbsDown className="text-red-500" />}
                                        colorClass="border-red-500"
                                    />
                                )}
                            </motion.div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewInsights;