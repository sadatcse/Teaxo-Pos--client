import React, { useState, useEffect, useCallback } from "react";
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { useDebounce } from "use-debounce";
import Swal from 'sweetalert2';

import UseAxiosSecure from '../../Hook/UseAxioSecure';
import useTotalBranch from '../../Hook/UseTotalBrach';
import Mtitle from '../../components library/Mtitle';
import Preloader from '../../components/Shortarea/Preloader';
import CategoryModal from './CategoryModal'; // Adjust path if needed

const ACatagroie = () => {
    const axiosSecure = UseAxiosSecure();
    const { branches, loading: branchesLoading } = useTotalBranch();

    const [categories, setCategories] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({ branch: '', isActive: '', search: '' });
    const [debouncedSearch] = useDebounce(filters.search, 500);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: currentPage, limit: 10, ...filters, search: debouncedSearch });
            const response = await axiosSecure.get(`/category/superadmin/all?${params.toString()}`);
            setCategories(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) { 
            console.error("Error fetching categories:", error); 
        } finally { 
            setLoading(false); 
        }
    }, [axiosSecure, currentPage, filters, debouncedSearch]);

    useEffect(() => { fetchCategories(); }, [fetchCategories]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    };

    const handleOpenModal = (category = null) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const handleSubmit = async (formData) => {
        setIsSubmitting(true);
        const isEditing = !!editingCategory;
        const endpoint = isEditing ? `/category/update/${editingCategory._id}` : '/category/post';
        const method = isEditing ? 'put' : 'post';
        
        try {
            await axiosSecure[method](endpoint, formData);
            Swal.fire('Success!', `Category ${isEditing ? 'updated' : 'created'} successfully.`, 'success');
            fetchCategories();
            setIsModalOpen(false);
        } catch (error) {
            Swal.fire('Error!', error.response?.data?.message || 'Failed to save category.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?', text: "Deleting a category can affect existing products!",
            icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes, delete it!'
        }).then(result => {
            if (result.isConfirmed) {
                axiosSecure.delete(`/category/delete/${id}`).then(() => {
                    Swal.fire('Deleted!', 'The category has been deleted.', 'success');
                    fetchCategories();
                }).catch(() => Swal.fire('Error!', 'Failed to delete category.', 'error'));
            }
        });
    };

    return (
        <div className="p-6 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
            <Mtitle title="Product Category Management" rightcontent={
                <button 
                    onClick={() => handleOpenModal()} 
                    className="btn bg-indigo-600 hover:bg-indigo-700 text-white border-none rounded-xl flex items-center gap-2"
                >
                    <FiPlus /> Add Category
                </button>
            } />

            {/* Filter Panel */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800/80 my-6 grid grid-cols-1 md:grid-cols-3 gap-4 transition-colors">
                <input 
                    type="text" 
                    value={filters.search} 
                    onChange={e => handleFilterChange('search', e.target.value)} 
                    placeholder="Search by category name..." 
                    className="input input-bordered w-full rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200" 
                />
                <select 
                    value={filters.branch} 
                    onChange={e => handleFilterChange('branch', e.target.value)} 
                    className="select select-bordered w-full rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200" 
                    disabled={branchesLoading}
                >
                    <option value="">All Branches</option>
                    {branches.map(b => <option key={b._id || b.id} value={b.name}>{b.name}</option>)}
                </select>
                <select 
                    value={filters.isActive} 
                    onChange={e => handleFilterChange('isActive', e.target.value)} 
                    className="select select-bordered w-full rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                >
                    <option value="">All Statuses</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
            </div>

            {loading ? <Preloader /> : (
                <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800/80 transition-colors">
                    <table className="table w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-650 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="p-4 text-sm font-bold">Serial</th>
                                <th className="p-4 text-sm font-bold">Category Name</th>
                                <th className="p-4 text-sm font-bold">Branch</th>
                                <th className="p-4 text-sm font-bold">Status</th>
                                <th className="p-4 text-sm font-bold text-right rounded-tr-2xl">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map(cat => (
                                <tr key={cat._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-350">
                                    <td className="p-4 font-medium">{cat.serial}</td>
                                    <td className="p-4 font-semibold text-slate-850 dark:text-slate-200">{cat.categoryName}</td>
                                    <td className="p-4">
                                        <span className="badge bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-none font-medium">
                                            {cat.branch}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`badge ${cat.isActive ? 'badge-success text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'} border-none font-medium`}>
                                            {cat.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        <button onClick={() => handleOpenModal(cat)} className="btn btn-ghost btn-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-lg p-1.5"><FiEdit size={16}/></button>
                                        <button onClick={() => handleDelete(cat._id)} className="btn btn-ghost btn-xs text-rose-600 dark:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg p-1.5"><FiTrash2 size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 text-slate-600 dark:text-slate-400">
                <p className="text-sm font-medium">Total Categories: {pagination.totalDocuments || 0}</p>
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

            <CategoryModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                isEditing={!!editingCategory}
                initialData={editingCategory || { isActive: true }}
                branches={branches}
            />
        </div>
    );
};

export default ACatagroie;