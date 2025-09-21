import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaChair,
    FaUserClock,
    FaUtensils,
    FaCheckCircle,
    FaBookmark,
} from 'react-icons/fa';
import useCustomerTableSearch from '../../Hook/useCustomerTableSearch';
import Mtitle from '../../components library/Mtitle';
import MtableLoading from "../../components library/MtableLoading"; 

const statusConfig = {
    free: {
        display: 'Available',
        badgeClass: 'badge-success text-white',
        icon: FaChair,
        iconClass: 'text-green-500',
    },
    pending: {
        display: 'Occupied',
        badgeClass: 'badge-warning text-slate-800',
        icon: FaUserClock,
        iconClass: 'text-yellow-500',
    },
    cooking: {
        display: 'Cooking',
        badgeClass: 'badge-info text-white',
        icon: FaUtensils,
        iconClass: 'text-sky-500',
    },
    served: {
        display: 'Served',
        badgeClass: 'badge-primary text-white',
        icon: FaCheckCircle,
        iconClass: 'text-indigo-500',
    },
    reserved: {
        display: 'Reserved',
        badgeClass: 'badge-error text-white',
        icon: FaBookmark,
        iconClass: 'text-red-500',
    },
};

const Lobby = () => {
    const { tables, loading } = useCustomerTableSearch();
    const navigate = useNavigate();
    const [hoveredTableId, setHoveredTableId] = useState(null);

    const handleTableSelect = (table) => {
        if (table.status === 'free') {
            navigate('/dashboard/pos', { state: { selectedTable: table } });
        } else if (['pending', 'cooking', 'served'].includes(table.status)) {
            navigate(`/dashboard/edit-order/${table.invoiceId}`);
        } else if (table.status === 'reserved') {
            if (table.invoiceId) {
                navigate(`/dashboard/edit-order/${table.invoiceId}`);
            } else {
                navigate('/dashboard/pos', { state: { selectedTable: table } });
            }
        } else {
            console.log(`Table ${table.tableName} is ${statusConfig[table.status]?.display || 'unavailable'} and cannot be selected.`);
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: (i) => ({
            opacity: 1,
            scale: 1,
            transition: { delay: i * 0.05, duration: 0.4 }
        }),
        exit: { opacity: 0, scale: 0.8, transition: { duration: 0.3 } },
    };

    return (
        <div className="bg-base-200 min-h-screen p-4 sm:p-6 lg:p-8">
            <motion.div
                className="card bg-base-100 shadow-xl w-full mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="card-body">
                    <header className="mb-6">
                        <Mtitle title="Restaurant Lobby" />
                        <p className="text-slate-700 mt-1">
                            Please select a table to proceed.
                        </p>
                    </header>
                    <div className="divider" />
                    <main>
                        {loading ? (
                            <div className="col-span-full flex justify-center items-center py-24">
                                <MtableLoading />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                <AnimatePresence>
                                    {(tables || []).map((table, i) => {
                                        const config = statusConfig[table.status] || statusConfig.free;
                                        const isClickable = ['free', 'pending', 'reserved', 'cooking', 'served'].includes(table.status);
                                        const IconComponent = config.icon;

                                        return (
                                            <motion.div
                                                key={table._id}
                                                layout
                                                custom={i}
                                                variants={cardVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                whileHover={isClickable ? { scale: 1.05, y: -5 } : {}}
                                                whileTap={isClickable ? { scale: 0.95 } : {}}
                                                onMouseEnter={() => setHoveredTableId(table._id)}
                                                onMouseLeave={() => setHoveredTableId(null)}
                                                onClick={() => isClickable && handleTableSelect(table)}
                                                className={`card compact bg-base-100 shadow-md transition-all duration-300 relative overflow-hidden border border-slate-200 ${isClickable ? 'cursor-pointer hover:shadow-xl hover:border-blue-600' : 'cursor-not-allowed opacity-70'}`}
                                            >
                                                <div className="card-body items-center text-center p-4">
                                                    <div className="absolute top-3 right-3">
                                                        <IconComponent className={`w-10 h-10 ${config.iconClass} opacity-10`} />
                                                    </div>
                                                    <h2 className="card-title text-4xl font-extrabold text-slate-700 tracking-tight">
                                                        {table.tableName}
                                                    </h2>
                                                    <div className="card-actions justify-center mt-3 w-full">
                                                        <div className={`badge ${config.badgeClass} font-semibold p-3`}>
                                                            {config.display}
                                                            {table.status === 'reserved' && table.reservation?.startTime && (
                                                                <span className="ml-1.5 font-normal opacity-90">
                                                                    ({formatTime(table.reservation.startTime)})
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <AnimatePresence>
                                                    {table.status === 'reserved' && hoveredTableId === table._id && table.reservation && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: 10 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-3 bg-slate-700 text-white text-sm rounded-lg shadow-lg z-20 pointer-events-none"
                                                        >
                                                            <div className="font-bold text-base mb-1">{table.reservation.customerName}</div>
                                                            <div className="text-slate-300">{table.reservation.customerPhone}</div>
                                                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-700"></div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        )}
                    </main>
                </div>
            </motion.div>
        </div>
    );
};

export default Lobby;