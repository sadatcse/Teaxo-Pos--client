import React, { useState, useEffect, useContext, useCallback } from "react";
import { FaSearch, FaEye, FaTimes } from 'react-icons/fa';
import { MdSportsMartialArts, MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import { FiBell, FiSliders } from "react-icons/fi";
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';


import Mtitle from "../../components library/Mtitle";
import UseAxiosSecure from '../../Hook/UseAxioSecure';
import { AuthContext } from "../../providers/AuthProvider";
import useIngredientCategories from "../../Hook/useIngredientCategories";
import MtableLoading from "../../components library/MtableLoading"; 
import useActionPermissions from "../../Hook/useActionPermissions";

const PaginationControls = ({ currentPage, totalPages, onPageChange, totalDocuments, rowsPerPage }) => {
    if (totalPages <= 1) return null;
    return (
        <div className="flex items-center justify-between pt-4 text-sm text-slate-700">
            <div>
                Showing <span className="font-semibold">{(currentPage - 1) * rowsPerPage + 1}</span> to <span className="font-semibold">{Math.min(currentPage * rowsPerPage, totalDocuments)}</span> of <span className="font-semibold">{totalDocuments}</span> entries
            </div>
            <div className="join">
                <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="join-item btn btn-sm">
                    <MdNavigateBefore />
                </button>
                <button className="join-item btn btn-sm">Page {currentPage} of {totalPages}</button>
                <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="join-item btn btn-sm">
                    <MdNavigateNext />
                </button>
            </div>
        </div>
    );
};

const StockDetailsModal = ({ stock, onClose, axiosSecure }) => {
    const [activeTab, setActiveTab] = useState('details');
    const [movements, setMovements] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'movement' && stock?._id) {
            const fetchMovements = async () => {
                setIsLoading(true);
                try {
                    const { data } = await axiosSecure.get(`/stock/${stock._id}/movements`);
                    setMovements(data);
                } catch (error) {
                    console.error("Failed to fetch stock movements:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchMovements();
        }
    }, [activeTab, stock, axiosSecure]);

    if (!stock) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="card bg-base-100 shadow-xl w-full max-w-2xl">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-blue-600">Stock Details: {stock.ingredient?.name}</h2>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="btn btn-sm btn-circle btn-ghost"><FaTimes /></motion.button>
                </div>
                <div className="p-4 sm:p-6">
                    <div role="tablist" className="tabs tabs-boxed mb-4">
                        <a role="tab" className={`tab ${activeTab === 'details' ? 'tab-active font-semibold' : ''}`} onClick={() => setActiveTab('details')}>Details</a>
                        <a role="tab" className={`tab ${activeTab === 'movement' ? 'tab-active font-semibold' : ''}`} onClick={() => setActiveTab('movement')}>Movement History</a>
                    </div>
                    {activeTab === 'details' && (
                        <div className="space-y-3 text-sm text-slate-700">
                            <p><strong>SKU:</strong> {stock.ingredient?.sku || 'N/A'}</p>
                            <p><strong>Current Quantity:</strong> <span className="font-bold text-lg text-blue-600">{stock.quantityInStock} {stock.unit}</span></p>
                            <p><strong>Stock Alert Level:</strong> {stock.ingredient?.stockAlert || 0} {stock.unit}</p>
                            <p><strong>Category:</strong> {stock.ingredient?.category?.categoryName || 'N/A'}</p>
                            <p><strong>Last Updated:</strong> {new Date(stock.updatedAt).toLocaleString()}</p>
                        </div>
                    )}
                    {activeTab === 'movement' && (
                        <div className="overflow-x-auto max-h-96">
                            {isLoading ? <MtableLoading /> : (
                                <table className="table table-zebra table-sm w-full">
                                    <thead><tr><th>Date</th><th>Before</th><th>After</th><th>Adj.</th><th>User</th><th>Note</th></tr></thead>
                                    <tbody>
                                        {movements.length > 0 ? movements.map(m => (
                                            <tr key={m._id}><td>{new Date(m.createdAt).toLocaleString()}</td><td>{m.beforeQuantity}</td><td>{m.afterQuantity}</td><td className={m.adjustment >= 0 ? 'text-green-600' : 'text-red-600'}>{m.adjustment > 0 ? `+${m.adjustment}` : m.adjustment}</td><td>{m.createdBy?.name || 'System'}</td><td>{m.note}</td></tr>
                                        )) : (<tr><td colSpan="6" className="text-center">No movement history found.</td></tr>)}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

const UpdateStockAlertModal = ({ stock, onClose, onSuccess, axiosSecure }) => {
    const [newAlert, setNewAlert] = useState(stock.ingredient?.stockAlert || 0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await axiosSecure.put(`/stock/ingredient/${stock.ingredient._id}/alert`, { newStockAlert: Number(newAlert) });
            Swal.fire('Success!', 'Stock alert has been updated.', 'success');
            onSuccess();
            onClose();
        } catch (error) {
            Swal.fire('Error!', 'Could not update stock alert.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="card bg-base-100 shadow-xl w-full max-w-md">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center"><h2 className="text-xl font-semibold text-blue-600">Update Stock Alert</h2><button onClick={onClose} className="btn btn-sm btn-circle btn-ghost"><FaTimes /></button></div>
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="form-control">
                        <label className="label"><span className="label-text text-slate-700">Alert Level for <span className="font-semibold">{stock.ingredient?.name}</span> ({stock.unit})</span></label>
                        <input type="number" className="border border-gray-300 rounded-xl p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 w-full" value={newAlert} onChange={(e) => setNewAlert(e.target.value)} required />
                    </div>
                    <div className="flex justify-end gap-4 mt-8">
                        <motion.button type="button" onClick={onClose} className="btn rounded-xl" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Cancel</motion.button>
                        <motion.button type="submit" className="btn bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md" disabled={isSubmitting} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>{isSubmitting ? <span className="loading loading-spinner"></span> : 'Update Alert'}</motion.button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const UpdateStockAdjustmentModal = ({ stock, onClose, onSuccess, axiosSecure }) => {
    const [physicalQuantity, setPhysicalQuantity] = useState(stock.quantityInStock || '');
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await axiosSecure.put(`/stock/adjust`, { stockId: stock._id, newQuantity: Number(physicalQuantity), note: note });
            Swal.fire('Success!', 'Stock has been adjusted.', 'success');
            onSuccess();
            onClose();
        } catch (error) {
            Swal.fire('Error!', 'Could not adjust stock.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="card bg-base-100 shadow-xl w-full max-w-md">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center"><h2 className="text-xl font-semibold text-blue-600">Stock Adjustment</h2><button onClick={onClose} className="btn btn-sm btn-circle btn-ghost"><FaTimes /></button></div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-control"><label className="label"><span className="label-text">Current Stock ({stock.unit})</span></label><input type="text" value={stock.quantityInStock} className="input input-bordered bg-slate-100 rounded-xl" disabled /></div>
                        <div className="form-control"><label className="label"><span className="label-text font-semibold">New Physical Quantity</span></label><input type="number" step="any" className="border border-gray-300 rounded-xl p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 w-full" value={physicalQuantity} onChange={(e) => setPhysicalQuantity(e.target.value)} required /></div>
                    </div>
                    <div className="form-control"><label className="label"><span className="label-text">Note (Reason for adjustment)</span></label><textarea className="textarea border border-gray-300 rounded-xl p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 h-24" placeholder="e.g., Weekly stock count..." value={note} onChange={(e) => setNote(e.target.value)}></textarea></div>
                    <div className="flex justify-end gap-4 mt-6">
                        <motion.button type="button" onClick={onClose} className="btn rounded-xl" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Cancel</motion.button>
                        <motion.button type="submit" className="btn bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md" disabled={isSubmitting} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>{isSubmitting ? <span className="loading loading-spinner"></span> : 'Update Stock'}</motion.button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const Stocks = () => {
    const axiosSecure = UseAxiosSecure();
    const { branch } = useContext(AuthContext);
    const { ingredientCategories } = useIngredientCategories();
    const [stocks, setStocks] = useState([]);
    const [isTableLoading, setTableLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showLowStockOnly, setShowLowStockOnly] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationInfo, setPaginationInfo] = useState({ totalPages: 1, totalDocuments: 0 });
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [isAlertModalOpen, setAlertModalOpen] = useState(false);
    const [isAdjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
    const [selectedStock, setSelectedStock] = useState(null);
   const { canPerform, loading: permissionsLoading } = useActionPermissions();
    const fetchStocks = useCallback(async () => {
        if (!branch) return;
        setTableLoading(true);
        const params = new URLSearchParams({ page: currentPage, limit: rowsPerPage });
        if (selectedCategory) params.append('category', selectedCategory);
        if (searchTerm) params.append('search', searchTerm);
        if (showLowStockOnly) params.append('lowStock', 'true');
        try { const { data } = await axiosSecure.get(`/stock/${branch}/get-all?${params.toString()}`); setStocks(data.data); setPaginationInfo(data.pagination); } catch (error) { Swal.fire({ icon: 'error', title: 'Error!', text: 'Failed to fetch stock data.' }); } finally { setTableLoading(false); }
    }, [branch, currentPage, rowsPerPage, selectedCategory, searchTerm, showLowStockOnly, axiosSecure]);

    useEffect(() => { const handler = setTimeout(() => { if (currentPage !== 1) setCurrentPage(1); else fetchStocks(); }, 500); return () => clearTimeout(handler); }, [searchTerm]);
    useEffect(() => { if (currentPage !== 1) setCurrentPage(1); else fetchStocks(); }, [selectedCategory, showLowStockOnly, rowsPerPage]);
    useEffect(() => { fetchStocks(); }, [currentPage, fetchStocks]);

    const handleViewDetails = (stock) => { setSelectedStock(stock); setDetailsModalOpen(true); };
    const handleOpenAlertModal = (stock) => { setSelectedStock(stock); setAlertModalOpen(true); };
    const handleOpenAdjustmentModal = (stock) => { setSelectedStock(stock); setAdjustmentModalOpen(true); };

    return (
        <main className="bg-base-200 min-h-screen p-4 sm:p-6 lg:p-8">
            <Mtitle title="Current Stock" rightcontent={
                <div className="flex flex-col md:flex-row gap-4 justify-end items-center">
                    <div className="w-full md:max-w-xs relative">
                        <input type="text" className="border border-gray-300 rounded-xl p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 w-full pr-10" placeholder="Search by Name or SKU" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        <FaSearch className="text-slate-400 absolute top-1/2 right-4 transform -translate-y-1/2" />
                    </div>
                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="border border-gray-300 rounded-xl p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150">
                        <option value="">All Categories</option>
                        {ingredientCategories.map(cat => (<option key={cat._id} value={cat._id}>{cat.categoryName}</option>))}
                    </select>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowLowStockOnly(!showLowStockOnly)} className={`btn rounded-xl gap-2 ${showLowStockOnly ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white hover:bg-gray-50 border border-gray-300'}`}>
                        <MdSportsMartialArts /> Low Stock
                    </motion.button>
                </div>
            } />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="card bg-base-100 shadow-xl mt-6">
                <div className="card-body p-4 sm:p-6">
                    {isTableLoading ? <MtableLoading /> : (
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead className="bg-blue-600 text-white uppercase text-xs font-medium tracking-wider">
                                    <tr><th className="p-3 rounded-tl-lg">Name</th><th className="p-3">Quantity</th><th className="p-3">Unit</th><th className="p-3">Stock Alert</th><th className="p-3">SKU</th><th className="p-3">Last Update</th><th className="p-3 rounded-tr-lg text-center">Action</th></tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {stocks.length === 0 && (<tr><td colSpan="7" className="text-center py-4 text-slate-700">No stock items found.</td></tr>)}
                                        {stocks.map((s) => {
                                            const isLow = s.quantityInStock < s.ingredient.stockAlert;
                                            return (
                                                <motion.tr key={s._id} className={`hover:bg-blue-50 transition-colors duration-200 ${isLow ? 'bg-red-50' : ''}`} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                    <td className="p-3 font-semibold text-slate-700 border-b border-slate-200 flex items-center gap-2">{s.ingredient?.name || 'N/A'}{isLow && <MdSportsMartialArts className="text-red-500" title="Low stock" />}</td>
                                                    <td className="p-3 font-bold text-blue-700 border-b border-slate-200">{s.quantityInStock}</td>
                                                    <td className="p-3 text-slate-700 border-b border-slate-200">{s.unit}</td>
                                                    <td className="p-3 text-slate-700 border-b border-slate-200">{s.ingredient?.stockAlert || 0}</td>
                                                    <td className="p-3 text-slate-500 border-b border-slate-200">{s.ingredient?.sku || 'N/A'}</td>
                                                    <td className="p-3 text-sm text-slate-500 border-b border-slate-200">{new Date(s.updatedAt).toLocaleString()}</td>
      <td className="p-3 border-b border-slate-200">
    <div className="flex items-center justify-center gap-2">
        {canPerform("Stock Management", "view") && (
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleViewDetails(s)} className="btn btn-circle btn-sm bg-blue-600 hover:bg-blue-700 text-white" title="View Details"><FaEye /></motion.button>
        )}
        {canPerform("Stock Management", "edit") && (
            <>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleOpenAlertModal(s)} className="btn btn-circle btn-sm bg-yellow-600 hover:bg-yellow-700 text-white" title="Update Stock Alert"><FiBell /></motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleOpenAdjustmentModal(s)} className="btn btn-circle btn-sm bg-yellow-600 hover:bg-yellow-700 text-white" title="Stock Adjustment"><FiSliders /></motion.button>
            </>
        )}
    </div>
</td>
                                                </motion.tr>
                                            );
                                        })}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                            <PaginationControls currentPage={currentPage} totalPages={paginationInfo.totalPages} onPageChange={(page) => setCurrentPage(page)} totalDocuments={paginationInfo.totalDocuments} rowsPerPage={rowsPerPage} />
                        </div>
                    )}
                </div>
            </motion.div>
            <AnimatePresence>
                {isDetailsModalOpen && <StockDetailsModal stock={selectedStock} onClose={() => setDetailsModalOpen(false)} axiosSecure={axiosSecure} />}
                {isAlertModalOpen && <UpdateStockAlertModal stock={selectedStock} onClose={() => setAlertModalOpen(false)} onSuccess={fetchStocks} axiosSecure={axiosSecure} />}
                {isAdjustmentModalOpen && <UpdateStockAdjustmentModal stock={selectedStock} onClose={() => setAdjustmentModalOpen(false)} onSuccess={fetchStocks} axiosSecure={axiosSecure} />}
            </AnimatePresence>
        </main>
    );
};

export default Stocks;