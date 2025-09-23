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
    // ✅ NEW: State specifically for categories inside the modal
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

    // ✅ NEW: useEffect to fetch categories when the branch in the MODAL changes
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
        <div className="p-6 bg-gray-50 min-h-screen">
            <Mtitle title="Product Management" rightcontent={
                <button onClick={() => openModal()} className="btn bg-blue-600 hover:bg-blue-700 text-white"><FiPlus className="mr-2"/>Add Product</button>
            } />

            {/* --- Filter Bar --- */}
            <div className="p-4 bg-white rounded-lg shadow-md my-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <input type="text" value={filters.search} onChange={e => handleFilterChange('search', e.target.value)} placeholder="Search by name..." className="input input-bordered w-full" />
                <select value={filters.branch} onChange={e => handleFilterChange('branch', e.target.value)} className="select select-bordered w-full" disabled={branchesLoading}>
                    <option value="">All Branches</option>
                    {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                </select>
                <select value={filters.category} onChange={e => handleFilterChange('category', e.target.value)} className="select select-bordered w-full">
                    <option value="">All Categories</option>
                    {/* This dropdown uses the categories for the main page filter */}
                    {pageCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={filters.status} onChange={e => handleFilterChange('status', e.target.value)} className="select select-bordered w-full">
                    <option value="">All Statuses</option>
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                </select>
            </div>

            {/* Table and Pagination... (No changes here) */}
             {loading ? <Preloader /> : (
                <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                    <table className="table w-full">
                        <thead className="bg-blue-600 text-white">
                            <tr>
                                <th>Product</th><th>Category</th><th>Price</th><th>Branch</th><th>Status</th><th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product._id} className="hover">
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="avatar"><div className="mask mask-squircle w-12 h-12"><img src={product.photo || 'https://via.placeholder.com/150'} alt={product.productName} /></div></div>
                                            <div><div className="font-bold">{product.productName}</div></div>
                                        </div>
                                    </td>
                                    <td>{product.category}</td>
                                    <td>{product.price} BDT</td>
                                    <td>{product.branch}</td>
                                    <td><span className={`badge ${product.status === 'available' ? 'badge-success' : 'badge-error'}`}>{product.status}</span></td>
                                    <td className="space-x-2">
                                        <button onClick={() => openModal(product)} className="btn btn-ghost btn-sm"><FiEdit/></button>
                                        <button onClick={() => handleDelete(product._id)} className="btn btn-ghost btn-sm text-red-500"><FiTrash2/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            <div className="flex justify-between items-center mt-6">
                <p>Total Products: {pagination.totalDocuments}</p>
                <div className="join">
                    <button onClick={() => setCurrentPage(p => p - 1)} disabled={pagination.currentPage === 1} className="join-item btn">«</button>
                    <button className="join-item btn">Page {pagination.currentPage}</button>
                    <button onClick={() => setCurrentPage(p => p + 1)} disabled={pagination.currentPage === pagination.totalPages} className="join-item btn">»</button>
                </div>
            </div>


            {/* --- Create/Edit Modal --- */}
            {isModalOpen && (
                <div className="modal modal-open">
                    <div className="modal-box w-11/12 max-w-lg">
                        <button onClick={closeModal} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"><FiX/></button>
                        <h3 className="font-bold text-lg mb-4">{editId ? 'Edit Product' : 'Add New Product'}</h3>
                        <div className="space-y-4">
                            <input type="text" placeholder="Product Name" value={formData.productName || ''} onChange={e => setFormData({...formData, productName: e.target.value})} className="input input-bordered w-full" />
                            <input type="number" placeholder="Price" value={formData.price || ''} onChange={e => setFormData({...formData, price: e.target.value})} className="input input-bordered w-full" />
                            <select value={formData.branch || ''} onChange={e => setFormData({...formData, branch: e.target.value, category: ''})} className="select select-bordered w-full">
                                {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                            </select>
                            
                            {/* ✅ This dropdown now uses the new state and logic */}
                            <select 
                                value={formData.category || ''} 
                                onChange={e => setFormData({...formData, category: e.target.value})} 
                                className="select select-bordered w-full"
                                disabled={modalCategoriesLoading || !formData.branch}
                            >
                                 <option value="">{modalCategoriesLoading ? 'Loading...' : 'Select Category'}</option>
                                 {modalCategories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>

                            <select value={formData.status || 'available'} onChange={e => setFormData({...formData, status: e.target.value})} className="select select-bordered w-full">
                                <option value="available">Available</option><option value="unavailable">Unavailable</option>
                            </select>
                            <ImageUpload setImageUrl={url => setFormData({...formData, photo: url})} />
                        </div>
                        <div className="modal-action">
                            <button onClick={closeModal} className="btn btn-ghost">Cancel</button>
                            <button onClick={handleSubmit} className="btn bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
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