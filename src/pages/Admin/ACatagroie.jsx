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
        } catch (error) { console.error("Error fetching categories:", error); } 
        finally { setLoading(false); }
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
        <div className="p-6 bg-gray-50 min-h-screen">
            <Mtitle title="Product Category Management" rightcontent={
                <button onClick={() => handleOpenModal()} className="btn bg-blue-600 hover:bg-blue-700 text-white"><FiPlus className="mr-2"/>Add Category</button>
            } />

            <div className="p-4 bg-white rounded-lg shadow-md my-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" value={filters.search} onChange={e => handleFilterChange('search', e.target.value)} placeholder="Search by category name..." className="input input-bordered w-full" />
                <select value={filters.branch} onChange={e => handleFilterChange('branch', e.target.value)} className="select select-bordered w-full" disabled={branchesLoading}>
                    <option value="">All Branches</option>
                    {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                </select>
                <select value={filters.isActive} onChange={e => handleFilterChange('isActive', e.target.value)} className="select select-bordered w-full">
                    <option value="">All Statuses</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
            </div>

            {loading ? <Preloader /> : (
                <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                    <table className="table w-full">
                        <thead className="bg-blue-600 text-white">
                            <tr><th>Serial</th><th>Category Name</th><th>Branch</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {categories.map(cat => (
                                <tr key={cat._id} className="hover">
                                    <td>{cat.serial}</td>
                                    <td className="font-bold">{cat.categoryName}</td>
                                    <td><span className="badge badge-neutral">{cat.branch}</span></td>
                                    <td><span className={`badge ${cat.isActive ? 'badge-success' : 'badge-ghost'}`}>{cat.isActive ? 'Active' : 'Inactive'}</span></td>
                                    <td className="space-x-2">
                                        <button onClick={() => handleOpenModal(cat)} className="btn btn-ghost btn-sm"><FiEdit/></button>
                                        <button onClick={() => handleDelete(cat._id)} className="btn btn-ghost btn-sm text-red-500"><FiTrash2/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            <div className="flex justify-between items-center mt-6">
                <p>Total Categories: {pagination.totalDocuments}</p>
                <div className="join">
                    <button onClick={() => setCurrentPage(p => p - 1)} disabled={pagination.currentPage === 1} className="join-item btn">«</button>
                    <button className="join-item btn">Page {pagination.currentPage}</button>
                    <button onClick={() => setCurrentPage(p => p + 1)} disabled={pagination.currentPage === pagination.totalPages} className="join-item btn">»</button>
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