import React, { useState, useEffect, useContext } from 'react';
import moment from 'moment';
import { AuthContext } from '../../providers/AuthProvider';
import UseAxiosSecure from '../../Hook/UseAxioSecure';

// --- React Icons ---
import { IoRestaurant, IoTimeOutline } from "react-icons/io5";
import { MdDeliveryDining, MdOutlineFoodBank, MdOutlinePendingActions, MdSoupKitchen } from "react-icons/md";
import { BsHandbagFill } from "react-icons/bs";
import { FaCheckCircle, FaUtensils } from "react-icons/fa";
import Mtitle from '../../components library/Mtitle';

// --- Helper Hook for Live Timer (Unchanged) ---
const useTimeAgo = (startTime) => {
    const [timeAgo, setTimeAgo] = useState('');

    useEffect(() => {
        const updateTimer = () => {
            const duration = moment.duration(moment().diff(moment(startTime)));
            const days = Math.floor(duration.asDays());
            const hours = duration.hours();
            const minutes = duration.minutes();
            const seconds = duration.seconds();

            let parts = [];
            if (days > 0) parts.push(`${days}d`);
            if (hours > 0) parts.push(`${hours}h`);
            parts.push(`${String(minutes).padStart(2, '0')}m`);
            parts.push(`${String(seconds).padStart(2, '0')}s`);
            
            setTimeAgo(parts.join(' '));
        };

        const intervalId = setInterval(updateTimer, 1000);
        updateTimer(); // Initial call

        return () => clearInterval(intervalId);
    }, [startTime]);

    return timeAgo;
};


