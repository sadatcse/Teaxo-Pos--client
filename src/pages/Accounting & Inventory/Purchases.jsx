import React, { useState, useEffect, useContext } from "react";
import { FiEdit, FiTrash2, FiEye, FiPlus, FiX } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { TfiSearch } from "react-icons/tfi";
import Mpagination from "../../components library/Mpagination";
import Mtitle from "../../components library/Mtitle";
import UseAxiosSecure from '../../Hook/UseAxioSecure';
import { AuthContext } from "../../providers/AuthProvider";
import Preloader from './../../components/Shortarea/Preloader';

const Purchases = () => {
    const axiosSecure = UseAxiosSecure();
    const { branch, user } = useContext(AuthContext); // Get user for role check

    // State management
    const [purchases, setPurchases] = useState([]);
    const [filteredPurchases, setFilteredPurchases] = useState([]);
    const [isTableLoading, setTableLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    // Modal and Form State
    const [isModalOpen, setModalOpen] = useState(false);
    const [isViewModalOpen, setViewModalOpen] = useState(false);
    const [isFormLoading, setFormLoading] = useState(false);
    const [editId, setEditId] = useState(null);
    const [viewingPurchase, setViewingPurchase] = useState(null);
    
    // Data for forms
    const [vendors, setVendors] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [categories, setCategories] = useState([]);
    const [itemCategories, setItemCategories] = useState([""]);
    
    // Initial form state
    const initialFormData = {
        vendor: "",
        purchaseDate: new Date().toISOString().split('T')[0],
        invoiceNumber: "",
        items: [{ ingredient: "", quantity: 1, unitPrice: 0, totalPrice: 0 }],
        grandTotal: 0,
        paymentStatus: "Unpaid",
        paidAmount: 0,
        notes: "",
        branch: branch || "",
    };
    const [formData, setFormData] = useState(initialFormData);

    // --- DATA FETCHING & FILTERING ---
    const fetchPurchases = async () => {
        if (!branch) return;
        setTableLoading(true);
        try {
            const { data } = await axiosSecure.get(`/purchase/${branch}/get-all`);
            setPurchases(data);
            setFilteredPurchases(data);
        } catch (error) {
            console.error("Error fetching purchases:", error);
        } finally {
            setTableLoading(false);
        }
    };

    const fetchPrerequisites = async () => {
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
    };

    useEffect(() => {
        if (branch) {
            fetchPurchases();
            fetchPrerequisites();
        }
    }, [branch, axiosSecure]);

    useEffect(() => {
        let data = purchases;
        if (dateFilter) {
            data = data.filter(p => p.purchaseDate.split('T')[0] === dateFilter);
        }
        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            data = data.filter(p =>
                p.vendor?.vendorName.toLowerCase().includes(lowercasedFilter) ||
                p.invoiceNumber?.toLowerCase().includes(lowercasedFilter)
            );
        }
        setFilteredPurchases(data);
    }, [searchTerm, dateFilter, purchases]);

    // --- FORM & MODAL LOGIC ---
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItems = [...formData.items];
        newItems[index][name] = value;
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
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { ingredient: "", quantity: 1, unitPrice: 0, totalPrice: 0 }]
        }));
        setItemCategories(prev => [...prev, ""]);
    };

    const removeItem = (index) => {
        setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
        setItemCategories(prev => prev.filter((_, i) => i !== index));
    };

    useEffect(() => {
        const total = formData.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
        const paid = parseFloat(formData.paidAmount) || 0;
        let status = "Unpaid";
        if (paid > 0 && paid < total) status = "Partial";
        else if (paid > 0 && paid >= total) status = "Paid";
        setFormData(prev => ({ ...prev, grandTotal: total, paymentStatus: status }));
    }, [formData.items, formData.paidAmount]);
    
    // --- ACTIONS (CREATE, EDIT, VIEW, DELETE) ---
    const openCreateModal = async () => {
        setEditId(null);
        setFormData(initialFormData);
        setItemCategories([""]);
        setModalOpen(true);
        // Fetch the next invoice number
        try {
            const { data } = await axiosSecure.get(`/purchase/next-invoice/${branch}`);
            setFormData(prev => ({...prev, invoiceNumber: data.nextInvoiceNumber}));
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
            purchaseDate: purchase.purchaseDate.split('T')[0],
            items: purchase.items.map(item => ({...item, ingredient: item.ingredient._id}))
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

    const handleSubmit = async () => {
        setFormLoading(true);
        try {
            const apiCall = editId 
                ? axiosSecure.put(`/purchase/update/${editId}`, formData)
                : axiosSecure.post('/purchase/post', formData);
            
            await apiCall;
            fetchPurchases();
            closeModal();
            Swal.fire({ icon: 'success', title: 'Success!', text: `Purchase ${editId ? 'updated' : 'recorded'} successfully.` });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Error!', text: `Failed to ${editId ? 'update' : 'record'} purchase.` });
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = (purchaseId) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this! Stock will not be adjusted automatically.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axiosSecure.delete(`/purchase/delete/${purchaseId}`);
                    fetchPurchases();
                    Swal.fire('Deleted!', 'The purchase has been deleted.', 'success');
                } catch (error) {
                    Swal.fire('Error!', 'Failed to delete the purchase.', 'error');
                }
            }
        });
    };

    // --- RENDER HELPERS ---
    const renderStatusBadge = (status) => {
        const styles = {
            Paid: "bg-green-100 text-green-700", Unpaid: "bg-red-100 text-red-700", Partial: "bg-yellow-100 text-yellow-700",
        };
        return <span className={`px-3 py-1 text-sm font-semibold rounded-full ${styles[status]}`}>{status}</span>;
    };
    
    const { paginatedData, paginationControls, rowsPerPageAndTotal } = Mpagination({ totalData: filteredPurchases });

    return (
        <div className="p-4 md:p-6 min-h-screen bg-gray-50">
            <Mtitle title="Purchase Management" rightcontent={
                <div className='flex flex-col md:flex-row md:items-center gap-4'>
                    <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="input-style" />
                    <div className='relative w-full md:w-64'>
                        <TfiSearch className='absolute top-1/2 left-3 -translate-y-1/2 text-gray-400' />
                        <input type="text" className='input-style pl-10' placeholder='Search...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <button onClick={openCreateModal} className="btn-primary flex items-center justify-center gap-2 w-full md:w-auto">
                        <FiPlus /> Create Purchase
                    </button>
                </div>
            } />

            <div className="text-sm md:text-base mt-4">{rowsPerPageAndTotal}</div>

            {isTableLoading ? <Preloader /> : (
                <section className="overflow-x-auto shadow-lg rounded-xl bg-white mt-4">
                    <table className="table w-full">
                        <thead className='bg-slate-100'>
                            <tr className="text-sm font-bold text-slate-700 text-left">
                                {['Invoice', 'Vendor', 'Items', 'Total Amount', 'Paid', 'Status', 'Date', 'Actions'].map((h, i) =>
                                    <td key={h} className={`p-4 ${i === 7 && 'text-center'}`}>{h}</td>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.length === 0 ? (
                                <tr><td colSpan="8" className="text-center py-10 text-gray-500">No purchases found.</td></tr>
                            ) : (
                                paginatedData.map((p) => (
                                    <tr key={p._id} className="hover:bg-slate-50 border-b border-slate-100 last:border-b-0">
                                        <td className="p-4 font-bold text-slate-800">{p.invoiceNumber}</td>
                                        <td className="p-4">{p.vendor?.vendorName}</td>
                                        <td className="p-4 text-center">{p.items.length}</td>
                                        <td className="p-4 font-semibold">{p.grandTotal.toFixed(2)} BDT</td>
                                        <td className="p-4">{p.paidAmount.toFixed(2)} BDT</td>
                                        <td className="p-4">{renderStatusBadge(p.paymentStatus)}</td>
                                        <td className="p-4">{new Date(p.purchaseDate).toLocaleDateString()}</td>
                                        <td className="p-4 text-lg flex justify-center items-center gap-4">
                                            {/* View button is for everyone */}
                                            <button onClick={() => openViewModal(p)} className="text-gray-500 hover:text-blue-600 transition-colors" title="View"><FiEye /></button>
                                            
                                            {/* ===== START: ADMIN-ONLY BUTTONS ===== */}
                                            {user?.role === 'admin' && (
                                                <>
                                                    <button onClick={() => openEditModal(p)} className="text-gray-500 hover:text-yellow-600 transition-colors" title="Edit"><FiEdit /></button>
                                                    <button onClick={() => handleDelete(p._id)} className="text-gray-500 hover:text-red-600 transition-colors" title="Delete"><FiTrash2 /></button>
                                                </>
                                            )}
                                            {/* ===== END: ADMIN-ONLY BUTTONS ===== */}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    <div className="p-4">{paginationControls}</div>
                </section>
            )}

            {/* MAIN MODAL (CREATE/EDIT) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-5xl max-h-full overflow-y-auto">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b">
                            <h2 className="text-2xl font-bold text-gray-800">{editId ? 'Edit Purchase' : 'Create a New Purchase'}</h2>
                            <button onClick={closeModal} className="p-2 rounded-full hover:bg-gray-200"><FiX className="text-xl" /></button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                            <div>
                                <label className="label">Vendor *</label>
                                <select name="vendor" value={formData.vendor} onChange={handleFormChange} className="input-style" required>
                                    <option value="" disabled>Select Vendor</option>
                                    {vendors.map(v => <option key={v._id} value={v._id}>{v.vendorName}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label">Invoice No *</label>
                                <input type="text" name="invoiceNumber" value={formData.invoiceNumber} onChange={handleFormChange} className="input-style" placeholder="INV-1001" required />
                            </div>
                            <div>
                                <label className="label">Purchase Date *</label>
                                <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleFormChange} className="input-style" required disabled={user?.role !== 'admin'} />
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-gray-700 mb-3 mt-8">Purchase Items</h3>
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="w-full">
                                <thead className="bg-gray-100">
                                    <tr>
                                        {['Category', 'Ingredient', 'Quantity', 'Unit Price', 'Total', 'Action'].map(h => 
                                            <th key={h} className="p-3 text-left text-sm font-bold text-gray-600">{h}</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.items.map((item, index) => (
                                        <tr key={index} className="border-b last:border-0">
                                            <td className="p-2"><select value={itemCategories[index]} onChange={e => handleCategoryChange(index, e.target.value)} className="input-style" required><option value="" disabled>Select</option>{categories.map(c => <option key={c._id} value={c._id}>{c.categoryName}</option>)}</select></td>
                                            <td className="p-2"><select name="ingredient" value={item.ingredient} onChange={e => handleItemChange(index, e)} className="input-style" required disabled={!itemCategories[index]}><option value="" disabled>Select</option>{ingredients.filter(i => i.category?._id === itemCategories[index]).map(i => <option key={i._id} value={i._id}>{i.name} ({i.unit})</option>)}</select></td>
                                            <td className="p-2"><input type="number" name="quantity" value={item.quantity} onChange={e => handleItemChange(index, e)} className="input-style" required /></td>
                                            <td className="p-2"><input type="number" name="unitPrice" value={item.unitPrice} onChange={e => handleItemChange(index, e)} className="input-style" required /></td>
                                            <td className="p-2"><input type="text" value={(item.totalPrice || 0).toFixed(2)} className="input-style bg-gray-100" readOnly /></td>
                                            <td className="p-2 text-center"><button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 text-2xl" disabled={formData.items.length <= 1}>&times;</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button onClick={addItem} className="mt-3 btn-secondary-outline text-sm"><FiPlus /> Add Item</button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            <div>
                                <label className="label">Notes</label>
                                <textarea name="notes" value={formData.notes} onChange={handleFormChange} className="input-style w-full h-24" placeholder="Add notes..."></textarea>
                            </div>
                            <div className="flex flex-col items-end gap-4">
                                <div className="text-xl font-bold text-gray-800 w-full max-w-xs flex justify-between"><span>Grand Total:</span><span>{formData.grandTotal.toFixed(2)} BDT</span></div>
                                <div className="w-full max-w-xs">
                                    <label className="label">Paid Amount *</label>
                                    <input type="number" name="paidAmount" value={formData.paidAmount} onChange={handleFormChange} className="input-style" required />
                                </div>
                                <div className="w-full max-w-xs flex justify-between items-center">
                                    <label className="label">Payment Status:</label>{renderStatusBadge(formData.paymentStatus)}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
                            <button onClick={closeModal} className="btn-secondary">Cancel</button>
                            <button onClick={handleSubmit} className="btn-primary" disabled={isFormLoading}>
                                {isFormLoading ? 'Saving...' : editId ? 'Save Changes' : 'Create Purchase'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW MODAL */}
            {isViewModalOpen && viewingPurchase && (
                 <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                     <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-3xl max-h-full overflow-y-auto">
                         <div className="flex justify-between items-center mb-5 pb-4 border-b">
                            <h2 className="text-2xl font-bold text-gray-800">Purchase Details</h2>
                            <button onClick={closeModal} className="p-2 rounded-full hover:bg-gray-200"><FiX className="text-xl" /></button>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-6">
                            <div className="bg-slate-50 p-3 rounded-lg">
                                <p className="font-bold text-slate-600">Vendor</p>
                                <p className="text-slate-800 text-base">{viewingPurchase.vendor?.vendorName}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg">
                                <p className="font-bold text-slate-600">Invoice No.</p>
                                <p className="text-slate-800 text-base">{viewingPurchase.invoiceNumber}</p>
                            </div>
                             <div className="bg-slate-50 p-3 rounded-lg">
                                <p className="font-bold text-slate-600">Purchase Date</p>
                                <p className="text-slate-800 text-base">{new Date(viewingPurchase.purchaseDate).toLocaleDateString()}</p>
                            </div>
                         </div>
                         <h3 className="text-lg font-bold text-gray-700 mb-2">Items Purchased ({viewingPurchase.items.length})</h3>
                         <div className="overflow-x-auto border rounded-lg mb-6">
                            <table className="w-full">
                                <thead className="bg-gray-100">
                                    <tr>{['Ingredient', 'Category', 'Qty', 'Unit Price', 'Total'].map(h => <th key={h} className="p-3 text-left text-sm font-bold text-gray-600">{h}</th>)}</tr>
                                </thead>
                                <tbody>
                                    {viewingPurchase.items.map(item => (
                                        <tr key={item._id} className="border-b last:border-b-0">
                                            <td className="p-3">{item.ingredient.name} ({item.ingredient.unit})</td>
                                            <td className="p-3">{item.ingredient.category?.categoryName}</td>
                                            <td className="p-3">{item.quantity}</td>
                                            <td className="p-3">{item.unitPrice.toFixed(2)}</td>
                                            <td className="p-3 font-semibold">{item.totalPrice.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                {viewingPurchase.notes && (<><h4 className="font-bold text-gray-700 mb-1">Notes</h4><p className="bg-gray-50 p-3 rounded-md text-gray-600">{viewingPurchase.notes}</p></>)}
                            </div>
                            <div className="flex flex-col items-end gap-3 text-right">
                                <p className="font-bold text-xl">Grand Total: <span className="text-blue-600">{viewingPurchase.grandTotal.toFixed(2)} BDT</span></p>
                                <p>Amount Paid: {viewingPurchase.paidAmount.toFixed(2)} BDT</p>
                                <p>Balance Due: {(viewingPurchase.grandTotal - viewingPurchase.paidAmount).toFixed(2)} BDT</p>
                                <div className="mt-2">{renderStatusBadge(viewingPurchase.paymentStatus)}</div>
                            </div>
                         </div>
                         
                         <div className="text-right mt-8 pt-6 border-t">
                            <button onClick={closeModal} className="btn-secondary">Close</button>
                         </div>
                     </div>
                 </div>
            )}
        </div>
    );
};

export default Purchases;