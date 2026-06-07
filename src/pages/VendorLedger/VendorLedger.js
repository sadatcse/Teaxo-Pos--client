import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { FiEye, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import Mtitle from '../../components library/Mtitle';
import UseAxiosSecure from '../../Hook/UseAxioSecure';
import { AuthContext } from '../../providers/AuthProvider';
import MtableLoading from '../../components library/MtableLoading';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const VendorLedger = () => {
    const { vendorId } = useParams();
    const axiosSecure = UseAxiosSecure();
    const { branch } = useContext(AuthContext);

    // Ledger States
    const [vendor, setVendor] = useState(null);
    const [ledger, setLedger] = useState([]);
    const [openingBalance, setOpeningBalance] = useState(0);
    const [closingBalance, setClosingBalance] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [modalType, setModalType] = useState(''); // 'Debit' or 'Credit'
    const [isModalLoading, setIsModalLoading] = useState(false);

    useEffect(() => {
        if (!vendorId || !branch) return;
        const fetchLedger = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                if (fromDate) params.append('fromDate', fromDate.toISOString().split('T')[0]);
                if (toDate) params.append('toDate', toDate.toISOString().split('T')[0]);
                const { data } = await axiosSecure.get(`/vendor/ledger/${vendorId}`, { params });
                console.log(data);
                setVendor(data.vendor);
                setLedger(data.ledger);
                setOpeningBalance(data.openingBalance);
                setClosingBalance(data.closingBalance);
            } catch (error) {
                console.error("Failed to fetch vendor ledger:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLedger();
    }, [vendorId, branch, axiosSecure, fromDate, toDate]);

    const handleViewDetails = async (entry) => {
        setIsModalOpen(true);
        setIsModalLoading(true);
        setModalType(entry.type);
        try {
            const endpoint = entry.type === 'Debit'
                ? `/purchase/get-id/${entry.sourceId}`
                : `/vendor-payment/get-id/${entry.sourceId}`;
            const { data } = await axiosSecure.get(endpoint);
            setModalData(data);
        } catch (error) {
            console.error("Failed to fetch details:", error);
            setModalData(null); // Clear data on error
        } finally {
            setIsModalLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalData(null);
        setModalType('');
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-150 min-h-screen font-sans transition-colors duration-200">
            <Mtitle
                title={vendor ? `Ledger for ${vendor.vendorName}` : "Vendor Ledger"}
                rightcontent={
                    <div className='flex items-center gap-4'>
                        <DatePicker selected={fromDate} onChange={(date) => setFromDate(date)} dateFormat="dd/MM/yyyy" className="input input-bordered bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-100 focus:outline-none" placeholderText="From Date" isClearable />
                        <span className="text-slate-500 dark:text-zinc-400">to</span>
                        <DatePicker selected={toDate} onChange={(date) => setToDate(date)} dateFormat="dd/MM/yyyy" className="input input-bordered bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-100 focus:outline-none" placeholderText="To Date" isClearable />
                    </div>
                }
            />

            <div className="card bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-xl mt-6 text-slate-800 dark:text-zinc-100">
                <div className="p-4">
                    {isLoading ? <MtableLoading /> : (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-center">
                                <div className="stat bg-blue-50 dark:bg-blue-950/20 border border-blue-100/40 dark:border-blue-900/40 rounded-lg">
                                    <div className="stat-title text-slate-550 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">Opening Balance</div>
                                    <div className="stat-value text-blue-600 dark:text-blue-400 font-bold">{openingBalance.toLocaleString()}</div>
                                </div>
                                <div className="stat bg-red-50 dark:bg-red-950/20 border border-red-100/40 dark:border-red-900/40 rounded-lg">
                                    <div className="stat-title text-slate-550 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">Total Debits</div>
                                    <div className="stat-value text-red-600 dark:text-red-400 font-bold">{ledger.reduce((sum, tx) => sum + tx.debit, 0).toLocaleString()}</div>
                                </div>
                                <div className="stat bg-green-50 dark:bg-green-950/20 border border-green-100/40 dark:border-green-900/40 rounded-lg">
                                    <div className="stat-title text-slate-550 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">Total Credits</div>
                                    <div className="stat-value text-green-600 dark:text-green-400 font-bold">{ledger.reduce((sum, tx) => sum + tx.credit, 0).toLocaleString()}</div>
                                </div>
                                <div className="stat bg-purple-50 dark:bg-purple-950/20 border border-purple-100/40 dark:border-purple-900/40 rounded-lg">
                                    <div className="stat-title text-slate-550 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider">Closing Balance</div>
                                    <div className="stat-value text-purple-600 dark:text-purple-400 font-bold">{closingBalance.toLocaleString()}</div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="table w-full">
                                    <thead className='bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-b border-slate-200 dark:border-zinc-700 uppercase text-xs'>
                                        <tr>
                                            <th className="p-3">Date</th>
                                            <th className="p-3">Particulars</th>
                                            <th className="p-3 text-right">Debit</th>
                                            <th className="p-3 text-right">Credit</th>
                                            <th className="p-3 text-right">Balance</th>
                                            <th className="p-3 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className='border-b border-slate-200 dark:border-zinc-850 font-semibold text-slate-750 dark:text-zinc-200'><td colSpan={5} className="p-3">Opening Balance</td><td className='p-3 text-right'>{openingBalance.toLocaleString()}</td></tr>
                                        {ledger.map((entry, index) => (
                                            <tr key={index} className="border-b border-slate-200 dark:border-zinc-850 text-sm text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                                                <td className="p-3">{new Date(entry.date).toLocaleDateString()}</td>
                                                <td className="p-3">{entry.details}</td>
                                                <td className="p-3 text-right text-red-600 dark:text-red-400">{entry.debit > 0 ? entry.debit.toLocaleString() : '-'}</td>
                                                <td className="p-3 text-right text-green-600 dark:text-green-400">{entry.credit > 0 ? entry.credit.toLocaleString() : '-'}</td>
                                                <td className="p-3 text-right font-semibold text-slate-800 dark:text-zinc-150">{entry.balance.toLocaleString()}</td>
                                                <td className="p-3 text-center">
                                                    <button onClick={() => handleViewDetails(entry)} className="btn btn-ghost btn-xs text-blue-600 dark:text-blue-400 hover:bg-slate-105 dark:hover:bg-zinc-800"><FiEye size={16} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className='bg-slate-100 dark:bg-zinc-805 font-bold text-slate-800 dark:text-zinc-100 border-t border-slate-200 dark:border-zinc-700'><td colSpan={5} className="p-3">Closing Balance</td><td className='p-3 text-right'>{closingBalance.toLocaleString()}</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Details Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-6 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto text-slate-800 dark:text-zinc-150">
                            <div className="flex justify-between items-center mb-4 border-b border-slate-150 dark:border-zinc-800 pb-3">
                                <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400">{modalType === 'Debit' ? 'Purchase Details' : 'Payment Details'}</h2>
                                <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost text-slate-400 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"><FiX /></button>
                            </div>
                            {isModalLoading ? <MtableLoading /> : !modalData ? <p className="text-slate-500 dark:text-zinc-405">Details not found.</p> : (
                                modalType === 'Debit' ? (
                                    <PurchaseDetails data={modalData} />
                                ) : (
                                    <PaymentDetails data={modalData} />
                                )
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Sub-component for Purchase Details
const PurchaseDetails = ({ data }) => (
    <div className="space-y-4 text-sm text-slate-700 dark:text-zinc-300">
        <div className="grid grid-cols-3 gap-4 p-3 bg-slate-55 dark:bg-zinc-800/60 border border-slate-150 dark:border-zinc-750 rounded-lg text-slate-755 dark:text-zinc-300">
            <div><strong>Invoice #:</strong> {data.invoiceNumber}</div>
            <div><strong>Date:</strong> {new Date(data.purchaseDate).toLocaleDateString()}</div>
            <div><strong>Vendor:</strong> {data.vendor?.vendorName}</div>
        </div>
        <h3 className="font-semibold text-md mt-4 text-slate-800 dark:text-zinc-200">Items Purchased</h3>
        <div className="overflow-x-auto">
            <table className="table table-compact w-full text-slate-700 dark:text-zinc-300 border border-slate-150 dark:border-zinc-800 rounded-lg">
                <thead className="bg-slate-50 dark:bg-zinc-800/40 text-slate-750 dark:text-zinc-200 border-b border-slate-150 dark:border-zinc-800">
                    <tr><th>Item</th><th>Qty</th><th className="text-right">Unit Price</th><th className="text-right">Total</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                    {data.items.map(item => (
                        <tr key={item._id} className="border-b border-slate-100 dark:border-zinc-850 hover:bg-slate-55/50 dark:hover:bg-zinc-800/20">
                            <td className="font-medium">{item.ingredient.name}</td>
                            <td>{item.quantity} {item.ingredient.unit}</td>
                            <td className="text-right">{item.unitPrice.toFixed(2)}</td>
                            <td className="text-right font-semibold">{item.totalPrice.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <div className="text-right p-3 bg-slate-55 dark:bg-zinc-800 border border-slate-150 dark:border-zinc-750 rounded-lg space-y-1 mt-4 text-slate-800 dark:text-zinc-200">
            <p><strong>Grand Total:</strong> {data.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <p><strong>Paid Amount:</strong> {data.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <p className="font-bold text-blue-600 dark:text-blue-400">Due Amount: {(data.grandTotal - data.paidAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
    </div>
);

// Sub-component for Payment Details
const PaymentDetails = ({ data }) => (
    <div className="space-y-4 text-sm text-slate-700 dark:text-zinc-300">
        <div className="grid grid-cols-3 gap-4 p-3 bg-slate-55 dark:bg-zinc-800/60 border border-slate-150 dark:border-zinc-750 rounded-lg text-slate-755 dark:text-zinc-300">
            <div><strong>Payment Date:</strong> {new Date(data.paymentDate).toLocaleDateString()}</div>
            <div><strong>Paid To:</strong> {data.vendor?.vendorName}</div>
            <div><strong>Paid By:</strong> {data.createdBy?.name}</div>
        </div>
        <div className="p-4 text-center border border-slate-205 dark:border-zinc-800 rounded-lg bg-slate-50/50 dark:bg-zinc-850/30">
            <p className="text-slate-500 dark:text-zinc-400">Total Amount Paid</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{data.amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <p className="text-slate-500 dark:text-zinc-400">via {data.paymentMethod}</p>
        </div>
        <h3 className="font-semibold text-md mt-4 text-slate-800 dark:text-zinc-200">Applied to Invoices</h3>
        <div className="overflow-x-auto">
            <table className="table table-compact w-full text-slate-700 dark:text-zinc-300 border border-slate-150 dark:border-zinc-800 rounded-lg">
                <thead className="bg-slate-50 dark:bg-zinc-800/40 text-slate-750 dark:text-zinc-200 border-b border-slate-150 dark:border-zinc-800">
                    <tr><th>Invoice #</th><th className="text-right">Invoice Total</th><th className="text-right">Amount Applied</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                    {data.appliedToPurchases.map(app => (
                        <tr key={app.purchase._id} className="border-b border-slate-105 dark:border-zinc-850 hover:bg-slate-55/50 dark:hover:bg-zinc-800/20">
                            <td>{app.purchase.invoiceNumber}</td>
                            <td className="text-right">{app.purchase.grandTotal.toFixed(2)}</td>
                            <td className="text-right font-semibold">{app.amountApplied.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export default VendorLedger;