// --- Order Card Component (Refactored with DaisyUI & Tailwind) ---
const OrderCard = ({ order, onUpdate }) => {
    const timeAgo = useTimeAgo(order.dateTime);

    // --- Helper to get styles and icon based on order type ---
    const getOrderTypeDetails = (type) => {
        switch (type) {
            case 'dine-in': 
                return { 
                    className: 'bg-red-600 text-white', 
                    icon: <IoRestaurant size={24} /> 
                };
            case 'delivery': 
                return { 
                    className: 'bg-green-600 text-white', 
                    icon: <MdDeliveryDining size={24} /> 
                };
            case 'takeaway': 
                return { 
                    className: 'bg-orange-500 text-white', 
                    icon: <BsHandbagFill size={20} /> 
                };
            default: 
                return { 
                    className: 'bg-gray-500 text-white', 
                    icon: <MdSoupKitchen size={24} /> 
                };
        }
    };

    const handleStatusChange = (productId, newStatus) => {
        const updatedProducts = order.products.map(p => 
            p._id === productId ? { ...p, cookStatus: newStatus } : p
        );

        const isCooking = updatedProducts.some(p => p.cookStatus === 'COOKING');
        const allServed = updatedProducts.every(p => p.cookStatus === 'SERVED');

        let newOrderStatus = order.orderStatus;
        if (allServed) {
            newOrderStatus = 'served';
        } else if (isCooking) {
            newOrderStatus = 'cooking';
        }

        const updatedOrder = { ...order, products: updatedProducts, orderStatus: newOrderStatus };
        onUpdate(updatedOrder);
    };
    
    const handleCookAll = () => {
        const updatedProducts = order.products.map(p => 
            p.cookStatus === 'PENDING' ? { ...p, cookStatus: 'COOKING' } : p
        );
        const updatedOrder = { ...order, products: updatedProducts, orderStatus: 'cooking' };
        onUpdate(updatedOrder);
    };

    const orderTypeDetails = getOrderTypeDetails(order.orderType);
    const orderIdentifier = order.orderType === 'dine-in' ? `Table: ${order.tableName}` : `Order: #${order.counter}`;
    
    return (
        <div className="card bg-base-100 shadow-xl border-2 border-base-300 flex flex-col">
            {/* --- Card Header --- */}
            <div className={`card-title p-3 rounded-t-xl flex justify-between items-center ${orderTypeDetails.className}`}>
                <div className='flex items-center gap-3'>
                    {orderTypeDetails.icon}
                    <div>
                        <h2 className="text-xl font-bold">{order.orderType.toUpperCase()}</h2>
                        <p className="text-sm font-normal">{orderIdentifier}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-lg font-semibold">
                    <IoTimeOutline />
                    <span>{timeAgo}</span>
                </div>
            </div>

            {/* --- Card Body --- */}
            <div className="card-body p-0 flex-grow">
                <ul className="menu p-4 text-base-content">
                    {order.products.map(product => (
                        <li key={product._id} className="flex flex-row items-center justify-between w-full py-2 border-b border-base-200 last:border-none">
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-lg w-8 text-center">{product.qty}x</span>
                                <span className='truncate'>{product.productName}</span>
                            </div>
                            <div className="product-actions">
                                {product.cookStatus === 'PENDING' && (
                                    <button className="btn btn-sm btn-error" onClick={() => handleStatusChange(product._id, 'COOKING')}>Cook</button>
                                )}
                                {product.cookStatus === 'COOKING' && (
                                    <button className="btn btn-sm btn-info" onClick={() => handleStatusChange(product._id, 'SERVED')}>Serve</button>
                                )}
                                {product.cookStatus === 'SERVED' && (
                                    <div className="badge badge-success gap-2 text-white">
                                        <FaCheckCircle />
                                        SERVED
                                    </div>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            
            {/* --- Card Footer --- */}
            <div className="card-actions p-3 border-t border-base-200">
                <button className="btn btn-success w-full text-white" onClick={handleCookAll}>
                    <FaUtensils />
                    Cook All Pending Items
                </button>
            </div>
        </div>
    );
};


// --- Main Kitchen Display Component (Refactored with DaisyUI & Tailwind) ---
const Kitchendisplay = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const axiosSecure = UseAxiosSecure();
    const { branch } = useContext(AuthContext);
    const branchName = branch;

    const fetchOrders = async () => {
        try {
            const response = await axiosSecure.get(`/invoice/${branchName}/kitchen`);
            const sortedOrders = response.data.sort((a, b) => {
                const statusOrder = { 'pending': 1, 'cooking': 2 };
                const orderA = statusOrder[a.orderStatus] || 3;
                const orderB = statusOrder[b.orderStatus] || 3;
                if (orderA !== orderB) return orderA - orderB;
                return new Date(a.dateTime) - new Date(b.dateTime);
            });
            setOrders(sortedOrders);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch kitchen orders:", err);
            setError("Could not load orders. Please check connection.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const pollInterval = setInterval(fetchOrders, 10000);
        return () => clearInterval(pollInterval);
    }, [branchName]); // Added branchName to dependency array

    const handleUpdateOrder = async (updatedOrder) => {
        try {
            await axiosSecure.put(`/invoice/update/${updatedOrder._id}`, updatedOrder);
            fetchOrders(); // Refetch to ensure data consistency
        } catch (err) {
            console.error("Failed to update order:", err);
            setError("Failed to update order status. Please try again.");
        }
    };
    
    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8" >
            <div className="container mx-auto">
                <header className="text-center mb-8">
               
                     <Mtitle title="Kitchen Orders" />
                    <p className=" text-start text-base-content/70">{moment().format("dddd, MMMM Do YYYY")}</p>
                </header>

                {loading && (
                    <div className="text-center mt-20">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                        <p className="text-xl mt-4">Loading Kitchen Orders...</p>
                    </div>
                )}
                
                {error && (
                     <div role="alert" className="alert alert-error max-w-xl mx-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>Error! {error}</span>
                    </div>
                )}
                
                {!loading && !error && (
                    orders.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {orders.map(order => (
                                <OrderCard key={order._id} order={order} onUpdate={handleUpdateOrder} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-base-content/70 mt-20">
                            <MdOutlineFoodBank className="mx-auto text-6xl mb-4" />
                            <p className="text-2xl font-semibold">No open orders right now.</p>
                            <p>Enjoy the quiet moment! 🍽️</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default Kitchendisplay;