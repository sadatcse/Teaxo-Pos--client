import React, { useState, useEffect, useCallback } from 'react';
import { FiEdit, FiTrash2, FiPlus, FiX } from 'react-icons/fi';
import { useDebounce } from 'use-debounce';
import Swal from 'sweetalert2';

import UseAxiosSecure from '../../Hook/UseAxioSecure';
import useTotalBranch from '../../Hook/UseTotalBrach';
import Mtitle from '../../components library/Mtitle';
import Preloader from '../../components/Shortarea/Preloader';
import ImageUpload from '../../config/ImageUploadcpanel';

const AProduct = () => {
    const axiosSecure = UseAxiosSecure();
    const { branches, loading: branchesLoading } = useTotalBranch();

    // Data states for the main page
    const [products, setProducts] = useState([]);
    const [pageCategories, setPageCategories] = useState([]); // Renamed for clarity
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);

    // Modal & Form states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    // State specifically for categories inside the modal
    const [modalCategories, setModalCategories] = useState([]);
    const [modalCategoriesLoading, setModalCategoriesLoading] = useState(false);

    // Filter states
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({ branch: '', category: '', status: '', search: '' });
    const [debouncedSearch] = useDebounce(filters.search, 500);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage, limit: 10, ...filters, search: debouncedSearch,
            });
            const response = await axiosSecure.get(`/product/superadmin?${params.toString()}`);
            setProducts(response.data.data);
            setPageCategories(response.data.categories); // For the main page filter
            setPagination(response.data.pagination);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    }, [axiosSecure, currentPage, filters, debouncedSearch]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Fetch categories when the branch in the MODAL changes
    useEffect(() => {
        const fetchModalCategories = async () => {
            if (formData.branch) {
                setModalCategoriesLoading(true);
                try {
                    const response = await axiosSecure.get(`/product/categories/${formData.branch}`);
                    setModalCategories(response.data);
                } catch (error) {
                    console.error("Failed to fetch modal categories", error);
                    setModalCategories([]);
                } finally {
                    setModalCategoriesLoading(false);
                }
            } else {
                setModalCategories([]); // Clear categories if no branch is selected
            }
        };

        fetchModalCategories();
    }, [formData.branch, axiosSecure]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    };
    
    const openModal = (product = null) => {
        if (product) {
            setEditId(product._id);
            setFormData(product);
        } else {
            setEditId(null);
            setFormData({ status: 'available', branch: branches[0]?.name || '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const endpoint = editId ? `/product/update/${editId}` : '/product/post';
            const method = editId ? 'put' : 'post';
            await axiosSecure[method](endpoint, formData);
            
            Swal.fire('Success!', `Product ${editId ? 'updated' : 'created'} successfully.`, 'success');
            fetchProducts();
            closeModal();
        } catch (error) {
            Swal.fire('Error!', 'Failed to save product.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?', text: "You won't be able to revert this!",
            icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes, delete it!'
        }).then(result => {
            if (result.isConfirmed) {
                axiosSecure.delete(`/product/delete/${id}`).then(() => {
                    Swal.fire('Deleted!', 'The product has been deleted.', 'success');
                    fetchProducts();
                }).catch(() => Swal.fire('Error!', 'Failed to delete product.', 'error'));
            }
        });
    };

    return (
        <div className="p-6 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
            <Mtitle title="Product Management" rightcontent={
                <button 
                    onClick={() => openModal()} 
                    className="btn bg-indigo-600 hover:bg-indigo-700 text-white border-none rounded-xl flex items-center gap-2"
                >
                    <FiPlus /> Add Product
                </button>
            } />

            {/* --- Filter Bar --- */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800/80 my-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 transition-colors">
                <input 
                    type="text" 
                    value={filters.search} 
                    onChange={e => handleFilterChange('search', e.target.value)} 
                    placeholder="Search by name..." 
                    className="input input-bordered w-full rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200" 
                />
                <select 
                    value={filters.branch} 
                    onChange={e => handleFilterChange('branch', e.target.value)} 
                    className="select select-bordered w-full rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200" 
                    disabled={branchesLoading}
                >
                    <option value="">All Branches</option>
                    {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                </select>
                <select 
                    value={filters.category} 
                    onChange={e => handleFilterChange('category', e.target.value)} 
                    className="select select-bordered w-full rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                >
                    <option value="">All Categories</option>
                    {pageCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select 
                    value={filters.status} 
                    onChange={e => handleFilterChange('status', e.target.value)} 
                    className="select select-bordered w-full rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                >
                    <option value="">All Statuses</option>
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                </select>
            </div>

            {loading ? <Preloader /> : (
                <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800/80 transition-colors">
                    <table className="table w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-655 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="p-4 text-sm font-bold">Product</th>
                                <th className="p-4 text-sm font-bold">Category</th>
                                <th className="p-4 text-sm font-bold">Price</th>
                                <th className="p-4 text-sm font-bold">Branch</th>
                                <th className="p-4 text-sm font-bold">Status</th>
                                <th className="p-4 text-sm font-bold text-right rounded-tr-2xl">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-350">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="avatar">
                                                <div className="mask mask-squircle w-12 h-12 bg-slate-100 dark:bg-slate-850">
                                                    <img src={product.photo || 'https://via.placeholder.com/150'} alt={product.productName} />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-850 dark:text-slate-200">{product.productName}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium text-slate-600 dark:text-slate-300">{product.category}</td>
                                    <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{product.price} BDT</td>
                                    <td className="p-4">
                                        <span className="badge bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-none font-medium">
                                            {product.branch}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`badge ${product.status === 'available' ? 'badge-success text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'} border-none font-medium`}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button onClick={() => openModal(product)} className="btn btn-ghost btn-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg p-1.5" title="Edit"><FiEdit size={16}/></button>
                                        <button onClick={() => handleDelete(product._id)} className="btn btn-ghost btn-xs text-rose-600 dark:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg p-1.5" title="Delete"><FiTrash2 size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 text-slate-600 dark:text-slate-400">
                <p className="text-sm font-medium">Total Products: {pagination.totalDocuments || 0}</p>
                <div className="join">
                    <button 
                        onClick={() => setCurrentPage(p => p - 1)} 
                        disabled={pagination.currentPage === 1} 
                        className="join-item btn bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300 disabled:opacity-50"
                    >
                        «
                    </button>
                    <button className="join-item btn bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 dark:text-slate-300 cursor-default">
                        Page {pagination.currentPage || 1}
                    </button>
                    <button 
                        onClick={() => setCurrentPage(p => p + 1)} 
                        disabled={pagination.currentPage === pagination.totalPages} 
                        className="join-item btn bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300 disabled:opacity-50"
                    >
                        »
                    </button>
                </div>
            </div>

            {/* --- Create/Edit Modal --- */}
            {isModalOpen && (
                <div className="modal modal-open">
                    <div className="modal-box w-11/12 max-w-lg bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl">
                        <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 text-slate-500 dark:text-slate-400"><FiX size={18}/></button>
                        <h3 className="font-bold text-lg mb-4 text-slate-850 dark:text-slate-200">{editId ? 'Edit Product' : 'Add New Product'}</h3>
                        <div className="space-y-4">
                            <input type="text" placeholder="Product Name" value={formData.productName || ''} onChange={e => setFormData({...formData, productName: e.target.value})} className="input input-bordered w-full rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200" />
                            <input type="number" placeholder="Price" value={formData.price || ''} onChange={e => setFormData({...formData, price: e.target.value})} className="input input-bordered w-full rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200" />
                            
                            <select value={formData.branch || ''} onChange={e => setFormData({...formData, branch: e.target.value, category: ''})} className="select select-bordered w-full rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
                                {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                            </select>
                            
                            <select 
                                value={formData.category || ''} 
                                onChange={e => setFormData({...formData, category: e.target.value})} 
                                className="select select-bordered w-full rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                                disabled={modalCategoriesLoading || !formData.branch}
                            >
                                 <option value="">{modalCategoriesLoading ? 'Loading...' : 'Select Category'}</option>
                                 {modalCategories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>

                            <select value={formData.status || 'available'} onChange={e => setFormData({...formData, status: e.target.value})} className="select select-bordered w-full rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
                                <option value="available">Available</option>
                                <option value="unavailable">Unavailable</option>
                            </select>
                            
                            <ImageUpload setImageUrl={url => setFormData({...formData, photo: url})} />
                        </div>
                        <div className="modal-action">
                            <button onClick={closeModal} className="btn bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border-none rounded-xl text-slate-700 dark:text-slate-300">Cancel</button>
                            <button onClick={handleSubmit} className="btn bg-indigo-600 hover:bg-indigo-700 text-white border-none rounded-xl" disabled={isSubmitting}>
                                {isSubmitting ? <span className="loading loading-spinner"></span> : 'Save Product'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AProduct;