import React, { useState, useEffect, useContext } from "react";
import { FiEye, FiBell, FiEdit2, FiAlertTriangle } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { TfiSearch } from "react-icons/tfi";
import Mpagination from "../../components library/Mpagination";
import MtableLoading from "../../components library/MtableLoading";
import Mtitle from "../../components library/Mtitle";
import UseAxiosSecure from '../../Hook/UseAxioSecure';
import { AuthContext } from "../../providers/AuthProvider";
import Preloader from './../../components/Shortarea/Preloader';

const Stocks = () => {
    const axiosSecure = UseAxiosSecure();
    const { branch } = useContext(AuthContext);

    const [stocks, setStocks] = useState([]);
    const [filteredStocks, setFilteredStocks] = useState([]);
    const [isTableLoading, setTableLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showLowStockOnly, setShowLowStockOnly] = useState(false);

    // Modal States
    const [selectedStock, setSelectedStock] = useState(null);
    const [isAdjustModalOpen, setAdjustModalOpen] = useState(false);
    const [isAlertModalOpen, setAlertModalOpen] = useState(false);
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);

    // Form States
    const [adjustFormData, setAdjustFormData] = useState({ newQuantity: 0, note: '' });
    const [alertFormData, setAlertFormData] = useState({ stockAlert: 0 });
    const [isFormLoading, setFormLoading] = useState(false);

    const fetchStocks = async () => {
        if (!branch) return;
        setTableLoading(true);
        try {
            const { data } = await axiosSecure.get(`/stock/${branch}/get-all`);
            setStocks(data);
        } catch (error) {
            console.error("Error fetching stocks:", error);
            Swal.fire({ icon: 'error', title: 'Error!', text: 'Failed to fetch stock data.' });
        } finally {
            setTableLoading(false);
        }
    };

    useEffect(() => {
        fetchStocks();
    }, [branch]);

    useEffect(() => {
        let data = stocks;
        if (showLowStockOnly) {
            data = data.filter(s => s.quantityInStock < s.ingredient.stockAlert);
        }
        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            data = data.filter(s =>
                s.ingredient.name.toLowerCase().includes(lowercasedFilter) ||
                s.ingredient.sku.toLowerCase().includes(lowercasedFilter)
            );
        }
        setFilteredStocks(data);
    }, [searchTerm, showLowStockOnly, stocks]);

    const openModal = (modalSetter, stockItem) => {
        setSelectedStock(stockItem);
        if (modalSetter === setAdjustModalOpen) {
            setAdjustFormData({ newQuantity: stockItem.quantityInStock, note: '' });
        }
        if (modalSetter === setAlertModalOpen) {
            setAlertFormData({ stockAlert: stockItem.ingredient.stockAlert });
        }
        modalSetter(true);
    };

    const closeModal = () => {
        setAdjustModalOpen(false);
        setAlertModalOpen(false);
        setDetailsModalOpen(false);
        setSelectedStock(null);
        setFormLoading(false);
    };

    const handleAdjustStock = async () => {
        setFormLoading(true);
        try {
            await axiosSecure.put(`/stock/${branch}/adjust`, {
                ingredientId: selectedStock.ingredient._id,
                newQuantity: adjustFormData.newQuantity,
            });
            await fetchStocks(); // Refetch to get updated data
            closeModal();
            Swal.fire('Success!', 'Stock quantity has been updated.', 'success');
        } catch (error) {
            Swal.fire('Error!', 'Failed to adjust stock.', 'error');
        } finally {
            setFormLoading(false);
        }
    };

    const handleSetAlert = async () => {
        setFormLoading(true);
        try {
            await axiosSecure.put(`/ingredient/update-alert/${selectedStock.ingredient._id}`, {
                stockAlert: alertFormData.stockAlert,
            });
            await fetchStocks(); // Refetch to get updated alert levels
            closeModal();
            Swal.fire('Success!', 'Stock alert level has been updated.', 'success');
        } catch (error) {
            Swal.fire('Error!', 'Failed to set stock alert.', 'error');
        } finally {
            setFormLoading(false);
        }
    };

    const lowStockCount = stocks.filter(s => s.quantityInStock < s.ingredient.stockAlert).length;
    const { paginatedData, paginationControls, rowsPerPageAndTotal } = Mpagination({ totalData: filteredStocks });

    return (
        <div className="p-4 min-h-screen">
            <Mtitle title="Current Stock" rightcontent={
                <div className='flex items-center gap-4'>
                    <div className='md:w-64 border shadow-sm py-2 px-3 bg-white rounded-xl'>
                        <div className='flex items-center gap-2'>
                            <TfiSearch className='text-xl font-bold text-gray-500' />
                            <input type="text" className='outline-none w-full' placeholder='Search Stocks...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                </div>
            } />

            <div className="mt-4">
                <button onClick={() => setShowLowStockOnly(!showLowStockOnly)} className={`flex items-center gap-2 py-2 px-4 rounded-lg font-semibold ${showLowStockOnly ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                    <FiAlertTriangle />
                    Low Stock ({lowStockCount})
                </button>
            </div>

            <div className="text-sm md:text-base mt-4">{rowsPerPageAndTotal}</div>

            {isTableLoading ? <Preloader /> : (
                <section className="overflow-x-auto border shadow-sm rounded-xl bg-white mt-5">
                    <table className="table w-full">
                        <thead className='bg-gray-50'>
                            <tr className="text-sm font-semibold text-gray-600 text-left">
                                <td className="p-4">Name</td>
                                <td className="p-4">Quantity</td>
                                <td className="p-4">Unit</td>
                                <td className="p-4">Stock Alert</td>
                                <td className="p-4">SKU</td>
                                <td className="p-4">Last Update</td>
                                <td className="p-4 text-center">Actions</td>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((s) => {
                                const isLow = s.quantityInStock < s.ingredient.stockAlert;
                                return (
                                    <tr key={s._id} className={`hover:bg-slate-50 border-b ${isLow ? 'bg-red-50' : ''}`}>
                                        <td className="p-4 font-medium flex items-center gap-2">
                                            {s.ingredient.name}
                                            {isLow && <FiAlertTriangle className="text-red-500" />}
                                        </td>
                                        <td className="p-4 font-bold">{s.quantityInStock}</td>
                                        <td className="p-4">{s.unit}</td>
                                        <td className="p-4">{s.ingredient.stockAlert}</td>
                                        <td className="p-4">{s.ingredient.sku}</td>
                                        <td className="p-4">{new Date(s.updatedAt).toLocaleString()}</td>
                                        <td className="p-4 text-lg flex justify-center items-center space-x-4">
                                            <button onClick={() => openModal(setDetailsModalOpen, s)} className="text-gray-400 hover:text-blue-500"><FiEye /></button>
                                            <button onClick={() => openModal(setAlertModalOpen, s)} className="text-gray-400 hover:text-yellow-600"><FiBell /></button>
                                            <button onClick={() => openModal(setAdjustModalOpen, s)} className="text-gray-400 hover:text-green-600"><FiEdit2 /></button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div className="p-4">
                        <MtableLoading data={stocks} />
                        {paginationControls}
                    </div>
                </section>
            )}

            {/* Modals */}
            {isAdjustModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-content max-w-lg">
                        <h2 className="modal-title">Update Stock Adjustment: {selectedStock?.ingredient.name}</h2>
                        <div>
                            <label className="label">Physical Quantity *</label>
                            <input type="number" value={adjustFormData.newQuantity} onChange={e => setAdjustFormData({...adjustFormData, newQuantity: e.target.value})} className="input-style" />
                        </div>
                        <div className="mt-2 text-sm text-gray-500">Current Stock: {selectedStock?.quantityInStock} {selectedStock?.unit}</div>
                        <div className="mt-4">
                            <label className="label">Note</label>
                            <textarea value={adjustFormData.note} onChange={e => setAdjustFormData({...adjustFormData, note: e.target.value})} className="input-style w-full" placeholder="Reason for adjustment (e.g., waste, correction)"></textarea>
                        </div>
                        <div className="modal-actions">
                            <button onClick={closeModal} className="btn-cancel">Cancel</button>
                            <button onClick={handleAdjustStock} className="btn-confirm" disabled={isFormLoading}>{isFormLoading ? 'Saving...' : 'Update Stock Adjustment'}</button>
                        </div>
                    </div>
                </div>
            )}

            {isAlertModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-content max-w-md">
                        <h2 className="modal-title">Update Stock Alert: {selectedStock?.ingredient.name}</h2>
                        <div>
                            <label className="label">Stock Alert Level *</label>
                            <input type="number" value={alertFormData.stockAlert} onChange={e => setAlertFormData({stockAlert: e.target.value})} className="input-style" />
                            <p className="text-xs text-gray-500 mt-1">Receive a warning when stock falls below this quantity.</p>
                        </div>
                        <div className="modal-actions">
                            <button onClick={closeModal} className="btn-cancel">Cancel</button>
                            <button onClick={handleSetAlert} className="btn-confirm" disabled={isFormLoading}>{isFormLoading ? 'Saving...' : 'Update Stock Alert'}</button>
                        </div>
                    </div>
                </div>
            )}

            {isDetailsModalOpen && (
                 <div className="modal-backdrop">
                    <div className="modal-content max-w-2xl">
                        <div className="flex justify-between items-center">
                            <h2 className="modal-title">Stock Details</h2>
                            <button onClick={closeModal} className="text-2xl text-gray-500 hover:text-gray-800">&times;</button>
                        </div>
                        {/* Tab Navigation */}
                        <div className="border-b mt-2">
                             <nav className="-mb-px flex space-x-6">
                                <button className="py-3 px-1 border-b-2 font-medium text-sm border-blue-500 text-blue-600">Details</button>
                                <button className="py-3 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700">Stock Movement</button>
                             </nav>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                                {selectedStock.ingredient.name}
                                {selectedStock.quantityInStock < selectedStock.ingredient.stockAlert && <span className="text-sm font-semibold px-2 py-1 bg-red-100 text-red-700 rounded-full">Low Stock</span>}
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                                <div><div className="text-gray-500">Unit</div><div className="font-semibold">{selectedStock.unit}</div></div>
                                <div><div className="text-gray-500">Stock Alert</div><div className="font-semibold">{selectedStock.ingredient.stockAlert}</div></div>
                                <div><div className="text-gray-500">SKU</div><div className="font-semibold">{selectedStock.ingredient.sku}</div></div>
                                <div><div className="text-gray-500">Current Quantity</div><div className="font-semibold text-lg">{selectedStock.quantityInStock}</div></div>
                                {/* Add Average Price when available */}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Stocks;
