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
        <div className="p-4 sm:p-6 lg:p-8 bg-base-200 min-h-screen">
            <Mtitle
                title={vendor ? `Ledger for ${vendor.vendorName}` : "Vendor Ledger"}
                rightcontent={
                    <div className='flex items-center gap-4'>
                        <DatePicker selected={fromDate} onChange={(date) => setFromDate(date)} dateFormat="dd/MM/yyyy" className="input input-bordered" placeholderText="From Date" isClearable />
                        <span className="text-slate-500">to</span>
                        <DatePicker selected={toDate} onChange={(date) => setToDate(date)} dateFormat="dd/MM/yyyy" className="input input-bordered" placeholderText="To Date" isClearable />
                    </div>
                }
            />

            <div className="card bg-base-100 shadow-xl mt-6">
                <div className="p-4">
                    {isLoading ? <MtableLoading /> : (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-center">
                                <div className="stat bg-blue-50 rounded-lg"><div className="stat-title">Opening Balance</div><div className="stat-value text-blue-600">{openingBalance.toLocaleString()}</div></div>
                                <div className="stat bg-red-50 rounded-lg"><div className="stat-title">Total Debits</div><div className="stat-value text-red-600">{ledger.reduce((sum, tx) => sum + tx.debit, 0).toLocaleString()}</div></div>
                                <div className="stat bg-green-50 rounded-lg"><div className="stat-title">Total Credits</div><div className="stat-value text-green-600">{ledger.reduce((sum, tx) => sum + tx.credit, 0).toLocaleString()}</div></div>
                                <div className="stat bg-purple-50 rounded-lg"><div className="stat-title">Closing Balance</div><div className="stat-value text-purple-600">{closingBalance.toLocaleString()}</div></div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="table w-full">
                                    <thead className='bg-slate-100 text-slate-700 uppercase text-xs'>
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
                                        <tr className='border-b font-semibold text-slate-700'><td colSpan={5} className="p-3">Opening Balance</td><td className='p-3 text-right'>{openingBalance.toLocaleString()}</td></tr>
                                        {ledger.map((entry, index) => (
                                            <tr key={index} className="border-b text-sm text-slate-700 hover:bg-base-200">
                                                <td className="p-3">{new Date(entry.date).toLocaleDateString()}</td>
                                                <td className="p-3">{entry.details}</td>
                                                <td className="p-3 text-right text-red-600">{entry.debit > 0 ? entry.debit.toLocaleString() : '-'}</td>
                                                <td className="p-3 text-right text-green-600">{entry.credit > 0 ? entry.credit.toLocaleString() : '-'}</td>
                                                <td className="p-3 text-right font-semibold">{entry.balance.toLocaleString()}</td>
                                                <td className="p-3 text-center">
                                                    <button onClick={() => handleViewDetails(entry)} className="btn btn-ghost btn-xs text-blue-600"><FiEye /></button>
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className='bg-slate-100 font-bold text-slate-800'><td colSpan={5} className="p-3">Closing Balance</td><td className='p-3 text-right'>{closingBalance.toLocaleString()}</td></tr>
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
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-base-100 p-6 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-blue-600">{modalType === 'Debit' ? 'Purchase Details' : 'Payment Details'}</h2>
                                <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost"><FiX /></button>
                            </div>
                            {isModalLoading ? <MtableLoading /> : !modalData ? <p>Details not found.</p> : (
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
    <div className="space-y-4 text-sm">
        <div className="grid grid-cols-3 gap-4 p-3 bg-slate-50 rounded-lg">
            <div><strong>Invoice #:</strong> {data.invoiceNumber}</div>
            <div><strong>Date:</strong> {new Date(data.purchaseDate).toLocaleDateString()}</div>
            <div><strong>Vendor:</strong> {data.vendor?.vendorName}</div>
        </div>
        <h3 className="font-semibold text-md mt-4">Items Purchased</h3>
        <table className="table table-compact w-full">
            <thead><tr><th>Item</th><th>Qty</th><th className="text-right">Unit Price</th><th className="text-right">Total</th></tr></thead>
            <tbody>
                {data.items.map(item => (
                    <tr key={item._id}>
                        <td>{item.ingredient.name}</td>
                        <td>{item.quantity} {item.ingredient.unit}</td>
                        <td className="text-right">{item.unitPrice.toFixed(2)}</td>
                        <td className="text-right">{item.totalPrice.toFixed(2)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
        <div className="text-right p-3 bg-slate-50 rounded-lg space-y-1 mt-4">
            <p><strong>Grand Total:</strong> {data.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <p><strong>Paid Amount:</strong> {data.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <p className="font-bold">Due Amount: {(data.grandTotal - data.paidAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
    </div>
);

// Sub-component for Payment Details
const PaymentDetails = ({ data }) => (
    <div className="space-y-4 text-sm">
        <div className="grid grid-cols-3 gap-4 p-3 bg-slate-50 rounded-lg">
            <div><strong>Payment Date:</strong> {new Date(data.paymentDate).toLocaleDateString()}</div>
            <div><strong>Paid To:</strong> {data.vendor?.vendorName}</div>
            <div><strong>Paid By:</strong> {data.createdBy?.name}</div>
        </div>
        <div className="p-3 text-center">
            <p className="text-slate-500">Total Amount Paid</p>
            <p className="text-3xl font-bold text-green-600">{data.amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <p className="text-slate-500">via {data.paymentMethod}</p>
        </div>
        <h3 className="font-semibold text-md mt-4">Applied to Invoices</h3>
        <table className="table table-compact w-full">
            <thead><tr><th>Invoice #</th><th className="text-right">Invoice Total</th><th className="text-right">Amount Applied</th></tr></thead>
            <tbody>
                {data.appliedToPurchases.map(app => (
                    <tr key={app.purchase._id}>
                        <td>{app.purchase.invoiceNumber}</td>
                        <td className="text-right">{app.purchase.grandTotal.toFixed(2)}</td>
                        <td className="text-right">{app.amountApplied.toFixed(2)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default VendorLedger;