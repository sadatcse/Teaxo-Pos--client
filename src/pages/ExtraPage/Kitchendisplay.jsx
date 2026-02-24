import React, { useState, useEffect, useContext, useRef } from 'react';
import moment from 'moment';
import { AuthContext } from '../../providers/AuthProvider';
import UseAxiosSecure from '../../Hook/UseAxioSecure';
import io from 'socket.io-client';

// --- Icons ---
import { 
    IoRestaurant, IoTimeOutline, IoVolumeMuteOutline, 
    IoVolumeHighOutline, IoBeerOutline 
} from "react-icons/io5";
import { 
    MdDeliveryDining, MdOutlineFoodBank, MdSoupKitchen, MdFastfood, MdHistory 
} from "react-icons/md";
import { BsHandbagFill } from "react-icons/bs";
import { FaCheckCircle, FaUtensils, FaFire, FaClock } from "react-icons/fa";

// Audio
import ding from "../../assets/ding.mp3";

// --- Time Ago Hook ---
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
        updateTimer();
        return () => clearInterval(intervalId);
    }, [startTime]);
    return timeAgo;
};

// --- Product Batch Component ---
const ProductBatchRow = ({ batch, productName, isDrink, onStatusChange }) => {
    // Style based on status
    const getStatusStyle = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'COOKING': return 'bg-orange-50 border-orange-200 text-orange-800';
            case 'SERVED': return 'bg-gray-50 border-gray-100 text-gray-400 opacity-60';
            default: return 'bg-gray-50';
        }
    };

    return (
        <div className={`flex items-center justify-between p-2 mb-1 rounded-md border ${getStatusStyle(batch.cookStatus)}`}>
            {/* Left: Info */}
            <div className="flex items-center gap-3">
                <div className={`text-xs font-bold px-2 py-1 rounded border ${isDrink ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white border-gray-200'}`}>
                    +{batch.qty}
                </div>
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                        <MdHistory /> {moment(batch.updateTime).format('h:mm:ss A')}
                    </span>
                    <span className={`text-xs font-semibold uppercase ${batch.cookStatus === 'SERVED' ? 'line-through' : ''}`}>
                        {batch.cookStatus}
                    </span>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1">
                {batch.cookStatus === 'PENDING' && (
                    <button 
                        onClick={() => onStatusChange(batch._id, 'COOKING')}
                        className="btn btn-xs btn-warning text-white"
                    >
                        <FaFire /> Cook
                    </button>
                )}
                {batch.cookStatus === 'COOKING' && (
                    <button 
                        onClick={() => onStatusChange(batch._id, 'SERVED')}
                        className="btn btn-xs btn-success text-white"
                    >
                        <FaUtensils /> Serve
                    </button>
                )}
                {batch.cookStatus === 'SERVED' && (
                    <FaCheckCircle className="text-green-500" />
                )}
            </div>
        </div>
    );
};

