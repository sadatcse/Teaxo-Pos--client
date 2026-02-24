import React, { useState, useRef } from 'react';
import { FaTimes, FaHistory, FaClock, FaPrint, FaUtensils } from 'react-icons/fa';
import { toast } from 'react-toastify';

// Import your receipt templates (adjust the paths if necessary based on your folder structure)
import KitchenReceiptTemplate from "../Receipt/KitchenReceiptTemplate";
import BarReceiptTemplate from "../Receipt/BarReceiptTemplate";

const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const UpdateHistoryModal = ({ isOpen, onClose, allOrderItems, profileData, invoiceData }) => {
    const [printItems, setPrintItems] = useState([]);
    const kitchenReceiptRef = useRef();
    const barReceiptRef = useRef();

    if (!isOpen) return null;

    // 1. Flatten all history logs from all products and calculate Deltas
    const flatLogs = [];
    allOrderItems.forEach(item => {
        if (item.history && item.history.length > 0) {
            item.history.forEach((h, index) => {
                // Calculate how many were actually added in this specific update
                const prevQty = index > 0 ? item.history[index - 1].qty : 0;
                const deltaQty = h.qty - prevQty;

                flatLogs.push({
                    productId: item.productId,
                    productName: item.productName,
                    updateNumber: h.updateNumber,
                    updateTime: h.updateTime,
                    qty: h.qty,           // Total quantity at that moment
                    deltaQty: deltaQty,   // Added quantity for this specific KOT round
                    cookStatus: h.cookStatus,
                    rate: item.price || 0,
                    drinkBar: item.drinkBar || false,
                    isComplimentary: item.isComplimentary || false
                });
            });
        }
    });

    // 2. Group the logs by their exact updateTime
    const groupedLogs = {};
    flatLogs.forEach(log => {
        if (!groupedLogs[log.updateTime]) {
            groupedLogs[log.updateTime] = [];
        }
        groupedLogs[log.updateTime].push(log);
    });

    // 3. Sort chronologically
    const sortedTimesAsc = Object.keys(groupedLogs).sort((a, b) => new Date(a) - new Date(b));
    const sortedTimesDesc = [...sortedTimesAsc].reverse();

    // --- STRICT PRINTING LOGIC ---
    const triggerPrint = (items, isFullPrint = false) => {
        if (!profileData || !invoiceData) {
            toast.error("Missing order data. Please save the order first.");
            return;
        }

        // Separate items to strictly enforce length checks
        const kitchenItemsToPrint = items.filter(i => !i.drinkBar);
        const barItemsToPrint = items.filter(i => i.drinkBar);

        setPrintItems(items);
        
        // Give React a fraction of a second to render the hidden templates
        setTimeout(() => {
            // ONLY trigger print if there is at least 1 item for that specific department
            if (kitchenItemsToPrint.length > 0 && kitchenReceiptRef.current) {
                kitchenReceiptRef.current.printReceipt();
            }
            if (barItemsToPrint.length > 0 && barReceiptRef.current) {
                barReceiptRef.current.printReceipt();
            }
            
            toast.success(isFullPrint ? "Printing Complete Order KOT/BOT..." : "Printing Historical Version KOT/BOT...");
        }, 300);
    };

    const handlePrintAllItems = () => {
        const allItemsFormat = allOrderItems.map(item => ({
            productId: item.productId,
            productName: item.productName,
            qty: item.quantity,
            rate: item.price || 0,
            drinkBar: item.drinkBar || false,
            isComplimentary: item.isComplimentary || false,
            cookStatus: item.cookStatus
        }));
        triggerPrint(allItemsFormat, true);
    };

    const handlePrintVersion = (logsForTime) => {
        // Only print items that were actually added (delta > 0) in this specific round
        const versionItems = logsForTime
            .filter(log => log.deltaQty > 0)
            .map(log => ({
                productId: log.productId,
                productName: log.productName,
                qty: log.deltaQty, 
                rate: log.rate,
                drinkBar: log.drinkBar,
                isComplimentary: log.isComplimentary,
                cookStatus: log.cookStatus
            }));
        
        if (versionItems.length === 0) {
            toast.warn("No new items were added in this specific update (only status changes or reductions).");
            return;
        }

        triggerPrint(versionItems, false);
    };

    // Separate state items for rendering the templates
    const kitchenPrintData = printItems.filter(p => !p.drinkBar);
    const barPrintData = printItems.filter(p => p.drinkBar);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl relative w-full max-w-4xl flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
                
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
                    <h3 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
                        <FaHistory className="text-blue-600" />
                        Order Update History
                    </h3>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handlePrintAllItems}
                            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors text-sm shadow-sm"
                        >
                            <FaUtensils /> Print All Active Items
                        </button>
                        <button onClick={onClose} className="text-gray-400 hover:text-red-500 bg-white shadow-sm border border-gray-200 rounded-full p-2 transition-colors">
                            <FaTimes size={16} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-5 overflow-y-auto custom-scrollbar flex-1 bg-gray-100/50">
                    {sortedTimesDesc.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 italic">No update history found for this order.</div>
                    ) : (
                        <div className="space-y-6">
                            {sortedTimesDesc.map((timeStr) => {
                                const updateIndex = sortedTimesAsc.indexOf(timeStr) + 1;
                                const updateLabel = `${getOrdinal(updateIndex)} Update`;
                                const logsForTime = groupedLogs[timeStr];

                                return (
                                    <div key={timeStr} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                        
                                        {/* Group Header */}
                                        <div className="bg-blue-50 px-5 py-3 border-b border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="font-extrabold text-blue-900 text-lg uppercase tracking-wide">
                                                    {updateLabel}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-200/50 px-2 py-1 rounded-lg">
                                                    <FaClock />
                                                    {new Date(timeStr).toLocaleString()}
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handlePrintVersion(logsForTime)}
                                                className="flex items-center gap-2 bg-white border border-blue-300 text-blue-500 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg font-bold transition-colors text-sm shadow-sm"
                                            >
                                                <FaPrint /> Print This Version
                                            </button>
                                        </div>

                                        {/* Group Items Table */}
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                                    <tr>
                                                        <th className="px-5 py-3 border-b font-bold">Product Name</th>
                                                        <th className="px-5 py-3 border-b font-bold text-center w-32">Added Qty (Delta)</th>
                                                        <th className="px-5 py-3 border-b font-bold text-center w-24">Total Qty</th>
                                                        <th className="px-5 py-3 border-b font-bold text-center w-32">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="text-sm">
                                                    {logsForTime.map((log, index) => (
                                                        <tr key={index} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                                                            <td className="px-5 py-3 font-bold text-gray-800">{log.productName}</td>
                                                            <td className="px-5 py-3 text-center text-blue-600 font-extrabold">
                                                                {log.deltaQty > 0 ? `+${log.deltaQty}` : log.deltaQty}
                                                            </td>
                                                            <td className="px-5 py-3 text-center font-bold text-gray-900 text-base">{log.qty}</td>
                                                            <td className="px-5 py-3 text-center">
                                                                <span className={`inline-block px-3 py-1 rounded-md text-xs font-extrabold tracking-wide ${
                                                                    log.cookStatus === 'SERVED' ? 'bg-green-100 text-green-700 border border-green-200' :
                                                                    log.cookStatus === 'COOKING' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                                                    'bg-gray-100 text-gray-600 border border-gray-200'
                                                                }`}>
                                                                    {log.cookStatus || 'PENDING'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* HIDDEN PRINT TEMPLATES SPECIFIC TO THIS MODAL */}
                <div style={{ display: 'none' }}>
                    {profileData && invoiceData && (
                        <>
                            {/* STRICT CONDITIONAL MOUNTING - Only loads if there are products > 0 */}
                            {kitchenPrintData.length > 0 && (
                                <KitchenReceiptTemplate
                                    ref={kitchenReceiptRef}
                                    profileData={profileData}
                                    invoiceData={{ ...invoiceData, products: kitchenPrintData }}
                                />
                            )}
                            
                            {barPrintData.length > 0 && (
                                <BarReceiptTemplate
                                    ref={barReceiptRef}
                                    profileData={profileData}
                                    invoiceData={{ ...invoiceData, products: barPrintData }}
                                />
                            )}
                        </>
                    )}
                </div>

            </div>
        </div>
    );
};

export default UpdateHistoryModal;