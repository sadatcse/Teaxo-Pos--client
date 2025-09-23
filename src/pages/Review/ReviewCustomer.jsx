import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import UseAxiosSecure from '../../Hook/useAxiosPublic';

// --- SVG Icon Components ---

const StarIcon = ({ color }) => (
    <svg className="w-8 h-8 transition-colors duration-200" fill={color} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const PhoneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const CommentIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
    </svg>
);

const UtensilsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
);

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
    </svg>
);

// A reusable Star Rating component using Framer Motion
const StarRating = ({ rating, setRating }) => {
    const [hover, setHover] = useState(null);
    return (
        <div className="flex items-center space-x-1">
            {[...Array(5)].map((star, i) => {
                const ratingValue = i + 1;
                return (
                    <motion.label
                        key={i}
                        className="cursor-pointer"
                        onMouseEnter={() => setHover(ratingValue)}
                        onMouseLeave={() => setHover(null)}
                        whileHover={{ scale: 1.2, rotate: 15 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <input
                            type="radio"
                            name="rating"
                            value={ratingValue}
                            onClick={() => setRating(ratingValue)}
                            className="hidden"
                        />
                        <StarIcon
                            color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                        />
                    </motion.label>
                );
            })}
        </div>
    );
};

// Notification component using DaisyUI alert
const Notification = ({ message, type, onDismiss }) => {
    if (!message) return null;
    const typeClasses = {
        warning: 'alert-warning',
        error: 'alert-error',
    };
    return (
        <div className={`alert ${typeClasses[type]} shadow-lg`}>
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span>{message}</span>
            </div>
            <div className="flex-none">
                <button onClick={onDismiss} className="btn btn-sm btn-circle btn-ghost">&times;</button>
            </div>
        </div>
    );
};


const ReviewCustomer = () => {
    const { tableId,route } = useParams();
    const axiosSecure = UseAxiosSecure();
    const [orderInfo, setOrderInfo] = useState(null);
    const [branchInfo, setBranchInfo] = useState(null); 
    const [branch, setBranch] = useState(null); 
    const [customer, setCustomer] = useState({ name: '', mobile: '', email: '' });
    const [ratings, setRatings] = useState({ overall: 0, comment: '', bestFoodName: '' });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'warning' });

    const fetchOrderDetails = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            // Using axios directly as the custom hook is not available in this scope
            const response = await axiosSecure.get(`/review/prepare/${route}/${tableId}`);
            
            const { orderDetails, branchDetails } = response.data;
            
            setOrderInfo(orderDetails);
            setBranchInfo(branchDetails);
            setBranch(branchDetails.branch);

            if (orderDetails?.products?.length > 0) {
                let selectedFood = '';
                if (orderDetails.products.length === 1) {
                    selectedFood = orderDetails.products[0].productName;
                } else {
                    const randomIndex = Math.floor(Math.random() * orderDetails.products.length);
                    selectedFood = orderDetails.products[randomIndex].productName;
                }
                setRatings(prevRatings => ({ ...prevRatings, bestFoodName: selectedFood }));
            }

        } catch (err) {
            setError(err.response?.data?.message || "It looks like you haven't placed an order yet, or this review link has expired. Please place an order to leave a review.");
            console.error("Error fetching order details:", err);
        } finally {
            setLoading(false);
        }
    }, [tableId, route]);

    useEffect(() => {
        fetchOrderDetails();
    }, [fetchOrderDetails]);

    const handleMobileBlur = async () => {
        if (customer.mobile.length >= 10) {
            try {
                // Using axios directly
                const response = await axiosSecure.get(`/review/customer/check/${customer.mobile}`);
                if (response.data.exists) {
                    setCustomer(response.data.customer);
                }
            } catch (err) {
                console.error("Error checking customer:", err);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setNotification({ show: false, message: '' });

        if (!customer.name || !customer.mobile) {
            setNotification({ show: true, message: 'Please provide your name and phone number.', type: 'warning' });
            return;
        }
        if (ratings.overall === 0) {
            setNotification({ show: true, message: 'Please provide an overall star rating for your order.', type: 'warning' });
            return;
        }

        setSubmitting(true);
        const reviewData = { ...customer, rating: ratings.overall, comment: ratings.comment, bestFoodName: ratings.bestFoodName, branch, tableId };

        try {
            // Using axios directly
            await axiosSecure.post('/review/submit', reviewData);
            setFormSubmitted(true);
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Failed to submit review.";
            setNotification({ show: true, message: errorMessage, type: 'error' });
            console.error("Error submitting review:", err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-blue-600"></span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="card w-full max-w-lg bg-white shadow-xl"
                >
                    <div className="card-body items-center text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="text-red-500 h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <h2 className="card-title text-2xl font-bold text-red-600">Oops! Something went wrong.</h2>
                        <p className="text-gray-600 mt-2">{error}</p>
                    </div>
                </motion.div>
            </div>
        );
    }
    
    if (formSubmitted) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="card w-full max-w-lg bg-white shadow-xl"
                >
                    <div className="card-body items-center text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="text-green-500 h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <h1 className="card-title text-3xl font-bold text-green-600">Thank You!</h1>
                        <p className="text-lg text-gray-700 mt-2">Your review has been submitted successfully.</p>
                    </div>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 space-y-6"
            >
                <header className="text-center">
                    {branchInfo?.logo && (
                         <img 
                             src={branchInfo.logo} 
                             alt={`${branchInfo.name} Logo`} 
                             className="mx-auto h-20 w-auto object-contain mb-4"
                         />
                    )}
                    <h1 className="text-3xl font-bold text-gray-800">{branchInfo?.name || 'Review Your Order'}</h1>
                    <p className="text-sm text-gray-500 mt-1">{branchInfo?.address}</p>
                    
                    <div className="mt-6">
                        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Order Details</h2>
                        <div className="mt-3 flex justify-center bg-blue-50/50 rounded-xl p-4 shadow-inner space-x-4">
                            
                            {/* --- CONDITIONAL RENDERING LOGIC STARTS HERE --- */}
                            {orderInfo?.orderType === 'dine-in' && (
                                <div className="text-center flex-1">
                                    <p className="text-xs text-blue-800 font-semibold">Table</p>
                                    <p className="text-lg font-bold text-blue-900">{orderInfo?.tableName || 'N/A'}</p>
                                </div>
                            )}

                            {orderInfo?.orderType === 'delivery' && (
                                <div className="text-center flex-1">
                                    <p className="text-xs text-blue-800 font-semibold">Delivery Via</p>
                                    <p className="text-lg font-bold text-blue-900">{orderInfo?.deliveryProvider || 'N/A'}</p>
                                </div>
                            )}

                            {orderInfo?.orderType === 'takeaway' && (
                                <div className="text-center flex-1">
                                    <p className="text-xs text-blue-800 font-semibold">Order Type</p>
                                    <p className="text-lg font-bold text-blue-900">Takeaway</p>
                                </div>
                            )}
                            {/* --- CONDITIONAL RENDERING LOGIC ENDS HERE --- */}

                            <div className="border-l border-blue-200"></div>
                            <div className="text-center flex-1">
                                <p className="text-xs text-blue-800 font-semibold">Token</p>
                                <p className="text-lg font-bold text-blue-900">{orderInfo?.invoiceSerial || 'N/A'}</p>
                            </div>
                             <div className="border-l border-blue-200"></div>
                            <div className="text-center flex-1">
                                <p className="text-xs text-blue-800 font-semibold">Amount</p>
                                <p className="text-lg font-bold text-blue-900">৳{orderInfo?.totalAmount?.toFixed(2) || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {notification.show && <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification({ show: false, message: '' })} />}
                    
                    <div className="p-6 border rounded-xl bg-gray-50 space-y-5">
                         <h3 className="text-lg font-semibold text-gray-700">Your Details</h3>
                         <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><PhoneIcon /></div>
                                <input
                                    type="tel"
                                    value={customer.mobile}
                                    onChange={(e) => setCustomer({ ...customer, mobile: e.target.value })}
                                    onBlur={handleMobileBlur}
                                    placeholder="Enter your phone to see if we know you"
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                         </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><UserIcon /></div>
                                <input
                                    type="text"
                                    value={customer.name}
                                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                                    placeholder="Your full name"
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-6 border rounded-xl bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Rate Your Experience</h3>
                        <div className="flex justify-center mb-4"><StarRating rating={ratings.overall} setRating={(r) => setRatings({...ratings, overall: r})} /></div>
                        <div className="relative">
                            <div className="absolute top-3 left-0 pl-3 flex items-center pointer-events-none"><CommentIcon /></div>
                            <textarea
                                placeholder="Write your overall feedback..."
                                value={ratings.comment}
                                onChange={(e) => setRatings({ ...ratings, comment: e.target.value })}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                rows="3"
                            ></textarea>
                        </div>
                    </div>

                    <div className="p-6 border rounded-xl bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Which food did you like best?</h3>
                         <div className="relative">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><UtensilsIcon /></div>
                            <select
                                 value={ratings.bestFoodName}
                                 onChange={(e) => setRatings({ ...ratings, bestFoodName: e.target.value })}
                                 className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 appearance-none"
                             >
                                 <option value="">Select an item (optional)</option>
                                 {orderInfo?.products.map(p => (
                                     <option key={p.productId} value={p.productName}>{p.productName}</option>
                                 ))}
                             </select>
                         </div>
                    </div>

                    <motion.button
                        type="submit"
                        disabled={submitting}
                        className="btn w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition duration-300 disabled:bg-blue-400 flex items-center justify-center text-base"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {submitting ? <span className="loading loading-spinner"></span> : <><EditIcon/> Submit Review</>}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default ReviewCustomer;