// --- Parent Product Container ---
const ProductItem = ({ product, onUpdateHistory }) => {
    // 1. Calculate Batches from History
    // The history 'qty' is cumulative (1, 2, 3...). We need the diff.
    const batches = React.useMemo(() => {
        if (!product.history || product.history.length === 0) {
            // Fallback for old data without history
            return [{
                _id: product._id, // use product ID as pseudo-history ID
                qty: product.qty,
                cookStatus: product.cookStatus,
                updateTime: product.updatedAt,
                isParent: true 
            }];
        }

        // Sort by updateNumber (0, 1, 2...)
        const sortedHistory = [...product.history].sort((a, b) => a.updateNumber - b.updateNumber);

        return sortedHistory.map((item, index) => {
            const prevQty = index > 0 ? sortedHistory[index - 1].qty : 0;
            const batchQty = item.qty - prevQty;
            return { ...item, batchQty }; // Add the calculated 'increment'
        }).filter(b => b.batchQty > 0) // Remove 0 qty updates if any
          .reverse(); // Show NEWEST (Pending) updates at the top!
    }, [product]);

    const isDrink = product.drinkBar === true;

    return (
        <li className="flex flex-col w-full py-3 border-b border-base-200 last:border-none">
            {/* Header: Total Product Summary */}
            <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${isDrink ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                    {isDrink ? <IoBeerOutline size={22} /> : <MdFastfood size={22} />}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-extrabold text-lg">Total: {product.qty}x</span>
                        <span className="font-bold text-base text-gray-700">{product.productName}</span>
                    </div>
                </div>
            </div>

            {/* Batches List */}
            <div className="pl-2 sm:pl-12 w-full">
                {batches.map(batch => (
                    <ProductBatchRow 
                        key={batch._id}
                        batch={{...batch, qty: batch.batchQty || batch.qty}} // Ensure we pass the increment qty
                        productName={product.productName}
                        isDrink={isDrink}
                        onStatusChange={(historyId, status) => onUpdateHistory(product._id, historyId, status)}
                    />
                ))}
            </div>
        </li>
    );
};

// --- Main Order Card ---
const OrderCard = ({ order, onUpdate }) => {
    const timeAgo = useTimeAgo(order.dateTime);

    const getOrderTypeDetails = (type) => {
        switch (type) {
            case 'dine-in': return { className: 'bg-rose-600 text-white', icon: <IoRestaurant size={24} /> };
            case 'delivery': return { className: 'bg-emerald-600 text-white', icon: <MdDeliveryDining size={24} /> };
            case 'takeaway': return { className: 'bg-amber-500 text-white', icon: <BsHandbagFill size={20} /> };
            default: return { className: 'bg-slate-500 text-white', icon: <MdSoupKitchen size={24} /> };
        }
    };

    // --- Core Logic: Handling Status Update ---
    const handleHistoryUpdate = (productId, historyId, newStatus) => {
        // 1. Clone Order
        const updatedProducts = order.products.map(p => {
            if (p._id !== productId) return p;

            // 2. Find the product, then update the specific history item
            let updatedHistory;
            
            if (p.history && p.history.length > 0) {
                 updatedHistory = p.history.map(h => 
                    h._id === historyId ? { ...h, cookStatus: newStatus } : h
                );
            } else {
                // Fallback: If no history exists, update parent (legacy)
                return { ...p, cookStatus: newStatus };
            }

            // 3. Derive Parent CookStatus based on History
            // If ANY history is cooking -> Parent Cooking.
            // If ALL history served -> Parent Served.
            const allServed = updatedHistory.every(h => h.cookStatus === 'SERVED');
            const anyCooking = updatedHistory.some(h => h.cookStatus === 'COOKING');
            const parentStatus = allServed ? 'SERVED' : (anyCooking ? 'COOKING' : 'PENDING');

            return { ...p, history: updatedHistory, cookStatus: parentStatus };
        });

        // 4. Derive Order Status
        const orderAllServed = updatedProducts.every(p => p.cookStatus === 'SERVED');
        const orderAnyCooking = updatedProducts.some(p => p.cookStatus === 'COOKING');
        const newOrderStatus = orderAllServed ? 'served' : (orderAnyCooking ? 'cooking' : order.orderStatus);

        const updatedOrder = { ...order, products: updatedProducts, orderStatus: newOrderStatus };
        onUpdate(updatedOrder);
    };

    const handleCookAllPending = () => {
        // Find all history items across all products that are PENDING and set to COOKING
        const updatedProducts = order.products.map(p => {
            if(!p.history || p.history.length === 0) {
                return p.cookStatus === 'PENDING' ? {...p, cookStatus: 'COOKING'} : p;
            }

            const updatedHistory = p.history.map(h => 
                h.cookStatus === 'PENDING' ? { ...h, cookStatus: 'COOKING' } : h
            );
            
            // Recalculate parent status
            const anyCooking = updatedHistory.some(h => h.cookStatus === 'COOKING');
            const parentStatus = anyCooking ? 'COOKING' : p.cookStatus;

            return { ...p, history: updatedHistory, cookStatus: parentStatus };
        });

        const updatedOrder = { ...order, products: updatedProducts, orderStatus: 'cooking' };
        onUpdate(updatedOrder);
    };

    const orderTypeDetails = getOrderTypeDetails(order.orderType);
    const identifier = order.orderType === 'dine-in' ? `Table: ${order.tableName}` : `Token: ${order.counter}`;
    
    // Check if there are ANY pending items in history to enable the "Cook All" button
    const hasPending = order.products.some(p => {
        if(p.history?.length > 0) return p.history.some(h => h.cookStatus === 'PENDING');
        return p.cookStatus === 'PENDING';
    });

    return (
        <div className="card bg-white shadow-xl border border-gray-200 flex flex-col h-full">
            <div className={`p-4 rounded-t-xl flex justify-between items-start ${orderTypeDetails.className}`}>
                <div className="flex gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm h-fit">
                        {orderTypeDetails.icon}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">{identifier}</h2>
                        <div className="flex gap-2 mt-1">
                             <span className="badge badge-sm bg-black/20 border-none text-white">
                                {order.customerName}
                             </span>
                             {order.kotRound > 0 && (
                                <span className="badge badge-sm bg-yellow-400 text-black border-none font-bold">
                                    Round {order.kotRound}
                                </span>
                             )}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end text-xs font-semibold opacity-90">
                    <span className="flex items-center gap-1"><FaClock /> {timeAgo}</span>
                    <span className="mt-1">#{order.invoiceSerial.slice(-4)}</span>
                </div>
            </div>

            <div className="card-body p-0 overflow-y-auto max-h-[400px]">
                <ul className="flex flex-col px-3">
                    {order.products.map(product => (
                        <ProductItem 
                            key={product._id} 
                            product={product} 
                            onUpdateHistory={handleHistoryUpdate} 
                        />
                    ))}
                </ul>
            </div>

            <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                <button 
                    className={`btn btn-block ${hasPending ? 'btn-neutral' : 'btn-disabled'}`}
                    onClick={handleCookAllPending}
                    disabled={!hasPending}
                >
                    <FaFire className={hasPending ? "text-orange-500" : ""} /> 
                    {hasPending ? "Cook All New Items" : "All Items Processing"}
                </button>
            </div>
        </div>
    );
};

// --- Main Page Component ---
const Kitchendisplay = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAlertEnabled, setIsAlertEnabled] = useState(true);
    const [showAlert, setShowAlert] = useState(false);
    
    const audioRef = useRef(new Audio(ding));
    const axiosSecure = UseAxiosSecure();
    const { branch } = useContext(AuthContext);
    const branchName = branch || "demo"; 

    useEffect(() => {
        if (!branchName) return;

        const fetchOrders = async () => {
            try {
                const response = await axiosSecure.get(`/invoice/${branchName}/kitchen`);
                const sorted = response.data.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
                setOrders(sorted);
            } catch (err) {
                console.error(err);
                setError("Waiting for connection...");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();

        const socket = io(process.env.REACT_APP_UPLOAD_URL);
        socket.emit('join-branch', branchName);

        socket.on('kitchen-update', (updatedOrder) => {
            if (!updatedOrder?._id) return;
            
            // Play sound for genuinely NEW orders or Rounds
            if (isAlertEnabled && updatedOrder.orderStatus !== 'served') {
                // Simple logic: if not in list, or kotRound increased
                setOrders(prev => {
                    const exists = prev.find(o => o._id === updatedOrder._id);
                    if (!exists || (updatedOrder.kotRound > exists.kotRound)) {
                        audioRef.current.currentTime = 0;
                        audioRef.current.play().catch(()=>{});
                        setShowAlert(true);
                        setTimeout(() => setShowAlert(false), 4000);
                    }
                    return prev; 
                });
            }

            setOrders(prev => {
                const index = prev.findIndex(o => o._id === updatedOrder._id);
                let newList = [...prev];
                if (index !== -1) newList[index] = updatedOrder;
                else newList.push(updatedOrder);
                
                return newList
                    .filter(o => o.orderStatus !== 'served')
                    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
            });
        });

        return () => { socket.off('kitchen-update'); socket.disconnect(); };
    }, [branchName, axiosSecure, isAlertEnabled]);

    const handleUpdateOrder = async (updatedOrder) => {
        // Optimistic UI
        setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o).filter(o => o.orderStatus !== 'served'));
        
        try {
            // Ensure we send the FULL updated structure including the nested history status
            await axiosSecure.put(`/invoice/update/${updatedOrder._id}`, updatedOrder);
        } catch (err) {
            console.error("Update failed", err);
            // In a real app, you might revert state here or show a toaster
        }
    };

    return (
        <div className="bg-base-200 min-h-screen p-4 font-sans">
            <div className="max-w-[1920px] mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                            <MdOutlineFoodBank size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-800 tracking-tight">KITCHEN BOARD</h1>
                            <p className="text-gray-500 font-medium">Live Orders Management</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-4 sm:mt-0">
                        <div className="stat-value text-2xl font-bold text-gray-700 bg-gray-50 px-4 py-2 rounded-lg border">
                            {orders.length} <span className="text-sm font-normal text-gray-400">Active</span>
                        </div>
                        <button 
                            onClick={() => setIsAlertEnabled(!isAlertEnabled)} 
                            className={`btn btn-circle ${isAlertEnabled ? 'btn-neutral' : 'btn-ghost'}`}
                        >
                            {isAlertEnabled ? <IoVolumeHighOutline size={24} /> : <IoVolumeMuteOutline size={24} />}
                        </button>
                    </div>
                </div>

                {showAlert && (
                    <div className="fixed top-20 right-10 z-50 animate-bounce">
                        <div className="alert alert-error text-white shadow-2xl">
                            <IoRestaurant size={24} /> <span>New Order / Update Received!</span>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center mt-20"><span className="loading loading-bars loading-lg text-primary"></span></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {orders.map(order => (
                            <OrderCard key={order._id} order={order} onUpdate={handleUpdateOrder} />
                        ))}
                        {orders.length === 0 && (
                            <div className="col-span-full text-center py-20 text-gray-400">
                                <FaCheckCircle size={60} className="mx-auto mb-4 opacity-20" />
                                <p className="text-xl font-bold">All Orders Cleared</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Kitchendisplay;