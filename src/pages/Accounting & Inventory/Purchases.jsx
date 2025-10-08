import React, { useState, useEffect, useContext, useCallback } from "react";
import { FiEdit, FiTrash2, FiEye, FiPlus, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { TfiSearch } from "react-icons/tfi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion, AnimatePresence } from 'framer-motion';
import { GoPlus } from "react-icons/go";
import Mtitle from "../../components library/Mtitle";
import UseAxiosSecure from '../../Hook/UseAxioSecure';
import { AuthContext } from "../../providers/AuthProvider";
import MtableLoading from "../../components library/MtableLoading";
import useActionPermissions from "../../Hook/useActionPermissions";

const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

const Purchases = () => {
    const axiosSecure = UseAxiosSecure();
    const { branch, user } = useContext(AuthContext);
   const { canPerform, loading: permissionsLoading } = useActionPermissions();
    // Data and Loading States
    const [purchases, setPurchases] = useState([]);
    const [isTableLoading, setTableLoading] = useState(false);

    // Server-Side Filter and Pagination States
    const [searchTerm, setSearchTerm] = useState('');
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationInfo, setPaginationInfo] = useState({ totalPages: 1, totalDocuments: 0, limit: 10 });

    // Modal and Form States
    const [isModalOpen, setModalOpen] = useState(false);
    const [isViewModalOpen, setViewModalOpen] = useState(false);
    const [isFormLoading, setFormLoading] = useState(false);
    const [editId, setEditId] = useState(null);
    const [viewingPurchase, setViewingPurchase] = useState(null);

    // Form Prerequisites
    const [vendors, setVendors] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [categories, setCategories] = useState([]);
    const [itemCategories, setItemCategories] = useState([""]);
    
    // Initial Form State
    const initialFormData = {
        vendor: "",
        purchaseDate: new Date(),
        invoiceNumber: "",
        items: [{ ingredient: "", quantity: 1, unitPrice: 0, totalPrice: 0 }],
        grandTotal: 0,
        paymentStatus: "Unpaid",
        paidAmount: 0,
        paymentMethod: "Cash",
        notes: "",
        branch: branch || "",
    };
    const [formData, setFormData] = useState(initialFormData);

    // --- DATA FETCHING ---

    const fetchPurchases = useCallback(async () => {
        if (!branch) return;
        setTableLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (fromDate) params.append('fromDate', fromDate.toISOString().split('T')[0]);
            if (toDate) params.append('toDate', toDate.toISOString().split('T')[0]);
            params.append('page', currentPage);

            const { data } = await axiosSecure.get(`/purchase/${branch}/get-all`, { params });
            setPurchases(data.data || []);
            setPaginationInfo(data.pagination || { totalPages: 1, totalDocuments: 0, limit: 10 });
        } catch (error) {
            console.error("Error fetching purchases:", error);
            setPurchases([]);
        } finally {
            setTableLoading(false);
        }
    }, [axiosSecure, branch, currentPage, fromDate, toDate, searchTerm]);

    const fetchPrerequisites = useCallback(async () => {
        if (!branch) return;
        try {
            const [vendorsRes, ingredientsRes, categoriesRes] = await Promise.all([
                axiosSecure.get(`/vendor/${branch}/active`),
                axiosSecure.get(`/ingredient/${branch}/active`),
                axiosSecure.get(`/ingredient-category/${branch}/active`)
            ]);
            setVendors(vendorsRes.data);
            setIngredients(ingredientsRes.data);
            setCategories(categoriesRes.data);
        } catch (error) {
            console.error("Error fetching prerequisites:", error);
        }
    }, [axiosSecure, branch]);
    
    // --- USEEFFECT HOOKS ---

    useEffect(() => {
        const handler = setTimeout(() => {
            if (branch) fetchPurchases();
        }, 500);
        return () => clearTimeout(handler);
    }, [branch, fetchPurchases]);

    useEffect(() => {
        if (branch) fetchPrerequisites();
    }, [branch, fetchPrerequisites]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, fromDate, toDate]);

    useEffect(() => {
        const total = formData.items?.reduce((sum, item) => sum + (item.totalPrice || 0), 0) || 0;
        const paid = parseFloat(formData.paidAmount) || 0;
        let status = "Unpaid";
        if (paid > 0 && paid < total) status = "Partial";
        else if (paid > 0 && paid >= total) status = "Paid";
        setFormData(prev => ({ ...prev, grandTotal: total, paymentStatus: status }));
    }, [formData.items, formData.paidAmount]);
    
    // --- MODAL & FORM HANDLERS ---

    const openCreateModal = async () => {
        setEditId(null);
        setFormData({ ...initialFormData, branch: branch || "" });
        setItemCategories([""]);
        setModalOpen(true);
        try {
            const { data } = await axiosSecure.get(`/purchase/next-invoice/${branch}`);
            setFormData(prev => ({ ...prev, invoiceNumber: data.nextInvoiceNumber }));
        } catch (error) {
            console.error("Failed to fetch next invoice number", error);
        }
    };

    const openEditModal = (purchase) => {
        setEditId(purchase._id);
        const itemCats = purchase.items.map(item => item.ingredient?.category?._id || "");
        setItemCategories(itemCats);
        setFormData({
            ...purchase,
            vendor: purchase.vendor._id,
            purchaseDate: new Date(purchase.purchaseDate),
            paymentMethod: purchase.paymentMethod || "Cash",
            items: purchase.items.map(item => ({ ...item, ingredient: item.ingredient._id }))
        });
        setModalOpen(true);
    };

    const openViewModal = (purchase) => {
        setViewingPurchase(purchase);
        setViewModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setViewModalOpen(false);
        setEditId(null);
        setViewingPurchase(null);
    };

    const handleFormChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleDateChange = (date) => setFormData(prev => ({ ...prev, purchaseDate: date }));

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [name]: value };
        const quantity = parseFloat(newItems[index].quantity) || 0;
        const unitPrice = parseFloat(newItems[index].unitPrice) || 0;
        newItems[index].totalPrice = quantity * unitPrice;
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const handleCategoryChange = (index, categoryId) => {
        const newItemCategories = [...itemCategories];
        newItemCategories[index] = categoryId;
        setItemCategories(newItemCategories);
        const newItems = [...formData.items];
        newItems[index].ingredient = "";
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setFormData(prev => ({ ...prev, items: [...prev.items, { ingredient: "", quantity: 1, unitPrice: 0, totalPrice: 0 }] }));
        setItemCategories(prev => [...prev, ""]);
    };

    const removeItem = (index) => {
        setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
        setItemCategories(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        setFormLoading(true);
        const payload = { ...formData, userId: user._id, purchaseDate: formData.purchaseDate.toISOString().split('T')[0] };
        try {
            const apiCall = editId ? axiosSecure.put(`/purchase/update/${editId}`, payload) : axiosSecure.post('/purchase/post', payload);
            await apiCall;
            fetchPurchases();
            closeModal();
            Swal.fire({ icon: 'success', title: 'Success!', text: `Purchase ${editId ? 'updated' : 'recorded'} successfully.` });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error!', text: error.response?.data?.message || `Failed to ${editId ? 'update' : 'record'} purchase.` });
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = (purchaseId) => {
        Swal.fire({
            title: 'Are you sure?', text: "This will reverse the stock and delete the purchase record!", icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axiosSecure.delete(`/purchase/delete/${purchaseId}`, { data: { userId: user._id } });
                    fetchPurchases();
                    Swal.fire('Deleted!', 'The purchase has been deleted.', 'success');
                } catch (error) {
                    Swal.fire('Error!', error.response?.data?.message || 'Failed to delete the purchase.', 'error');
                }
            }
        });
    };
    
    // --- RENDER & HELPER FUNCTIONS ---

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= paginationInfo.totalPages) {
            setCurrentPage(newPage);
        }
    };

    const renderRowsInfo = () => {
        if (!paginationInfo || paginationInfo.totalDocuments === 0) return "No records found.";
        const start = (currentPage - 1) * paginationInfo.limit + 1;
        const end = start - 1 + purchases.length;
        return `Showing ${start}-${end} of ${paginationInfo.totalDocuments} records`;
    };

    const renderStatusBadge = (status) => {
        const styles = { Paid: "bg-green-100 text-green-700", Unpaid: "bg-red-100 text-red-700", Partial: "bg-yellow-100 text-yellow-700" };
        return <span className={`px-3 py-1 text-sm font-semibold rounded-full ${styles[status]}`}>{status}</span>;
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-base-200">
            <Mtitle title="Purchase Management" rightcontent={
                <div className='flex flex-col md:flex-row md:items-center gap-4'>
                    <DatePicker selected={fromDate} onChange={(date) => setFromDate(date)} dateFormat="dd/MM/yyyy" className="input input-bordered w-full" placeholderText="From Date" isClearable />
                    <DatePicker selected={toDate} onChange={(date) => setToDate(date)} dateFormat="dd/MM/yyyy" className="input input-bordered w-full" placeholderText="To Date" isClearable />
                    <div className='relative w-full md:w-64'>
                        <TfiSearch className='absolute top-1/2 left-3 -translate-y-1/2 text-gray-400' />
                        <input type="text" className='input input-bordered w-full pl-10' placeholder='Search...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                   {canPerform("Purchase Management", "add") && (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={openCreateModal} className="btn bg-blue-600 text-white hover:bg-blue-700 w-full md:w-auto justify-center">
                            <GoPlus className="text-xl" /> Create Purchase
                        </motion.button>
                    )}
                </div>
            } />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="card bg-base-100 shadow-xl mt-6">
                <div className="p-4">
                    <div className="text-sm text-slate-700 mb-4">{renderRowsInfo()}</div>
                    {isTableLoading ? <MtableLoading /> : (
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead><tr className="bg-blue-600 text-white uppercase text-xs font-medium tracking-wider">{['Invoice', 'Vendor', 'Items', 'Total Amount', 'Paid', 'Status', 'Date', 'Actions'].map((h, i) => <th key={h} className={`p-3 ${i === 0 && 'rounded-tl-lg'} ${i === 7 && 'rounded-tr-lg text-center'}`}>{h}</th>)}</tr></thead>
                                <tbody>
                                    <AnimatePresence>
                                        {purchases.length === 0 ? (<tr><td colSpan="8" className="text-center py-10 text-slate-700">No purchases found.</td></tr>) : (
                                            purchases.map((p) => (
                                                <motion.tr key={p._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-blue-50 border-b border-slate-200 last:border-b-0 text-sm text-slate-700">
                                                    <td className="p-3 font-semibold">{p.invoiceNumber}</td>
                                                    <td className="p-3">{p.vendor?.vendorName}</td>
                                                    <td className="p-3 text-center">{p.items.length}</td>
                                                    <td className="p-3 font-semibold">{p.grandTotal.toFixed(2)} BDT</td>
                                                    <td className="p-3">{p.paidAmount.toFixed(2)} BDT</td>
                                                    <td className="p-3">{renderStatusBadge(p.paymentStatus)}</td>
                                                    <td className="p-3">{formatDate(p.purchaseDate)}</td>
                                  <td className="p-3">
    <div className="flex justify-center items-center gap-2">
        {canPerform("Purchase Management", "view") && (
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openViewModal(p)} className="btn btn-circle btn-sm bg-blue-600 hover:bg-blue-700 text-white" title="View"><FiEye /></motion.button>
        )}
        {canPerform("Purchase Management", "edit") && (
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openEditModal(p)} className="btn btn-circle btn-sm bg-yellow-600 hover:bg-yellow-700 text-white" title="Edit"><FiEdit /></motion.button>
        )}
        {canPerform("Purchase Management", "delete") && (
             <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(p._id)} className="btn btn-circle btn-sm bg-red-600 hover:bg-red-700 text-white" title="Delete"><FiTrash2 /></motion.button>
        )}
    </div>
</td>
                                                </motion.tr>
                                            ))
                                        )}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                            {paginationInfo && paginationInfo.totalDocuments > 0 && (
                                <div className="p-4 border-t border-slate-200 flex items-center justify-between">
                                    <span className="text-sm text-slate-700">Page <span className="font-semibold">{currentPage}</span> of <span className="font-semibold">{paginationInfo.totalPages}</span></span>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="btn btn-sm btn-outline rounded-lg"><FiChevronLeft /></button>
                                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === paginationInfo.totalPages} className="btn btn-sm btn-outline rounded-lg"><FiChevronRight /></button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Create/Edit Modal */}
            <AnimatePresence>{isModalOpen && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-base-100 rounded-xl shadow-xl w-full max-w-5xl max-h-full overflow-y-auto"><div className="p-6">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200"><h2 className="text-xl font-semibold text-blue-600">{editId ? 'Edit Purchase' : 'Create New Purchase'}</h2><motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={closeModal} className="btn btn-ghost btn-circle"><FiX className="text-xl" /></motion.button></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <select name="vendor" value={formData.vendor} onChange={handleFormChange} className="input input-bordered w-full" required><option value="" disabled>Select Vendor</option>{vendors.map(v => <option key={v._id} value={v._id}>{v.vendorName}</option>)}</select>
                        <input type="text" name="invoiceNumber" value={formData.invoiceNumber} onChange={handleFormChange} className="input input-bordered w-full" placeholder="Invoice No *" required />
                        <DatePicker selected={formData.purchaseDate} onChange={handleDateChange} dateFormat="dd/MM/yyyy" className="input input-bordered w-full" required disabled={user?.role !== 'admin'} />
                    </div>
                    <h3 className="text-lg font-semibold text-blue-600 mb-3 mt-8">Purchase Items</h3>
                    <div className="overflow-x-auto rounded-lg border"><table className="w-full">
                        <thead className="bg-slate-100"><tr>{['Category', 'Ingredient', 'Quantity', 'Unit Price', 'Total', 'Action'].map(h => <th key={h} className="p-3 text-left text-sm font-semibold text-slate-700 tracking-wider">{h}</th>)}</tr></thead>
                        <tbody>{formData.items?.map((item, index) => (<tr key={index} className="border-b last:border-0">
                            <td className="p-2"><select value={itemCategories[index]} onChange={e => handleCategoryChange(index, e.target.value)} className="select select-bordered w-full" required><option value="" disabled>Select</option>{categories.map(c => <option key={c._id} value={c._id}>{c.categoryName}</option>)}</select></td>
                            <td className="p-2"><select name="ingredient" value={item.ingredient} onChange={e => handleItemChange(index, e)} className="select select-bordered w-full" required disabled={!itemCategories[index]}><option value="" disabled>Select</option>{ingredients.filter(i => i.category?._id === itemCategories[index]).map(i => <option key={i._id} value={i._id}>{i.name} ({i.unit})</option>)}</select></td>
                            <td className="p-2"><input type="number" name="quantity" value={item.quantity} onChange={e => handleItemChange(index, e)} className="input input-bordered w-full" required /></td>
                            <td className="p-2"><input type="number" name="unitPrice" value={item.unitPrice} onChange={e => handleItemChange(index, e)} className="input input-bordered w-full" required /></td>
                            <td className="p-2"><input type="text" value={(item.totalPrice || 0).toFixed(2)} className="input input-bordered bg-slate-100 w-full" readOnly /></td>
                            <td className="p-2 text-center"><button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 text-lg disabled:opacity-50" disabled={formData.items.length <= 1}><FiTrash2 /></button></td>
                        </tr>))}</tbody>
                    </table></div>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={addItem} className="mt-3 btn btn-outline btn-sm rounded-xl border-slate-300"><FiPlus /> Add Item</motion.button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        <div><label className="label text-sm text-slate-700">Notes</label><textarea name="notes" value={formData.notes} onChange={handleFormChange} className="textarea textarea-bordered w-full h-32" placeholder="Add any relevant notes..."></textarea></div>
                        <div className="bg-slate-50 p-4 rounded-lg flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="text-lg font-bold text-slate-700 flex justify-between"><span>Grand Total:</span><span className="text-blue-600">{formData.grandTotal.toFixed(2)} BDT</span></div>
                                <div className="flex justify-between items-center"><label className="label text-sm text-slate-700">Paid Amount *</label><input type="number" name="paidAmount" value={formData.paidAmount} onChange={handleFormChange} className="input input-bordered w-40 text-right" required /></div>
                                <div className="flex justify-between items-center"><label className="label text-sm text-slate-700">Payment Method *</label><select name="paymentMethod" value={formData.paymentMethod} onChange={handleFormChange} className="select select-bordered w-40" required><option>Cash</option><option>Card</option><option>Mobile</option><option>Other</option></select></div>
                            </div>
                            <div className="flex justify-between items-center mt-4 pt-4 border-t"><label className="label text-sm text-slate-700">Payment Status:</label>{renderStatusBadge(formData.paymentStatus)}</div>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-slate-200">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={closeModal} className="btn rounded-xl">Cancel</motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSubmit} className="btn bg-blue-600 text-white hover:bg-blue-700 rounded-xl shadow-md" disabled={isFormLoading}>{isFormLoading ? 'Saving...' : editId ? 'Save Changes' : 'Create Purchase'}</motion.button>
                    </div>
                </div></motion.div>
            </motion.div>)}</AnimatePresence>

            {/* View Modal */}
            <AnimatePresence>{isViewModalOpen && viewingPurchase && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-base-100 rounded-xl shadow-xl w-full max-w-3xl max-h-full overflow-y-auto"><div className="p-6">
                    <div className="flex justify-between items-center mb-5 pb-4 border-b border-slate-200"><h2 className="text-xl font-semibold text-blue-600">Purchase Details</h2><motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={closeModal} className="btn btn-ghost btn-circle"><FiX className="text-xl" /></motion.button></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-6">
                        <div className="bg-slate-50 p-3 rounded-lg"><p className="font-bold text-slate-700">Vendor</p><p className="text-slate-700 mt-1">{viewingPurchase.vendor?.vendorName}</p></div>
                        <div className="bg-slate-50 p-3 rounded-lg"><p className="font-bold text-slate-700">Invoice No.</p><p className="text-slate-700 mt-1">{viewingPurchase.invoiceNumber}</p></div>
                        <div className="bg-slate-50 p-3 rounded-lg"><p className="font-bold text-slate-700">Purchase Date</p><p className="text-slate-700 mt-1">{formatDate(viewingPurchase.purchaseDate)}</p></div>
                    </div>
                    <h3 className="text-lg font-semibold text-blue-600 mb-2">Items Purchased ({viewingPurchase.items.length})</h3>
                    <div className="overflow-x-auto border rounded-lg mb-6"><table className="w-full">
                        <thead className="bg-slate-100"><tr>{['Ingredient', 'Category', 'Qty', 'Unit Price', 'Total'].map(h => <th key={h} className="p-3 text-left text-sm font-semibold text-slate-700">{h}</th>)}</tr></thead>
                        <tbody>{viewingPurchase.items.map(item => (<tr key={item._id} className="border-b last:border-b-0 text-sm text-slate-700"><td className="p-3">{item.ingredient.name} ({item.ingredient.unit})</td><td className="p-3">{item.ingredient.category?.categoryName}</td><td className="p-3">{item.quantity}</td><td className="p-3">{item.unitPrice.toFixed(2)}</td><td className="p-3 font-semibold">{item.totalPrice.toFixed(2)}</td></tr>))}</tbody>
                    </table></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>{viewingPurchase.notes && (<><h4 className="font-bold text-slate-700 mb-1">Notes</h4><p className="bg-slate-50 p-3 rounded-md text-slate-700 text-sm">{viewingPurchase.notes}</p></>)}</div>
                        <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-right text-sm">
                            <p className="font-semibold text-slate-700">Method: <span className="font-normal">{viewingPurchase.paymentMethod || 'N/A'}</span></p>
                            <p className="font-bold text-lg text-slate-700">Grand Total: <span className="text-blue-600">{viewingPurchase.grandTotal.toFixed(2)} BDT</span></p>
                            <p className="text-slate-700">Amount Paid: {viewingPurchase.paidAmount.toFixed(2)} BDT</p>
                            <p className="text-slate-700">Balance Due: {(viewingPurchase.grandTotal - viewingPurchase.paidAmount).toFixed(2)} BDT</p>
                            <div className="mt-2 flex justify-end">{renderStatusBadge(viewingPurchase.paymentStatus)}</div>
                        </div>
                    </div>
                    <div className="text-right mt-8 pt-6 border-t border-slate-200"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={closeModal} className="btn rounded-xl">Close</motion.button></div>
                </div></motion.div>
            </motion.div>)}</AnimatePresence>
        </div>
    );
};

export default Purchases;