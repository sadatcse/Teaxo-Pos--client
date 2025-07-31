import React, { useState } from 'react';
import { FiTablet } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import useCustomerTableSearch from '../../Hook/useCustomerTableSearch';

// Configuration for table statuses
const statusConfig = {
    free: {
        display: 'Available',
        cardClass: 'border-l-4 border-green-500 bg-green-50 hover:bg-green-100',
        iconClass: 'text-green-600',
    },
    pending: {
        display: 'Occupied',
        cardClass: 'border-l-4 border-yellow-500 bg-yellow-50 hover:bg-yellow-100',
        iconClass: 'text-yellow-600',
    },
    // highlight-start
    cooking: {
        display: 'Cooking',
        cardClass: 'border-l-4 border-orange-500 bg-orange-50 hover:bg-orange-100',
        iconClass: 'text-orange-600',
    },
    served: {
        display: 'Served',
        cardClass: 'border-l-4 border-blue-500 bg-blue-50 hover:bg-blue-100',
        iconClass: 'text-blue-600',
    },
    // highlight-end
    reserved: {
        display: 'Reserved',
        cardClass: 'border-l-4 border-red-500 bg-red-50 hover:bg-red-100',
        iconClass: 'text-red-600',
    },
};

const Lobby = () => {
    const { tables, loading } = useCustomerTableSearch();
    const navigate = useNavigate();
    // State to track which table is being hovered over to show reservation details
    const [hoveredTableId, setHoveredTableId] = useState(null);

    // Updated handler to navigate based on table status
    const handleTableSelect = (table) => {
        if (table.status === 'free') {
            navigate('/dashboard/pos', { state: { selectedTable: table } });
        // highlight-start
        } else if (['pending', 'cooking', 'served'].includes(table.status)) {
            navigate(`/dashboard/edit-order/${table.invoiceId}`);
        // highlight-end
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

    // Formats a date string into a more readable time string
    const formatTime = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col items-center font-sans">
            <div className="w-full max-w-6xl">
                <header className="mb-10 text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">
                        Restaurant Table
                    </h1>
                    <p className="text-gray-500 mt-2">Please Select a Table</p>
                </header>

                <main className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                    {loading ? (
                        <p className="text-gray-600 col-span-full text-center">Loading tables...</p>
                    ) : (
                        (tables || []).map((table) => {
                            const config = statusConfig[table.status] || statusConfig.free;
                            // highlight-start
                            const isClickable = ['free', 'pending', 'reserved', 'cooking', 'served'].includes(table.status);
                            // highlight-end

                            return (
                                // Added onMouseEnter and onMouseLeave to control tooltip visibility for reserved tables
                                <div
                                    key={table._id}
                                    onMouseEnter={() => setHoveredTableId(table._id)}
                                    onMouseLeave={() => setHoveredTableId(null)}
                                    onClick={() => isClickable && handleTableSelect(table)}
                                    // Added 'relative' positioning for the tooltip
                                    className={`relative rounded-lg shadow-md transition-all duration-300 flex flex-col justify-between p-4 ${config.cardClass} ${isClickable ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : 'cursor-not-allowed opacity-70'}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <h2 className="text-xl font-bold text-gray-800">{table.tableName}</h2>
                                        <FiTablet className={`w-6 h-6 ${config.iconClass}`} />
                                    </div>
                                    <div className="mt-4">
                                        <p className="text-sm font-medium text-gray-700">{config.display}</p>
                                        {table.status === 'reserved' && table.reservation?.startTime && (
                                            <p className="text-sm text-gray-600">
                                                {formatTime(table.reservation.startTime)}
                                            </p>
                                        )}
                                    </div>

                                    {/* Tooltip for reserved tables, shown on hover, with improved styling and labels */}
                                    {table.status === 'reserved' && hoveredTableId === table._id && table.reservation && (
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-max max-w-xs p-3 bg-slate-800 text-white text-sm rounded-lg shadow-xl z-20 pointer-events-none opacity-100 transition-opacity">
                                            <div className="grid grid-cols-[auto,1fr] gap-x-2">
                                                <span className="font-semibold text-slate-300">Customer:</span>
                                                <span className="font-bold text-white">{table.reservation.customerName}</span>
                                                <span className="font-semibold text-slate-300">Phone:</span>
                                                <span className="text-slate-100">{table.reservation.customerPhone}</span>
                                            </div>
                                            {/* Arrow pointing to the card */}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-800"></div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </main>
            </div>
        </div>
    );
};

export default Lobby;