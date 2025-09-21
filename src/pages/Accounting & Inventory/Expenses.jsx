import React, { useState, useEffect, useContext } from "react";
import { FiEdit, FiTrash2, FiEye, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { TfiSearch } from "react-icons/tfi";
import { GoPlus } from "react-icons/go";
import { motion, AnimatePresence } from 'framer-motion';
import Mtitle from "../../components library/Mtitle";
import UseAxiosSecure from '../../Hook/UseAxioSecure';
import { AuthContext } from "../../providers/AuthProvider";
import MtableLoading from "../../components library/MtableLoading"; 

const Expenses = () => {
    const axiosSecure = UseAxiosSecure();
    const { branch, user } = useContext(AuthContext);

    const [expenses, setExpenses] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationInfo, setPaginationInfo] = useState({ totalPages: 1, totalDocuments: 0, limit: 10 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [editId, setEditId] = useState(null);
    const [isFormLoading, setIsFormLoading] = useState(false);
    const [isTableLoading, setIsTableLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const [formData, setFormData] = useState({
        title: "", category: "Utility", vendorName: "", totalAmount: "", paidAmount: "",
        paymentStatus: "Unpaid", paymentMethod: "Cash", date: new Date().toISOString().split('T')[0],
        note: "", branch: branch || "",
    });

    useEffect(() => {
        if (!branch) return;
        const fetchVendors = async () => {
            try {
                const response = await axiosSecure.get(`/vendor/${branch}/active`);
                if (Array.isArray(response.data)) { setVendors(response.data); }
            } catch (error) { console.error('Error fetching vendors:', error); }
        };
        fetchVendors();
    }, [branch, axiosSecure]);

    useEffect(() => {
        if (!branch) return;
        const fetchExpenses = async () => {
            setIsTableLoading(true);
            try {
                const params = new URLSearchParams();
                if (searchTerm) params.append('search', searchTerm);
                if (fromDate) params.append('fromDate', fromDate);
                if (toDate) params.append('toDate', toDate);
                params.append('page', currentPage);
                const response = await axiosSecure.get(`/expense/${branch}/get-all`, { params });
                if (response.data && Array.isArray(response.data.data)) {
                    setExpenses(response.data.data);
                    setPaginationInfo(response.data.pagination);
                } else { setExpenses([]); setPaginationInfo({ totalPages: 1, totalDocuments: 0, limit: 10 }); }
            } catch (error) { console.error('Error fetching expenses:', error); setExpenses([]); } finally { setIsTableLoading(false); }
        };
        const debounceHandler = setTimeout(() => { fetchExpenses(); }, 500);
        return () => clearTimeout(debounceHandler);
    }, [branch, searchTerm, fromDate, toDate, currentPage, axiosSecure]);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, fromDate, toDate]);

    useEffect(() => {
        const total = Number(formData.totalAmount);
        const paid = Number(formData.paidAmount);
        if (!total || total <= 0) { setFormData(prev => ({ ...prev, paymentStatus: 'Unpaid' })); }
        else if (paid >= total) { setFormData(prev => ({ ...prev, paymentStatus: 'Paid' })); }
        else if (paid > 0 && paid < total) { setFormData(prev => ({ ...prev, paymentStatus: 'Partial' })); }
        else { setFormData(prev => ({ ...prev, paymentStatus: 'Unpaid' })); }
    }, [formData.totalAmount, formData.paidAmount]);

    const refreshExpenses = () => { if (expenses.length === 1 && currentPage > 1) { setCurrentPage(currentPage - 1); } };

    const openCreateModal = () => {
        setEditId(null);
        setFormData({
            title: "", category: "Utility", vendorName: "", totalAmount: "", paidAmount: "",
            paymentStatus: "Unpaid", paymentMethod: "Cash", date: new Date().toISOString().split('T')[0],
            note: "", branch: branch || "",
        });
        setIsModalOpen(true);
    };

    const closeModal = () => { setIsModalOpen(false); setEditId(null); };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const newFormData = { ...formData, [name]: value };
        if (name === 'category' && value !== 'Vendor') { newFormData.vendorName = ''; }
        setFormData(newFormData);
    };

    const handleAddOrEditExpense = async () => {
        setIsFormLoading(true);
        const payload = { ...formData, branch: formData.branch || branch, totalAmount: Number(formData.totalAmount), paidAmount: Number(formData.paidAmount), };
        try {
            if (editId) { await axiosSecure.put(`/expense/update/${editId}`, payload); }
            else { await axiosSecure.post('/expense/post', payload); }
            refreshExpenses();
            closeModal();
            Swal.fire({ icon: 'success', title: 'Success!', text: `Expense has been ${editId ? 'updated' : 'added'}.` });
        } catch (error) { console.error('Error saving expense:', error); Swal.fire({ icon: 'error', title: 'Error!', text: 'Failed to save expense. Please check the form and try again.' }); } finally { setIsFormLoading(false); }
    };

    const handleEdit = (expense) => {
        setEditId(expense._id);
        const formattedDate = expense.date ? new Date(expense.date).toISOString().split('T')[0] : '';
        setFormData({ ...expense, date: formattedDate });
        setIsModalOpen(true);
    };

    const handleRemove = (expense) => {
        if (expense.purchaseId && user?.role !== 'admin') { Swal.fire({ icon: 'warning', title: 'Action Restricted', text: 'This expense is linked to a purchase and can only be deleted by an administrator.', }); return; }
        Swal.fire({ title: 'Are you sure?', text: "You won't be able to revert this!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'Yes, delete it!' })
            .then((result) => {
                if (result.isConfirmed) {
                    axiosSecure.delete(`/expense/delete/${expense._id}`)
                        .then(() => { refreshExpenses(); Swal.fire('Deleted!', 'The expense record has been deleted.', 'success'); })
                        .catch(error => { console.error('Error deleting expense:', error); Swal.fire('Error!', 'Failed to delete the expense.', 'error'); });
                }
            });
    };

    const handleView = (expense) => { setSelectedExpense(expense); setIsViewModalOpen(true); };
    const handlePageChange = (newPage) => { if (newPage > 0 && newPage <= paginationInfo.totalPages) { setCurrentPage(newPage); } };

    const renderRowsInfo = () => { if (!paginationInfo || paginationInfo.totalDocuments === 0) { return "No records found."; } const start = (currentPage - 1) * paginationInfo.limit + 1; const end = start - 1 + expenses.length; return `Showing ${start}-${end} of ${paginationInfo.totalDocuments} records`; };
    const renderStatusBadge = (status) => { const styles = { Paid: "bg-green-100 text-green-800", Unpaid: "bg-red-100 text-red-800", Partial: "bg-yellow-100 text-yellow-800", }; return (<span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>); };

    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-base-200">
            <Mtitle title="Expense Management" rightcontent={
                <div className='flex flex-col md:flex-row md:items-center gap-3'>
                    <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border border-gray-300 rounded-xl p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150" />
                    <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border border-gray-300 rounded-xl p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150" />
                    <div className='relative md:w-64'><TfiSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-lg text-gray-400' /><input type="text" className='border border-gray-300 rounded-xl p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 w-full pl-10' placeholder='Search...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={openCreateModal} className="flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-xl shadow-md hover:bg-blue-700 transition duration-300 justify-center">
                        <GoPlus className="text-xl" /> New Expense
                    </motion.button>
                </div>
            } />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="card bg-base-100 shadow-xl mt-6">
                <div className="p-4">
                    <div className="text-sm text-slate-700 mb-4">{renderRowsInfo()}</div>
                    {isTableLoading ? <MtableLoading /> : (
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead className='bg-blue-600 text-white uppercase text-xs font-medium tracking-wider'><tr><th className="p-3 rounded-tl-lg">Title</th><th className="p-3">Category</th><th className="p-3">Total</th><th className="p-3">Paid</th><th className="p-3">Status</th><th className="p-3">Date</th><th className="p-3 rounded-tr-lg text-center">Actions</th></tr></thead>
                                <tbody>
                                    <AnimatePresence>
                                        {expenses.length === 0 ? (<tr><td colSpan="7" className="text-center py-10 text-slate-700">No expenses found.</td></tr>) : (
                                            expenses.map((expense) => (
                                                <motion.tr key={expense._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-blue-50 border-b border-slate-200 last:border-b-0 text-sm text-slate-700">
                                                    <td className="p-3 font-medium">{expense.title}</td><td className="p-3">{expense.category}</td><td className="p-3">{expense.totalAmount?.toLocaleString()} BDT</td><td className="p-3">{expense.paidAmount?.toLocaleString()} BDT</td><td className="p-3">{renderStatusBadge(expense.paymentStatus)}</td><td className="p-3">{new Date(expense.date).toLocaleDateString()}</td>
                                                    <td className="p-3">
                                                        <div className="flex justify-center items-center gap-2">
                                                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleView(expense)} className="btn btn-circle btn-sm bg-blue-600 hover:bg-blue-700 text-white"><FiEye /></motion.button>
                                                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleEdit(expense)} className="btn btn-circle btn-sm bg-yellow-600 hover:bg-yellow-700 text-white"><FiEdit /></motion.button>
                                                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleRemove(expense)} className="btn btn-circle btn-sm bg-red-600 hover:bg-red-700 text-white"><FiTrash2 /></motion.button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))
                                        )}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                            {paginationInfo && paginationInfo.totalDocuments > 0 && (<div className="p-4 border-t border-slate-200 flex items-center justify-between"><span className="text-sm text-slate-700">Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{paginationInfo.totalPages}</span></span><div className="flex items-center gap-2"><button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="btn btn-sm btn-outline rounded-lg"><FiChevronLeft /></button><button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === paginationInfo.totalPages} className="btn btn-sm btn-outline rounded-lg"><FiChevronRight /></button></div></div>)}
                        </div>
                    )}
                </div>
            </motion.div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-base-100 p-6 rounded-xl shadow-xl w-full max-w-lg max-h-screen overflow-y-auto">
                            <h2 className="text-xl font-semibold text-blue-600 mb-6">{editId ? 'Edit Expense' : 'Create New Expense'}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className="label-text text-slate-700">Category *</label><select name="category" value={formData.category} onChange={handleInputChange} className="mt-1 w-full border border-gray-300 rounded-xl p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150">{["Utility", "Maintenance", "Rent", "Salary", "Groceries", "Marketing", "Cleaning", "Vendor", "Other"].map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
                                <div><label className="label-text text-slate-700">{formData.category === 'Vendor' ? 'Vendor *' : 'Vendor'}</label>{formData.category === 'Vendor' ? (<select name="vendorName" value={formData.vendorName} onChange={handleInputChange} className="mt-1 w-full border border-gray-300 rounded-xl p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150" required><option value="">Select Vendor</option>{vendors.map(v => (<option key={v._id} value={v.vendorName}>{v.vendorName}</option>))}</select>) : (<input type="text" name="vendorName" value={formData.vendorName} onChange={handleInputChange} className="mt-1 w-full border border-gray-300 rounded-xl p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150" placeholder="Optional" />)}</div>
                                <div className="md:col-span-2"><label className="label-text text-slate-700">Title *</label><input type="text" name="title" value={formData.title} onChange={handleInputChange} className="mt-1 w-full border border-gray-300 rounded-xl p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150" placeholder="e.g., Office Electricity Bill" required /></div>
                                <div><label className="label-text text-slate-700">Total Amount *</label><input type="number" name="totalAmount" value={formData.totalAmount} onChange={handleInputChange} className="mt-1 w-full border border-gray-300 rounded-xl p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150" placeholder="0.00" required /></div>
                                <div><label className="label-text text-slate-700">Paid Amount *</label><input type="number" name="paidAmount" value={formData.paidAmount} onChange={handleInputChange} className="mt-1 w-full border border-gray-300 rounded-xl p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150" placeholder="0.00" required /></div>
                                <div><label className="label-text text-slate-700">Payment Method *</label><select name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange} className="mt-1 w-full border border-gray-300 rounded-xl p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150">{["Cash", "Card", "Mobile", "Other"].map(method => <option key={method} value={method}>{method}</option>)}</select></div>
                                <div><label className="label-text text-slate-700">Payment Status</label><div className="mt-1 w-full border border-gray-300 rounded-xl p-2 shadow-sm bg-slate-100 flex items-center">{renderStatusBadge(formData.paymentStatus)}</div></div>
                                <div className="md:col-span-2"><label className="label-text text-slate-700">Date *</label><input type="date" name="date" value={formData.date} onChange={handleInputChange} className="mt-1 w-full border border-gray-300 rounded-xl p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150" required /></div>
                            </div>
                            <div className="mt-4"><label className="label-text text-slate-700">Note</label><textarea name="note" value={formData.note} onChange={handleInputChange} rows="3" className="mt-1 w-full border border-gray-300 rounded-xl p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150" placeholder="Add any relevant details..."></textarea></div>
                            <div className="flex justify-end space-x-4 mt-8"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={closeModal} className="btn rounded-xl">Cancel</motion.button><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleAddOrEditExpense} className="btn bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-md" disabled={isFormLoading}>{isFormLoading ? 'Saving...' : editId ? 'Save Changes' : 'Create Expense'}</motion.button></div>
                        </motion.div>
                    </div>
                )}
                {isViewModalOpen && selectedExpense && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-base-100 p-6 rounded-xl shadow-xl w-full max-w-lg">
                            <h2 className="text-xl font-semibold text-blue-600 mb-6">Expense Details</h2>
                            <div className="space-y-3">
                                {Object.entries({ "Title": selectedExpense.title, "Category": selectedExpense.category, "Vendor Name": selectedExpense.vendorName || "N/A", "Total Amount": `${selectedExpense.totalAmount?.toLocaleString()} BDT`, "Paid Amount": `${selectedExpense.paidAmount?.toLocaleString()} BDT`, "Due Amount": `${(selectedExpense.totalAmount - selectedExpense.paidAmount).toLocaleString()} BDT`, "Payment Status": <div className="inline-block">{renderStatusBadge(selectedExpense.paymentStatus)}</div>, "Payment Method": selectedExpense.paymentMethod, "Date": new Date(selectedExpense.date).toLocaleDateString(), "Note": selectedExpense.note || "No note provided." })
                                    .map(([label, value]) => (<div key={label} className="flex flex-col sm:flex-row border-b border-slate-200 pb-2 text-sm"><p className="font-semibold text-slate-700 w-full sm:w-1/3">{label}:</p><div className="text-slate-700 w-full sm:w-2/3">{value}</div></div>))}
                            </div>
                            <div className="flex justify-end mt-8"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsViewModalOpen(false)} className="btn rounded-xl">Close</motion.button></div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Expenses;